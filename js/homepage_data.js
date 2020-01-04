function initHomePage() {
  let ele;
  let item;
  let fragment = document.createDocumentFragment();
  for (let i = 0; i < num_teams; i++) {
    // Get team id's
    const teams = json_data["team_data"];
    let name = json_data["standings_data"][i].team_name;
    let logo = teams.find(o => o.team_name == name)["logo_url"];
    let wins = teams.find(o => o.team_name == name)["wins"];
    let losses = teams.find(o => o.team_name == name)["losses"];

    // Create HTML div from template
    let html = getTemplateByID("side-rankings-template").innerHTML;
    html = html.replace("%p", (i + 1) + ". " + name);
    html = html.replace("%src", logo);
    html = html.replace("%alt", name);
    html = html.replace("%w", wins);
    html = html.replace("%l", losses);

    if (i == 0) {
      html = html.replace(/%e/g, " &#128525 ");
    } else if (i == num_teams - 1) {
      html = html.replace(/%e/g, " &#128169 ");
    } else {
      html = html.replace(/%e/g, "");
    }

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
    let {
      name,
      state
    } = injured[i]

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
  const formatter = new google.visualization.NumberFormat({
    fractionDigits: 0,
  });

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

  for (let i = 0; i < num_teams; i++) {
    formatter.format(data, i + 1);
  }

  const wrap_width = $('.scroll-wrapper').width();
  const chart_width = Math.max(wrap_width, 600);
  console.log(chart_width);

  const past_week = json_data["wins_timeline"][cur_week - 1]
  const max_val = Math.ceil(Math.max(...past_week))

  let options = {
    title: "Total Wins",
    height: '600',
    width: chart_width - 25,
    lineWidth: 3,
    focusTarget: 'category',
    dataOpacity: 0,
    chartArea: {
      left: 50,
      right: 50,
      top: 100,
      bottom: 75,
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
        max: max_val,
      }
    }
  }

  let chart = new google.visualization.LineChart(document.getElementById("win-line-graph"));
  chart.draw(data, options);
}

function drawWinPerLineGraphChartjs() {
  let data = {};
  data['labels'] = [];
  data['datasets'] = [];
  const options = {};

  for (let i = 0; i < cur_week; i++) {
    data['labels'].push(i.toString());
  }

  const wins_data = json_data["wins_timeline"]
  for (let i = 0; i < wins_data.length; i++) {
    let dataset = {
      data: wins_data[i],
      label: getTeamNameByID(i + 1),
      backgroundColor: 'rgba(255, 255, 255, 0)',
      borderColor: getRandomColor(),
      lineTension: 0,
    };

    data['datasets'].push(dataset);
  }

  const ctx = document.getElementById('win-line-graph').getContext('2d');
  const my_chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: options
  });
}