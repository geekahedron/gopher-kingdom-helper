// ==UserScript==
// @name	GKH for Utopia
// @namespace	https://github.com/geekahedron/gopher-kingdom-haven/
// @require http://code.jquery.com/jquery-latest.js
// @version	0.0.5a
// @description	Auto-join script for 2015 Summer Steam Monster Minigame
// @author	geekahedron
// @match       http://utopia-game.com/wol/*
// @updateURL   https://github.com/geekahedron/gopher-kingdom-haven/raw/master/gkh.user.js
// @downloadURL https://github.com/geekahedron/gopher-kingdom-haven/raw/master/gkh.user.js
// @grant	none
// ==/UserScript==

window.onload = function() {
    console.log("window loaded");
};

$(document).ready(function() {
    console.log("document ready");
    initialize();
});

var xmlhttp;
var state;
var spells;
var kingdoms;
var currentSection;
var currentPage;
var currentDate;
var currentMonth;
var currentDay;
var currentYear;
var prevDay;
var prevMonth;
var prevYear;

function initialize() {
    console.log("Initializing Gopher");
    if (typeof localStorage['gopherstate'] === 'undefined') {
        state = {};
    } else {
        state = JSON.parse(localStorage['gopherstate']);
    }
    createChild(state,'info');
    createChild(state,'data');
    spells = {};
    kingdoms = {};
    
    currentSection = window.location.pathname.split("/")[2];
    currentPage = window.location.pathname.split("/")[3];
    setCurrentDate($("div.current-date")[0].innerText);
}

/**************************** 
 *    PAGE MANIPULATION     *
 ****************************/

function removeAds() {
    var adDiv = $("div#left-column > div:first-child");
    if (adDiv.attr("id") === undefined) adDiv.remove();
    $('#leaderboard-ad,#skyscraper-ad,#ad-words').remove();
    adDiv = $('#middle > div:last-child');
    if (adDiv.attr("id") === undefined) adDiv.remove();
}

function showWanted() {
    console.log("Showing wanted divs");
    addGlobalStyle('div#middle div { display:none; }');
    $("div#middle div").hide();
    $("div#middle div").css('display','none');
    $("div#left-column").show();
    $("div#content-area").show();
    $("div#game-navigation").show();
    $("div#game-navigation div").show();
    $("div.game-header").show();
    $("div.game-content").show();
    $("div.game-content div").show();
    $("div.infobox").show();
    $("div.infobox div").show();
}

function insertGopherBox() {
    removeAds();
    addGlobalStyle("#right-column { float: left; }");
    addGlobalStyle("#right-column { width: 168px; }");
    addGlobalStyle("#gopherbox { border: 2px solid #3B4041; }");
    addGlobalStyle("#gopherbox { min-height: 300px; }");
    addGlobalStyle("#gopherbox h2 { text-align: center; }");
    var gopherbox = document.createElement("div");
    gopherbox.id = "gopherbox";
    gopherbox.className = "gopherbox";
    var pagetitle = document.createElement("h2");
    pagetitle.id = "gophertitle";
    pagetitle.innerHTML = "Gopher";
    gopherbox.appendChild(pagetitle);
    $("div#right-column")[0].appendChild(gopherbox);
}

/**************************** 
 *   PAGE READ FUNCTIONS    *
 ****************************/

function loadNews() {
    getContent("province_news", function(c) {
        var newsdates = content.getElementsByClassName("news-incident-date");
        var newsreports = content.getElementsByClassName("news-incident-report");

        // clear the queue of existing news reports and repopulate the year
        
        //TODO:: THIS DOESN'T WORK WITH BACKGROUND LOADING
        var navtext = $(".next-prev-nav").text().trim();
        if (navtext.search("<") === 0) {  // remove the "prev" link text
            navtext = navtext.substr(navtext.search("Edition")+8).trim();
        }
        navtext = navtext.substr(0,navtext.search("Edition")).trim();
        var d = parseUtoDate(navtext);
        createChild(state.data,d[2]);
        createChild(state.data[d[2]],d[0]);
        state.data[d[2]][d[0]] = {};

        // read in news entries
        for (var i; i < newsdates.length; i++) {
            var d = parseUtoDate(newsdates[i].innerText.trim());
            createDataEntry(d);
            var report = newsreports[i].innerText.trim();
        }
    });
}



