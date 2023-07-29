import requests


base_url = "https://fantasysports.yahooapis.com/fantasy/v2/{}?format=json_f"

def extract_from_yahoo_api(access_token: str, league_key: str, url_params: list):
    url_suffix = ""
    for param in url_params:
       url_suffix += f"{param}/"

       if param == "league":
          url_suffix += f"{league_key}/"

    url = base_url.format(url_suffix)
    headers = {"Authorization": f"Bearer {access_token}"}

    res = requests.get(url, headers=headers)

    if res.status_code == 200:
        data = res.json()
    
    if res.status_code == 200:
      data = res.json()

      print(f"Successfully fetched {url_params} from Yahoo API")
      return data
    else:
      print(f"Failed fetching {url_params} from Yahoo")
      raise ValueError(f"Error obtaining {url_params} from Yahoo API")  