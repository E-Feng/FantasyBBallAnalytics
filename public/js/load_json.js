const standings_headers = {
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
const matchup_headers = {
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
const injury_headers = {
  "Team Name": "string",
  "Player": "string",
}
const best_headers = {
  "Team Name": "string",
  "Best <br>(Season)": "string",
  "Best <br>(Last 7)": "string",
  "Best <br>(Last 15)": "string",
  "Best <br>(Last 30)": "string",
  "Worst <br>(Season)": "string",
  "Worst <br>(Last 7)": "string",
  "Worst <br>(Last 15)": "string",
  "Worst <br>(Last 30)": "string",
}

let matchup_data = {};
let num_teams;
let num_weeks;
let cur_week;

let json_data = {};

const json_files = ["wins_timeline",
  "injury_list",
  "matchup_data",
  "standings_data",
  "team_data",
  "best_players",
  "misc_data",
];

async function load_json_files() {
  const git_url = "https://raw.githubusercontent.com/E-Feng/JSONStorage/master/"
  for (let i=0; i<json_files.length; i++) {
    let json_name = json_files[i];

    // Loading from github repository
    let res = await fetch(git_url + json_name + ".json");
    let git_data = await res.json();
    if (typeof(git_data) == 'string') {
      git_data = JSON.parse(git_data);
    }

    // Loading from backend API for testing
    let res2 = await fetch(`/api/${json_name}`)
    let api_data = await res2.json();
    api_data = JSON.parse(api_data);

    // Saving either to global variable
    json_data[json_name] = git_data;
  }
}

load_json_files().
then(() => {
  formatMatchupData();
  google.charts.load('current', {packages: ['table', 'corechart']});
  google.charts.setOnLoadCallback(drawAllGoogleCharts);
  initHomePage();
}).
catch (err => console.log(err));

function drawAllGoogleCharts() {
  drawAllMatchupTables();
  drawStandingsTable();
  drawWinPerLineGraph();
  drawInjuryListTable();
  drawBestPlayersTable();
}


function formatMatchupData() {
  let data = json_data["matchup_data"]
  for (let week in data) {
    matchup_data[week] = {};
    for (let team_id in data[week]) {
      matchup_data[week][team_id] = {};

      matchup = data[week][team_id];
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
}