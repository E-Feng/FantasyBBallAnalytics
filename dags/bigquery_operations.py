import pandas as pd

from airflow.decorators import task
from airflow.operators.python import get_current_context
from airflow.providers.google.cloud.operators.bigquery import (
  BigQueryCreateEmptyTableOperator,
  BigQueryExecuteQueryOperator,
  BigQueryGetDataOperator
)
from airflow.providers.google.cloud.transfers.gcs_to_bigquery import (
  GCSToBigQueryOperator
)
from airflow.providers.google.cloud.sensors.bigquery import (
  BigQueryTableExistenceSensor,
)


CONN_ID = 'GCP_BQ'

PROJECT_ID = 'fantasy-cc6ec'
DATASET_NAME = 'fantasy'

SCHEMA_TEAMS = [
  {'name': 'teamName', 'type': 'STRING', 'mode': 'REQUIRED'},
  {'name': 'teamId', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'fullTeamName', 'type': 'STRING', 'mode': 'REQUIRED'},
  {'name': 'firstName', 'type': 'STRING', 'mode': 'REQUIRED'},
  {'name': 'lastName', 'type': 'STRING', 'mode': 'REQUIRED'},
  {'name': 'location', 'type': 'STRING', 'mode': 'REQUIRED'},
  {'name': 'abbrev', 'type': 'STRING', 'mode': 'REQUIRED'},
  {'name': 'seed', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'wins', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'losses', 'type': 'INTEGER', 'mode': 'REQUIRED'},
]

SCHEMA_SCOREBOARD = [
  {'name': 'teamId', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'awayId', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'week', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'won', 'type': 'BOOL', 'mode': 'REQUIRED'},
  {'name': 'fgPer', 'type': 'FLOAT64', 'mode': 'REQUIRED'},
  {'name': 'ftPer', 'type': 'FLOAT64', 'mode': 'REQUIRED'},
  {'name': 'threes', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'rebs', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'asts', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'blks', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'tos', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'ejs', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'pts', 'type': 'INTEGER', 'mode': 'REQUIRED'},
]

SCHEMA_DRAFT = [
  {'name': 'pickNumber', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'round', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'teamId', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'playerId', 'type': 'INTEGER', 'mode': 'REQUIRED'},  
]

SCHEMA_RATINGS = [
  {'name': 'id', 'type': 'INTEGER', 'mode': 'REQUIRED'},
  {'name': 'playerName', 'type': 'STRING', 'mode': 'REQUIRED'},
  {'name': 'ratingSeason', 'type': 'FLOAT64', 'mode': 'REQUIRED'},
  {'name': 'ratingLast7', 'type': 'FLOAT64', 'mode': 'REQUIRED'},   
  {'name': 'ratingLast15', 'type': 'FLOAT64', 'mode': 'REQUIRED'},
  {'name': 'ratingLast30', 'type': 'FLOAT64', 'mode': 'REQUIRED'},
  {'name': 'rankingSeason', 'type': 'FLOAT64', 'mode': 'REQUIRED'},
  {'name': 'rankingLast7', 'type': 'FLOAT64', 'mode': 'REQUIRED'},   
  {'name': 'rankingLast15', 'type': 'FLOAT64', 'mode': 'REQUIRED'},
  {'name': 'rankingLast30', 'type': 'FLOAT64', 'mode': 'REQUIRED'},     
]

TABLE_LIST = {
  'teams': SCHEMA_TEAMS,
  'scoreboard': SCHEMA_SCOREBOARD,
  'draft': SCHEMA_DRAFT,
  'ratings': SCHEMA_RATINGS
}

@task
def create_tables():
  context = get_current_context()

  for table_name in TABLE_LIST:
    bq_operator = BigQueryCreateEmptyTableOperator(
      task_id = 'create_table',
      dataset_id = DATASET_NAME,
      table_id = table_name,
      #schema_fields = TABLE_LIST[table_name],
      bigquery_conn_id= CONN_ID
    )
    bq_operator.execute(context)

@task
def check_table_exists(table_name: str):
  context = get_current_context()

  bq_operator = BigQueryTableExistenceSensor(
    task_id = 'check_table',
    project_id = PROJECT_ID,
    dataset_id = DATASET_NAME,
    table_id = table_name,
    bigquery_conn_id= CONN_ID
  )
  bq_operator.execute(context)

@task
def transfer_gcs_to_bigquery_table(data_name: str):
  context = get_current_context()

  bq_operator = GCSToBigQueryOperator(
    task_id = 'gcs_to_bq',
    bucket = 'fantasy-cc6ec.appspot.com',
    source_objects = [f'{data_name}.json'],
    source_format = 'NEWLINE_DELIMITED_JSON',
    destination_project_dataset_table = f'{PROJECT_ID}.{DATASET_NAME}.{data_name}',
    #schema_fields= TABLE_LIST[data_name],
    write_disposition='WRITE_TRUNCATE',
    bigquery_conn_id= CONN_ID
  )
  bq_operator.execute(context)

@task 
def join_draft_and_ratings():
  context = get_current_context()

  sql_str = '''
    SELECT pickNumber, round, playerName, teamId, ratingSeason, ratingNoEjsSeason, rankingSeason,
        RANK() OVER( ORDER BY ratingNoEjsSeason DESC) AS rankingNoEjsSeason
    FROM `fantasy-cc6ec.fantasy.draft` AS draft
    JOIN `fantasy-cc6ec.fantasy.ratings` AS ratings
    ON draft.playerId = ratings.id
  '''

  bq_query_operator = BigQueryExecuteQueryOperator(
    task_id = 'join_draft_and_ratings',
    sql = sql_str,
    use_legacy_sql = False,
    destination_dataset_table = f'{PROJECT_ID}.{DATASET_NAME}.temp',
    write_disposition = 'WRITE_TRUNCATE',
    create_disposition = 'CREATE_IF_NEEDED',
    gcp_conn_id = CONN_ID
  )
  bq_query_operator.execute(context)

  bq_get_data_operator = BigQueryGetDataOperator(
    task_id = 'get_join_draft_and_ratings',
    dataset_id = DATASET_NAME,
    table_id = 'temp',
    max_results = 200,
    gcp_conn_id = CONN_ID
  )
  data = bq_get_data_operator.execute(context)

  column_names = [
    'pickNumber', 'round', 
    'playerName', 'teamId',
    'ratingSeason', 'ratingNoEjsSeason',
    'rankingSeason', 'rankingNoEjsSeason'
    ]
  df = pd.DataFrame(data, columns = column_names)

  draft_recap_json = df.to_json(orient='records')
  return draft_recap_json