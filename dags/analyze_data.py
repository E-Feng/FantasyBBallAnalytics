import json
import pandas as pd


def evaluate_total_cats(**context):
  """
  Evaluates total scoring categories throughout the season from the raw scoreboard data
  """

  raw_json = context['ti'].xcom_pull(key='scoreboard_df', task_ids=['transform_scoreboard_to_df'])

  df = pd.DataFrame.from_dict(raw_json)

  print(df)