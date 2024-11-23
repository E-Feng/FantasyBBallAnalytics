import json
import requests


def invoke_lambda(client, function_name, payload):
  if not isinstance(payload, str):
    payload = json.dumps(payload)
  
  res = client.invoke(
    FunctionName=function_name,
    InvocationType='RequestResponse',
    Payload=payload
  )

  if res['StatusCode'] != 200 or res.get('FunctionError', False):
    return []

  data = json.loads(res['Payload'].read().decode())['body']

  return data


def get_current_espn_league_year():
    year_url = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/"

    res = requests.get(year_url)

    data = res.json()
    league_year = int(data[0]["id"])

    return league_year