function initHomePage() {
    let ele;
    let item;
    let fragment = document.createDocumentFragment();
    for (let i = 0; i<num_teams; i++) {
        // Get team id's
        let teams = json_data["team_data"]
        let winner_name = json_data["standings_data"][i].team_name;
        let winner_logo = teams.find(o => o.team_name == winner_name)["logo_url"]

        // Create HTML div from template
        let html = getTemplateByID("side-rankings-template").innerHTML;
        html = html.replace("%p", (i+1) + ". " + winner_name);
        html = html.replace("%src", winner_logo);
        html = html.replace("%alt", winner_name);

        ele = document.createElement(null);
        ele.innerHTML = html;
        ele = ele.firstElementChild;
        fragment.appendChild(ele);
    }
    $("#side-rankings").append(fragment);
}

function drawWinPerLineGraph() {
    let data = new google.visualization.DataTable();
    data.addColumn('number', 'Week');
    for (let i=0; i<num_teams; i++) {
        let team_name = json_data["team_data"].find(o => o.id == (i+1))["team_name"]
        data.addColumn('number', team_name);
    }

    for (let i=0; i<cur_week; i++) {
        //let team_data = homepage_data["per_timeline"][i];
        let team_data = json_data["wins_timeline"][i]
        team_data = [i].concat(team_data);
        data.addRows([team_data]);
    }

    let options = {
        title: "Total Wins",
        height: 500,
        width: 1000,
        lineWidth: 3,
        hAxis: {
            minValue: 0,
        }
    }

    let chart = new google.visualization.LineChart(document.getElementById("win-per-line-graph"));
    chart.draw(data, options);
}