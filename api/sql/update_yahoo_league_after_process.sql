INSERT INTO leagueids(
    leagueid, created, lastupdated, lastviewed, platform, viewcount, active, allyears, yahoorefreshtoken)
VALUES (%(league_id)s, CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, %(platform)s, 0, TRUE, %(all_years)s, %(yahoo_refresh_token)s)
ON CONFLICT (leagueid, platform) DO UPDATE SET
    lastupdated = NOW(), 
    viewCount = leagueids.viewCount + 1,
    allyears = EXCLUDED.allyears,
    yahoorefreshtoken = EXCLUDED.yahoorefreshtoken