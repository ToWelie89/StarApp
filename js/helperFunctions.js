// Reference: https://develop.battle.net/documentation/guides/regionality-and-apis
const regionIds = {
    us: 1,
    latam: 1,
    eu: 2,
    russia: 2,
    korea: 3,
    taiwan: 3,
    china: 5
};

const leaguesAsNumbers = {
    'BRONZE': 0,
    'SILVER': 1,
    'GOLD': 2,
    'PLATINUM': 3,
    'DIAMOND': 4,
    'MASTER': 5,
    'GRANDMASTER': 6
};

const realms = {
    us: 1,
    latam: 2,
    eu: 1,
    russia: 2,
    korea: 1,
    taiwan: 2,
    china: 1
};

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

var standardWinBarStyle = "border-left: 1px solid black; border-top: 1px solid black; border-bottom: 1px solid black; height: 12px; border-top-left-radius: 3px; border-bottom-left-radius: 3px; background-color: forestgreen; margin-top: 5px; float: left; margin-left: 0px; margin-right: 0px;";
var standardLoseBarStyle = "border-right: 1px solid black; border-top: 1px solid black; border-bottom: 1px solid black;height: 12px; border-top-right-radius: 3px; border-bottom-right-radius: 3px; background-color: maroon; margin-top: 5px; float: left; margin-left: 0px; margin-right: 0px;";

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

