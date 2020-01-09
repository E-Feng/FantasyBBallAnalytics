function drawAllMatchupTables() {
  let ele;
  let item;
  let weeks_added = false;
  let fragment = document.createDocumentFragment();  
  for (let team_id = 1; team_id <= num_teams; team_id++) {
    let team_name = json_data["team_data"].find(o => o.id == team_id)["team_name"]
    for (let week = 1; week <= cur_week; week++) {
      // Create HTML div from template
      let table_id = "google-charts-table" + week + "-" + team_id;

      let html = getTemplateByID("matchup-tables-template").innerHTML;
      html = html.replace("%w", week);
      html = html.replace("%t", team_name);
      html = html.replace("%dw", week);
      html = html.replace("%dt", team_id);      
      html = html.replace("google-charts-table", table_id)
      ele = document.createElement(null);
      ele.innerHTML = html;
      ele = ele.firstElementChild;
      fragment.appendChild(ele);

      $("#" + table_id).ready(() => drawMatchupTable(week, team_id));

      // Add weeks to filter drop down menu
      if (!weeks_added){
        item = document.createElement("option");
        item.innerHTML = week;
        item.value = week;
        $("#matchup-weeks-filter").append(item);
      }
    }
    weeks_filter.selectedIndex = String(cur_week);
    weeks_added = true;

    // Add team name to filter drop down menu
    item = document.createElement("option");
    item.innerHTML = team_name;
    item.value = team_id;
    $("#matchup-teams-filter").append(item);
  }
  $("#matchup-tables").append(fragment);

  let event = new Event("change");
  weeks_filter.dispatchEvent(event);
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
    if (win_diff < 0 | (win_diff == 0 & (away_sub[i][getColumnIndex("PTS")] > 0))) {
      addNewProperty(data, i+1, 0, 'red-background');
    }
  }

  let table_id = "google-charts-table" + week + "-" + team_id;
  let table = new google.visualization.Table(document.getElementById(table_id));
  
  let formatter = new google.visualization.NumberFormat(
    {fractionDigits: 4, negativeParens: false});
  formatter.format(data, 2);
  formatter.format(data, 3);

  table.draw(data, options);
}