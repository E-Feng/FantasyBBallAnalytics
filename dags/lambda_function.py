from extract_espn import (
  extract_from_espn_api
)

def lambda_handler(event, context):
  league_id = event["queryStringParameters"]['leagueId']
  league_year = event["queryStringParameters"]['leagueYear']

  print(event)
  print(context)