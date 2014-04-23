$(document).ready(function () {
    loadProfileData();
});

function loadProfileData() {
    var standardWinBarStyle = "border-left: 1px solid black; border-top: 1px solid black; border-bottom: 1px solid black; height: 12px; border-top-left-radius: 3px; border-bottom-left-radius: 3px; background-color: forestgreen; margin-top: 5px; float: left; margin-left: 0px; margin-right: 0px;";
    var standardLoseBarStyle = "border-right: 1px solid black; border-top: 1px solid black; border-bottom: 1px solid black;height: 12px; border-top-right-radius: 3px; border-bottom-right-radius: 3px; background-color: maroon; margin-top: 5px; float: left; margin-left: 0px; margin-right: 0px;";

    var matchesList = new Array();

    if (profileURL) {
        getJsonData(parseData, "");
        getJsonData(setMatchHistory, "matches");
    }

    function parseData(jsonData) {
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
            $("#raceSymbol").attr("src", "images/racesymbols/terranlogo.gif");
        } else if (jsonData.career.primaryRace == "ZERG") {
            $("#raceSymbol").attr("src", "images/racesymbols/zerglogo.gif");
        } else if (jsonData.career.primaryRace == "PROTOSS") {
            $("#raceSymbol").attr("src", "images/racesymbols/protosslogo.gif");
        } else {
            $("#raceSymbol").attr("src", "images/racesymbols/randomlogo.gif");
        }

        for (var i = 1; i <= 4; i++) {
            $("#ladderColumn" + i).html("<p style=\"width: 370px;\">No data</p>");
        }

        // LEAGUE STATS
        if (jsonData.season.stats != undefined) {
            for (var i = 0; i < jsonData.season.stats.length; i++) {
                var games = jsonData.season.stats[i].games;
                var wins = jsonData.season.stats[i].wins;
                var losses = games - wins;
                var totalWidth = 410;
                var winWidth = parseInt(totalWidth * (wins / games));
                var lossWidth = totalWidth - winWidth;
                var winPercentage = parseInt(wins / games * 100);
                var text = "<p>" + wins + " wins " + losses + " losses (" + winPercentage + "% win rate)<br>" +
                            "<div class=\"greenBar\" style=\"" + ((wins == 0) ? "visibility: hidden;" : "") + standardWinBarStyle + "width: " + winWidth + "px;" + ((wins > 0 && losses == 0) ? "border-top-right-radius: 3px; border-bottom-right-radius: 3px; border-right: 1px solid black;" : "") + "\"></div>" +
                            "<div class=\"redBar\" style=\"" + ((losses == 0) ? "visibility: hidden;" : "") + standardLoseBarStyle + "width: " + lossWidth + "px;" + ((wins == 0 && losses > 0) ? "border-top-left-radius: 3px; border-bottom-left-radius: 3px;" : "") + "\"></div>" +
                            "</p>";

                var ladderColumn;
                if (jsonData.season.stats[i].type == "1v1") {
                    ladderColumn = $("#ladderColumn1");
                } else if (jsonData.season.stats[i].type == "2v2") {
                    ladderColumn = $("#ladderColumn2");
                } else if (jsonData.season.stats[i].type == "3v3") {
                    ladderColumn = $("#ladderColumn3");
                } else if (jsonData.season.stats[i].type == "4v4") {
                    ladderColumn = $("#ladderColumn4");
                }
                ladderColumn.html(text);
            }
        }
        // STATS ON RIGHT BAR
        setLeagueSymbol(jsonData.career.highest1v1Rank, $("#bestSoloLeague"), $("#bestSoloLeagueText"));
        setLeagueSymbol(jsonData.career.highestTeamRank, $("#bestTeamLeague"), $("#bestTeamLeagueText"));
        $("#totalWins").text(jsonData.career.careerTotalGames);
        $("#totalGamesThisSeasons").text(jsonData.career.seasonTotalGames);

        $("#zergWins").text(jsonData.career.zergWins);
        $("#terranWins").text(jsonData.career.terranWins);
        $("#protossWins").text(jsonData.career.protossWins);

        $("#zergRank").text(jsonData.swarmLevels.zerg.level);
        $("#terranRank").text(jsonData.swarmLevels.terran.level);
        $("#protossRank").text(jsonData.swarmLevels.protoss.level);

        $("#rankBox").text(jsonData.swarmLevels.level);

        displayLeagueIcons();
    }

    function setLeagueSymbol(league, imageObject, textObject) {
        if (league == "BRONZE") {
            imageObject.attr("src", "images/leagues/bronze.png");
        } else if (league == "SILVER") {
            imageObject.attr("src", "images/leagues/silver.png");
        } else if (league == "GOLD") {
            imageObject.attr("src", "images/leagues/gold.png");
        } else if (league == "PLATINUM") {
            imageObject.attr("src", "images/leagues/platinum.png");
        } else if (league == "DIAMOND") {
            imageObject.attr("src", "images/leagues/diamond.png");
        } else if (league == "MASTER") {
            imageObject.attr("src", "images/leagues/master.png");
        } else if (league == "GRANDMASTER") {
            imageObject.attr("src", "images/leagues/grandmaster.png");
        } else {
            textObject.css("visibility", "hidden");
        }
    }

    // Creates match history elements
    function setMatchHistory(jsonData) {
        var string = "<p style=\"font-size: 18px; float: left; margin-left: 20px; margin-bottom: 0px; color: white;\">Recent matches: </p>";
        // reverse to see the oldest map first so that it will be oldest to the left and most recent to the right
        jsonData.matches.reverse();
        for (var i = 0; i < jsonData.matches.length; i++) {
            // ONLY SHOW LADDER GAMES
            if (jsonData.matches[i].type != "CUSTOM") {

                var matchObject = new Object();
                matchObject.map = jsonData.matches[i].map;
                matchObject.date = jsonData.matches[i].date;
                matchObject.decision = jsonData.matches[i].decision;
                matchObject.type = jsonData.matches[i].type;
                matchesList.push(matchObject);

                if (jsonData.matches[i].decision == "WIN") {
                    string += "<p class=\"match\" id=\"" + jsonData.matches[i].date + "\" style=\"font-size: 18px; color: darkgreen; font-weight: bold; margin-left: 7px; float: left;\">W</p>";
                }
                else if (jsonData.matches[i].decision == "LOSS") {
                    string += "<p class=\"match\" id=\"" + jsonData.matches[i].date + "\" style=\"font-size: 18px; color: darkred; font-weight: bold; margin-left: 7px; float: left;\">L</p>";
                }
            }
        }
        // Reverse to the see the newest map first again
        jsonData.matches.reverse();

        var streak = 0;
        for (var matchIndex = 0; matchIndex < jsonData.matches.length; matchIndex++) {
            if (jsonData.matches[matchIndex].type != "CUSTOM" && jsonData.matches[matchIndex].decision == "LOSS") {
                if (streak > 0) {
                    string += ("<p style=\"font-size: 18px; margin-top: -10px; float: left; margin-left: 20px; color: white; clear: left;\">Current win streak: " + streak + " games</p>");
                }
                break;
            } else if (jsonData.matches[matchIndex].type != "CUSTOM" && jsonData.matches[matchIndex].decision == "WIN") {
                streak++;
            }
        }

        $("#matchHistory").html(string);

        // The hover effect for the match class that loads the tooltip with match data and displays it at cursor position
        $(".match").live("mouseenter", function () {

            $(this).css("color", $(this).text() == "W" ? "limegreen" : "red");

            $("#tooltip").css("visibility", "visible");
            var date = $(this).attr("id");
            var matchObject = Enumerable.From(matchesList).Single(function (x) { return x.date == date });
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

            $("#tooltip").html(match + " - " + matchObject.map + "<br>" + imageHTML + "<br>" + timeConverter(matchObject.date) + "<br>" + matchObject.decision + (matchObject.decision == "WIN" ? "    ¯\\_(ツ)_/¯" : "    T_T"));
            $("#tooltip").stop(true, true).fadeIn(200);
            $("#tooltip").css("top", parseInt($(this).offset().top - $("#tooltip").height() - 25));
            $("#tooltip").css("left", parseInt($(this).offset().left));
        });
        $(".match").live("mouseleave", function () {
            $("#tooltip").stop(true, true).fadeOut(200);
            $(this).css("color", $(this).text() == "W" ? "darkgreen" : "darkred");
        });
    }

    // Maps a map name to a picture. Use Empty.jpg if none is found
    function getMapThumbnailPath(mapName) {
        // 1v1
        if (mapName == "Akilon Wastes") {
            return "images\\mapThumbnails\\1v1\\AkilonWastes.jpg";
        } else if (mapName == "Bel'Shir Vestige LE") {
            return "images\\mapThumbnails\\1v1\\BelshirVestigeLE.jpg";
        } else if (mapName == "Alterzim Stronghold TE") {
            return "images\\mapThumbnails\\1v1\\AlterzimStrongholdTE.jpg";
        } else if (mapName == "Star Station TE") {
            return "images\\mapThumbnails\\1v1\\StarStationTE.jpg";
        } else if (mapName == "Derelict Watcher TE") {
            return "images\\mapThumbnails\\1v1\\DerelichtWatcherTE.jpg";
        } else if (mapName == "Polar Night LE") {
            return "images\\mapThumbnails\\1v1\\PolarNight.jpg";
        } else if (mapName == "Yeonsu LE") {
            return "images\\mapThumbnails\\1v1\\YeonsuLE.jpg";
        } else if (mapName == "Frost LE") {
            return "images\\mapThumbnails\\1v1\\FrostLE.jpg";
        } else if (mapName == "Whirlwind LE") {
            return "images\\mapThumbnails\\1v1\\WhirlwindLE.jpg";
            // 2v2
        } else if (mapName == "Geosync Quarry") {
            return "images\\mapThumbnails\\2v2\\GeosyncQuarry.jpg";
        } else if (mapName == "Graystone Ravine") {
            return "images\\mapThumbnails\\2v2\\GraystoneRavine.jpg";
        } else if (mapName == "Isle of Slaughter") {
            return "images\\mapThumbnails\\2v2\\IsleOfSlaughter.jpg";
        } else if (mapName == "Reclamation") {
            return "images\\mapThumbnails\\2v2\\Reclamation.jpg";
        } else if (mapName == "Reflection") {
            return "images\\mapThumbnails\\2v2\\Reflection.jpg";
        } else if (mapName == "Resupply Tanker") {
            return "images\\mapThumbnails\\2v2\\ResupplyTanker.jpg";
        } else if (mapName == "The Bone Trench") {
            return "images\\mapThumbnails\\2v2\\TheBoneTrench.jpg";
        } else if (mapName == "Hunting Ground") {
            return "images\\mapThumbnails\\2v2\\HuntingGround.jpg";
            // 3v3
        } else if (mapName == "Green Acres") {
            return "images\\mapThumbnails\\3v3\\GreenAcres.jpg";
        } else if (mapName == "Queen's Nest") {
            return "images\\mapThumbnails\\3v3\\QueensNest.jpg";
        } else if (mapName == "Research Complex") {
            return "images\\mapThumbnails\\3v3\\ResearchComplex.jpg";
        } else if (mapName == "Sands of Strife") {
            return "images\\mapThumbnails\\3v3\\SandsStrife.jpg";
        } else if (mapName == "Shadow Reactor") {
            return "images\\mapThumbnails\\3v3\\ShadowReactor.jpg";
        } else if (mapName == "Silent Dunes") {
            return "images\\mapThumbnails\\3v3\\SilentDunes.jpg";
        } else if (mapName == "Temple of the Preservers") {
            return "images\\mapThumbnails\\3v3\\TempleOfThePreservers.jpg";
        } else if (mapName == "Vault of Secrets") {
            return "images\\mapThumbnails\\3v3\\VaultOfSecrets.jpg";
            // 4v4
        } else if (mapName == "Atlas Station") {
            return "images\\mapThumbnails\\4v4\\AtlasStation.jpg";
        } else if (mapName == "Celestial Bastion") {
            return "images\\mapThumbnails\\4v4\\CelestialBastion.jpg";
        } else if (mapName == "Deadlock Ridge") {
            return "images\\mapThumbnails\\4v4\\DeadlockRidge.jpg";
        } else if (mapName == "Fallout Zone") {
            return "images\\mapThumbnails\\4v4\\FalloutZone.jpg";
        } else if (mapName == "Fossil Quarry") {
            return "images\\mapThumbnails\\4v4\\FossilQuarry.jpg";
        } else if (mapName == "Primordial Grave") {
            return "images\\mapThumbnails\\4v4\\PrimordialGrave.jpg";
        } else if (mapName == "Volcanic Ridge") {
            return "images\\mapThumbnails\\4v4\\VolcanicRidge.jpg";
        } else if (mapName == "Writhing Morass") {
            return "images\\mapThumbnails\\4v4\\WrithingMorass.jpg";
            // FFA
        } else if (mapName == "Abyss") {
            return "images\\mapThumbnails\\FFA\\Abyss.jpg";
        } else if (mapName == "Fractured Glacier") {
            return "images\\mapThumbnails\\FFA\\FracturedGlacier.jpg";
        } else if (mapName == "Korhal City") {
            return "images\\mapThumbnails\\FFA\\KorhalCity.jpg";
        } else if (mapName == "Quicksand") {
            return "images\\mapThumbnails\\FFA\\Quicksand.jpg";
        } else if (mapName == "Star Station") {
            return "images\\mapThumbnails\\FFA\\StarStation.jpg";
        } else if (mapName == "Tectonic Rift") {
            return "images\\mapThumbnails\\FFA\\TectonicRift.jpg";
        } else {
            return "images\\mapThumbnails\\Empty.png";
        }
    }

    // Converts the timestamp to a format a human understand ;)
    function timeConverter(UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ', ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
        return time;
    }

    // Display icons leagues in the main panel
    function displayLeagueIcons() {
        // LEAGUE SYMBOLS
        if (Enumerable.From(ladders).Where(function (x) { return x.ladderType == "HOTS_SOLO" }).ToArray().length != 0) {
            var ladderObject = Enumerable.From(ladders).Single(function (x) { return x.ladderType == "HOTS_SOLO" });
            $("#soloLeague").attr("src", getLeagueSymbol(ladderObject.league, ladderObject.rank));
        }
        if (Enumerable.From(ladders).Where(function (x) { return x.ladderType == "HOTS_TWOS" }).ToArray().length != 0) {
            var ladderObject = Enumerable.From(ladders).Single(function (x) { return x.ladderType == "HOTS_TWOS" });
            $("#twosLeague").attr("src", getLeagueSymbol(ladderObject.league, ladderObject.rank));
        }
        if (Enumerable.From(ladders).Where(function (x) { return x.ladderType == "HOTS_THREES" }).ToArray().length != 0) {
            var ladderObject = Enumerable.From(ladders).Single(function (x) { return x.ladderType == "HOTS_THREES" });
            $("#threesLeague").attr("src", getLeagueSymbol(ladderObject.league, ladderObject.rank));
        }
        if (Enumerable.From(ladders).Where(function (x) { return x.ladderType == "HOTS_FOURS" }).ToArray().length != 0) {
            var ladderObject = Enumerable.From(ladders).Single(function (x) { return x.ladderType == "HOTS_FOURS" });
            $("#foursLeague").attr("src", getLeagueSymbol(ladderObject.league, ladderObject.rank));
        }
    }

    function getLeagueSymbol(league, rank) {
        var path = "images/leagues/" + league.toLowerCase();

        if (rank <= 50 && rank > 25) {
            path += "Top50";
        } else if (rank <= 25 && rank > 8) {
            path += "Top25";
        } else if (rank <= 8) {
            path += "Top8";
        }
        path += ".png";
        return path;
    }
}

