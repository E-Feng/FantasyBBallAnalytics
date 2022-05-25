from airflow.decorators import task

from extract_espn import (
  extract_from_espn_api
)


@task
def extract_from_espn_api_task():
  return
  