# Constants for ESPN API category id
PTS = '0'
BLKS = '1'
STLS = '2'
ASTS = '3'
OREBS = '4'
DREBS = '5'
REBS = '6'
EJS = '7'
FLAGS = '8'
PFS = '9'
TECHS = '10'
TOS = '11'
DQS = '12'
FG_MADE = '13'
FG_ATT = '14'
FT_MADE = '15'
FT_ATT = '16'
THREES = '17'
THREE_ATT = '18'
FG_PER = '19'
FT_PER = '20'
THREE_PER = '21'
ADJ_FG_PER = '22'
FG_MISS = '23'
FT_MISS = '24'
THREE_MISS = '25'
AST_TO_R = '35'
DDS = '37'
TDS = '38'
QDS = '39'
MINS = '40'
GS = '41'
GP = '42'
TWS = '43'

FPTS = '99'

SEASON = '0'
LAST7 = '1'
LAST15 = '2'
LAST30 = '3'

# Constants for Yahoo API category ids
GP_Y = '0' # Games played
GS_Y = '1' # Games started
MINS_Y = '2'
FG_ATT_Y = '3'
FG_MADE_Y = '4'
FG_PER_Y = '5'
FG_DISP_Y = '9004003'
FT_ATT_Y = '6'
FT_MADE_Y = '7'
FT_PER_Y = '8'
FT_DISP_Y = '9007006'
THREE_ATT_Y = '9'
THREES_Y = '10'
THREE_PER_Y = '11'
PTS_Y = '12'
OREBS_Y = '13'
DREBS_Y = '14'
REBS_Y = '15'
ASTS_Y = '16'
STLS_Y = '17'
BLKS_Y = '18'
TOS_Y = '19'
AST_TO_R_Y = '20' # Assist/turnover ratio
PFS_Y = '21'
DQS_Y = '22'
TECHS_Y = '23'
EJS_Y = '24'
FLAGS_Y = '25'
DDS_Y = '27'
TDS_Y = '28'

STAT_IDS_MAP_TO_ESPN = {
  MINS_Y: MINS,
  FG_DISP_Y: -1,
  FG_ATT_Y: FG_ATT,
  FG_PER_Y: FG_PER,
  FT_DISP_Y: -1,
  FT_ATT_Y: FT_ATT,
  FT_PER_Y: FT_PER,
  THREES_Y: THREES,
  THREE_ATT_Y: THREE_ATT,
  THREE_PER_Y: THREE_PER,
  PTS_Y: PTS,
  OREBS_Y: OREBS,
  DREBS_Y: DREBS,
  REBS_Y: REBS,
  ASTS_Y: ASTS,
  STLS_Y: STLS,
  BLKS_Y: BLKS,
  TOS_Y: TOS,
  AST_TO_R_Y: AST_TO_R,
  DDS_Y: DDS,
  TDS_Y: TDS,
}

# Constants for ESPN API lineup slot ids
SLOT_PG = 0
SLOT_SG = 1
SLOT_SF = 2
SLOT_PF = 3
SLOT_C = 4
SLOT_G = 5
SLOT_F = 6
SLOT_SG_SF = 7
SLOT_G_F = 8
SLOT_PF_C = 9
SLOT_F_C = 10
SLOT_UTIL = 11
SLOT_BENCH = 12
SLOT_IR = 13

# Constants for Yahoo API roster positions
SLOT_PG_Y = 'PG'
SLOT_SG_Y = 'SG'
SLOT_G_Y = 'G'
SLOT_SF_Y = 'SF'
SLOT_PF_Y = 'PF'
SLOT_F_Y = 'F'
SLOT_C_Y = 'C'
SLOT_UTIL_Y = 'Util'
SLOT_BENCH_Y = 'BN'
SLOT_IL_Y = 'IL'
SLOT_IL_PLUS_Y = 'IL+'

SLOT_IDS_MAP_TO_ESPN = {
  SLOT_PG_Y: SLOT_PG,
  SLOT_SG_Y: SLOT_SG,
  SLOT_G_Y: SLOT_G,
  SLOT_SF_Y: SLOT_SF,
  SLOT_PF_Y: SLOT_PF,
  SLOT_F_Y: SLOT_F,
  SLOT_C_Y: SLOT_C,
  SLOT_UTIL_Y: SLOT_UTIL,
  SLOT_BENCH_Y: SLOT_BENCH,
  SLOT_IL_Y: SLOT_IR,
  SLOT_IL_PLUS_Y: SLOT_IR,
}

# ESPN proTeamId -> NBA tricode (matches PRO_TEAM_IDS in client/src/utils/consts.js)
ESPN_PRO_TEAM_TO_NBA = {
  1: 'ATL', 2: 'BOS', 3: 'NOP', 4: 'CHI', 5: 'CLE', 6: 'DAL', 7: 'DEN', 8: 'DET',
  9: 'GSW', 10: 'HOU', 11: 'IND', 12: 'LAC', 13: 'LAL', 14: 'MIA', 15: 'MIL',
  16: 'MIN', 17: 'BKN', 18: 'NYK', 19: 'ORL', 20: 'PHI', 21: 'PHX', 22: 'POR',
  23: 'SAC', 24: 'SAS', 25: 'OKC', 26: 'UTA', 27: 'WAS', 28: 'TOR', 29: 'MEM',
  30: 'CHA',
}

# Yahoo season game ids
YAHOO_SEASON_GAME_IDS = {
    '2023': '428',
    '2024': '454',
    '2025': '466',
    '2026': '999'
}
YAHOO_DUMMY_LEAGUE_IDS = {
    '2024': '454.l.52531',
    '2025': '466.l.9359',
    '2026': '999.l.58546'
}

# Public league to get player data
ESPN_DATA_FETCH_LEAGUE_ID = '1978554631'