function drawBestPlayersTable() {
  let cssClassNames = {
    headerRow: 'players-header-text',
    tableRow: '',
    oddTableRow: '',
    selectedTableRow: '',
    hoverTableRow: '',
    headerCell: '',
    tableCell: 'players-table-text',
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
  for (let key in best_headers) {
    data.addColumn(best_headers[key], key);
  }
  const team_data = json_data["team_data"];
  const best_players = json_data["best_players"];

  let num_cols = data.getNumberOfColumns();
  let num_rows = parseInt(num_teams);
  data.addRows(num_rows);

  team_data.forEach(team => {
    let val = `<p class='team-padding'>`+team.team_name+`</p>`
    data.setCell(team.id - 1, 0, val);
  })

  best_players.forEach(player => {
    let row = player.team_id - 1;
    let col = parseInt(player.period.substring(0, 2)) + 1;
    let class_name = `player-cell-best`;
    if (player.rank == "worse") {
      col = col + 4;
      class_name = `player-cell-worse`;
    }
    let url = getHeadshotURLFromID(player.player_id);
    let full_name = player.first_name + " " + player.last_name;
    let settings = `" title="` + full_name + `" alt="` + full_name + `"`;
    let val = `<img class='` + class_name + `' src="` + url + settings + `></img>`;
    data.setCell(row, col, val);
  })

  let table = new google.visualization.Table(document.getElementById("best-table"));
  table.draw(data, options);
}