function loadState() {
    getContent("council_state", function(c) {
        content = c;
        var statenumbers = c.children[2].children[1].children;
        var trendtable = c.children[4].children[1].children;

        state.info.pezzies = statenumbers[0].children[1].innerText;
        state.info.employed = statenumbers[0].children[3].innerText;
        state.info.nw = statenumbers[0].children[5].innerText;
        state.info.army = statenumbers[1].children[1].innerText;
        state.info.unemployed = statenumbers[1].children[3].innerText;
        state.info.thieves = statenumbers[2].children[1].innerText;
        state.info.unfilledjobs = statenumbers[2].children[3].innerText;
        state.info.honor = statenumbers[2].children[5].innerText;
        state.info.wizzies = statenumbers[3].children[1].innerText;
        state.info.employment = statenumbers[3].children[3].innerText;
        state.info.landrank = statenumbers[3].children[5].innerText;
        state.info.population = statenumbers[4].children[1].innerText;
        state.info.income = statenumbers[4].children[3].innerText;
        state.info.nwrank = statenumbers[4].children[5].innerText;
        state.info.maxpop = statenumbers[5].children[1].innerText;
        state.info.wages = statenumbers[5].children[3].innerText;

        //TODO::        createDataEntry(prevDate);
        createChild(state.data,prevYear);
        createChild(state.data[prevYear],prevMonth);
        createChild(state.data[prevYear][prevMonth],prevDay);

        state.data[prevYear][prevMonth][prevDay]["income"] = trendtable[0].children[1].innerText;
        state.data[prevYear][prevMonth][prevDay]["wages"] = trendtable[1].children[1].innerText;
        state.data[prevYear][prevMonth][prevDay]["draft"] = trendtable[2].children[1].innerText;
        state.data[prevYear][prevMonth][prevDay]["science"] = trendtable[3].children[1].innerText;
        state.data[prevYear][prevMonth][prevDay]["netgc"] = trendtable[4].children[1].innerText;
        state.data[prevYear][prevMonth][prevDay]["pezchg"] = trendtable[5].children[1].innerText;
        state.data[prevYear][prevMonth][prevDay]["fg"] = trendtable[6].children[1].innerText;
        state.data[prevYear][prevMonth][prevDay]["fn"] = trendtable[7].children[1].innerText;
        state.data[prevYear][prevMonth][prevDay]["fd"] = trendtable[8].children[1].innerText;
        state.data[prevYear][prevMonth][prevDay]["netfood"] = trendtable[9].children[1].innerText;
        state.data[prevYear][prevMonth][prevDay]["rd"] = trendtable[11].children[1].innerText;
        state.data[prevYear][prevMonth][prevDay]["rp"] = trendtable[10].children[1].innerText;
        state.data[prevYear][prevMonth][prevDay]["netrune"] = trendtable[12].children[1].innerText;

        state.data[currentYear][currentMonth]["income"] = trendtable[0].children[2].innerText;
        state.data[currentYear][currentMonth]["wages"] = trendtable[1].children[2].innerText;
        state.data[currentYear][currentMonth]["draft"] = trendtable[2].children[2].innerText;
        state.data[currentYear][currentMonth]["science"] = trendtable[3].children[2].innerText;
        state.data[currentYear][currentMonth]["netgc"] = trendtable[4].children[2].innerText;
        state.data[currentYear][currentMonth]["pezchg"] = trendtable[5].children[2].innerText;
        state.data[currentYear][currentMonth]["fg"] = trendtable[6].children[2].innerText;
        state.data[currentYear][currentMonth]["fn"] = trendtable[7].children[2].innerText;
        state.data[currentYear][currentMonth]["fd"] = trendtable[8].children[2].innerText;
        state.data[currentYear][currentMonth]["netfood"] = trendtable[9].children[2].innerText;
        state.data[currentYear][currentMonth]["rp"] = trendtable[10].children[2].innerText;
        state.data[currentYear][currentMonth]["rd"] = trendtable[11].children[2].innerText;
        state.data[currentYear][currentMonth]["netrune"] = trendtable[12].children[2].innerText;

        state.data[prevYear][prevMonth]["income"] = trendtable[0].children[3].innerText;
        state.data[prevYear][prevMonth]["wages"] = trendtable[1].children[3].innerText;
        state.data[prevYear][prevMonth]["draft"] = trendtable[2].children[3].innerText;
        state.data[prevYear][prevMonth]["science"] = trendtable[3].children[3].innerText;
        state.data[prevYear][prevMonth]["netgc"] = trendtable[4].children[3].innerText;
        state.data[prevYear][prevMonth]["pezchg"] = trendtable[5].children[3].innerText;
        state.data[prevYear][prevMonth]["fg"] = trendtable[6].children[3].innerText;
        state.data[prevYear][prevMonth]["fn"] = trendtable[7].children[3].innerText;
        state.data[prevYear][prevMonth]["fd"] = trendtable[8].children[3].innerText;
        state.data[prevYear][prevMonth]["netfood"] = trendtable[9].children[3].innerText;
        state.data[prevYear][prevMonth]["rp"] = trendtable[10].children[3].innerText;
        state.data[prevYear][prevMonth]["rd"] = trendtable[11].children[3].innerText;
        state.data[prevYear][prevMonth]["netrune"] = trendtable[12].children[3].innerText;
        
        localStorage['gopherState'] = JSON.stringify(state);
    });
}


