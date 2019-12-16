function initHomePage() {
/*     let winner_name = standings_data[0][1]
    let loser_name = standings_data[num_teams-1][1]

    let winner_logo = team_logos[teams_rev[winner_name]]
    let loser_logo = team_logos[teams_rev[loser_name]]

    $("#current-winner").text(winner_name);
    $("#current-loser").text(loser_name);
    $("#img-winner").attr("src", winner_logo).attr("alt", winner_name);
    $("#img-loser").attr("src", loser_logo).attr("alt", loser_name); */

    let ele;
    let item;
    let fragment = document.createDocumentFragment();
    for (let i = 0; i<num_teams; i++) {
        // Get team id's
        let winner_name = standings_data[i][1]
        let winner_logo = team_logos[teams_rev[winner_name]]

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
        data.addColumn('number', teams[i+1]);
    }

    for (let i=0; i<cur_week; i++) {
        let team_data = homepage_data["per_timeline"][i];
        team_data = [i+1].concat(team_data);
        data.addRows([team_data]);
    }

    let options = {
        title: "Win Percentages",
        height: 500,
        width: 1000,
        lineWidth: 5,
        hAxis: {
            minValue: 1,
        }
    }

    let chart = new google.visualization.LineChart(document.getElementById("win-per-line-graph"));
    chart.draw(data, options);
}