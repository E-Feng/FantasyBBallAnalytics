import pandas as pd

import consts


def transform_yahoo_raw_to_df(endpoint: str, raw_data: dict):
    """
    Index function for all endpoint transformations
    """
    # Temperory replacement until match supported in Python 3.10
    if endpoint == 'settings':
        df = transform_settings_to_df(raw_data)
    elif endpoint == 'teams':
        df = transform_team_to_df(raw_data)
    elif endpoint == 'roster':
        df = transform_roster_to_df(raw_data)
    elif endpoint == 'scoreboard':
        df = transform_scoreboard_to_df(raw_data)
    elif endpoint == 'draft':
        df = transform_draft_to_df(raw_data)       
    elif endpoint in ['players', 'players_id_map']:
        df = transform_to_df(raw_data)
    else:
        df = pd.DataFrame()

    return df


def transform_team_to_df(data: dict):
    """
    Transforms team raw json data from ESPN API to pandas dataframe
    """
    data_array = []

    # Iterate through all teams
    for team in data['fantasy_content']["league"]["teams"]:
        row = {}

        team = team["team"]

        row['teamId'] = int(team['team_id'])
        row['teamName'] = team['name']
        row['seed'] = team['team_standings']["rank"]
        row['wins'] = team['team_standings']["outcome_totals"]['wins']
        row['losses'] = team['team_standings']["outcome_totals"]['losses']

        row['fullTeamName'] = team['name']

        # Getting first and last name from teams key
        row['firstName'] = team["managers"][0]["manager"]["nickname"]
        row['lastName'] = ""

        #print(row)
        data_array.append(row)
  
    df = pd.DataFrame.from_records(data_array)
    return df


def transform_roster_to_df(data: dict):
    """
    Transforms roster raw json data from ESPN API to pandas dataframe
    """
    data_array = []

    for team in data['fantasy_content']["league"]["teams"]:
        row = {}

        team = team["team"]

        row['teamId'] = int(team["team_id"])
        row["roster"] = []

        for player in team["roster"]["players"]:
            player = player["player"]

            player_row = {}

            player_row["playerId"] = player["player_id"]
            player_row["lineupSlotId"] = player["selected_position"]["position"]
            player_row["acquisitionType"] = ""
            row["roster"].append(player_row)

        data_array.append(row)

    df = pd.DataFrame.from_records(data_array)
    return df   


def transform_settings_to_df(data: dict):
    data_array = []

    data = data["fantasy_content"]["league"]

    row = {}

    row["isActive"] = True
    row['currentWeek'] = data["current_week"]
    row["scoringType"] = data["scoring_type"]

    row["categoryIds"] = [20,6,7,0,1,17,2,11,3,19]

    data_array.append(row)

    df = pd.DataFrame.from_records(data_array)
    return df


def transform_scoreboard_to_df(data: dict):
    data_array = []

    for match in data["fantasy_content"]["league"]["scoreboard"]["matchups"]:
        week = int(match["matchup"]["week"])

        team_id_1 = int(match["matchup"]["teams"][0]["team"]["team_id"])
        team_id_2 = int(match["matchup"]["teams"][1]["team"]["team_id"])

        for team in match["matchup"]["teams"]:
            row = {}
            team = team["team"]

            team_id = int(team["team_id"])

            row["week"] = week
            row["teamId"] = team_id
            row["awayId"] = team_id_1 if team_id == team_id_2 else team_id_2
            row["won"] = team.get("win_probability", 0) > 0.5

            # Formatting list of dicts to dict for easier extraction
            stats = team["team_stats"]["stats"]
            stats_dict = {stat["stat"]["stat_id"]: stat["stat"]["value"] for stat in stats}

            row['fgMade'] = int(stats_dict.get(consts.FG_MADE_Y) or 0)
            row['fgAtt'] = int(stats_dict.get(consts.FG_ATT_Y) or 0)
            row['fgPer'] = float(stats_dict.get(consts.FG_PER_Y) or 0)
            row['ftMade'] = int(stats_dict.get(consts.FT_MADE_Y) or 0)
            row['ftAtt'] = int(stats_dict.get(consts.FT_ATT_Y) or 0)
            row['ftPer'] = float(stats_dict.get(consts.FT_PER_Y) or 0)
            row['threes'] = int(stats_dict.get(consts.THREES_Y) or 0)
            row['orebs'] = int(stats_dict.get(consts.OREBS_Y) or 0)
            row['drebs'] = int(stats_dict.get(consts.DREBS_Y) or 0)
            row['rebs'] = int(stats_dict.get(consts.REBS_Y) or 0)
            row['asts'] = int(stats_dict.get(consts.ASTS_Y) or 0)
            row['stls'] = int(stats_dict.get(consts.STLS_Y) or 0)
            row['blks'] = int(stats_dict.get(consts.BLKS_Y) or 0)
            row['tos'] = int(stats_dict.get(consts.TOS_Y) or 0)
            row['dqs'] = int(stats_dict.get(consts.DQS_Y) or 0)
            row['ejs'] = int(stats_dict.get(consts.EJS_Y) or 0)
            row['flags'] = int(stats_dict.get(consts.FLAGS_Y) or 0)
            row['pfs'] = int(stats_dict.get(consts.PFS_Y) or 0)
            row['techs'] = int(stats_dict.get(consts.TECHS_Y) or 0)
            row['pts'] = int(stats_dict.get(consts.PTS_Y) or 0)
            # row['fpts'] = int(stats_dict.get(consts.FG_MADE_Y) or 0)

            # Clean null values
            row = {k: v for k, v in row.items() if (type(v) == int or type(v) == float)}

            data_array.append(row)

    df = pd.DataFrame.from_records(data_array)
    return df


def transform_draft_to_df(data: dict):
    data_array = []

    for pick in data['fantasy_content']["league"]["draft_results"]:
        row = {}
        pick = pick["draft_result"]

        if pick and pick.get('player_key'):
            row['pickNumber'] = pick['pick']
            row['round'] = pick['round']
            row['teamId'] = int(pick['team_key'][-1])
            row['playerId'] = pick['player_key'].split('.')[-1]

            data_array.append(row)
  
    df = pd.DataFrame.from_records(data_array)
    return df


def transform_to_df(data: dict):
    df = pd.DataFrame.from_records(data)
    return df