import os
import json
import requests

from airflow.decorators import task
from airflow.models import Variable
from airflow.providers.postgres.hooks.postgres import PostgresHook


AWS_CONN_ID = 'AWS_RDS'


@task
def get_league_id_list():
  """
  Gets list of league ids to extract information from
  """
  hook = PostgresHook(postgres_conn_id=AWS_CONN_ID)
  cursor = hook.get_conn().cursor()

  cursor.execute(
    """
    SELECT LeagueId, LeagueYear, LastYear, CookieEspnS2, CookieSwid 
    FROM leagues
    WHERE Active AND LeagueYear='2022' AND
      ((NOW() - LastViewed < INTERVAL '7 day') OR
        (NOW() - LastUpdated > INTERVAL '7 day'))
    """
  )

  league_ids = cursor.fetchall()

  formatted_league_ids = {
    'leagueId': [],
    'leagueYear': [],
    'lastYear': [],
    'cookieEspnS2': [],
    'cookieSwid': []
  }

  for league in league_ids:
    formatted_league_ids['leagueId'].append(league[0])
    formatted_league_ids['leagueYear'].append(league[1])
    formatted_league_ids['lastYear'].append(league[2])
    formatted_league_ids['cookieEspnS2'].append(league[3])
    formatted_league_ids['cookieSwid'].append(league[4])

  Variable.set(key='league_ids', value=formatted_league_ids, serialize_json=True)
  Variable.set(key='league_year', value=formatted_league_ids['leagueYear'][0])

  print("League ID Data", type(league_ids))
  for row in league_ids:
    print(row[0], row[1])

  return

@task
def get_scoring_period_id():
  """
  Gets the current scoring period to compute previous daily scores
  """
  # Hardcoded URL very likely to work, public league
  url = 'https://fantasy.espn.com/apis/v3/games/fba/seasons/2022/segments/0/leagues/976410188?view=scoringperiodid'

  r = requests.get(url)

  if r.status_code == 200:
    data = r.json()

    scoring_period_id = str(data['scoringPeriodId'] - 1)

    return scoring_period_id
  else:
    print("Failed fetching data from ESPN")
    print(r.text)
    raise ValueError("Error obtaining data from ESPN API")    