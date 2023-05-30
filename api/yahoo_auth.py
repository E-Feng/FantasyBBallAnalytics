import requests

url = "https://api.login.yahoo.com/oauth2/get_token"

YAHOO_KEY="dj0yJmk9Y0NLbVduVG0wTFdBJmQ9WVdrOWJYVkJSbG8wYTNjbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTYz"
YAHOO_SECRET="8cc969af8890f8775d55367728267d6907a0b4c7"

YAHOO_AUTH_CODE="k4yae4m"

payload = f"client_id={YAHOO_KEY}&grant_type=authorization_code&code={YAHOO_AUTH_CODE}&redirect_uri=oob&client_secret={YAHOO_SECRET}"
headers = {"Content-Type": "application/x-www-form-urlencoded"}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)
