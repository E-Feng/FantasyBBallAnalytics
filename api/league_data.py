import json
import boto3
from decimal import Decimal

dynamodb_table_name = 'fantasyLeagueData'

lambda_client = boto3.client('lambda', region_name='us-east-1')

def get_league_data_from_ddb(event, context):
  print(event)

  # Obtaining parameters from query, initializing boto
  league_id = str(event["queryStringParameters"]['leagueId'])
  league_year = int(event["queryStringParameters"]['leagueYear'])
  
  get_league_id = '48375511' if league_id == '00000001' else league_id
  
  dynamodb = boto3.resource('dynamodb')
  
  table = dynamodb.Table(dynamodb_table_name)

  
  # Getting item from dynamoDB
  item = table.get_item(Key={"leagueId": get_league_id, "leagueYear": league_year})

  statusCode = 400
  body = None
  if 'Item' in item:
    statusCode = 200
    body = item['Item']
      
  # Run update last viewed lambda
  if statusCode == 200:
    payload = {
      "queryStringParameters": {
        "leagueId": league_id,
        "method": 'lastViewed'  
      }
    }
      
    update_res = lambda_client.invoke(
      FunctionName='updateLastViewedLeague', 
      InvocationType='RequestResponse',
      Payload=json.dumps(payload)
    )
      
  return body

def put_league_data_to_ddb(event, context):
  print(event)
    
  # Obtaining payload to write to dynamodb
  payload = json.loads(event['body'], parse_float=Decimal)
  
  print(payload)

  # Verifying data
  if not 'leagueId' in payload.keys():
    return {
      'body': 'Invalid post request',
      'statusCode': 500
    }
      
  league_id = payload['leagueId']
  league_year = payload['leagueYear']

      
  # Updating data
  dynamodb = boto3.resource('dynamodb')
  table = dynamodb.Table(dynamodb_table_name)
  
  # Grab all_years if not present
  if 'allYears' not in payload:
    item = table.get_item(Key={"leagueId": league_id, "leagueYear": league_year})
    body = item['Item']
    
    payload['allYears'] = body['allYears']

  response = table.put_item(
    Item=payload
  )
  
  return response