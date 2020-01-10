# FantasyBBallAnalytics
Analytics to optimize fantasy basketball decisions.

Heroku hosted - http://fantasyanalytics.info
Github Pages hosted - https://e-feng.github.io/FantasyBBallAnalytics/

## Introduction to Fantasy
Fantasy basketball is a popular fantasy game where players act as general managers of teams and draft players from the NBA. Throughout the NBA season, teams would faceoff against each other following their players real-time statistics. Categories such as points, rebounds, assists, steals, and blocks would be tallied and the team that wins the majority would get the win for that weekly matchup. This game type called head-to-head most categories (H2H Cats) is one of many that is typically played. Strategy would involve knowing which players to draft, which players to play for that current week, unowned players to pick up, trades with other teams, and general management of the team. This project would provide additional information and statistics on the state of the league to help with these management decisions.

## Site Details
Information on current standings, player injury list, category standings and ranks, matchups with opposing teams, and player rankings is provided. Colorful visual displays are shown to provide information and help guide a decision for setting player lineups.

## Technical Details
Source data retrieved from ESPN using their Fantasy Basketball API various endpoints. The JSON data was parsed and formatted into relational tables and stored into a local MySQL database. Unchanged data was also stored into a local MongoDB database for practice purposes. Python and libraries such as pandas and numpy were used to analyze the data, comparing matchups with every other teams, overall category rankings, player rankings, etc. The data was converted to JSON files and pushed to a neighboring repository for ease of daily updates. Visual displays were created using Google Charts, primarily tables using the JSON data. The page is statically hosted using github pages as well as Heroku's platform as a service.

## Example Visuals
### League Standings
Current league standings with rankings, win-loss column, and heatmap of overall category stats throughout the weeks. Good for seeing teams overall strength and weaknesses in specific categories to help prepare. (Black border denotes playoff cutoff)
![League Standings](https://i.imgur.com/q82IisH.png)

### Schedule Matchups
Matchup comparison against every other team and the mean. Colored categories easily shows win or loss and overall color on team name shows an overall win or loss for that week. Good to see teams overall strength for that week as well as specific matchup details against other teams. (Black border denotes scheduled matchup)
![Schedule Matchup](https://i.imgur.com/Umw74jF.png)

## Future Work
Future work includes further information such as projections for the current matchup as well throughout the rest of the season. A trade simulator can show future projections and stimulate trades.

Long term work would involve opening this project up to the community by allowing others to put in their league and have this information evaluated and help them. Currently portions of this have been hardcoded to this league specifically and may not work on others that have different settings. 
