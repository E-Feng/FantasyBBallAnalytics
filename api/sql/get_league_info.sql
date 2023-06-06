SELECT
  (NOW() - lastupdated) < INTERVAL '1 day',
  CASE WHEN platform = 'espn' THEN cookieespns2 ELSE yahoorefreshtoken END
FROM leagueids  
WHERE leagueid = %(league_id)s
  AND platform = %(platform)s