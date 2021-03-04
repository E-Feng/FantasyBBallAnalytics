import os
import json
import pendulum
from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.utils.db import provide_session

from extract_espn import extract_team_info, extract_scoreboard_info, extract_daily_score_info
from transform_data import transform_scoreboard_to_df, transform_team_to_df, transform_daily_score_to_df
from analyze_data import calculate_and_upload_daily_alert
from upload_to_gcs import upload_scoreboard_to_firebase, upload_team_to_firebase


local_tz = pendulum.timezone('US/Eastern')

default_args = {
  'owner': 'Airflow',
  'start_date': datetime(2021, 1, 1, tzinfo=local_tz),
  'retries': 1,
  'retry_delay': timedelta(seconds=5)
}

@provide_session
def cleanup_xcom(context, session=None):
    dag_id = context["ti"]["dag_id"]
    session.query(XCom).filter(XCom.dag_id == dag_id).delete()

with DAG('fantasy_dag', 
          default_args=default_args, 
          schedule_interval='0 8 * * *', 
          catchup=False,
          template_searchpath=['/usr/local/airflow/dags/sql'],
          on_success_callback=cleanup_xcom
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

  t7 = PythonOperator(
    task_id='extract_daily_score_info',
    python_callable=extract_daily_score_info,
    provide_context=True
  ) 

  t8 = PythonOperator(
    task_id='transform_daily_score_to_df',
    python_callable=transform_daily_score_to_df,
    provide_context=True
  ) 

  t9 = PythonOperator(
    task_id='calculate_and_upload_daily_alert',
    python_callable=calculate_and_upload_daily_alert,
    provide_context=True
  ) 

  t1 >> t5 >> t6
  t2 >> t3 >> t4
  t1 >> t7 >> t8 >> t9