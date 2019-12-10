let matchup_data = {};
let standings_data = [];
let teams = {};
let team_logos = {};

let num_teams;
let num_weeks;
let cur_week;

let standings_headers = {
  "Rank": "number",
  "Team Name": "string",
  "W": "number",
  "L": "number",
  "FG%": "string",
  "FT%": "string",
  "3PM": "string",
  "REB": "string",
  "AST": "string",
  "STL": "string",
  "BLK": "string",
  "TO": "string",
  "EJ": "string",
  "PTS": "string",
};
let matchup_headers = {
  "Team Name": "string",
  "Owner": "string",
  "FG%": "number",
  "FT%": "number",
  "3PM": "number",
  "REB": "number",
  "AST": "number",
  "STL": "number",
  "BLK": "number",
  "TO": "number",
  "EJ": "number",
  "PTS": "number",
};


$.getJSON("json/team_data.json", function (team_json) {
  let data = JSON.parse(team_json["teams"]);

  for (let team of data["data"]) {
    teams[team["id"]] = team["team_name"];
    team_logos[team["id"]] = team["logo_url"];
  }
})

$.getJSON("json/standings_data.json", function (standings_json) {
  let data = JSON.parse(standings_json);

  for (let team of data["data"]) {
    standings_data.push(Object.values(team));
  }
})

$.getJSON("json/matchup_data.json", function (matchup_json) {
  for (let week in matchup_json) {
    matchup_data[week] = {};
    for (let team_id in matchup_json[week]) {
      matchup_data[week][team_id] = {};

      matchup = matchup_json[week][team_id];
      opp_name = matchup["away_name"];
      home_stats = JSON.parse(matchup["home_stats"]);
      away_raw = JSON.parse(matchup["away_raw"]);
      away_sub = JSON.parse(matchup["away_sub"]);

      away_raw_arr = [];
      for (stat of away_raw["data"]) {
        away_raw_arr.push(Object.values(stat));
      }

      away_sub_arr = [];
      for (stat of away_sub["data"]) {
        away_sub_arr.push(Object.values(stat));
      }      

      matchup_data[week][team_id]["away_name"] = opp_name;
      matchup_data[week][team_id]["home_stats"] = Object.values(home_stats["data"][0]);
      matchup_data[week][team_id]["away_raw"] = away_raw_arr;
      matchup_data[week][team_id]["away_sub"] = away_sub_arr;

      num_teams = team_id;
      cur_week = week;
    }
    num_weeks = week;
  }
});

google.charts.load('current', {packages: ['table']});
google.charts.setOnLoadCallback(drawAllMatchupTables);
google.charts.setOnLoadCallback(drawStandingsTable);
setTimeout(initHomePage, 2000);