# FantasyBBallAnalytics
Analytics to optimize fantasy basketball decisions.
Github Pages hosted - https://e-feng.github.io/FantasyBBallAnalytics/

## Introduction to Fantasy
Fantasy basketball is a popular fantasy game where players act as general managers of teams and draft players from the NBA. Throughout the NBA season, teams would faceoff against each other following their players real-time statistics. Categories such as points, rebounds, assists, steals, and blocks would be tallied and the team that wins the majority would get the win for that weekly matchup. This game type called head-to-head most categories (H2H Cats) is one of many that is typically played. Strategy would involve knowing which players to draft, which players to play for that current week, unowned players to pick up, trades with other teams, and general management of the team. This project would provide additional information and statistics on the state of the league to help with these management decisions.

## Site Details
Information on current standings, player injury list, category standings and ranks, matchups with opposing teams, and player rankings is provided. Colorful visual displays are shown to provide information and help guide a decision for setting player lineups.

## Technical Details
Source data retrieved from ESPN using their Fantasy Basketball API various endpoints. The JSON data was parsed and formatted into relational tables and stored into a local MySQL database. Unchanged data was also stored into a local MongoDB database for practice purposes. Python and libraries such as pandas and numpy were used to analyze the data, comparing matchups with every other teams, overall category rankings, player rankings, etc. The data was converted to JSON files and pushed to a neighboring repository for ease of daily updates. Github pages was used to host the static website where the data was fetched and displayed using primarily Google Charts.

## Example Visuals
### League Standings
Current league standings with rankings, win-loss column, and heatmap of overall category stats throughout the weeks.
![League Standings](https://i.imgur.com/q82IisH.png)
