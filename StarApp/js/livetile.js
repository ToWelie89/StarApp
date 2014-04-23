$(document).ready(function () {
    clearInterval(liveTileTimer);
    refreshLaddersAndTiles();
});

var liveTileTimer;

function refreshLaddersAndTiles() {
    // Reset ladder arrays
    ladders = [];
    allLadders = [];

    if (profileURL) {
        // Arrays used to set order of different elements
        var ladderHierarchy = new Array("BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "MASTER", "GRANDMASTER");
        var ladderTypeSequence = new Array("HOTS_SOLO", "HOTS_TWOS", "HOTS_THREES", "HOTS_FOURS");

        var notifications = Windows.UI.Notifications;
        var currentNotification = 0;
        var template = notifications.TileTemplateType.tileWideSmallImageAndText02;
        var tileXml = notifications.TileUpdateManager.getTemplateContent(template);
        var tileTextAttributes = tileXml.getElementsByTagName("text");
        var tileImageAttributes = tileXml.getElementsByTagName("image");

        getJsonData(setupLeagueInfo, "ladders");
    }

    // Fills the ladders and allLadders arrays with data and sets live tile data
    function setupLeagueInfo(jsonData) {
        for (var i = 0; i < jsonData.currentSeason.length; i++) {
            for (var j = 0; j < jsonData.currentSeason[i].ladder.length; j++) {

                var ladderType = jsonData.currentSeason[i].ladder[j].matchMakingQueue;
                var league = jsonData.currentSeason[i].ladder[j].league;
                var rank = jsonData.currentSeason[i].ladder[j].rank;
                var gamesWon = jsonData.currentSeason[i].ladder[j].wins;
                var gamesLost = jsonData.currentSeason[i].ladder[j].losses;
                var ladderId = jsonData.currentSeason[i].ladder[j].ladderId;

                var ladderObject;

                if (Enumerable.From(ladders).Where(function (x) { return x.ladderType == ladderType }).ToArray().length != 0) {
                    ladderObject = Enumerable.From(ladders).Single(function (x) { return x.ladderType == ladderType });
                    if (ladderHierarchy.indexOf(league) > ladderHierarchy.indexOf(ladderObject.league)) {
                        ladderObject.league = league;
                        ladderObject.rank = rank;
                        ladderObject.gamesWon = gamesWon;
                        ladderObject.gamesLost = gamesLost;
                        ladderObject.ladderId = ladderId;
                    }
                } else {
                    ladderObject = new Object();
                    ladderObject.league = league;
                    ladderObject.ladderType = ladderType;
                    ladderObject.rank = rank;
                    ladderObject.gamesWon = gamesWon;
                    ladderObject.gamesLost = gamesLost;
                    ladderObject.ladderId = ladderId;
                    ladders.push(ladderObject);
                }

                var completeLadderObject = new Object();
                var characteres = new Array();
                for (var chars = 0; chars < jsonData.currentSeason[i].characters.length; chars++) {
                    if (jsonData.currentSeason[i].characters[chars].displayName != nick && jsonData.currentSeason[i].characters[chars].id != id) {
                        var character = new Object();
                        character.name = jsonData.currentSeason[i].characters[chars].displayName;
                        characteres.push(character);
                    }
                }
                completeLadderObject.ladderType = ladderType;
                completeLadderObject.ladderId = ladderId;
                completeLadderObject.characters = characteres;
                allLadders.push(completeLadderObject);
            }
        }
        ladders.sort(sort);
        setupTileLoop();
    }

    // Sort so that the order of displayed ladder type follows that of ladderTypeSequence array
    function sort(a, b) {
        return ladderTypeSequence.indexOf(a.ladderType) - ladderTypeSequence.indexOf(b.ladderType);
    }

    // Starts the loop that each 6 seconds shows new ladder information in the live tile
    function setupTileLoop() {
        if (ladders.length == 1) {
            tileTextAttributes[0].innerText = getLadderTypeName(ladders[0].ladderType);
            tileTextAttributes[1].innerText = (ladders[0].gamesWon + ladders[0].gamesLost) + " games";
            tileTextAttributes[2].innerText = ladders[0].gamesWon + " wins " + ladders[0].gamesLost + " losses ("
                                              + parseInt((ladders[0].gamesWon / (ladders[0].gamesWon + ladders[0].gamesLost)) * 100) + "%)";
            tileTextAttributes[3].innerText = "Rank: " + ladders[0].rank;

            var picturePath = getLeagueIcon(ladders[0].league, ladders[0].rank);
            try {
                tileImageAttributes[0].setAttribute("src", picturePath);
            } catch (e) {
                // Do something
            }
            var tileNotification = new notifications.TileNotification(tileXml);
            notifications.TileUpdateManager.createTileUpdaterForApplication().clear();
            notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);
        }
        else if (ladders.length > 1) {
            liveTileTimer = setInterval(liveTileLoop, 6000);
        }
    }
    
    function liveTileLoop() {
        tileTextAttributes[0].innerText = getLadderTypeName(ladders[currentNotification].ladderType);
        tileTextAttributes[1].innerText = (ladders[currentNotification].gamesWon + ladders[currentNotification].gamesLost) + " games";
        tileTextAttributes[2].innerText = ladders[currentNotification].gamesWon + " wins " + ladders[currentNotification].gamesLost + " losses ("
                                          + parseInt((ladders[currentNotification].gamesWon / (ladders[currentNotification].gamesWon + ladders[currentNotification].gamesLost)) * 100) + "%)";
        tileTextAttributes[3].innerText = "Rank: " + ladders[currentNotification].rank;

        var picturePath = getLeagueIcon(ladders[currentNotification].league, ladders[currentNotification].rank);
        try {
            tileImageAttributes[0].setAttribute("src", picturePath);
        } catch (e) {
            // Do something
        }

        var tileNotification = new notifications.TileNotification(tileXml);

        notifications.TileUpdateManager.createTileUpdaterForApplication().clear();
        notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);

        if (currentNotification == (ladders.length - 1)) {
            currentNotification = 0;
        } else {
            currentNotification++;
        }
    }

    function getLadderTypeName(type) {
        if (type == "HOTS_SOLO") {
            return "1v1";
        } else if (type == "HOTS_TWOS") {
            return "2v2";
        } else if (type == "HOTS_THREES") {
            return "3v3";
        } else if (type == "HOTS_FOURS") {
            return "4v4";
        }
        return "N/A";
    }

    // Creates a mapping to a league icon depending onr and league
    function getLeagueIcon(league, rank) {
        var path = "ms-appx:///images/leagues/" + league.toLowerCase();

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