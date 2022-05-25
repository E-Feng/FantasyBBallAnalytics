import os
import requests
import json


# Initializing parameters
base_url = 'https://fantasy.espn.com/apis/v3/games/fba/seasons/{}/segments/0/leagues/{}'


def extract_from_espn_api(league_info: dict, view: list, header: dict = {}):
  """
  Extracts data from ESPN API endpoint with specific view and any headers
  """
  #league_ids = Variable.get("league_ids", deserialize_json=True)

  league_id = league_info.get('leagueId', None)
  league_year = league_info.get('leagueYear', None)

  if league_id is None or league_year is None:
    raise ValueError(f"No league id or year provided")  

  cookie_espn = league_info.get('cookieEspn', None)
  cookie_swid = league_info.get('cookieSwid', None)

  cookies = {}
  if cookie_espn or cookie_swid:
    cookies = {"espn_s2": cookie_espn, "swid": cookie_swid}

  league_url = base_url.format(league_year, league_id)

  r = requests.get(
    league_url,
    params = {"view": view},
    headers = header,
    cookies = cookies
  )  

  if r.status_code == 200:
    data = r.json()

    print(f"Successfully fetched {view} from ESPN and pushed to xcom")
    return data
  else:
    print(f"Failed fetching {view} from ESPN")
    raise ValueError(f"Error obtaining {view} from ESPN API")  