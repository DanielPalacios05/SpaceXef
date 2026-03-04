import os
import json
import base64
import boto3
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from typing import Optional
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

root_path = "/Prod" if os.environ.get("AWS_EXECUTION_ENV") else ""
app = FastAPI(
    title="SpaceXef API", 
    description="Read-Only API connected to DynamoDB Single-Table",
    root_path=root_path
)

# Enable CORS for local/frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE', 'SpaceXef-Data')

if os.environ.get('LOCAL_DDB'):
    dynamodb = boto3.resource('dynamodb', endpoint_url='http://localhost:8000', region_name='us-east-1', aws_access_key_id='test', aws_secret_access_key='test')
else:
    dynamodb = boto3.resource('dynamodb')
    
table = dynamodb.Table(DYNAMODB_TABLE)

def encode_cursor(key_dict: dict) -> str:
    """Encodes LastEvaluatedKey dictionary into a base64 string cursor."""
    if not key_dict:
        return None
    return base64.b64encode(json.dumps(key_dict).encode('utf-8')).decode('utf-8')

def decode_cursor(cursor_str: str) -> dict:
    """Decodes a base64 string cursor back into an ExclusiveStartKey dictionary."""
    if not cursor_str:
        return None
    try:
        return json.loads(base64.b64decode(cursor_str.encode('utf-8')).decode('utf-8'))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid pagination cursor")

@app.get("/launches")
def get_launches(
    limit: int = Query(50, ge=1, le=200, description="Number of items to return per page"),
    next_token: Optional[str] = Query(None, description="Pagination cursor for the next page"),
    status: Optional[str] = Query(None, description="Filter by status (success, failed, upcoming)"),
    rocket: Optional[str] = Query(None, description="Filter by specific Rocket ID"),
    search: Optional[str] = Query(None, description="Search by mission name")
):
    """
    Retrieves dynamically padded chronologically sorted SpaceX launches from DynamoDB.
    Supports native pagination via cursor and database-side filtering.
    """
    
    # 1. Base Query Condition (Uses overloaded PK)
    key_condition = Key('PK').eq('LAUNCH')
    
    # 2. Build kwargs for DynamoDB Query
    query_kwargs = {
        'KeyConditionExpression': key_condition,
        'Limit': limit,
        'ScanIndexForward': False  # False = Sort Newest to Oldest based on padded SK Unix Time
    }
    
    # 3. Apply Optional Cursor
    start_key = decode_cursor(next_token)
    if start_key:
        query_kwargs['ExclusiveStartKey'] = start_key
        
    # 4. Build Optional FilterExpressions
    conditions = []
    if status:
        conditions.append(Attr('status').eq(status))
    if rocket:
        conditions.append(Attr('rocket.id').eq(rocket))
    if search:
        conditions.append(Attr('name').contains(search))
        
    if conditions:
        filter_expression = conditions[0]
        for condition in conditions[1:]:
            filter_expression = filter_expression & condition
        query_kwargs['FilterExpression'] = filter_expression

    # 5. Execute DynamoDB Query natively
    try:
        items = []
        last_evaluated_key = start_key
        
        # Loop until we satisfy the requested limit, to bypass DynamoDB's filter dropping mechanism
        while len(items) < limit:
            if last_evaluated_key:
                query_kwargs['ExclusiveStartKey'] = last_evaluated_key
            else:
                if 'ExclusiveStartKey' in query_kwargs:
                    del query_kwargs['ExclusiveStartKey']
                    
            response = table.query(**query_kwargs)
            items.extend(response.get('Items', []))
            
            last_evaluated_key = response.get('LastEvaluatedKey')
            if not last_evaluated_key:
                break
                
        # Trim to exact limit
        page_items = items[:limit]
        
        # Determine the next cursor accurately
        if len(items) > limit:
            last_item = page_items[-1]
            next_cursor_dict = {'PK': last_item.get('PK'), 'SK': last_item.get('SK')}
            next_cursor = encode_cursor(next_cursor_dict)
            has_next_page = True
        elif last_evaluated_key:
            next_cursor = encode_cursor(last_evaluated_key)
            has_next_page = True
        else:
            next_cursor = None
            has_next_page = False
        
        return {
            "docs": page_items,
            "count": len(page_items),
            "next_token": next_cursor,
            "has_next_page": has_next_page
        }
        
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
def get_stats():
    """Retrieves aggregated statistics and timeline from DynamoDB."""
    try:
        response = table.get_item(Key={'PK': 'STATS', 'SK': 'OVERVIEW'})
        item = response.get('Item')
        if not item:
            raise HTTPException(status_code=404, detail="Stats not found")
        return item
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/launches/{launch_id}")
def get_launch(launch_id: str):
    """Retrieves full details for a specific launch using its SK (date_unix#id)."""
    try:
        response = table.get_item(Key={'PK': 'LAUNCH', 'SK': launch_id})
        item = response.get('Item')
        if not item:
            raise HTTPException(status_code=404, detail="Launch not found")
        return item
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@app.get("/rockets")
def get_rockets():
    """Retrieves all standalone rocket records from DynamoDB."""
    try:
        response = table.query(
            KeyConditionExpression=Key('PK').eq('ROCKET')
        )
        return {"items": response.get('Items', []), "count": response.get('Count', 0)}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))

# Wrap the FastAPI app for AWS Lambda (API Gateway HTTP/REST compatibility)
handler = Mangum(app)
