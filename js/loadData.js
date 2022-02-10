// Contains information about the ladders showwn (1v1, best 2v2, best 3v3, best 4v4) in live tile and main window of app
var ladders = [];
// Contains information of ALL ladders, for instance all different 2v2 teams, to be shown in left ladder window
var allLadders = [];
var matchesList = [];

let noProfileLoaded = true;

const profile = {
    regionId: getUrlParamter('regionId'),
    realm: getUrlParamter('realm'),
    profileId: getUrlParamter('profileId')
};

if (profile.regionId && profile.profileId && profile.realm) {
    showProfileSetterBar(false);
    getProfile(profile.regionId, profile.realm, profile.profileId);
} else if (window.localStorage.getItem('regionId') && window.localStorage.getItem('realm') && window.localStorage.getItem('profileId')) {
    profile.regionId = window.localStorage.getItem('regionId');
    profile.realm = window.localStorage.getItem('realm');
    profile.profileId = window.localStorage.getItem('profileId');
    showProfileSetterBar(false);
    getProfile(profile.regionId, profile.realm, profile.profileId);
} else {
    document.getElementById('statsData').style.opacity = 0;
    document.getElementById('container').style.opacity = 0;
    // show empty
}

// Try to test if the data is correct and working
function getProfile(regionId, realm, profileId) {
    noProfileLoaded = false;
    setMarineLoader(true);

    fetch(`./model/starcraftApiService.php?regionId=${regionId}&realm=${realm}&profileId=${profileId}&action=getProfile`)
    .then(response => response.json())
    .then(jsonData => {
        profile.displayName = jsonData.displayName;

        // PORTRAIT
        $("#portrait").css("background-image", "url(" + jsonData.portrait.url + ")");
        $("#portrait").css("background-size", "auto");
        $("#portrait").css("background-position", jsonData.portrait.x + "px " + jsonData.portrait.y + "px");
        // BASIC CHARACTER INFO
        $("#changeProfile").text("Change profile");
        $("#charName").text(jsonData.displayName);
        if (jsonData.clanName != "") {
            $("#clanName").text("[" + jsonData.clanTag + "] " + jsonData.clanName);
        } else {
            $("#changeProfile").css("margin-left", "0px");
        }
        $("#achievementPoints").text(jsonData.achievements.points.totalPoints);
        // RACE SYMBOLS
        if (jsonData.career.primaryRace == "TERRAN") {
            $("#raceSymbol").attr("src", "./images/racesymbols/terranlogo.gif");
        } else if (jsonData.career.primaryRace == "ZERG") {
            $("#raceSymbol").attr("src", "./images/racesymbols/zerglogo.gif");
        } else if (jsonData.career.primaryRace == "PROTOSS") {
            $("#raceSymbol").attr("src", "./images/racesymbols/protosslogo.gif");
        } else {
            $("#raceSymbol").attr("src", "./images/racesymbols/randomlogo.gif");
        }

        for (var i = 1; i <= 4; i++) {
            $("#ladderColumn" + i).html("<p style=\"width: 370px;\">No data</p>");
        }

        document.getElementById("changeProfile").addEventListener('click', () => {
            showProfileSetterBar(true);
            document.getElementById('profileTextArea').focus();
            document.getElementById('profileTextArea').select();
        });

        // LEAGUE STATS
        if (jsonData.season.stats != undefined) {
            for (var i = 0; i < jsonData.season.stats.length; i++) {
                if (jsonData.season.stats[i].type !== 'Archon') { // for now, no archon support
                    var games = jsonData.season.stats[i].wins;
    
                    let ladderColumn;
                    if (jsonData.season.stats[i].type == "1v1") {
                        ladderColumn = $("#ladderColumn1");
                    } else if (jsonData.season.stats[i].type == "2v2") {
                        ladderColumn = $("#ladderColumn2");
                    } else if (jsonData.season.stats[i].type == "3v3") {
                        ladderColumn = $("#ladderColumn3");
                    } else if (jsonData.season.stats[i].type == "4v4") {
                        ladderColumn = $("#ladderColumn4");
                    }
    
                    if (games > 0) {
                        var wins = jsonData.season.stats[i].games;
                        var losses = games - wins;
                        var totalWidth = 410;
                        var winWidth = parseInt(totalWidth * (wins / games));
                        var lossWidth = totalWidth - winWidth;
                        var winPercentage = Math.floor((wins / games) * 100);
                        var text = "<p>" + wins + " wins " + losses + " losses (" + winPercentage + "% win rate)<br>" +
                                    "<div class=\"greenBar\" style=\"" + ((wins == 0) ? "visibility: hidden;" : "") + standardWinBarStyle + "width: " + winWidth + "px;" + ((wins > 0 && losses == 0) ? "border-top-right-radius: 3px; border-bottom-right-radius: 3px; border-right: 1px solid black;" : "") + "\"></div>" +
                                    "<div class=\"redBar\" style=\"" + ((losses == 0) ? "visibility: hidden;" : "") + standardLoseBarStyle + "width: " + lossWidth + "px;" + ((wins == 0 && losses > 0) ? "border-top-left-radius: 3px; border-bottom-left-radius: 3px;" : "") + "\"></div>" +
                                    "</p>";
                        ladderColumn.html(text);
                    } else {
                        var text = "<p class='noMatches'>No matches for this mode</p>";
                        ladderColumn.html(text);
                    }
                }
            }
        }
        // STATS ON RIGHT BAR
        setLeagueSymbol(jsonData.career.highest1v1Rank, $("#bestSoloLeague"), $("#bestSoloLeagueText"));
        setLeagueSymbol(jsonData.career.highestTeamRank, $("#bestTeamLeague"), $("#bestTeamLeagueText"));
        var w = jsonData.career.careerTotalGames + '';
        var totalWins = w < 1000
            ? w
            : w.substring(0, w.length - 3) + ' ' + w.substring(w.length - 3, w.length);

        $("#totalWins").text(totalWins);
        $("#totalGamesThisSeasons").text(jsonData.career.seasonTotalGames);

        $("#zergWins").text(jsonData.career.zergWins);
        $("#terranWins").text(jsonData.career.terranWins);
        $("#protossWins").text(jsonData.career.protossWins);

        $("#zergRank").text(jsonData.swarmLevels.zerg.level);
        $("#terranRank").text(jsonData.swarmLevels.terran.level);
        $("#protossRank").text(jsonData.swarmLevels.protoss.level);

        $("#rankBox").text(jsonData.swarmLevels.level);

        document.getElementById('loadingStep1').style.webkitTextFillColor = 'white';

        getLadderData();
    });
}

