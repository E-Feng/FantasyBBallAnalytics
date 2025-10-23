import pandas as pd

import consts


def transform_players_truncate(league_data: dict):
  players = league_data["players"]
  draft = league_data["draft"]
  rosters = league_data["rosters"]

  if rosters.empty:
    return pd.DataFrame()

  is_owned = players['playerId'].isin(rosters["playerId"])
  is_drafted = players["playerId"].isin(draft["playerId"])
  
  trending_players = players[~is_owned].sort_values("percentChange", ascending=False).head(5)
  is_trending = players["playerId"].isin(trending_players["playerId"])

  all_cond = is_owned | is_drafted | is_trending

  return players[all_cond]


def transform_unrostered_daily(league_data: dict):
  daily = league_data["daily"]
  rosters = league_data["rosters"]

  if daily.empty or rosters.empty:
    return pd.DataFrame()
    
  if league_data["platform"] == "yahoo":
    players_id_map = league_data["players_id_map"]

    daily["fullName"] = daily["fullName"].str.replace(".", "", regex=False)
    players_id_map["playerName"] = players_id_map["playerName"].str.replace(".", "", regex=False)

    daily = daily.drop("playerId", axis=1)
    daily = daily.merge(players_id_map, left_on="fullName", right_on="playerName", how="inner")

  daily_unrostered = daily[~daily['playerId'].isin(rosters["playerId"])]
  top_daily_unrostered = daily_unrostered.head(4)

  return top_daily_unrostered