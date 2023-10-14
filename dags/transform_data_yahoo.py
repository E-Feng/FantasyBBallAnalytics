import pandas as pd


def merge_roster_into_teams(league_data: dict):
  teams = league_data["teams"]
  roster = league_data["roster"]

  teams = teams.merge(roster, left_on="teamId", right_on="teamId")

  return teams


def map_player_ids(league_data: dict):
  players_data = league_data["players"]

  players = players_data[0]
  map_data = players_data[1]

  for i, player in enumerate(players):
    player_name = player["playerName"]
    mapped_id = map_data.get(player_name, None)

    if mapped_id:
      players[i]["playerId"] = mapped_id
    else:
      print("Missing map", player_name)

  return players


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
        player[key] = {str(k):float(player[key][str(k)]) for k in category_ids}

  players = pd.DataFrame.from_records(players)

  is_owned = players['onTeamId'] > 0
  is_drafted = players["playerId"].isin(draft["playerId"])

  all_cond = is_owned | is_drafted

  return players[all_cond]  