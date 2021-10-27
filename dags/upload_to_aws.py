import json
import requests

from airflow.decorators import task
from airflow.exceptions import AirflowException



AWS_DDB_URL = 'https://p5v5a0pnfi.execute-api.us-east-1.amazonaws.com/v1/data'


@task
def upload_league_data_to_dynamo(data: dict):
  """
  Post process the league data and uploads to dynamodb
  """
  for key in data.keys():
    value = data[key]
    if isinstance(value, str) and '{' in value:
      data[key] = json.loads(data[key])

  headers = {'content-type': 'application/json'}
  payload = json.dumps(data)

  r = requests.put(AWS_DDB_URL, data=payload, headers=headers)

  if r.status_code == 500:
    raise AirflowException("Error uploading to dynamodb")
  return