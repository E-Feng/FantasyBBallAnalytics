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
    }
  }

  let table = new google.visualization.Table(document.getElementById("standings-table"));
  table.draw(data, options)
}

function getColorValue(val) {
  val = val > 2 ? 2 : val;
  let h = Math.floor((2 - val) * 60) + 10;
  let s = 100;
  let l = 70;

  return HSLToHex(h, s, l);
}

function HSLToHex(h,s,l) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r = 0,
      g = 0,
      b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  // Having obtained RGB, convert channels to hex
  r = Math.round((r + m) * 255).toString(16);
  g = Math.round((g + m) * 255).toString(16);
  b = Math.round((b + m) * 255).toString(16);

  // Prepend 0s, if necessary
  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
}