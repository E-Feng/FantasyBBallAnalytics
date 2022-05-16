import json
import requests
from random import randint
from time import sleep


AWS_DDB_URL = 'https://p5v5a0pnfi.execute-api.us-east-1.amazonaws.com/v1/data'
AWS_SQS_URL = 'https://p5v5a0pnfi.execute-api.us-east-1.amazonaws.com/v1/sqs'


def upload_league_data_to_dynamo(data: dict):
  """
  Post process the league data and upload to dynamodb
  """
  for key in data.keys():
    value = data[key]
    if isinstance(value, str) and '{' in value:
      data[key] = json.loads(data[key])

  headers = {'content-type': 'application/json'}
  payload = json.dumps(data)

  # Write to SQS first prior to dynamodb to prevent throttling, with some delay
  sleep(randint(0, 60))
  r = requests.put(AWS_SQS_URL, data=payload, headers=headers)

  # Random sleep (seconds) to prevent dynamodb write throttling
  #sleep(randint(0, 900))
  #r = requests.put(AWS_DDB_URL, data=payload, headers=headers)

  if r.status_code == 500:
    raise ValueError("Error uploading to dynamodb")
  return