import pymongo
import requests


leagueID = 48375511
leagueYear = 2020

baseUrl = "https://fantasy.espn.com/apis/v3/games/fba/seasons/" + \
              str(leagueYear) + "/segments/0/leagues/" + str(leagueID)

r = requests.get(baseUrl,
                 cookies={"swid": "{A746C402-08B1-42F4-86C4-0208B142F42A}",
                          "espn_s2": "AEANBh%2BD2CyE%2BH%2FBEYL2sJ%2B4nV9%2FOklCUoyYPiegbqwlFqzfE%2BnViiqW87jner2OdiFYVXKnHjjaSSx%2FJDbZWgyrFSCnaU8AxPJtsGXuMpDzFZw7B8YgcpTmCkSasag97Sd%2Fl1r6igCZh%2F1YyquO0H%2FyMVIXq8%2FUAarrXIFzeSx%2BBiB0ywQn6Iz6Smkiv63RWoJeNrzojIXfuoTbFw%2BVzXSnF6TH5MF4X7ooRKw%2FImPagScBbqIMjrq0EfPf6%2Bcm9XE%3D"})
d = r.json()
print(r)
print("----------")
print(d)    