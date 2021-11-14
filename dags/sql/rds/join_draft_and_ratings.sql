SELECT pickNumber, round, playerName, teamId, ratingSeason, ratingNoEjsSeason, rankingSeason,
  RANK() OVER( ORDER BY ratingNoEjsSeason DESC) AS rankingNoEjsSeason
FROM draftrecap
JOIN ratings
ON draftrecap.playerId = ratings.playerId
WHERE draftrecap.LeagueId = '{league_id}' AND draftrecap.LeagueYear = '{league_year}'