function loadSpells() {
    getContent("council_spells", function(c) {
        content = c;
        var spelltable = c.getElementsByTagName("table")[0].getElementsByTagName("tbody")[0].children;
        for (var i = 0; i < spelltable.length; i++) {
            var spellrow = spelltable[i];
            var spelltype = spellrow.children[0].children[0].className;
            var spellname = spellrow.children[0].children[0].innerText.trim();
            var duration = spellrow.children[1].innerText.trim();
            var description = spellrow.children[2].innerText.trim();
            //! TODO::Display results on page
            console.log(spellname + " (" + spelltype + ") " + duration + " [" + description + "]");
        }
    });
}

function logKingdom(k, i) {
    getContent("kingdom_details/"+k+"/"+i, function(c) {
        var messages = c.getElementsByClassName("message")[0];
        var msg = "";
        if (messages && messages.length > 0) msg = messages.innerText.trim();
        if (msg === "The kingdom " + k + ":" + i + " could not be found!")
            console.log('Cannot load (' + k + ':' + i + '): Could not be found');
        else if (msg == "We have not yet discovered kingdoms on Island " + i) {
            console.log('Cannot load (' + k + ':' + i + '): Not yet discovered');
        } else {
            content = c;
            var provtable = c.getElementsByClassName("tablesorter")[0].children[1].children;
            for (var i = 0; i < provtable.length; i++) {
                var provrow = provtable[i];
                var provstatus = provrow.className;
                if (provstatus !== "unused-slot") {
                    var provname = provrow.children[1].children[0].innerText;
                    var provrace = provrow.children[2].innerText;
                    var provsize = provrow.children[3].innerText;
                    var provnw = provrow.children[4].innerText;
                    var provnwpa = provrow.children[5].innerText;
                    var provhonor = provrow.children[6].innerText;
                    //! TODO::Display results on page
                    console.log("[" + i + "]" +provhonor + " " + provname + ", " + provrace + ", " + provsize + ", " + provnw);
                }
            }
        }

    });
}

/**************************** 
 *   PAGE LOAD FUNCTIONS    *
 ****************************/

function dateChange(oldDate) {
    //! TODO: Update on-screen elements (date, header) after tick
    $(".current-date")[0].innerText = currentDate[0] +" "+ currentDate[1] +" "+ currentDate[2];
    $(".current-date")[0].className += " updated";
    setResBar();
    console.log("Date changed from " + oldDate[0] +" "+ oldDate[1] +" "+ oldDate[2] + " to " + currentDate[0] +" "+ currentDate[1] +" "+ currentDate[2]);
}

function setResBar() {
    var res = state.data.resbar.children[1].children[0].children;
    var bar = $("#resource-bar tbody th");
    for (var i = 0; i < res.length; i++) {
        var val = res[i].innerText;
        var barval = bar[i].innerText;
        if (val !== barval) {
            console.log("Updating " + getResName(i) + " from " + barval + " to " + val);
            bar[i].innerText = val;
            bar[i].className = "updated";
        }
    }
}

function setCurrentDate(dateString) {
    var oldDate = currentDate;
    var currentDate = parseUtoDate(dateString);
    
    currentMonth = currentDate[0];
    currentDay = currentDate[1];
    currentYear = currentDate[2];

    prevDay = currentDay - 1;
    prevMonth = currentMonth;
    prevYear = currentYear;
    if (prevDay === 0) {
        prevDay = 24;
        prevMonth -= 1;
    }
    if (prevMonth === 0) {
        prevMonth = 7;
        prevYear -= 1;
    }
    if (JSON.stringify(oldDate) !== JSON.stringify(currentDate)) {
        dateChange(oldDate);
    }
    createDataEntry(currentDate);
}

