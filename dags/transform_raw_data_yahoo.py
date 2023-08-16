import pandas as pd

import consts


def transform_yahoo_raw_to_df(endpoint: list, raw_data: dict):
    """
    Index function for all endpoint transformations
    """
    # Temperory replacement until match supported in Python 3.10
    if endpoint == 'settings':
        df = transform_settings_to_df(raw_data)
    elif endpoint == 'teams':
        df = transform_team_to_df(raw_data)
    elif endpoint == 'scoreboard':
        df = transform_scoreboard_to_df(raw_data)
    elif endpoint == 'draft':
        df = transform_draft_to_df(raw_data)       
    elif endpoint == 'players':
        df = transform_players_to_df(raw_data)    
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


def transform_settings_to_df(data: dict):
    data_array = []

    row = {}

    row["isActive"] = True
    row["scoringType"] = data["fantasy_content"]["league"]["scoring_type"]

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
            row["won"] = team["win_probability"] > 0.5

            # Formatting list of dicts to dict for easier extraction
            stats = team["team_stats"]["stats"]
            stats_dict = {cat_id: val for stat in stats for cat_id, val in stat.items()}

            row['fgMade'] = int(stats_dict.get(consts.FG_MADE_Y, 0))
            row['fgAtt'] = int(stats_dict.get(consts.FG_ATT_Y, 0))
            row['fgPer'] = float(stats_dict.get(consts.FG_PER_Y, 0))
            row['ftMade'] = int(stats_dict.get(consts.FT_MADE_Y, 0))
            row['ftAtt'] = int(stats_dict.get(consts.FT_ATT_Y, 0))
            row['ftPer'] = float(stats_dict.get(consts.FT_PER_Y, 0))
            row['threes'] = int(stats_dict.get(consts.THREES_Y, 0))
            row['orebs'] = int(stats_dict.get(consts.OREBS_Y, 0))
            row['drebs'] = int(stats_dict.get(consts.DREBS_Y, 0))
            row['rebs'] = int(stats_dict.get(consts.REBS_Y, 0))
            row['asts'] = int(stats_dict.get(consts.ASTS_Y, 0))
            row['stls'] = int(stats_dict.get(consts.STLS_Y, 0))
            row['blks'] = int(stats_dict.get(consts.BLKS_Y, 0))
            row['tos'] = int(stats_dict.get(consts.TOS_Y, 0))
            row['dqs'] = int(stats_dict.get(consts.FG_MADE_Y, 0))
            row['ejs'] = int(stats_dict.get(consts.FG_MADE_Y, 0))
            row['flags'] = int(stats_dict.get(consts.FG_MADE_Y, 0))
            row['pfs'] = int(stats_dict.get(consts.FG_MADE_Y, 0))
            row['techs'] = int(stats_dict.get(consts.FG_MADE_Y, 0))
            row['pts'] = int(stats_dict.get(consts.PTS_Y, 0))
            row['fpts'] = float(stats_dict.get(consts.FG_MADE_Y, 0))

            data_array.append(row)

    df = pd.DataFrame.from_records(data_array)
    return df


def transform_draft_to_df(data: dict):
    data_array = []

    for pick in data['fantasy_content']["league"]["draft_results"]:
        row = {}
        pick = pick["draft_result"]

        row['pickNumber'] = pick['pick']
        row['round'] = pick['round']
        row['teamId'] = int(pick['team_key'][-1])
        row['playerId'] = pick['player_key'].split('.')[-1]

        data_array.append(row)
  
    df = pd.DataFrame.from_records(data_array)
    return df


def transform_players_to_df(data: dict):
    data_array = []


    df = pd.DataFrame.from_records(data_array)
    return df