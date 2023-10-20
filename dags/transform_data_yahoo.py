import pandas as pd


def merge_roster_into_teams(league_data: dict):
  teams = league_data["teams"]
  roster = league_data["roster"]

  teams = teams.merge(roster, left_on="teamId", right_on="teamId")

  return teams


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

  for col in cols_to_fix:
    if col in players.columns:
      mask = players[col].notnull()

      players.loc[mask, col] = players.loc[mask, col].apply(lambda d: {str(k):float(d[str(k)]) for k in category_ids})

  mask = players["statRatingsSeason"].notnull()
  players.loc[mask, "totalRatingSeason"] = players.loc[mask, "statRatingsSeason"].apply(lambda d: sum(d.values()))
  players.loc[mask, "totalRankingSeason"] = players.loc[mask, "totalRatingSeason"].rank(method='min', ascending=False)

  return players


def truncate_and_map_player_ids(league_data: dict):
  players = league_data["players"]
  players_id_map = league_data["players_id_map"]
  draft = league_data["draft"]
  roster = league_data["roster"]

  if draft.empty or players.empty:
    return pd.DataFrame()
  
  # Map yahoo ids
  players = players.drop("playerId", axis=1)
  players = players.merge(players_id_map, on="playerName", how="inner")

  # Truncate
  roster_flatten = pd.json_normalize(roster.explode("roster")["roster"])
  is_owned = players["playerId"].isin(roster_flatten["playerId"])
  is_drafted = players["playerId"].isin(draft["playerId"])

  all_cond = is_owned | is_drafted
  players = players[all_cond]

  return players