let standings_data = [];
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


$.getJSON("json/standings_data.json", function (standings_json) {
  let data = JSON.parse(standings_json);
  
  for (let team of data["data"]) {
    standings_data.push(Object.values(team));
  }
})

function drawStandingsTable() {
  let cssClassNames = {
    headerRow: '',
    tableRow: '',
    oddTableRow: '',
    selectedTableRow: '',
    hoverTableRow: '',
    headerCell: '',
    tableCell: 'standings-table-text',
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
  for (let key in standings_headers) {
    data.addColumn(standings_headers[key], key);
  }

  let num_cols = data.getNumberOfColumns();
  let num_rows = standings_data.length;
  data.addRows(num_rows);
  for (let i = 0; i < num_rows; i++) {
    for (let j = 0; j < num_cols; j++) {
      let val = standings_data[i][j];

      data.setCell(i, j, val);
      if ((typeof(val) == "string") & (data.getColumnLabel(j) != "Team Name")) {
        val = val.split("-").map(x => parseInt(x));
        if (val[0] > val[1]) {
          addNewProperty(data, i, j, 'green-background');
        } else if (val[0] < val[1]) {
          addNewProperty(data, i, j, 'red-background');
        } else if (val[0] == val[1]) {
          addNewProperty(data, i, j, 'yellow-background');
        }
      }
    }
  }

  let table = new google.visualization.Table(document.getElementById("standings-table"));
  table.draw(data, options)
}