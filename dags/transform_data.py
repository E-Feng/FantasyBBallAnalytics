import pandas as pd

import consts


def transform_players_truncate(league_data: dict):
  players = league_data["players"]
  draft = league_data["draft"]
  rosters = league_data["rosters"]

  is_owned = players['playerId'].isin(rosters["playerId"])
  is_drafted = players["playerId"].isin(draft["playerId"])

  all_cond = is_owned | is_drafted

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


def transform_draft_recap(draft: pd.DataFrame, players: pd.DataFrame, settings: pd.DataFrame):
  has_ejections_cat = int(consts.EJS) in settings.iloc[0]['categoryIds']

  columns = ['pickNumber', 'round', 'playerName', 'teamId', 'ratingSeason', 'rankingSeason']
  if has_ejections_cat:
    columns.append('ratingEjsSeason')
    columns.append('rankingEjsSeason')

  def calculate_ratings_no_ejections(ratings: dict):
    if isinstance(ratings, dict):
      ratings.pop(consts.EJS, None)
      return sum(ratings.values())
    return None

  players_copy = players.copy()

  players_copy['ratingSeason'] = players_copy['statRatingsSeason'].apply(calculate_ratings_no_ejections)

  players_copy['rankingSeason'] = players_copy['ratingSeason'].rank(method='min', na_option='keep', ascending=False)

  draft_recap_full = pd.merge(draft, players_copy, how='left', on='playerId')


  draft_recap_full.rename(columns={
    'totalRatingSeason': 'ratingEjsSeason',
    'totalRankingSeason': 'rankingEjsSeason'
  }, inplace=True)

  draft_recap = draft_recap_full[columns]

  return draft_recap