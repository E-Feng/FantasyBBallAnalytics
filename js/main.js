let sch_json;
let data_table = {};
let headers = {
  "Team": "string",
  "Name": "string",
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

$.getJSON("schedule_analytics.json", function (sch_json) {
  console.log("JSON Data received, name is " + sch_json.name);

  for (let week in sch_json) {
    data_table[week] = {};
    for (let team_id in sch_json[week]) {
      data_table[week][team_id] = {};

      match_up = sch_json[week][team_id];
      opp_name = match_up["away_name"];
      home_stats = JSON.parse(match_up["home_stats"]);
      away_raw = JSON.parse(match_up["away_raw"]);
      away_sub = JSON.parse(match_up["away_sub"]);

      away_raw_arr = [];
      for (stat of away_raw["data"]) {
        away_raw_arr.push(Object.values(stat));
      }

      away_sub_arr = [];
      for (stat of away_sub["data"]) {
        away_sub_arr.push(Object.values(stat));
      }      

      data_table[week][team_id]["away_name"] = opp_name;
      data_table[week][team_id]["home_stats"] = Object.values(home_stats["data"][0]);
      data_table[week][team_id]["away_raw"] = away_raw_arr;
      data_table[week][team_id]["away_sub"] = away_sub_arr;
    }
  }
});


function drawTable() {
  let cssClassNames = {
    headerRow: '',
    tableRow: '',
    oddTableRow: '',
    selectedTableRow: '',
    hoverTableRow: '',
    headerCell: '',
    tableCell: 'table-text',
    rowNumberCell: ''
  };

  let options = {
    allowHtml: true,
    cssClassNames: cssClassNames,
    showRowNumber: false,
    width: "100%",
    height: "100%",
  }

  let week = 4;
  let team_id = 1;

  let data = new google.visualization.DataTable();
  for (let key in headers) {
    data.addColumn(headers[key], key);
  }
  let home_stats = [null, null, null].concat(data_table[week][team_id]["home_stats"]);
  data.addRows([home_stats]);

  let away_raw = data_table[week][team_id]["away_raw"];
  let away_sub = data_table[week][team_id]["away_sub"];

  let num_rows = away_raw.length;
  let num_cols = data.getNumberOfColumns();
  let opp_name = data_table[week][team_id]["away_name"];
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
    //prop = data.getProperties(i+1,0);
    //console.log('green-background' + prop["classname"])
    //data.setProperty(i+1, 0, 'className', 'green-background' + prop["classname"]);
    addNewProperty(data, i+1, 0, 'green-background');
    if (win_diff < 0 | (win_diff == 0 & home_stats[last_col-2] < away_sub[i][last_col-2])) {
      addNewProperty(data, i+1, 0, 'red-background');
    }
  }

  let table = new google.visualization.Table(document.getElementById('table_div'));
  
  let formatter = new google.visualization.NumberFormat(
    {fractionDigits: 4, negativeParens: false});
  formatter.format(data, 3);
  formatter.format(data, 4);

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