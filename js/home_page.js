function initHomePage() {
    let winner_id = standings_data[0][0]
    let winner_name = standings_data[0][1]
    let loser_id = standings_data[num_teams-1][0]
    let loser_name = standings_data[num_teams-1][1]

    let winner_logo = team_logos[winner_id]
    let loser_logo = team_logos[loser_id]

    $("#current-winner").text(winner_name);
    $("#current-loser").text(loser_name);
    $("#img-winner").attr("src", winner_logo).attr("alt", winner_name);
    $("#img-loser").attr("src", loser_logo).attr("alt", loser_name);
}