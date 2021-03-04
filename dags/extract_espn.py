import os
import requests
import json


# Initializing API URLs from ESPN and cookies
league_year = 2021
league_id = 48375511

base_url = 'https://fantasy.espn.com/apis/v3/games/fba/seasons/{}/segments/0/leagues/{}'
league_url = base_url.format(league_year, league_id)

cookie_espn = os.environ['COOKIE_ESPN_S2']
cookie_swid = os.environ['COOKIE_SWID']

cookies = {"swid": cookie_swid, "espn_s2": cookie_espn}


def extract_team_info(**context):
  """
  Extracts team data from ESPN API
  """

  r = requests.get(league_url,
                   params = {"view": "mTeam"},
                   cookies = cookies)

  if r.status_code == 200:
    data = r.json()

    context['ti'].xcom_push(key='team_data', value=data)
    print("Successfully fetched data from ESPN and pushed to xcom")
  else:
    print("Failed fetching data from ESPN")
    raise ValueError("Error obtaining team data from ESPN API")

def extract_scoreboard_info(**context):
  """
  Extracts scoreboard_info from ESPN API
  """

  r = requests.get(league_url,
                    params = {"view": "mScoreboard"},
                    cookies = cookies)

  if r.status_code == 200:
    data = r.json()

    context['ti'].xcom_push(key='scoreboard_data', value=data)
    print("Successfully fetched data from ESPN and pushed to xcom")
  else:
    print("Failed fetching data from ESPN")
    raise ValueError("Error obtaining scoreboard data from ESPN API")

def extract_daily_score_info(**context):
  """
  Extracts daily scores from given scoring period id
  """

  raw_json = context['ti'].xcom_pull(key='team_data', task_ids=['extract_team_info'])
  
  # Getting scoring period id from yesterday
  scoring_id = str(raw_json[0]['scoringPeriodId'] - 1)
  #scoring_id = 56

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

    context['ti'].xcom_push(key='daily_score_data', value=data)
    print("Successfully fetched data from ESPN and pushed to xcom")
  else:
    print("Failed fetching data from ESPN")
    print(r.text)
    raise ValueError("Error obtaining scoreboard data from ESPN API")