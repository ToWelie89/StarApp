/////////////////////////////////////////////
// Global values to be used in other scripts
/////////////////////////////////////////////

// Contains information about the ladders showwn (1v1, best 2v2, best 3v3, best 4v4) in live tile and main window of app
var ladders = new Array();
// Contains information of ALL ladders, for instance all different 2v2 teams, to be shown in left ladder window
var allLadders = new Array();
// Id for the refresh-images-interval
var nIntervId;

function displayMessage(msg) {
    var msg = new Windows.UI.Popups.MessageDialog(msg);
    msg.commands.append(new Windows.UI.Popups.UICommand("Close"));
    msg.defaultCommandIndex = 0;
    msg.cancelCommandIndex = 1;
    msg.showAsync();
}

function tryToUpdatePictures() {
    if ($("#soloLeague").attr("src") == undefined) {
        refreshLaddersAndTiles();
        loadProfileData();
    } else {
        clearInterval(nIntervId);
    }
}

// Due to some problems where league icons are not set due to data missing then try to
// update these icons with a specific interval until they are shown. The problem is probably caused
// by errors with which functions are called when, so that the function that sets images is somehow
// called before the ladders array is set. This is a bit of a hacky solution but it works.
$(document).ready(function () {
    if ($("#soloLeague").attr("src") == undefined) {
        nIntervId = setInterval(tryToUpdatePictures, 500);
    }
});