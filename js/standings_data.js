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
        let vals = val.split("-").map(x => parseInt(x));
        let ratio = vals[1] / vals[0];
        // Dull the colors of ejection
        if (data.getColumnLabel(j) == "EJ"){
          ratio = (ratio + 1)/2;
        }
        let h = getColorValue(ratio);

        data.setProperty(i, j, "style", "background-color: " + h)
      }

      if (i == 6) {
        addNewProperty(data, i, j, 'bottom-border');
      }
    }
  }

  let table = new google.visualization.Table(document.getElementById("standings-table"));
  table.draw(data, options)
}