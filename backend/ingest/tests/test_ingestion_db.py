import pytest
import boto3
from moto import mock_aws
from core_ingestion import insert_launches

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
    
    result = insert_launches(dynamodb_table, mapped_items)
    
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
    
    # First insert
    result1 = insert_launches(dynamodb_table, mapped_items)
    assert result1["inserted"] == 1
    assert result1["updated"] == 0
    
    # Run again to trigger an update (ReturnValues='ALL_OLD' catches existing item)
    mapped_items[0]["name"] = "Updated Launch 1"
    result2 = insert_launches(dynamodb_table, mapped_items)
    assert result2["inserted"] == 0
    assert result2["updated"] == 1
