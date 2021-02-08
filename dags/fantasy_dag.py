import os
import json
from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.python_operator import PythonOperator

from extract_espn import extract_team_info, extract_scoreboard_info
from transform_data import transform_scoreboard_to_df, transform_team_to_df
from analyze_data import evaluate_total_cats
from upload_to_gcs import upload_scoreboard_to_firebase, upload_team_to_firebase


default_args = {
  'owner': 'Airflow',
  'start_date': datetime(2020, 10, 22),
  'retries': 1,
  'retry_delay': timedelta(seconds=5)
}

with DAG('fantasy_dag', 
          default_args=default_args, 
          schedule_interval='@daily', 
          catchup=False,
          template_searchpath=['/usr/local/airflow/dags/sql']
         ) as dag:

  # Tasks
  t1 = PythonOperator(
    task_id='extract_team_info', 
    python_callable=extract_team_info,
    provide_context=True
  )

  t5 = PythonOperator(
    task_id='transform_team_to_df',
    python_callable=transform_team_to_df,
    provide_context=True
  )

  t6 = PythonOperator(
    task_id='upload_team_to_gcs',
    python_callable=upload_team_to_firebase,
    provide_context=True
  )  

  t2 = PythonOperator(
    task_id='extract_scoreboard_info', 
    python_callable=extract_scoreboard_info,
    provide_context=True
  )

  t3 = PythonOperator(
    task_id='transform_scoreboard_to_df',
    python_callable=transform_scoreboard_to_df,
    provide_context=True
  )

  t4 = PythonOperator(
    task_id='upload_scoreboard_to_gcs',
    python_callable=upload_scoreboard_to_firebase,
    provide_context=True
  )


  t1 >> t5 >> t6
  t2 >> t3 >> t4