function getLadderData() {
    // Reset ladder arrays
    ladders = [];
    allLadders = [];

    if (profile.regionId && profile.profileId && profile.realm) {
        fetch(`./model/starcraftApiService.php?regionId=${profile.regionId}&realm=${profile.realm}&profileId=${profile.profileId}&action=getLadders`)
        .then(response => response.json())
        .then(jsonData => {
            ladders = [];
            allLadders = [];

            const allAvailableLadders = jsonData.currentSeason.reduce((t, c, i) => {
                c.ladder.map(l => l.characters = c.characters);
                t = [...t, ...c.ladder];
                return t;
            }, []);
            allAvailableLadders.map(x => x.leagueAsNumber = leaguesAsNumbers[x.league]);
            allAvailableLadders.map(x => x.ladderType = x.matchMakingQueue);

            ['LOTV_SOLO', 'LOTV_TWOS', 'LOTV_THREES', 'LOTV_FOURS'].forEach(ladderType => {
                let laddersOfType = allAvailableLadders.filter(x => x.matchMakingQueue === ladderType);
                laddersOfType.sort((a, b) => {
                    if (a.league !== b.league) {
                        return b.leagueAsNumber - a.leagueAsNumber;
                    } else {
                        return a.rank - b.rank;
                    }
                });
                if (laddersOfType[0]) {

                    //setLeagueSymbol(laddersOfType[0].league, imageObject);
                    
                    ladders = [...ladders, {
                        gamesLost: laddersOfType[0].losses,
                        gamesWon: laddersOfType[0].wins,
                        ladderId: laddersOfType[0].ladderId,
                        ladderType: laddersOfType[0].matchMakingQueue,
                        league: laddersOfType[0].league,
                        rank: laddersOfType[0].rank,
                    }];
                }
                allLadders = [...allLadders, ...laddersOfType];
            });

            displayLeagueIcons();
            document.getElementById('loadingStep2').style.webkitTextFillColor = 'white';

            loadMatchData();
        });
    }
}

