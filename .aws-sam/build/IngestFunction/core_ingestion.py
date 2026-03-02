import os
import urllib.request
import json
import boto3
from decimal import Decimal

def fetch_spacex_data(url: str, query_body: dict) -> dict:
    """Helper method to fetch JSON data via POST."""
    data = json.dumps(query_body).encode('utf-8')
    req = urllib.request.Request(
        url, 
        data=data, 
        headers={
            'User-Agent': 'SpaceXef-Ingestion',
            'Content-Type': 'application/json'
        },
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return {}

def parse_and_map_launches(docs: list) -> list:
    """Parses raw SpaceX 'docs' into precisely mapped dictionary schema."""
    mapped_items = []
    
    for doc in docs:
        launch_id = doc.get("id")
        if not isinstance(doc, dict) or not launch_id:
            continue
        
        date_unix = doc.get("date_unix") or 0
            
        # Calculate Status
        status = "failed"
        if doc.get("upcoming"):
            status = "upcoming"
        elif doc.get("success"):
            status = "success"
            
        # Map Rocket
        rocket_obj = doc.get("rocket")
        rocket_data = None
        if isinstance(rocket_obj, dict):
            flickr_images = rocket_obj.get("flickr_images")
            rocket_data = {
                "id": rocket_obj.get("id"),
                "name": rocket_obj.get("name"),
                "height": rocket_obj.get("height", {}).get("meters") if isinstance(rocket_obj.get("height"), dict) else None,
                "diameter": rocket_obj.get("diameter", {}).get("meters") if isinstance(rocket_obj.get("diameter"), dict) else None,
                "mass": rocket_obj.get("mass", {}).get("kg") if isinstance(rocket_obj.get("mass"), dict) else None,
                "description": rocket_obj.get("description"),
                "image": flickr_images[0] if flickr_images and isinstance(flickr_images, list) else None
            }
            
        # 3. Map Payloads
        payloads_list = doc.get("payloads", [])
        payload_data = []
        if isinstance(payloads_list, list):
            for p in payloads_list:
                if isinstance(p, dict):
                    payload_data.append({
                        "id": p.get("id"),
                        "name": p.get("name"),
                        "type": p.get("type"),
                        "mass": p.get("mass_kg")
                    })
                    
        # 4. Map Crew
        crew_list = doc.get("crew", [])
        crew_data = []
        if isinstance(crew_list, list):
            for c in crew_list:
                if isinstance(c, dict) and "crew" in c and isinstance(c["crew"], dict):
                    astronaut = c["crew"]
                    crew_data.append({
                        "id": astronaut.get("id"),
                        "role": c.get("role"),
                        "name": astronaut.get("name"),
                        "agency": astronaut.get("agency"),
                        "image": astronaut.get("image")
                    })
                    
        # 5. Format links & failures safely
        links = doc.get("links") or {}
        patch_links = links.get("patch") or {}
        
        failures_list = []
        raw_failures = doc.get("failures", [])
        if isinstance(raw_failures, list):
            for f in raw_failures:
                if isinstance(f, dict):
                    failures_list.append({
                        "time": f.get("time"),
                        "altitude": f.get("altitude"),
                        "reason": f.get("reason")
                    })


            
        mapped_item = {
            "id": launch_id,
            "patch": patch_links.get("small"),
            "flight_number": doc.get("flight_number") or 0, 
            "name": doc.get("name"),
            "details": doc.get("details"),
            "launch_date": date_unix,
            "date_precision": doc.get("date_precision"),
            "youtube_id": links.get("youtube_id"),
            "status": status,
            "failures": failures_list,
            "rocket": rocket_data,
            "payloads": payload_data,
            "crew": crew_data,
        }
        
        mapped_items.append(mapped_item)
        
    return mapped_items

def insert_launches(table, mapped_items: list) -> dict:
    """Inserts or updates the mapped items safely in DynamoDB handling Float to Decimal conversions."""
    inserted = 0
    updated = 0
    
    for item in mapped_items:
        # Float to Decimal Conversion
        item_json = json.dumps(item)
        db_item = json.loads(item_json, parse_float=Decimal)
        
        # Set DynamoDB PK and SK
        launch_id = db_item.get('id')
        date_unix = db_item.get('launch_date', 0)
        
        db_item['PK'] = 'LAUNCH'
        db_item['SK'] = f"{str(date_unix).zfill(15)}#{launch_id}"
        
        # Put Item and count Returns
        response = table.put_item(
            Item=db_item,
            ReturnValues='ALL_OLD'
        )
        
        if response.get('Attributes'):
            updated += 1
        else:
            inserted += 1
            
    return {"inserted": inserted, "updated": updated}


def lambda_handler(event, context):
    print("Starting decoupled SpaceX data ingestion...")
    
    DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE', 'SpaceXef-Data')
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(DYNAMODB_TABLE)
    
    # Define query logic
    query_body = {
        "query": {},
        "options": {
            "pagination": False,
            "select": {
                "id": 1, "links.patch.small": 1, "flight_number": 1, "name": 1, "details": 1,
                "date_unix": 1, "date_precision": 1, "links.youtube_id": 1, "success": 1,
                "upcoming": 1, "failures": 1, "rocket": 1, "payloads": 1, "crew": 1
            },
            "populate": [
                {
                    "path": "rocket",
                    "select": {
                        "id": 1, "name": 1, "height.meters": 1, "diameter.meters": 1,
                        "mass.kg": 1, "description": 1, "flickr_images": 1
                    }
                },
                {
                    "path": "payloads",
                    "select": {"id": 1, "name": 1, "type": 1, "mass_kg": 1}
                },
                {
                    "path": "crew.crew",
                    "select": {"id": 1, "name": 1, "agency": 1, "image": 1}
                }
            ]
        }
    }
    
    # Fetch
    response_data = fetch_spacex_data('https://api.spacexdata.com/v5/launches/query', query_body)
    docs = response_data.get('docs', [])
    analyzed = response_data.get('totalDocs', len(docs))
    
    # Parse and Map
    mapped_items = parse_and_map_launches(docs)
    
    # Insert
    insert_results = insert_launches(table, mapped_items)
    inserted = insert_results["inserted"]
    updated = insert_results["updated"]

    message = f"Successfully analyzed {analyzed} launches. Inserted: {inserted}, Updated: {updated}."
    print(message)
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': message,
            'analyzed': analyzed,
            'inserted': inserted,
            'updated': updated
        })
    }
