import os
import requests
import json

from airflow.decorators import task


# Initializing API URLs from ESPN and cookies
league_year = 2021
league_id = 48375511

base_url = 'https://fantasy.espn.com/apis/v3/games/fba/seasons/{}/segments/0/leagues/{}'
league_url = base_url.format(league_year, league_id)

cookie_espn = os.environ['COOKIE_ESPN_S2']
cookie_swid = os.environ['COOKIE_SWID']

cookies = {"swid": cookie_swid, "espn_s2": cookie_espn}


@task
def extract_from_espn_api(view: list, header: dict = {}):
  """
  Extracts all data from ESPN API
  """

  if header:
    r = requests.get(
      league_url,
      params = {"view": view},
      headers = header,
      cookies = cookies
    )
  else:
    r = requests.get(
      league_url,
      params = {"view": view},
      cookies = cookies
    )   

  if r.status_code == 200:
    data = r.json()

    print(f"Successfully fetched {view} from ESPN and pushed to xcom")
    return data
  else:
    print(f"Failed fetching {view} from ESPN")
    raise ValueError(f"Error obtaining {view} from ESPN API")  


@task
def extract_daily_score_info(settings: dict):
  """
  Extracts daily scores from given scoring period id
  """
  
  # Getting scoring period id from yesterday
  scoring_id = settings['scoringPeriodId']
  last_scoring_id = settings['status']['finalScoringPeriod']

  # Stopping writing if season is over
  if scoring_id > last_scoring_id:
    return

  scoring_id = str(scoring_id - 1)

  header_value = '''{"players":{"filterStatsForCurrentSeasonScoringPeriodId":{"value":[%s]},"sortStatIdForScoringPeriodId":{"additionalValue":%s,"sortAsc":false,"sortPriority":2,"value":0},"limit":250}}''' % (scoring_id, scoring_id)

  #print(header_value)
  print(f'Scoring period {scoring_id}')

  header = {'x-fantasy-filter': header_value}

  r = requests.get(league_url,
                    params = {'view': 'kona_playercard'},
                    headers = header,
                    cookies = cookies)

  if r.status_code == 200:
    data = r.json()

    print("Successfully fetched data from ESPN and pushed to xcom")
    return data
  else:
    print("Failed fetching data from ESPN")
    print(r.text)
    raise ValueError("Error obtaining scoreboard data from ESPN API")