# FantasyBBallAnalytics
Analytics to optimize fantasy basketball decisions.

Heroku/AWS-EC2 hosted - http://fantasyanalytics.info

Github Pages hosted - https://e-feng.github.io/FantasyBBallAnalytics/

## Introduction to Fantasy
Fantasy basketball is a popular fantasy game where players act as general managers of teams and draft players from the NBA. Throughout the NBA season, teams would faceoff against each other following their players real-time statistics. Categories such as points, rebounds, assists, steals, and blocks would be tallied and the team that wins the majority would get the win for that weekly matchup. This game type called head-to-head most categories (H2H Cats) is one of many that is typically played. Strategy would involve knowing which players to draft, which players to play for that current week, unowned players to pick up, trades with other teams, and general management of the team. This project would provide additional information and statistics on the state of the league to help with these management decisions.

## Site Details
Information on current standings, player injury list, category standings and ranks, matchups with opposing teams, and player rankings is provided. Colorful visual displays are shown to provide information and help guide a decision for setting player lineups.

## Technical Details

### Frontend
HTML5\
CSS3\
JavaScript\
React (stats only)

### Backend
Node.js/Express\
Python (data)\
MySQL\
MongoDB

### Deployment
GitHub-Pages\
AWS-EC2\
Heroku (current)

Specifics of the technical details as well as history of changes
### Source Data
* JSON data retrieved from ESPN v3 API various endpoints
### Storage 
* Formatted into relational tables and stored in local MySQL database
* Raw JSON also stored in MongoDB database 
### Analysis
* Python and libraries such as pandas and numpy were used to analyze the data, comparing matchups with every other teams, overall category rankings, player rankings, etc. Aggregated data stored into json files
### Data Hosting
* Data files pushed to neighboring repository for daily updates and ease of fetching
* Added AWS-S3 buckets and data served using APIs with Express
### Frontend and Visualization
* Responsive designed created with vanilla HTML/CSS/JS
* Tables and graphs created using Google Charts
* Stats page built using React components and hooks
### Deployment
* Statically hosted with Github Pages
* Hosted through Heroku with Node.js with custom domain
* Hosted on AWS-EC2 server

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
