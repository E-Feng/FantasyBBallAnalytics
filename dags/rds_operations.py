import os
import json
import psycopg2.extras
from psycopg2.extensions import AsIs

from airflow.decorators import task
from airflow.models import Variable
from airflow.providers.postgres.hooks.postgres import PostgresHook

from util import capitalize_dict_keys


AWS_CONN_ID = 'AWS_RDS'
SQL_DIR = '/opt/airflow/dags/sql/'

CREATE_TABLE_LIST = {
  'teams': 'rds/create_teams_table.sql',
  'scoreboard': 'rds/create_scoreboard_table.sql',
  'draftRecap': 'rds/create_draft_table.sql',
  'ratings': 'rds/create_ratings_table.sql',
  'settings': 'rds/create_settings_table.sql',
  'daily': 'rds/create_daily_table.sql'
}

def read_sql_file(file_path):
  fd = open(SQL_DIR + file_path, 'r')
  sql = fd.read()
  fd.close()

  return sql


@task
def create_rds_tables():
  hook = PostgresHook(postgres_conn_id=AWS_CONN_ID)
  conn = hook.get_conn()
  cursor = conn.cursor()

  for table_name in CREATE_TABLE_LIST:
    # Reading SQL file manually, issues with templating
    file_path = CREATE_TABLE_LIST[table_name]
    sql = read_sql_file(file_path)

    print("Running query: ")
    print(sql)

    cursor.execute(sql)

  conn.commit()
  return


@task
def truncate_rds_tables():
  hook = PostgresHook(postgres_conn_id=AWS_CONN_ID)
  conn = hook.get_conn()
  cursor = conn.cursor()

  for table_name in CREATE_TABLE_LIST:
    sql = f'TRUNCATE {table_name}'

    cursor.execute(sql)

  conn.commit()
  return


@task
def insert_data_into_rds_tables(i: int, endpoint: str, data: str):
  hook = PostgresHook(postgres_conn_id=AWS_CONN_ID)
  conn = hook.get_conn()
  cursor = conn.cursor()

  data = json.loads(data)

  # Only append league info for leagues, not common data
  if i >= 0:
    leagues_xcom = Variable.get('league_ids', deserialize_json=True)

    league_id = leagues_xcom['leagueId'][i]
    league_year = leagues_xcom['leagueYear'][i]

    for row in data:
      row['leagueId'] = league_id
      row['leagueYear'] = league_year

  columns = data[0].keys()
  sql = "INSERT INTO {} ({}) VALUES %s".format(
    endpoint, ','.join(columns)
  )

  print("Running query: ")
  print(sql)

  values = [[value for value in row.values()] for row in data]

  psycopg2.extras.execute_values(cursor, sql, values)
  conn.commit()

  return


@task
def rds_run_query_task(i: int, sql: str, params: tuple = ()):
  return rds_run_query(i, sql, params)


def rds_run_query(i: int, sql: str, params: tuple = ()):
  hook = PostgresHook(postgres_conn_id=AWS_CONN_ID)
  conn = hook.get_conn()
  cursor = conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor)

  if '.sql' in os.path.splitext(sql):
    sql = read_sql_file(sql)

  if i >= 0:
    leagues_xcom = Variable.get('league_ids', deserialize_json=True)

    league_id = leagues_xcom['leagueId'][i]
    league_year = leagues_xcom['leagueYear'][i]

    sql = sql.format(league_id=league_id, league_year=league_year)

  cursor.execute(sql, params)

  try:
    data = cursor.fetchall()
    formatted_data = capitalize_dict_keys(data)

    conn.commit()
    return formatted_data
  except:
    conn.commit()
    return ()