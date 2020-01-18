// Creating SPA by hiding/showing content pages
const app = {
    pages: [],
    show: new Event("show"),
    init: function(){
        app.pages = document.querySelectorAll(".page");
        app.pages.forEach((pg) => {
            pg.addEventListener("show", app.pageShown);
        })

        document.querySelectorAll(".nav-link").forEach((link) => {
            link.addEventListener("click", app.nav);
        })

        history.replaceState({}, "Home", "#home")
        window.addEventListener("hashchange", app.poppin)
    },

    nav: function(ev){
        ev.preventDefault();
        let current_page = ev.target.getAttribute("data-target");
        document.querySelector(".active").classList.remove("active");
        document.getElementById(current_page).classList.add("active");

        history.pushState({}, current_page, `#${current_page}`);
        document.getElementById(current_page).dispatchEvent(app.show);
    },

    pageShown: function(ev) {
        console.log("Page", ev.target.id, "shown");
    },

    poppin: function(ev){
        console.log(location.hash, "popstate event");
        let hash = location.hash.replace("#", "");
        document.querySelector(".active").classList.remove("active");
        document.getElementById(hash).classList.add("active");

        document.getElementById(hash).dispatchEvent(app.show);        
    }
}

document.addEventListener("DOMContentLoaded", app.init);

// Determining host and what data retrieval to use
const host_url = document.location.host;
const is_static = host_url.includes('github') || host_url.includes('127.0.0.1');

// Creating filters for teams/week for matchups
let weeks_filter = document.querySelector("#matchup-weeks-filter");
weeks_filter.addEventListener("change", filter_weeks)

function filter_weeks() {
    let selected_event = this.options[this.selectedIndex].value;
    if (selected_event == "all") {
        $("#matchup-tables div").removeClass("hidden");
    } else {
        $("#matchup-tables div[data-week]").addClass("hidden");
        $('#matchup-tables div[data-week="' + selected_event + '"]').removeClass("hidden");
        teams_filter.selectedIndex = "all";
    }    
}

let teams_filter = document.querySelector("#matchup-teams-filter");
teams_filter.addEventListener("change", filter_teams)

function filter_teams() {
    let selected_event = this.options[this.selectedIndex].value;
    if (selected_event == "all") {
        $("#matchup-tables div").removeClass("hidden");
    } else {
        $("#matchup-tables div[data-team-id]").addClass("hidden");
        $('#matchup-tables div[data-team-id="' + selected_event + '"]').removeClass("hidden");
        weeks_filter.selectedIndex = "all";
    }    
}

$('.toggle-nav').on('click', () => {
    $('.flex-nav ul').toggleClass('open');
})

$(window).resize(() => {
    //drawWinPerLineGraph();
});