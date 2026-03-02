import pytest
from fastapi.testclient import TestClient
import boto3
from moto import mock_aws
from main import app
import os
import sys

# Add ingest to path to use core_ingestion and mock data
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ingest')))
from core_ingestion import insert_data

client = TestClient(app)

@pytest.fixture(autouse=True)
def dynamodb_table(monkeypatch):
    monkeypatch.setenv("DYNAMODB_TABLE", "SpaceXef-Data")
    monkeypatch.delenv("LOCAL_DDB", raising=False)  # Force use of moto
    
    with mock_aws():
        dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        table = dynamodb.create_table(
            TableName='SpaceXef-Data',
            KeySchema=[
                {'AttributeName': 'PK', 'KeyType': 'HASH'},
                {'AttributeName': 'SK', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'PK', 'AttributeType': 'S'},
                {'AttributeName': 'SK', 'AttributeType': 'S'}
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        
        # Insert mock data using our function
        parsed_data = {
            "items": [
                {"id": "l1", "launch_date": 1000, "name": "Falcon Launch 1", "status": "success", "rocket": {"id": "r1"}},
                {"id": "l2", "launch_date": 2000, "name": "Starship Launch", "status": "failed", "rocket": {"id": "r2"}}
            ],
            "rockets": [
                {"id": "r1", "name": "Falcon"},
                {"id": "r2", "name": "Starship"}
            ],
            "stats": {
                "total": 2,
                "failures": 1
            }
        }
        
        insert_data(table, parsed_data)
        
        yield table

def test_get_stats():
    response = client.get("/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert data["failures"] == 1

def test_get_rockets():
    response = client.get("/rockets")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 2
    assert len(data["items"]) == 2

def test_get_launch_by_id():
    response = client.get("/launches/000000000001000%23l1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "l1"
    assert data["name"] == "Falcon Launch 1"

def test_get_launches_search():
    # Test search for "Starship"
    response = client.get("/launches?search=Starship")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 1
    assert data["docs"][0]["name"] == "Starship Launch"
    
def test_get_launches_status():
    # Test filter by status
    response = client.get("/launches?status=success")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 1
    assert data["docs"][0]["name"] == "Falcon Launch 1"
