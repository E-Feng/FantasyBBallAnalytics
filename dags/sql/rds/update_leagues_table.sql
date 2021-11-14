UPDATE leagues
SET lastupdated = NOW()
WHERE leagueid = '{league_id}'