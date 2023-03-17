import json
import requests
import random
import boto3
from time import sleep


AWS_DDB_URL = 'https://p5v5a0pnfi.execute-api.us-east-1.amazonaws.com/v1/data'
AWS_SQS_URL = 'https://p5v5a0pnfi.execute-api.us-east-1.amazonaws.com/v1/sqs'


def upload_league_data_to_dynamo(data: dict):
  """
  Post process the league data and upload to dynamodb
  """
  headers = {'content-type': 'application/json'}
  payload = json.dumps(data)

  r = requests.put(AWS_DDB_URL, data=payload, headers=headers)

  print(r)

  if r.status_code == 500:
    raise ValueError("Error uploading to dynamodb")
  return

def upload_league_data_to_dynamo_via_sqs(data: dict):
  """
  Post process the league data and upload to dynamodb via SQS
  """
  for key in data.keys():
    value = data[key]
    if isinstance(value, str) and '{' in value:
      data[key] = json.loads(data[key])

  headers = {'content-type': 'application/json'}
  payload = json.dumps(data)

  # Write to SQS first prior to dynamodb to prevent throttling, with some delay
  r = requests.put(AWS_SQS_URL, data=payload, headers=headers)

  # Random sleep (seconds) to prevent dynamodb write throttling
  #sleep(random.randint(0, 900))
  #r = requests.put(AWS_DDB_URL, data=payload, headers=headers)

  if r.status_code == 500:
    raise ValueError("Error uploading to dynamodb")
  return

def upload_data_to_s3(data: dict, filename: str, bucket_name: str):
  """
  Upload files to S3 bucket
  """

  s3 = boto3.client('s3')

  try:
    uploadByteStream = bytes(json.dumps(data).encode('UTF-8'))
    s3.put_object(Bucket=bucket_name, Key=filename, Body=uploadByteStream)
    print('Upload successful')
  except:
    print('Upload failed')
    raise ValueError("Error uploading to S3")
  return