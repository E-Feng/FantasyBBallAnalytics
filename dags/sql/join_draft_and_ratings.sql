SELECT pickNumber, round, playerName, teamId, ratingSeason, ratingNoEjsSeason, rankingSeason
FROM `fantasy-cc6ec.fantasy.draft` AS draft
JOIN `fantasy-cc6ec.fantasy.ratings` AS ratings
ON draft.playerId = ratings.id