function loadXMLDoc(url,cfunc)
{
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=cfunc;
    console.log("loading " + url);
    xmlhttp.open("GET",url,true);
    xmlhttp.send();
}

function parseContent(doc, cfunc) {
    console.log("parsing page");
    var htmlparse = new DOMParser();
    var page = htmlparse.parseFromString(doc,"text/html").firstElementChild;
    var content = page.getElementsByClassName("game-content")[0];

    // While we're pulling a new page, may as well check the date and resources
    state.data.resbar = page.getElementsByTagName("table")["resource-bar"];
    setCurrentDate(page.getElementsByClassName("current-date")[0].innerText);

}

function getContent(page, cfunc) {
    if (page === currentPage) {
        console.log(getPageName(page) + " page is already loaded");
        parseContent(document.documentElement.innerHTML, cfunc);
    } else {
        var url = "/wol/game/" + page + "/";
        loadXMLDoc(url, function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                doc = xmlhttp.responseText;
                parseContent(xmlhttp.responseText, cfunc);
            }
        });
    }
}

/**************************** 
 *    UTILITY FUNCTIONS     *
 ****************************/
function createChild(container, key) {
    if (typeof container[key] === 'undefined') {
        container[key] = {};
    }
}

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

function num(str) {
    return Number(str.replace(/[^\d\.\-\ ]/g, ''));
}

function parseUtoDate(str) {
    var d = str.split(" ");
    var r = [];
    if (d.length === 2) { // "March YR1"
        r[0] = new Date(Date.parse(d[0] +" 1, 2012")).getMonth()+1;
        r[1] = -1;
        r[2] = Number(d[1].substr(2));
    }
    if (d.length === 3) { // "May 3, YR2"
        r[0] = new Date(Date.parse(d[0] +" 1, 2012")).getMonth()+1;
        r[1] = Number(d[1].split(",")[0]);
        r[2] = Number(d[2].substr(2));
    } else if (d.length === 4) { // "May 4 of YR0"
        r[0] = new Date(Date.parse(d[0] +" 1, 2012")).getMonth()+1;
        r[1] = Number(d[1].split(",")[0]);
        r[2] = Number(d[3].substr(2));
    }
    return r;
}

function createDataEntry(d) {
    // d is date array in form [m, d, y]
    createChild(state.data,d[2]);
    createChild(state.data[d[2]],d[0]);
    createChild(state.data[d[2]][d[0]],d[1]);
}

/**************************** 
 *      INFO FUNCTIONS      *
 ****************************/
function getPageName(page) {
    var names = [];
    names.throne = "Throne";
    names.council_state = "Affairs of the State";
    names.council_military = "Military affairs";
    names.council_internal = "Buildings";
    names.council_learn = "Science";
    names.council_spells = "Mystics";
    names.council_history = "History";
    names.kingdom_details = "Kingdom";
    names.kingdom_intel = "Espionage";
    names.province_news = "Province news";
    names.kingdom_news = "Kingdom news";
    names.explore = "Exploration";
    names.build = "Growth";
    names.raze = "Raze";
    names.science = "Science research";
    names.train_army = "Train army";
    names.release_army = "Release army";
    names.wizards = "Manage wizards";
    names.enchantment = "Self spells";
    names.sorcery = "Combat spells";
    names.thievery = "Thievery";
    names.send_armies = "War room";
    names.province_target_finder = "Potential targets";
    names.aid = "Send aid";
    names.fund_dragon = "Fund dragon";
    names.attack_dragon = "Attack dragon";
    names.vote = "Vote";
    names.war = "War";
    names.nap = "Ceasefire";
    names.conflict = "Relations";
    names.ranking = "Rankings";
    names.preferences = "Game preferences";
//    names. = "Change province details";
    names.vacation = "Vacation mode";
    names.sitting = "Province sitting";
//    names. = "Abandon province";
//    names. = "Random move";
    return names[page];
}

function getResName(i) {
    return ["money", "peasants", "food", "runes", "nw", "land", "nwpa"][i];
}


// Why wait for the page to finish loading crap?
insertGopherBox();
