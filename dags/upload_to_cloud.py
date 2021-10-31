import os
import json
import tempfile
import requests
import pandas as pd

from airflow.decorators import task
from airflow.models import Variable
from airflow.operators.python import get_current_context
from airflow.exceptions import AirflowException
from airflow.providers.google.cloud.transfers.local_to_gcs import LocalFilesystemToGCSOperator

from util import authed_session


CONN_ID = 'google_cloud_created'
FIREBASE_URL = 'https://fantasy-cc6ec-default-rtdb.firebaseio.com/v1/{}/common/messageboard/{}.json'


@task
def upload_to_firebase(data: dict, data_type: str):
  """
  Uploads data to firebase with different types
  """
  league_year = Variable.get("league_year")

  if data_type is 'alert':
    date = list(data)[0]

    url = FIREBASE_URL.format(league_year, date)

    print(url)
    print(data)

    data_json = json.dumps(data[date])
    
    r = authed_session.patch(url, data=data_json)

    if r.status_code == 200:
      print("Data successfully sent to firebase")
      return
    else:
      print(r.status_code, r.text)
      raise AirflowException("Error uploading to firebase")


@task
def upload_to_gcs(data: str, file_path: str):
  """
  Convert string json dataframe to temp file then upload to gcs
  """
  context = get_current_context()

  data = json.loads(data)

  print("Data preview: ", type(data))
  print(data)

  with tempfile.NamedTemporaryFile() as fp:
    # do stuff with temp file
    full_path = fp.name

    for line in data:
      newline = json.dumps(line) + '\n'
      fp.write(newline.encode())

    print(full_path)
    fp.read()

    upload = LocalFilesystemToGCSOperator(
      task_id = f'gcs_upload_{file_path}',
      src = full_path,
      dst = file_path,
      bucket = 'fantasy-cc6ec.appspot.com',
      gcp_conn_id = CONN_ID
    )
    upload.execute(context)
