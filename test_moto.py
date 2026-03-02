import boto3
from moto import mock_aws

with mock_aws():
    dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
    table = dynamodb.create_table(
        TableName='test',
        KeySchema=[{'AttributeName': 'PK', 'KeyType': 'HASH'}, {'AttributeName': 'SK', 'KeyType': 'RANGE'}],
        AttributeDefinitions=[{'AttributeName': 'PK', 'AttributeType': 'S'}, {'AttributeName': 'SK', 'AttributeType': 'S'}],
        BillingMode='PAY_PER_REQUEST'
    )
    res = table.put_item(Item={"PK": "1", "SK": "1"}, ReturnValues='ALL_OLD')
    print("RES1:", res)
    res2 = table.put_item(Item={"PK": "1", "SK": "1", "updated": True}, ReturnValues='ALL_OLD')
    print("RES2:", res2)
