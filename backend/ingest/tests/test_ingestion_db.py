import pytest
import boto3
from decimal import Decimal
from moto import mock_aws
from core_ingestion import insert_data

@pytest.fixture
def dynamodb_table():
    with mock_aws():
        dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        table = dynamodb.create_table(
            TableName='SpaceXef-Data-Test',
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
        yield table

def test_insert_launches_new_items(dynamodb_table):
    mapped_items = [
        {"id": "abc", "launch_date": 1000, "name": "Launch 1", "rocket": {"mass": 500.5}},
        {"id": "def", "launch_date": 2000, "name": "Launch 2"}
    ]
    parsed_data = {"items": mapped_items}

    result = insert_data(dynamodb_table, parsed_data)

    assert result["inserted"] == 2
    assert result["updated"] == 0

    # Verify records in DynamoDB
    response = dynamodb_table.scan()
    items = response['Items']
    assert len(items) == 2

    # Check that PK and SK and Float->Decimal mapping occurred
    item_abc = next(item for item in items if item['id'] == 'abc')
    assert item_abc['PK'] == 'LAUNCH'
    assert item_abc['SK'] == '000000000001000#abc'
    # Moto/Boto3 returns Decimals
    assert item_abc['rocket']['mass'] == 500.5

def test_insert_launches_updates(dynamodb_table):
    mapped_items = [{"id": "abc", "launch_date": 1000, "name": "Launch 1"}]
    parsed_data = {"items": mapped_items}

    # First insert
    result1 = insert_data(dynamodb_table, parsed_data)
    assert result1["inserted"] == 1
    assert result1["updated"] == 0

    # Run again to trigger an update (ReturnValues='ALL_OLD' catches existing item)
    parsed_data["items"][0]["name"] = "Updated Launch 1"
    result2 = insert_data(dynamodb_table, parsed_data)
    assert result2["inserted"] == 0
    assert result2["updated"] == 1

def test_insert_rockets(dynamodb_table):
    """Verify rockets are inserted with correct PK/SK schema."""
    parsed_data = {
        "items": [],
        "rockets": [
            {"id": "r1", "name": "Falcon 9", "total_launches": 5},
            {"id": "r2", "name": "Starship", "total_launches": 2}
        ]
    }

    insert_data(dynamodb_table, parsed_data)

    # Scan for rockets
    from boto3.dynamodb.conditions import Key
    response = dynamodb_table.query(KeyConditionExpression=Key('PK').eq('ROCKET'))
    items = response['Items']

    assert len(items) == 2
    rocket_ids = {item['id'] for item in items}
    assert rocket_ids == {'r1', 'r2'}

    for item in items:
        assert item['PK'] == 'ROCKET'
        assert item['SK'] == f"ROCKET#{item['id']}"

def test_insert_stats(dynamodb_table):
    """Verify stats are inserted with correct PK/SK."""
    parsed_data = {
        "items": [],
        "stats": {
            "total": 10,
            "failures": 3,
            "total_payload_mass": 5000,
            "humans_traveled": 12
        }
    }

    insert_data(dynamodb_table, parsed_data)

    response = dynamodb_table.get_item(Key={'PK': 'STATS', 'SK': 'OVERVIEW'})
    item = response['Item']

    assert item['PK'] == 'STATS'
    assert item['SK'] == 'OVERVIEW'
    assert item['total'] == 10
    assert item['failures'] == 3
    assert item['total_payload_mass'] == 5000
    assert item['humans_traveled'] == 12

def test_insert_full_parsed_data(dynamodb_table):
    """End-to-end test: insert launches, rockets, and stats together."""
    parsed_data = {
        "items": [
            {"id": "l1", "launch_date": 1000, "name": "Launch 1", "status": "success", "rocket": {"id": "r1"}},
            {"id": "l2", "launch_date": 2000, "name": "Launch 2", "status": "failed", "rocket": {"id": "r1"}}
        ],
        "rockets": [
            {"id": "r1", "name": "Falcon 9", "total_launches": 2}
        ],
        "stats": {
            "total": 2,
            "failures": 1,
            "total_payload_mass": 300,
            "humans_traveled": 0
        }
    }

    result = insert_data(dynamodb_table, parsed_data)
    assert result["inserted"] == 2

    # Verify full table content
    response = dynamodb_table.scan()
    all_items = response['Items']
    # 2 launches + 1 rocket + 1 stats = 4 records
    assert len(all_items) == 4

    pks = {item['PK'] for item in all_items}
    assert pks == {'LAUNCH', 'ROCKET', 'STATS'}