function getLeagueSymbol(league, rank) {
    var path = "./images/leagues/" + league.toLowerCase();

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

const getUrlParamter = key => {
    const href = window.location.href;
    let parameters = href.split('?')[1];
    if (parameters) {
        parameters = parameters.split('&');
        const value = parameters.find(x => {
            const k = x.split('=')[0];
            const v = x.split('=')[1];
            if (k.toLowerCase() === key.toLowerCase()) {
                return v;
            }
        });
        return value.split('=')[1];
    } else {
        return null;
    }
};

function setLeagueSymbol(league, imageObject, textObject = null) {
    if (league == "BRONZE") {
        imageObject.attr("src", "./images/leagues/bronze.png");
    } else if (league == "SILVER") {
        imageObject.attr("src", "./images/leagues/silver.png");
    } else if (league == "GOLD") {
        imageObject.attr("src", "./images/leagues/gold.png");
    } else if (league == "PLATINUM") {
        imageObject.attr("src", "./images/leagues/platinum.png");
    } else if (league == "DIAMOND") {
        imageObject.attr("src", "./images/leagues/diamond.png");
    } else if (league == "MASTER") {
        imageObject.attr("src", "./images/leagues/master.png");
    } else if (league == "GRANDMASTER") {
        imageObject.attr("src", "./images/leagues/grandmaster.png");
    } else if (textObject) {
        textObject.css("visibility", "hidden");
    }
}

// Display icons leagues in the main panel
function displayLeagueIcons() {
    // LEAGUE SYMBOLS
    if (ladders.filter(x => x.ladderType === 'LOTV_SOLO').length != 0) {
        var ladderObject = ladders.filter(x => x.ladderType === 'LOTV_SOLO')[0];
        $("#soloLeague").attr("src", getLeagueSymbol(ladderObject.league, ladderObject.rank));
    } else {
        $("#soloLeague").attr("src", 'images/leagues/noLeague.png');
    }
    if (ladders.filter(x => x.ladderType === 'LOTV_TWOS').length != 0) {
        var ladderObject = ladders.filter(x => x.ladderType === 'LOTV_TWOS')[0];
        $("#twosLeague").attr("src", getLeagueSymbol(ladderObject.league, ladderObject.rank));
    } else {
        $("#twosLeague").attr("src", 'images/leagues/noLeague.png');
    }
    if (ladders.filter(x => x.ladderType === 'LOTV_THREES').length != 0) {
        var ladderObject = ladders.filter(x => x.ladderType === 'LOTV_THREES')[0];
        $("#threesLeague").attr("src", getLeagueSymbol(ladderObject.league, ladderObject.rank));
    } else {
        $("#threesLeague").attr("src", 'images/leagues/noLeague.png');
    }
    if (ladders.filter(x => x.ladderType === 'LOTV_FOURS').length != 0) {
        var ladderObject = ladders.filter(x => x.ladderType === 'LOTV_FOURS')[0];
        $("#foursLeague").attr("src", getLeagueSymbol(ladderObject.league, ladderObject.rank));
    } else {
        $("#foursLeague").attr("src", 'images/leagues/noLeague.png');
    }
}

// Shows or hides the panel where user can change profile
function showProfileSetterBar(bool) {
    if (bool) {
        const regionId = profile.regionId;
        const realm = profile.realm;

        const url = `https://starcraft2.com/en-gb/profile/${regionId}/${realm}/${profile.profileId}`;

        $("#profileTextArea").val(url);
        $("#noProfile").css("visibility", "visible");
        $("#noProfile").css("height", "auto");
        document.getElementById('stats').style.borderTopLeftRadius = '0px';
        document.getElementById('stats').style.borderTopRightRadius = '0px';
    } else {
        $("#noProfile").css("visibility", "hidden");
        $("#noProfile").css("height", "0px");
        document.getElementById('stats').style.borderTopLeftRadius = '7px';
        document.getElementById('stats').style.borderTopRightRadius = '7px';
    }
}

// Maps a map name to a picture. Use Empty.jpg if none is found
function getMapThumbnailPath(mapName) {
    // 1v1
    if (mapName == "Akilon Wastes") {
        return "./images\\mapThumbnails\\1v1\\AkilonWastes.jpg";
    } else if (mapName == "Bel'Shir Vestige LE") {
        return "./images\\mapThumbnails\\1v1\\BelshirVestigeLE.jpg";            
    } else if (mapName == "Alterzim Stronghold TE") {
        return "./images\\mapThumbnails\\1v1\\AlterzimStrongholdTE.jpg";
    } else if (mapName == "Star Station TE") {
        return "./images\\mapThumbnails\\1v1\\StarStationTE.jpg";
    } else if (mapName == "Derelict Watcher TE") {
        return "./images\\mapThumbnails\\1v1\\DerelichtWatcherTE.jpg";
    } else if (mapName == "Polar Night LE") {
        return "./images\\mapThumbnails\\1v1\\PolarNight.jpg";
    } else if (mapName == "Yeonsu LE") {
        return "./images\\mapThumbnails\\1v1\\YeonsuLE.jpg";
    } else if (mapName == "Frost LE") {
        return "./images\\mapThumbnails\\1v1\\FrostLE.jpg";
    } else if (mapName == "Whirlwind LE") {
        return "./images\\mapThumbnails\\1v1\\WhirlwindLE.jpg";
    // 1v1 current
    } else if (mapName.includes('Atmospheres')) {
        return "./images\\mapThumbnails\\1v1\\2000_Atmospheres.jpg";
    } else if (mapName.includes('Berlingrad')) {
        return "./images\\mapThumbnails\\1v1\\Berlingrad.jpg";
    } else if (mapName.includes('Blackburn')) {
        return "./images\\mapThumbnails\\1v1\\Blackburn.jpg";
    } else if (mapName.includes('Curious')) {
        return "./images\\mapThumbnails\\1v1\\Curious_Minds.jpg";
    } else if (mapName.includes('Glittering')) {
        return "./images\\mapThumbnails\\1v1\\Glittering_Ashes.jpg";
    } else if (mapName.includes('Hardwire')) {
        return "./images\\mapThumbnails\\1v1\\Hardwire.jpg";
    } else if (mapName.includes('Altaris')) {
        return "./images\\mapThumbnails\\1v1\\Pride_of_Altaris.jpg";
    // 2v2
    } else if (mapName == "Geosync Quarry") {
        return "./images\\mapThumbnails\\2v2\\GeosyncQuarry.jpg";
    } else if (mapName == "Graystone Ravine") {
        return "./images\\mapThumbnails\\2v2\\GraystoneRavine.jpg";
    } else if (mapName == "Isle of Slaughter") {
        return "./images\\mapThumbnails\\2v2\\IsleOfSlaughter.jpg";
    } else if (mapName == "Reclamation") {
        return "./images\\mapThumbnails\\2v2\\Reclamation.jpg";
    } else if (mapName == "Reflection") {
        return "./images\\mapThumbnails\\2v2\\Reflection.jpg";
    } else if (mapName == "Resupply Tanker") {
        return "./images\\mapThumbnails\\2v2\\ResupplyTanker.jpg";
    } else if (mapName == "The Bone Trench") {
        return "./images\\mapThumbnails\\2v2\\TheBoneTrench.jpg";
    } else if (mapName == "Hunting Ground") {
        return "./images\\mapThumbnails\\2v2\\HuntingGround.jpg";
    // 2v2 current
    } else if (mapName.includes('Arctic') && mapName.includes('Dream')) {
        return "./images\\mapThumbnails\\2v2\\Arctic_Dream_LE.jpg";
    } else if (mapName.includes('Emerald')) {
        return "./images\\mapThumbnails\\2v2\\Emerald_City.jpg";
    } else if (mapName.includes('Fields') && mapName.includes('Death')) {
        return "./images\\mapThumbnails\\2v2\\Fields_of_Death.jpg";
    } else if (mapName.includes('Artillery')) {
        return "./images\\mapThumbnails\\2v2\\Heavy_Artillery_LE.jpg";
    } else if (mapName.includes('Nightscape')) {
        return "./images\\mapThumbnails\\2v2\\Nightscape_LE.jpg";
    } else if (mapName.includes('Reclamation')) {
        return "./images\\mapThumbnails\\2v2\\Reclamation_LE.jpg";
    } else if (mapName.includes('Rhoskallian')) {
        return "./images\\mapThumbnails\\2v2\\Rhoskallian_LE.jpg";
    // 3v3
    } else if (mapName == "Green Acres") {
        return "./images\\mapThumbnails\\3v3\\GreenAcres.jpg";
    } else if (mapName == "Queen's Nest") {
        return "./images\\mapThumbnails\\3v3\\QueensNest.jpg";
    } else if (mapName == "Research Complex") {
        return "./images\\mapThumbnails\\3v3\\ResearchComplex.jpg";
    } else if (mapName == "Sands of Strife") {
        return "./images\\mapThumbnails\\3v3\\SandsStrife.jpg";
    } else if (mapName == "Shadow Reactor") {
        return "./images\\mapThumbnails\\3v3\\ShadowReactor.jpg";
    } else if (mapName == "Silent Dunes") {
        return "./images\\mapThumbnails\\3v3\\SilentDunes.jpg";
    } else if (mapName == "Temple of the Preservers") {
        return "./images\\mapThumbnails\\3v3\\TempleOfThePreservers.jpg";
    } else if (mapName == "Vault of Secrets") {
        return "./images\\mapThumbnails\\3v3\\VaultOfSecrets.jpg";
    // 3v3 current
    } else if (mapName.includes('Black') && mapName.includes('Site')) {
        return "./images\\mapThumbnails\\3v3\\Black_Site_2E.jpg";
    } else if (mapName.includes('Buried') && mapName.includes('Caverns')) {
        return "./images\\mapThumbnails\\3v3\\Buried_Caverns.jpg";
    } else if (mapName.includes('Tribulation')) {
        return "./images\\mapThumbnails\\3v3\\Canyon_of_Tribulation.jpg";
    } else if (mapName.includes('Flashback')) {
        return "./images\\mapThumbnails\\3v3\\Flashback_LE.jpg";
    } else if (mapName.includes('Realities') && mapName.includes('Simulation')) {
        return "./images\\mapThumbnails\\3v3\\Realities_Simulation_LE.jpg";
    } else if (mapName.includes('Sentinel')) {
        return "./images\\mapThumbnails\\3v3\\Sentinel_LE.jpg";
    } else if (mapName.includes('Whitewater')) {
        return "./images\\mapThumbnails\\3v3\\Whitewater_Line_LE.jpg";
    // 4v4
    } else if (mapName == "Atlas Station") {
        return "./images\\mapThumbnails\\4v4\\AtlasStation.jpg";
    } else if (mapName == "Celestial Bastion") {
        return "./images\\mapThumbnails\\4v4\\CelestialBastion.jpg";
    } else if (mapName == "Deadlock Ridge") {
        return "./images\\mapThumbnails\\4v4\\DeadlockRidge.jpg";
    } else if (mapName == "Fallout Zone") {
        return "./images\\mapThumbnails\\4v4\\FalloutZone.jpg";
    } else if (mapName == "Fossil Quarry") {
        return "./images\\mapThumbnails\\4v4\\FossilQuarry.jpg";
    } else if (mapName == "Primordial Grave") {
        return "./images\\mapThumbnails\\4v4\\PrimordialGrave.jpg";
    } else if (mapName == "Volcanic Ridge") {
        return "./images\\mapThumbnails\\4v4\\VolcanicRidge.jpg";
    } else if (mapName == "Writhing Morass") {
        return "./images\\mapThumbnails\\4v4\\WrithingMorass.jpg";
    // 4v4 current
    } else if (mapName.includes("Concord")) {
        return "./images\\mapThumbnails\\4v4\\Concord_LE.jpg";
    } else if (mapName.includes("Fortitude")) {
        return "./images\\mapThumbnails\\4v4\\Fortitude_LE.jpg";
    } else if (mapName.includes("Nekodrec")) {
        return "./images\\mapThumbnails\\4v4\\Nekodrec_LE.jpg";
    } else if (mapName.includes("Rooftop") && mapName.includes("Terrace")) {
        return "./images\\mapThumbnails\\4v4\\Rooftop_Terrace_0.1.jpg";
    } else if (mapName.includes("Shipwrecked")) {
        return "./images\\mapThumbnails\\4v4\\Shipwrecked_le_map.jpg";
    } else if (mapName.includes("Tropic")) {
        return "./images\\mapThumbnails\\4v4\\Tropic_Shores.jpg";
    } else if (mapName.includes("Tuonela")) {
        return "./images\\mapThumbnails\\4v4\\Tuonela_LE.jpg";
    // FFA
    } else if (mapName == "Abyss") {
        return "./images\\mapThumbnails\\FFA\\Abyss.jpg";
    } else if (mapName == "Fractured Glacier") {
        return "./images\\mapThumbnails\\FFA\\FracturedGlacier.jpg";
    } else if (mapName == "Korhal City") {
        return "./images\\mapThumbnails\\FFA\\KorhalCity.jpg";
    } else if (mapName == "Quicksand") {
        return "./images\\mapThumbnails\\FFA\\Quicksand.jpg";
    } else if (mapName == "Star Station") {
        return "./images\\mapThumbnails\\FFA\\StarStation.jpg";
    } else if (mapName == "Tectonic Rift") {
        return "./images\\mapThumbnails\\FFA\\TectonicRift.jpg";
    } else {
        return "./images\\mapThumbnails\\Empty.png";
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
};

function getLeagueSymbol(league, rank) {
    var path = "./images/leagues/" + league.toLowerCase();

    if (rank <= 50 && rank > 25) {
        path += "Top50";
    } else if (rank <= 25 && rank > 8) {
        path += "Top25";
    } else if (rank <= 8) {
        path += "Top8";
    }
    path += ".png";
    return path;
};

const setMarineLoader = show => {
    document.getElementById('marineLoader').style.opacity = show ? 1 : 0;
    document.getElementById('statsData').style.opacity = show ? 0 : 1;
    document.getElementById('container').style.opacity = show ? 0 : 1;
};