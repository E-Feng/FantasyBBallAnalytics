import pandas as pd


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

            row['fgMade'] = int(team["team_points"]["week"])
            row['fgAtt'] = int(team["team_points"]["week"])
            row['fgPer'] = int(team["team_points"]["week"])
            row['ftMade'] = int(team["team_points"]["week"])
            row['ftAtt'] = int(team["team_points"]["week"])
            row['ftPer'] = int(team["team_points"]["week"])
            row['threes'] = int(team["team_points"]["week"])
            row['orebs'] = int(team["team_points"]["week"])
            row['drebs'] = int(team["team_points"]["week"])
            row['rebs'] = int(team["team_points"]["week"])
            row['asts'] = int(team["team_points"]["week"])
            row['stls'] = int(team["team_points"]["week"])
            row['blks'] = int(team["team_points"]["week"])
            row['tos'] = int(team["team_points"]["week"])
            row['dqs'] = int(team["team_points"]["week"])
            row['ejs'] = int(team["team_points"]["week"])
            row['flags'] = int(team["team_points"]["week"])
            row['pfs'] = int(team["team_points"]["week"])
            row['techs'] = int(team["team_points"]["week"])
            row['pts'] = int(team["team_points"]["week"])
            row['fpts'] = int(team["team_points"]["week"])

            data_array.append(row)

    df = pd.DataFrame.from_records(data_array)
    return df


def transform_draft_to_df(data: dict):
    data_array = []

    for pick in data['fantasy_content']["league"]["draft_results"]:
        row = {}

        row['pickNumber'] = pick['pick']
        row['round'] = pick['round']
        row['teamId'] = pick['team_key'][-1]
        row['playerId'] = pick['player_key'].split('.')[-1]

        data_array.append(row)
  
    df = pd.DataFrame.from_records(data_array)
    return df


def transform_players_to_df(data: dict):
    data_array = []


    df = pd.DataFrame.from_records(data_array)
    return df