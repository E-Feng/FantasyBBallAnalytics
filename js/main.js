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