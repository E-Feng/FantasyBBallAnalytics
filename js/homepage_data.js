function initHomePage() {
  let ele;
  let item;
  let fragment = document.createDocumentFragment();
  for (let i = 0; i < num_teams; i++) {
    // Get team id's
    let teams = json_data["team_data"]
    let winner_name = json_data["standings_data"][i].team_name;
    let winner_logo = teams.find(o => o.team_name == winner_name)["logo_url"]

    // Create HTML div from template
    let html = getTemplateByID("side-rankings-template").innerHTML;
    html = html.replace("%p", (i + 1) + ". " + winner_name);
    html = html.replace("%src", winner_logo);
    html = html.replace("%alt", winner_name);

    ele = document.createElement(null);
    ele.innerHTML = html;
    ele = ele.firstElementChild;
    fragment.appendChild(ele);
  }
  $("#side-rankings").append(fragment);
}


function drawInjuryListTable() {
  let cssClassNames = {
    headerRow: '',
    tableRow: '',
    oddTableRow: '',
    selectedTableRow: '',
    hoverTableRow: '',
    headerCell: '',
    tableCell: 'injury-table-text',
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
  for (let key in injury_headers) {
    data.addColumn(injury_headers[key], key);
  }

  const injured = json_data["injury_list"]
  const num_players = injured.length;

  data.addRows(num_players);
  for (let i = 0; i < num_players; i++) {
    let team_name = getTeamNameByID(injured[i].team)
    let {name, state} = injured[i]

    data.setCell(i, 0, team_name)
    data.setCell(i, 1, name)

    if (state == "OUT") {
      addNewProperty(data, i, 1, 'red-background');
    } else if (state == "DAY_TO_DAY") {
      addNewProperty(data, i, 1, 'yellow-background');
    } else if (state == "SUSPENSION") {
      addNewProperty(data, i, 1, 'blue-background');
    }
  }

  let table = new google.visualization.Table(document.getElementById("injury-list-table"))
  table.draw(data, options)
}


function drawWinPerLineGraph() {
  let data = new google.visualization.DataTable();
  data.addColumn('number', 'Week');
  for (let i = 0; i < num_teams; i++) {
    let team_name = getTeamNameByID(i + 1)
    data.addColumn('number', team_name);
  }

  for (let i = 0; i < cur_week; i++) {

    let team_data = json_data["wins_timeline"][i]
    team_data = [i].concat(team_data);
    data.addRows([team_data]);
  }

  let options = {
    title: "Total Wins",
    height: '500',
    width: '1000',
    lineWidth: 3,
    focusTarget: 'category',
    chartArea: {
      left: 50,
      right: 50,
    },
    legend: {
      position: 'top',
      maxLines: 4,
    },
    hAxis: {
      title: 'Week',
      minValue: 0,
    },
    vAxis: {
      minValue: 0,
      viewWindow: {
        max: parseInt(cur_week) - 1,
      }
    }
  }

  let chart = new google.visualization.LineChart(document.getElementById("win-line-graph"));
  chart.draw(data, options);
}