import os
import json
import pendulum
from datetime import datetime, timedelta

from airflow import DAG
from airflow.decorators import task
from airflow.operators.python import get_current_context
from airflow.utils.db import provide_session
from airflow.models import XCom, Variable

from bigquery_operations import (
  create_tables,
  check_table_exists,
  transfer_gcs_to_bigquery_table,
  join_draft_and_ratings
)
from extract_espn import (
  extract_from_espn_api, 
  extract_daily_score_info
)
from transform_data import (
  transform_scoreboard_to_df, 
  transform_team_to_df,
  transform_draft_to_df,
  transform_ratings_to_df,
  transform_daily_score_to_df
)
from analyze_data import calculate_and_upload_daily_alert
from upload_to_cloud import (
  upload_to_firebase, 
  upload_to_gcs
)


CONN_ID = 'google_cloud_created'

local_tz = pendulum.timezone('US/Eastern')

default_args = {
  'owner': 'Airflow',
  'start_date': datetime(2021, 1, 1, tzinfo=local_tz),
  'end_date': None,
  'retries': 1,
  'retry_delay': timedelta(seconds=3),
  'gcp_conn_id': CONN_ID
}

@provide_session
def cleanup_xcom(context, session=None):
  dag_id = 'fantasy_dag'

  session.query(XCom).filter(XCom.dag_id == dag_id).delete()
  print("Cleaning out xcoms after successful run")


with DAG(
  'fantasy_dag', 
  default_args=default_args, 
  schedule_interval='0 8 * * *', 
  catchup=False,
  template_searchpath=['/usr/local/airflow/dags/sql/'],
  on_success_callback=cleanup_xcom,
) as dag:
  ### Tasks
  # Parameter initialization
  @task
  def initialize_parameters():
    context = get_current_context()
    conf_vars = context['dag_run'].conf

    for param in conf_vars:
      print("Setting ", param, "to ", conf_vars[param])
      os.environ[param] = conf_vars[param]

  init = initialize_parameters()


  # Initializing tables in bigquery
  table = create_tables()
  check_table_team_exists = check_table_exists('teams')
  check_table_scoreboard_exists = check_table_exists('scoreboard')
  check_table_draft_exists = check_table_exists('draft')
  check_table_ratings_exists = check_table_exists('ratings')

  table >> [
    check_table_team_exists,
    check_table_scoreboard_exists,
    check_table_draft_exists,
    check_table_ratings_exists
  ]


  # Settings info
  settings_raw = extract_from_espn_api(['mSettings'])
  init >> settings_raw


  # Team info ETL
  team_info_raw = extract_from_espn_api(['mTeam'])
  team_info_df = transform_team_to_df(team_info_raw)

  upload_teams_to_gcs = upload_to_gcs(team_info_df, 'teams.json')
  transfer_teams_gcs_to_bq_table = transfer_gcs_to_bigquery_table('teams')

  check_table_team_exists >> upload_teams_to_gcs >> transfer_teams_gcs_to_bq_table

  upload_to_firebase(team_info_df, 'teams')


  # Scoreboard ETL
  scoreboard_raw = extract_from_espn_api(['mScoreboard'])
  scoreboard_df = transform_scoreboard_to_df(scoreboard_raw)

  upload_scoreboard_to_gcs = upload_to_gcs(scoreboard_df, 'scoreboard.json')
  transfer_scoreboard_gcs_to_bq_table = transfer_gcs_to_bigquery_table('scoreboard')

  check_table_scoreboard_exists >> upload_scoreboard_to_gcs >> transfer_scoreboard_gcs_to_bq_table

  upload_to_firebase(scoreboard_df, 'scoreboard')


  # Draft + Player Rankings ETL
  draft_raw = extract_from_espn_api(['mDraftDetail'])
  draft_df = transform_draft_to_df(draft_raw)

  ratings_header_value = '''{"players":{"limit":1000,"sortPercOwned":{"sortAsc":false,"sortPriority":1},"sortDraftRanks":{"sortPriority":100,"sortAsc":true,"value":"STANDARD"}}}'''
  ratings_header = {'x-fantasy-filter': ratings_header_value}

  ratings_raw = extract_from_espn_api(['kona_player_info', 'mStatRatings'], ratings_header)
  ratings_df = transform_ratings_to_df(ratings_raw)

  upload_draft_to_gcs = upload_to_gcs(draft_df, 'draft.json')
  upload_ratings_to_gcs = upload_to_gcs(ratings_df, 'ratings.json')

  transfer_draft_gcs_to_bq_table = transfer_gcs_to_bigquery_table('draft')
  transfer_ratings_gcs_to_bq_table = transfer_gcs_to_bigquery_table('ratings')

  check_table_draft_exists >> upload_draft_to_gcs >> transfer_draft_gcs_to_bq_table
  check_table_ratings_exists >> upload_ratings_to_gcs >> transfer_ratings_gcs_to_bq_table

  draft_recap_pd = join_draft_and_ratings()

  [
    transfer_draft_gcs_to_bq_table,
    transfer_ratings_gcs_to_bq_table
  ] >> draft_recap_pd

  upload_to_firebase(draft_recap_pd, 'draftrecap')


  # Daily Score ETL
  daily_score_raw = extract_daily_score_info(settings_raw)
  daily_score_df = transform_daily_score_to_df(daily_score_raw)
  daily_alert = calculate_and_upload_daily_alert(daily_score_df, team_info_df)