function loadMatchData() {
    if (profile.regionId && profile.profileId && profile.realm) {
        fetch(`./model/starcraftApiService.php?regionId=${profile.regionId}&realm=${profile.realm}&profileId=${profile.profileId}&action=getMatches`)
        .then(response => response.json())
        .then(jsonData => {
            var string = "<p style=\"font-size: 18px; float: left; margin-left: 20px; margin-bottom: 0px; color: white;\">Recent matches: </p>";
            // reverse to see the oldest map first so that it will be oldest to the left and most recent to the right
            jsonData.matches.reverse();
            for (var i = 0; i < jsonData.matches.length; i++) {
                // ONLY SHOW LADDER GAMES
                if (jsonData.matches[i].type != "Custom") {

                    var matchObject = new Object();
                    matchObject.map = jsonData.matches[i].map;
                    matchObject.date = jsonData.matches[i].date;
                    matchObject.decision = jsonData.matches[i].decision;
                    matchObject.type = jsonData.matches[i].type;
                    matchesList.push(matchObject);

                    if (jsonData.matches[i].decision == "Win") {
                        string += "<p class=\"match\" id=\"" + jsonData.matches[i].date + "\" style=\"font-size: 18px; color: darkgreen; font-weight: bold; margin-left: 7px; float: left;\">W</p>";
                    }
                    else if (jsonData.matches[i].decision == "Loss") {
                        string += "<p class=\"match\" id=\"" + jsonData.matches[i].date + "\" style=\"font-size: 18px; color: darkred; font-weight: bold; margin-left: 7px; float: left;\">L</p>";
                    }
                }
            }
            // Reverse to the see the newest map first again
            jsonData.matches.reverse();

            var streak = 0;
            for (var matchIndex = 0; matchIndex < jsonData.matches.length; matchIndex++) {
                if (jsonData.matches[matchIndex].type != "Custom" && jsonData.matches[matchIndex].decision == "Loss") {
                    if (streak > 0) {
                        string += ("<p style=\"font-size: 18px; margin-top: -10px; float: left; margin-left: 20px; color: white; clear: left;\">Current win streak: " + streak + " games</p>");
                    }
                    break;
                } else if (jsonData.matches[matchIndex].type != "Custom" && jsonData.matches[matchIndex].decision == "Win") {
                    streak++;
                }
            }

            $("#matchHistory").html(string);

            // The hover effect for the match class that loads the tooltip with match data and displays it at cursor position
            $(".match").mouseenter(function () {
                $(this).css("color", $(this).text() == "W" ? "limegreen" : "red");

                $("#tooltip").css("visibility", "visible");
                var date = $(this).attr("id");
                
                var matchObject = matchesList.filter(x => (x.date + '') === date)[0];
                
                var imageHTML = "<img src=\"" + getMapThumbnailPath(matchObject.map) + "\" width=\"200\" style=\"margin-top: 5px; border: 2px solid black;\">";

                var match = "";
                if (matchObject.type == "SOLO") {
                    match = "1v1";
                } else if (matchObject.type == "TWOS") {
                    match = "2v2";
                } if (matchObject.type == "THREES") {
                    match = "3v3";
                } if (matchObject.type == "FOURS") {
                    match = "4v4";
                } if (matchObject.type == "FFA") {
                    match = "FFA";
                }

                $("#tooltip").html(match + " - " + matchObject.map + "<br>" + imageHTML + "<br>" + timeConverter(matchObject.date) + "<br>" + matchObject.decision + (matchObject.decision == "Win" ? "    ¯\\_(ツ)_/¯" : "    T_T"));
                $("#tooltip").stop(true, true).fadeIn(200);
                $("#tooltip").css("top", parseInt($(this).offset().top - $("#tooltip").height() - 25));
                $("#tooltip").css("left", parseInt($(this).offset().left));
            });
            $(".match").mouseleave(function () {
                $("#tooltip").stop(true, true).fadeOut(200);
                $(this).css("color", $(this).text() == "W" ? "darkgreen" : "darkred");
            });
            document.getElementById('loadingStep3').style.webkitTextFillColor = 'white';
            setTimeout(() => {
                setMarineLoader(false);
            }, 1000);
        });
    }
}

setTimeout(() => {
    document.getElementById('profileSubmitButton').addEventListener('click', function () {
        // Example URL: https://starcraft2.com/profile/2/1/8276303

        const input = document.getElementById('profileTextArea').value;

        if (!input) {
            alert('No URL input. You need to enter a URL to a Starcraft 2 profile. An example of which looks a bit like this:\n\nhttps://starcraft2.com/profile/2/1/8276303')
        } else {
            const relevantParts = input.split('/profile/')[1];
            // 2/1/8276303
            const region = relevantParts.split('/')[0];
            const realm = relevantParts.split('/')[1];
            const profileId= relevantParts.split('/')[2];

            const currentBaseUrl = window.location.href.split('?')[0];

            const rememberProfile = document.getElementById('rememberProfile').checked;

            if (rememberProfile) {
                window.localStorage.setItem('regionId', region);
                window.localStorage.setItem('realm', realm);
                window.localStorage.setItem('profileId', profileId);
            }

            window.location.href = `${currentBaseUrl}?regionId=${region}&profileId=${profileId}&realm=${realm}`;
        }
    });
    
    document.getElementById('noProfileCross').addEventListener('click', function () {
        if (profile && !noProfileLoaded) {
            showProfileSetterBar(false);
        }
    });
}, 100);