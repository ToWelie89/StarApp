$(document).ready(function () {
    // Empty options div to avoid annoying bug with content being displayed twice
    $("#ladderInfoTeamOptions").html("");

    // Hover effect for the league symbols
    $(".hoverLeagueSymbol").live("mouseenter", function () {
        var imageParent = $(this).parent().parent();
        imageParent.css("background", "-ms-radial-gradient(center, ellipse cover, rgba(237,103,255,1) 15%,rgba(215,121,255,1) 49%,rgba(215,121,255,1) 51%,rgba(215,121,255,0) 76%);");
        imageParent.css("background-position", "50% 90%");
        imageParent.css("background-size", "53px 53px");
        imageParent.css("background-repeat", "no-repeat");
    });
    $(".hoverLeagueSymbol").live("mouseleave", function () {
        var imageParent = $(this).parent().parent();
        imageParent.css("background", "none");
    });
    
    // Hover effect for the green/red win/loss-bars
    $(".greenBar").live("mouseleave", function () {
        $(this).css("background", "-ms-linear-gradient(top, rgba(34,139,34,1) 0%,rgba(100,219,54,1) 100%);");
    });
    $(".greenBar").live("mouseenter", function () {
        $(this).css("background", "-ms-linear-gradient(top, rgba(34,160,34,1) 0%,rgba(100,255,54,1) 100%);");
    });
    $(".redBar").live("mouseleave", function () {
        $(this).css("background", "-ms-linear-gradient(top, rgba(128,0,0,1) 0%,rgba(224,18,0,1) 100%);");
    });
    $(".redBar").live("mouseenter", function () {
        $(this).css("background", "-ms-linear-gradient(top, rgba(155,0,0,1) 0%,rgba(255,18,0,1) 100%);");
    });
    
    // Hover effect for the ladder option buttons
    $(".ladderOption").live("click", function () {
        var id = $(this).attr("id");
        showLadderInfo(id);
    });

    // Click event for ladder league symbol (used to bring forth ladder panel and load data)
    $(".hoverLeagueSymbol").live("click", function () {
        var ladderType;
        if ($(this).attr("id") == "soloLeague") {
            ladderType = "HOTS_SOLO";
        } else if ($(this).attr("id") == "twosLeague") {
            ladderType = "HOTS_TWOS";
        } else if ($(this).attr("id") == "threesLeague") {
            ladderType = "HOTS_THREES";
        } else if ($(this).attr("id") == "foursLeague") {
            ladderType = "HOTS_FOURS";
        } else {
            return; // error
        }

        $("#ladderInfoWrapper").animate({
            left: "0px"
        }, 300);
        displayLadderOptions(ladderType);
    });

    // Checks what different options there are for the specific ladder type, for instance if ladderType is 2v2 it checks
    // all your 2v2 teams, creates some html code and appends it to div
    function displayLadderOptions(ladderType) {
        var string = "";
        
        allLadders.sort(sort);
        
        // Sometimes there is the problem that allLadders contains a duplicate of each element, in other words twice
        // as many elements. That's why here I remove all duplicates. The reason for this problem is because the setupLeagueInfo function
        // in livetile.js is being called several times, but I can't understand why there are duplicates because allLaders array is reset each time,
        // so for now this ugly solution will have to due.
        var newArray = new Array();
        for (var i = 0; i < allLadders.length; i++) {
            if (newArray.length == 0 || Enumerable.From(newArray).Where(function (x) { return x.ladderId == allLadders[i].ladderId }).ToArray().length == 0) {
                newArray.push(allLadders[i]);
            }
        }
        allLadders = newArray;

        for (var i = 0; i < allLadders.length; i++) {
            if (allLadders[i].ladderType == ladderType) {
                if (allLadders[i].characters.length == 0) {
                    string += "<p class=\"ladderOption\" id=\"" + allLadders[i].ladderId + "\">SOLO</p>";
                } else {
                    var names = "w/ ";
                    for (var j = 0; j < allLadders[i].characters.length; j++) {
                        names += allLadders[i].characters[j].name;
                        if (j != (allLadders[i].characters.length - 1)) {
                            names += ", ";
                        }
                    }
                    string += "<p class=\"ladderOption\" id=\"" + allLadders[i].ladderId + "\">" + names + "</p>";
                }
            }
        }
        $("#ladderInfoTeamOptions").html(string);
        if (Enumerable.From(allLadders).Where(function (x) { return x.ladderType == ladderType }).ToArray().length > 0) {
            var ladderObject = Enumerable.From(allLadders).First(function (x) { return x.ladderType == ladderType });
            showLadderInfo(ladderObject.ladderId);
        }
    }
    
    // Sort so that solo leagues are displayed first
    function sort(a, b) {
        return a.characters.length - b.characters.length;
    }
    
    // Start showing ladder info for a speific id
    function showLadderInfo(id) {
        // Show loading indicator
        showLoadingIndicator(true);
        // Get ladder json data for the speific ladder and forward it to parseLadderData
        getLadderJsonData(parseLadderData, id);
    }
    
    // Creates a table for the ladder data and shows it in the ladder panel
    function parseLadderData(jsonData) {
        var html = "";
        var rowHeight;
        
        var grandmaster = false;
        if (jsonData.ladderMembers[0].favoriteRaceP1 != undefined &&
            jsonData.ladderMembers[0].favoriteRaceP2 == undefined &&
            jsonData.ladderMembers[0].favoriteRaceP3 == undefined &&
            jsonData.ladderMembers[0].favoriteRaceP4 == undefined &&
            jsonData.ladderMembers.length > 100) {
            grandmaster = true;
        }
        var mode = grandmaster ? 1 : Math.ceil(jsonData.ladderMembers.length / 100);
        
        // Setup top
        html += "<div id=\"ladderInfoTopRow\" class=\"ladderInfoRow\">" + 
                    "<div class=\"ladderInfoTopColumn ladderInfoColumn ladderInfoRank\" style=\"border-top-left-radius: 5px; border-bottom-left-radius: 5px;\"><p>Rank</p></div>" +
                    "<div class=\"ladderInfoTopColumn ladderInfoColumn ladderInfoPlayers\"><p>Players</p></div>" +
                    "<div class=\"ladderInfoTopColumn ladderInfoColumn ladderInfoPoints\"><p>Points</p></div>" +
                    "<div class=\"ladderInfoTopColumn ladderInfoColumn ladderInfoWins\"><p>Wins</p></div>" +
                    "<div class=\"ladderInfoTopColumn ladderInfoColumn ladderInfoLosses\" style=\"border-top-right-radius: 5px; border-bottom-right-radius: 5px;\"><p>Losses</p></div>" +
                "</div>";
        var first = true;
        var myRank = 0;
        for (var i = 0; i < jsonData.ladderMembers.length; i += mode) {
            var players = "";
            var myProfile = false;

            var races = new Array();
            races[0] = jsonData.ladderMembers[i].favoriteRaceP1;
            races[1] = jsonData.ladderMembers[i].favoriteRaceP2;
            races[2] = jsonData.ladderMembers[i].favoriteRaceP3;
            races[3] = jsonData.ladderMembers[i].favoriteRaceP4;

            for (var j = 0; j < mode; j++) {
                if (j == 2) { players += "<br>"; }
                if (mode > 2) {
                    rowHeight = 50;
                } else {
                    rowHeight = 30;
                }

                var picture;
                if (races[j] == "TERRAN") {
                    picture = "<img src=\"images/racesymbols/terranlogo.gif\" id=\"ladderListRaceSymbol\" width=\"20\" height=\"20\"/> ";
                } else if (races[j] == "PROTOSS") {
                    picture = "<img src=\"images/racesymbols/protosslogo.gif\" id=\"ladderListRaceSymbol\" width=\"20\" height=\"20\" /> ";
                } else if (races[j] == "ZERG") {
                    picture = "<img src=\"images/racesymbols/zerglogo.gif\" id=\"ladderListRaceSymbol\" width=\"20\" height=\"20\" /> ";
                } else {
                    picture = "<img src=\"images/racesymbols/randomlogo.gif\" id=\"ladderListRaceSymbol\" width=\"20\" height=\"20\" /> ";
                }

                players += picture;
                players += jsonData.ladderMembers[i + j].character.displayName;
                if (j != (mode - 1)) {
                    players += ", ";
                }
                
                if (jsonData.ladderMembers[i + j].character.displayName == nick) {
                    myProfile = true;
                    myRank = (parseInt(i / mode) + 1);
                }
            }

            var extraCssRank;
            var extraCssLosses;
            
            if (first) {
                extraCssRank = "style=\"border-top-left-radius: 5px;\"";
                extraCssLosses = "style=\"border-top-right-radius: 5px;\"";
            } else if (i == (jsonData.ladderMembers.length - 1)) {
                extraCssRank = "style=\"border-bottom-left-radius: 5px;\"";
                extraCssLosses = "style=\"border-bottom-right-radius: 5px;\"";
            } else {
                extraCssRank = "";
                extraCssLosses = "";
            }

            html += "<div class=\"ladderInfoRow\" "+(myProfile ? "id=\"myProfileHash\"" : "")+" style=\"height: "+rowHeight+"px;\">" +
                            "<div class=\"ladderInfoColumn ladderInfoRank " + (myProfile ? "myProfile" : "") + "\" " + extraCssRank + "><p>" + (parseInt(i / mode) + 1) + "</p></div>" +
                            "<div class=\"ladderInfoColumn ladderInfoPlayers " + (myProfile ? "myProfile" : "") + "\"><p>" + players + "</p></div>" +
                            "<div class=\"ladderInfoColumn ladderInfoPoints " + (myProfile ? "myProfile" : "") + "\"><p>" + jsonData.ladderMembers[i].points + "</p></div>" +
                            "<div class=\"ladderInfoColumn ladderInfoWins " + (myProfile ? "myProfile" : "") + "\"><p>" + jsonData.ladderMembers[i].wins + "</p></div>" +
                            "<div class=\"ladderInfoColumn ladderInfoLosses " + (myProfile ? "myProfile" : "") + "\" " + extraCssLosses + "><p>" + jsonData.ladderMembers[i].losses + "</p></div>" +
                        "</div>";

            first = false;
        }

        $("#ladderInfoContent").html(html);
        
        // Cool animation that scrolls down to the where your user is in the table
        $("#ladderInfoContent").stop(true, true).animate(500);
        $("#ladderInfoContent").animate({
            'scrollTop': (myRank * (rowHeight + 2) + $("#ladderInfoTopRow").height() + 10 - ($("#ladderInfoContent").height() / 2))
        }, 500);

        showLoadingIndicator(false);
    }

    // Shows or hides the loading indicator, used for while loading ladder data which takes a small while. The loading indicator
    // is basically just a div placed above the ladder info div
    function showLoadingIndicator(bool) {
        if (bool) {
            $("#lodingIndicatorWrapper").css("visibility", "visible");
            $("#ladderInfoContent").css("visibility", "hidden");
        } else {
            $("#lodingIndicatorWrapper").css("visibility", "hidden");
            $("#ladderInfoContent").css("visibility", "visible");
        }
    }
    
    // Hides the ladder info panel
    $("#ladderInfoCross").live("click", function () {
        $("#ladderInfoWrapper").animate({
            left: "-550px"
        }, 300);
    });
});