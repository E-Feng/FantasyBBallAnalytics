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




  # Separating common data with league specific
  if league_index == -1:
    default_league_id = '48375511'

    if default_league_id in league_ids['leagueId']:
      league_index = league_ids['leagueId'].index(default_league_id)
    else:
      league_index = 0

  league_id = league_ids['leagueId'][league_index]
  league_year = league_ids['leagueYear'][league_index]
  cookie_espn = league_ids['cookieEspnS2'][league_index]
  cookie_swid = league_ids['cookieSwid'][league_index]


  cookies = {}
  if not cookie_espn is None:
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