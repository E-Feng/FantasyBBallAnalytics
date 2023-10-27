INSERT INTO leagueids(
    leagueid, created, lastupdated, lastviewed, platform, viewcount, active, yahoorefreshtoken)
VALUES (%(league_id)s, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, %(platform)s, 0, TRUE, %(yahoo_refresh_token)s)
ON CONFLICT (leagueid, platform) DO UPDATE SET
    lastupdated = NOW(), 
    viewCount = leagueids.viewCount + 1,
    yahoorefreshtoken = EXCLUDED.yahoorefreshtoken