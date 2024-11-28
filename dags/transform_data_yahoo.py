import pandas as pd

import consts

def adjust_player_ratings(league_data: dict):
  players = league_data["players"]
  settings = league_data["settings"]

  if players.empty:
    return players

  cols_to_fix = [
    "statsSeason",
    "statsLast7",
    "statsLast15",
    "statsLast30",
    "statRatingsSeason",
    "statRatingsLast7",
    "statRatingsLast15",
    "statRatingsLast30"
  ]

  category_ids = settings.iloc[0]["categoryIds"]
  category_ids = [id for id in category_ids if id >= 0]

  if int(consts.FG_PER) in category_ids:
    category_ids.extend([int(consts.FG_MADE), int(consts.FG_ATT)])
  if int(consts.FT_PER) in category_ids:
    category_ids.extend([int(consts.FT_MADE), int(consts.FT_ATT)])

  for col in cols_to_fix:
    if col in players.columns:
      mask = players[col].notnull()

      players.loc[mask, col] = players.loc[mask, col].apply(lambda d: {str(k):float(d.get(str(k), 0)) for k in category_ids})

  mask = players["statRatingsSeason"].notnull()
  players.loc[mask, "totalRatingSeason"] = players.loc[mask, "statRatingsSeason"].apply(lambda d: sum(d.values()))
  players.loc[mask, "totalRankingSeason"] = players.loc[mask, "totalRatingSeason"].rank(method='min', ascending=False)

  return players


def truncate_and_map_player_ids(league_data: dict):
  players = league_data["players"]
  players_id_map = league_data["players_id_map"]
  draft = league_data["draft"]
  rosters = league_data["rosters"]

  if draft.empty or players.empty:
    return pd.DataFrame()
  
  # Map yahoo ids
  # Manual exceptions
  players_id_map.loc[players_id_map["playerName"] == "Alex Sarr", "playerName"] = "Alexandre Sarr"

  players["playerName"] = players["playerName"].str.replace(".", "", regex=False)
  players_id_map["playerName"] = players_id_map["playerName"].str.replace(".", "", regex=False)

  players = players.drop("playerId", axis=1)
  players = players.merge(players_id_map, on="playerName", how="inner")

  # Truncate
  is_owned = players["playerId"].isin(rosters["playerId"])
  is_drafted = players["playerId"].isin(draft["playerId"])

  all_cond = is_owned | is_drafted
  players = players[all_cond]

  return players


def map_daily_player_ids(league_data: dict):
  daily = league_data["daily"]
  players_id_map = league_data["players_id_map"]

  if daily.empty:
    return pd.DataFrame()
  
  daily["playerName"] = daily["playerName"].str.replace(".", "", regex=False)
  players_id_map["playerName"] = players_id_map["playerName"].str.replace(".", "", regex=False)

  daily = daily.drop("playerId", axis=1)
  daily = daily.merge(players_id_map, on="playerName", how="inner")

  return daily