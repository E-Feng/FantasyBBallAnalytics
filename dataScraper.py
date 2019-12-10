import math
import requests
import json


class DataScraper(object):
    # Constants for ESPN API
    CONST_PTS = '0'
    CONST_BLK = '1'
    CONST_STL = '2'
    CONST_AST = '3'
    CONST_REB = '6'
    CONST_EJ = '7'
    CONST_TO = '11'
    CONST_FGM = '13'
    CONST_FGA = '14'
    CONST_FTM = '15'
    CONST_FTA = '16'
    CONST_3PM = '17'
    CONST_FG_PER = '19'
    CONST_FT_PER = '20'
    CONST_MINS = '40'

    CONST_SEASON = '00'
    CONST_LAST7 = '01'
    CONST_LAST15 = '02'
    CONST_LAST30 = '03'

    # Establishing league URL and appropriate cookies
    swid_cookie = "{A746C402-08B1-42F4-86C4-0208B142F42A}"
    espn_cookie = "{AEANBh%2BD2CyE%2BH%2FBEYL2sJ%2B4nV9%2FOklCUoyYPiegbqwlFqzfE%2BnViiqW87jner2OdiFYVXKnHjjaSSx%2FJDbZWgyrFSCnaU8AxPJtsGXuMpDzFZw7B8YgcpTmCkSasag97Sd%2Fl1r6igCZh%2F1YyquO0H%2FyMVIXq8%2FUAarrXIFzeSx%2BBiB0ywQn6Iz6Smkiv63RWoJeNrzojIXfuoTbFw%2BVzXSnF6TH5MF4X7ooRKw%2FImPagScBbqIMjrq0EfPf6%2Bcm9XE%3D}"

    def __init__(self, mydb, league_id, league_year):
        self.mydb = mydb
        self.mycursor = mydb.cursor(buffered=True)
        self.league_id = league_id
        self.league_year = league_year
        self.num_teams = None

        self.base_url = "https://fantasy.espn.com/apis/v3/games/fba/seasons/" + \
            str(self.league_year) + "/segments/0/leagues/" + str(league_id)

        per_1 = self.CONST_SEASON + str(self.league_year)
        per_2 = self.CONST_LAST7 + str(self.league_year)
        per_3 = self.CONST_LAST15 + str(self.league_year)
        per_4 = self.CONST_LAST30 + str(self.league_year)

        self.periods = (per_1, per_2, per_3, per_4)


    def init_tables(self):
        """ 
        Initializes tables for database

        Returns:
        Table "teams" in MySQL with columns
            id            INT            PK
            abbrev        VARCHAR(4)
            team_name     VARCHAR(255)
            first_name    VARCHAR(255)
            last_name     VARCHAR(255)
            wins          INT
            losses        INT
            logo_url      VARCHAR(255)

        Table "scoreboard" in MySQL with columns
            scores_id     INT            PK AI
            fg_per        FLOAT
            ft_per        FLOAT
            three_pm      INT
            rebs          INT
            asts          INT
            stls          INT
            blks          INT
            tos           INT
            ejs           INT
            pts           INT

        Table "schedules" in MySQL with columns
            id            INT            PK
            week          INT 
            home_id       INT            FK to scoreboard.stat_id
            away_id       INT            FK to scoreboard.stat_id
            home_team     INT            FK to teams.id
            away_team     INT            FK to teams.id  

        Table "player_info" in MySQL with columns
            player_id     INT            PK
            team_id       INT            FK to teams.id
            first_name    VARCHAR(255)
            last_name     VARCHAR(255)
            state         VARCHAR(255)
            avail_slots   JSON

        Table "player_stats" in MySQL with columns
            id            INT            PK AI
            player_id     INT            FK to rosters.player_id
            period        VARCHAR(255)
            mins          FLOAT
            fgm           FLOAT
            fga           FLOAT
            fg_per        FLOAT
            ftm           FLOAT
            fta           FLOAT
            ft_per        FLOAT
            three_pm      FLOAT
            rebs          FLOAT
            asts          FLOAT
            stls          FLOAT
            blks          FLOAT
            tos           FLOAT
            ejs           FLOAT
            pts           FLOAT
            zscore        FLOAT

        """
        self.mycursor.execute("SHOW TABLES")
        tables = self.mycursor.fetchall()

        if (tables is None) or ("teams",) not in tables:
            self.mycursor.execute("CREATE TABLE teams ("
                                  "id INT PRIMARY KEY,"
                                  "abbrev VARCHAR(4),"
                                  "team_name VARCHAR(255),"
                                  "first_name VARCHAR(255),"
                                  "last_name VARCHAR(255),"
                                  "wins INT,"
                                  "losses INT,"
                                  "logo_url VARCHAR(255))")  

        if (tables is None) or ("scoreboard",) not in tables:
            self.mycursor.execute("CREATE TABLE scoreboard ("
                                  "scores_id INT AUTO_INCREMENT PRIMARY KEY,"
                                  "fg_per FLOAT,"
                                  "ft_per FLOAT,"
                                  "three_pm INT,"
                                  "rebs INT,"
                                  "asts INT,"
                                  "stls INT,"
                                  "blks INT,"
                                  "tos INT,"
                                  "ejs INT,"
                                  "pts INT)")                                                

        if (tables is None) or ("schedules",) not in tables:
            self.mycursor.execute("CREATE TABLE schedules ("
                                  "id INT PRIMARY KEY,"
                                  "week INT,"
                                  "home_id INT,"
                                  "away_id INT,"                                  
                                  "home_team INT,"
                                  "away_team INT)")  

        if (tables is None) or ("player_info",) not in tables:
            self.mycursor.execute("CREATE TABLE player_info ("
                                  "player_id INT PRIMARY KEY,"
                                  "team_id INT,"
                                  "first_name VARCHAR(255),"
                                  "last_name VARCHAR(255),"
                                  "state VARCHAR(255),"
                                  "avail_slots JSON)")

        if (tables is None) or ("player_stats",) not in tables:
            self.mycursor.execute("CREATE TABLE player_stats ("
                                  "id INT AUTO_INCREMENT PRIMARY KEY,"
                                  "player_id INT,"
                                  "period VARCHAR(255),"
                                  "mins FLOAT,"
                                  "fgm FLOAT,"
                                  "fga FLOAT,"
                                  "fg_per FLOAT,"
                                  "ftm FLOAT,"
                                  "fta FLOAT,"
                                  "ft_per FLOAT,"
                                  "three_pm FLOAT,"
                                  "rebs FLOAT,"
                                  "asts FLOAT,"
                                  "stls FLOAT,"
                                  "blks FLOAT,"
                                  "tos FLOAT,"
                                  "ejs FLOAT,"
                                  "pts FLOAT,"
                                  "zscore FLOAT)")                               


    def get_team_data(self):
        """ 
        Gets team data for league from ESPN
        """
        self.mycursor.execute("TRUNCATE TABLE teams")

        r = requests.get(self.base_url,
                        params={"view" : "mTeam"},
                        cookies={"swid" : self.swid_cookie,
                                "espn_s2" : self.espn_cookie})
                        
        d = json.loads(r.text)

        self.num_teams = len(d["teams"])

        sql = ("INSERT INTO teams (id, abbrev, team_name, first_name, last_name, wins, losses, logo_url)"
                " VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
                " ON DUPLICATE KEY UPDATE id=id")
        vals = []

        for team in d["teams"]:
            id = team["id"]
            id_key = team["primaryOwner"]
            abbrev = team["abbrev"]
            team_name = team["location"] + " " + team["nickname"]
            logo_url = team["logo"]
            wins = team["record"]["overall"]["wins"]
            losses = team["record"]["overall"]["losses"]

            for member in d["members"]:
                if id_key in member["id"]:
                    first_name = member["firstName"]
                    last_name = member["lastName"]

            vals.append((id, abbrev, team_name, first_name, last_name, wins, losses, logo_url))

        self.mycursor.executemany(sql, vals)
        self.mydb.commit()


    def get_scoreboard_data(self):
        """
        Gets scoreboard and schedule data for league from ESPN
        """
        self.mycursor.execute("TRUNCATE TABLE scoreboard")
        self.mycursor.execute("TRUNCATE TABLE schedules")

        r = requests.get(self.base_url,
                        params={"view" : "mScoreboard"},
                        cookies={"swid" : self.swid_cookie,
                                "espn_s2" : self.espn_cookie})
                        
        d = json.loads(r.text)

        sql_sch = ("INSERT INTO schedules (id, week, home_id, away_id, home_team, away_team)"
                " VALUES (%s, %s, %s, %s, %s, %s)")

        sql_sco = ("INSERT INTO scoreboard (fg_per, ft_per, three_pm, rebs, asts, stls, blks, tos, ejs, pts)"
                " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")

        sides = ("home", "away")
        for match in d["schedule"]:
            sch_id = match["id"]
            week = math.ceil(sch_id/(self.num_teams/2))

            # Grabbing data for both home and away teams
            scores_id = {}
            for side in sides:
                # Check if scheduled matchup has occured
                if "cumulativeScore" in match["home"]:
                    fg_per = match[side]["cumulativeScore"]["scoreByStat"][self.CONST_FG_PER]["score"]
                    ft_per = match[side]["cumulativeScore"]["scoreByStat"][self.CONST_FT_PER]["score"]
                    three_pm = match[side]["cumulativeScore"]["scoreByStat"][self.CONST_3PM]["score"]
                    rebs = match[side]["cumulativeScore"]["scoreByStat"][self.CONST_REB]["score"]
                    asts = match[side]["cumulativeScore"]["scoreByStat"][self.CONST_AST]["score"]
                    stls = match[side]["cumulativeScore"]["scoreByStat"][self.CONST_STL]["score"]
                    blks = match[side]["cumulativeScore"]["scoreByStat"][self.CONST_BLK]["score"]
                    tos = match[side]["cumulativeScore"]["scoreByStat"][self.CONST_TO]["score"]
                    ejs = match[side]["cumulativeScore"]["scoreByStat"][self.CONST_EJ]["score"]
                    pts = match[side]["cumulativeScore"]["scoreByStat"][self.CONST_PTS]["score"]

                    val_sco = (fg_per, ft_per, three_pm, rebs, asts, stls, blks, tos, ejs, pts)

                    self.mycursor.execute(sql_sco, val_sco)
                    scores_id[side] = self.mycursor.lastrowid
                    self.mydb.commit()
                else:
                    scores_id[side] = None

            # Adding to schedule table after both sides are done
            team_id = match["home"]["teamId"]
            opp_id = match["away"]["teamId"]

            val_sch = (sch_id, week, scores_id["home"], scores_id["away"], team_id, opp_id)
            
            self.mycursor.execute(sql_sch, val_sch)
            self.mydb.commit()

                    
    def get_player_data(self):
        """
        Gets player data for league from ESPN
        """
        self.mycursor.execute("TRUNCATE TABLE player_info")
        self.mycursor.execute("TRUNCATE TABLE player_stats")

        r = requests.get(self.base_url,
                        params={"view" : "kona_player_info"},
                        cookies={"swid" : self.swid_cookie,
                                "espn_s2" : self.espn_cookie})
                        
        d = json.loads(r.text)      

        sql_pinfo = ("INSERT INTO player_info (player_id, team_id, first_name, last_name, state, avail_slots)"
                " VALUES (%s, %s, %s, %s, %s, %s)")

        sql_pstats = ("INSERT INTO player_stats (player_id, period, mins, fgm, fga, fg_per, ftm, fta, ft_per, three_pm, rebs, asts, stls, blks, tos, ejs, pts, zscore)"
                " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")                

        for player in d["players"]:
            # Check for active player (has rating or rostered)
            if "ratings" in player:
                if player["ratings"]["0"]["positionalRanking"] != 0 or player["status"] == "ONTEAM":
                    player_id = player["id"]
                    team_id = player["onTeamId"] or None
                    first_name = player["player"]["firstName"]
                    last_name = player["player"]["lastName"]
                    state = player["player"]["injuryStatus"]
                    avail_slots = json.dumps(player["player"]["eligibleSlots"])

                    val_pinfo = (player_id, team_id, first_name, last_name, state, avail_slots)

                    self.mycursor.execute(sql_pinfo, val_pinfo)
                    self.mydb.commit()    

                    for stat in player["player"]["stats"]:
                        if stat["id"] in self.periods and "averageStats" in stat:
                            period = stat["id"]
                            mins = stat["averageStats"][self.CONST_MINS]
                            fgm = stat["averageStats"][self.CONST_FGM]
                            fga = stat["averageStats"][self.CONST_FGA]
                            fg_per = stat["averageStats"][self.CONST_FG_PER]
                            ftm = stat["averageStats"][self.CONST_FTA]
                            fta = stat["averageStats"][self.CONST_FTM]
                            ft_per = stat["averageStats"][self.CONST_FT_PER]
                            three_pm = stat["averageStats"][self.CONST_3PM]
                            rebs = stat["averageStats"][self.CONST_REB]
                            asts = stat["averageStats"][self.CONST_AST]
                            stls = stat["averageStats"][self.CONST_STL]
                            blks = stat["averageStats"][self.CONST_BLK]
                            tos = stat["averageStats"][self.CONST_TO]
                            ejs = stat["averageStats"][self.CONST_EJ]
                            pts = stat["averageStats"][self.CONST_PTS]

                            rating_key = period[1]
                            zscore = player["ratings"][rating_key]["totalRating"]

                            val_pstats = (player_id, period, mins, fgm, fga, fg_per, ftm, fta, ft_per, three_pm, rebs, asts, stls, blks, tos, ejs, pts, zscore)

                            self.mycursor.execute(sql_pstats, val_pstats)
                            self.mydb.commit()               