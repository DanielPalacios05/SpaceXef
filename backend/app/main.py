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

app = FastAPI(title="SpaceXef API", description="Read-Only API connected to DynamoDB Single-Table")

# Enable CORS for local/frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE', 'SpaceXef-Data')
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
    rocket: Optional[str] = Query(None, description="Filter by specific Rocket ID")
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
    filter_expression = None
    if status and rocket:
        filter_expression = Attr('status').eq(status) & Attr('rocket.id').eq(rocket)
    elif status:
        filter_expression = Attr('status').eq(status)
    elif rocket:
        filter_expression = Attr('rocket.id').eq(rocket)
        
    if filter_expression:
        query_kwargs['FilterExpression'] = filter_expression

    # 5. Execute DynamoDB Query natively
    try:
        response = table.query(**query_kwargs)
        items = response.get('Items', [])
        
        # When using FilterExpression with Limit, DynamoDB applies the Limit BEFORE the Filter.
        # So we might get fewer items than requested even if there's more data.
        # But for this simple implementation, we rely purely on the native response.
        
        last_evaluated_key = response.get('LastEvaluatedKey')
        next_cursor = encode_cursor(last_evaluated_key) if last_evaluated_key else None
        
        # Convert Decimals to integers/floats for JSON compatibility
        def replace_decimals(obj):
            from decimal import Decimal
            if isinstance(obj, list):
                return [replace_decimals(i) for i in obj]
            elif isinstance(obj, dict):
                return {k: replace_decimals(v) for k, v in obj.items()}
            elif isinstance(obj, Decimal):
                if obj % 1 == 0:
                    return int(obj)
                return float(obj)
            return obj
            
        clean_items = replace_decimals(items)
        
        return {
            "docs": clean_items,
            "count": len(clean_items),
            "next_token": next_cursor,
            "has_next_page": bool(next_cursor)
        }
        
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))

# Wrap the FastAPI app for AWS Lambda (API Gateway HTTP/REST compatibility)
handler = Mangum(app)
