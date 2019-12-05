let matchup_data = {};
let teams = {};
let num_weeks;
let num_teams;
let cur_week;
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
  for (let team of data["data"]){
    teams[team["id"]] = team["team_name"];
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

function drawAllMatchupTables() {
  let counter = 1;
  for (let team_id = 1; team_id <= num_teams; team_id++) {
    for (let week = 1; week <= cur_week; week++) {
      // Create HTML div from template
      //let html = $("#matchup-table-template").html();
      let html = $("template")[0].innerHTML;
      html = html.replace("%w", week);
      html = html.replace("%t", teams[team_id]);
      html = html.replace("google-charts-table", "google-charts-table" + counter)
      $new = $("#matchup-tables").append(html);

      drawMatchupTable(week, team_id, counter);
      counter++;
    }
  }
}


function drawMatchupTable(week, team_id, counter) {
  let cssClassNames = {
    headerRow: '',
    tableRow: '',
    oddTableRow: '',
    selectedTableRow: '',
    hoverTableRow: '',
    headerCell: '',
    tableCell: 'matchup-table-text',
    rowNumberCell: ''
  };

  let options = {
    allowHtml: true,
    cssClassNames: cssClassNames,
    showRowNumber: false,
    width: "100%",
    height: "100%",
  }

  let data = new google.visualization.DataTable();
  for (let key in matchup_headers) {
    data.addColumn(matchup_headers[key], key);
  }
  let home_stats = [null, null].concat(matchup_data[week][team_id]["home_stats"]);
  data.addRows([home_stats]);

  let away_raw = matchup_data[week][team_id]["away_raw"];
  let away_sub = matchup_data[week][team_id]["away_sub"];

  let num_rows = away_raw.length;
  let num_cols = data.getNumberOfColumns();
  let opp_name = matchup_data[week][team_id]["away_name"];
  let opp_row;

  data.addRows(num_rows);
  for (let i = 0; i < num_rows; i++) {
    opp_row = away_raw[i].includes(opp_name);
    for (let j = 0; j < num_cols; j++) {
      let raw_val = away_raw[i][j];
      let sub_val = away_sub[i][j];

      data.setCell(i + 1, j, raw_val);
      if (sub_val > 0) {
        addNewProperty(data, i+1, j, 'red-background');
      } else if (sub_val < 0) {
        addNewProperty(data, i+1, j, 'green-background');
      } else if (sub_val == 0) {
        addNewProperty(data, i+1, j, 'yellow-background');
      }

      // Highlight matched opponent for that week
      if (opp_row) {
        if (j == 0) {
          addNewProperty(data, i+1, j, 'left-border');
        } else if (j == num_cols-1) {
          addNewProperty(data, i+1, j, 'right-border');
        } else {
          addNewProperty(data, i+1, j, 'middle-border');
        }
      }
    }

    let last_col = away_sub[0].length;
    let win_diff = away_sub[i][last_col-2] - away_sub[i][last_col-1]

    // Assume win then change if loss
    addNewProperty(data, i+1, 0, 'green-background');
    if (win_diff < 0 | (win_diff == 0 & (away_sub[i][12] > 0))) {
      addNewProperty(data, i+1, 0, 'red-background');
    }
  }

  let table_id = "google-charts-table" + String(counter);
  let table = new google.visualization.Table(document.getElementById(table_id));
  
  let formatter = new google.visualization.NumberFormat(
    {fractionDigits: 4, negativeParens: false});
  formatter.format(data, 2);
  formatter.format(data, 3);

  table.draw(data, options);
}

function addNewProperty(data, row, col, prop){
  old_prop = data.getProperties(row, col);
  if (old_prop["className"]) {
    new_prop = old_prop["className"] + " " + prop;
  } else {
    new_prop = prop;
  }
  data.setProperty(row, col, "className", new_prop);
}