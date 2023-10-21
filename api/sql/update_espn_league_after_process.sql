INSERT INTO leagueids(
    leagueid, created, lastupdated, lastviewed, platform, viewcount, active, cookieespns2)
VALUES (%(league_id)s, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'espn', 0, TRUE, %(cookie_espn)s)
ON CONFLICT (leagueid, platform) DO UPDATE SET
    lastupdated = NOW(), 
    viewCount = leagueids.viewCount + 1,
    cookieespns2 = EXCLUDED.cookieespns2