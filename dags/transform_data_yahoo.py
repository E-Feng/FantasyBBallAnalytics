import pandas as pd


def merge_roster_into_teams(league_data: dict):
  teams = league_data["teams"]
  roster = league_data["roster"]

  teams = teams.merge(roster, left_on="teamId", right_on="teamId")

  return teams


def truncate_players(league_data: dict):
  players = league_data["players"]
  draft = league_data["draft"]
  settings = league_data["settings"]

  if draft.empty or league_data["leagueYear"] < 2024:
    return []

  category_ids = settings.iloc[0]["categoryIds"]
  for player in players:
    for key in player.keys():
      if isinstance(player[key], dict) and "stat" in key:
        player[key] = {str(k):player[key][str(k)] for k in category_ids}

  players = pd.DataFrame.from_records(players)

  is_owned = players['onTeamId'] > 0
  is_drafted = players["playerId"].isin(draft["playerId"])

  all_cond = is_owned | is_drafted

  return players[all_cond]  