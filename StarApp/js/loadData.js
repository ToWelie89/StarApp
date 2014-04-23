// These are global variables used for character info and storage
var applicationData = Windows.Storage.ApplicationData.current;
var localSettings = applicationData.localSettings;
// The localsettings is where we can set our own variables to be stored on the computer. Save our profile
// data to "characterProfile"
var profile = localSettings.values["characterProfile"];
// Show the variable in the textbox for changing profile
$("#profileTextArea").val(profile);
var profileURL = "";
var nick;
var id;
var host;

if (profile && (profile != "" || profile != null)) {
    var urlBits = profile.split("/");
    urlBits = Enumerable.From(urlBits).Where(function (x) { return x != "" }).ToArray();

    var apiSource = "/api/sc2/profile/";
    var realm;

    for (var i = 0; i < urlBits.length; i++) {
        if (urlBits[i].indexOf(".battle.net") != -1) {
            host = urlBits[i];
        }
    }

    nick = urlBits[urlBits.length - 1];
    realm = urlBits[urlBits.length - 2];
    id = urlBits[urlBits.length - 3];

    profileURL = "http://" + host + apiSource + id + "/" + realm + "/" + nick + "/";
    testIfProfileIsWorking();
} else {
    //showProfileSetterBar(true);
    profileURL = "http://eu.battle.net/api/sc2/profile/326029/1/LiquidTLO/";
    testIfProfileIsWorking();
}

// Try to test if the data is correct and working
function testIfProfileIsWorking() {
    if (!(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(profileURL))) {
        showProfileSetterBar(true);
        return;
    }

    var jsonData;
    var req = createRequest(); // defined above
    req.open("GET", profileURL, true);
    req.send();

    // Create the callback:
    req.onreadystatechange = function () {
        if (req.readyState != 4) return; // Not there yet
        if (req.status != 200) {
            return;
        }
        
        var resp = req.responseText;
        jsonData = JSON.parse(resp);
        if (!(jsonData.status && jsonData.status == "nok")) {
            showProfileSetterBar(false);
        } else {
            showProfileSetterBar(true);
        }
    }
}

// Shows or hides the panel where user can change profile
function showProfileSetterBar(bool) {
    if (bool) {
        $("#profileTextArea").val(profile);
        $("#noProfile").css("visibility", "visible");
        $("#noProfile").css("margin-bottom", "20px");
        $("#noProfile").css("height", "auto");
    } else {
        $("#noProfile").css("visibility", "hidden");
        $("#noProfile").css("margin-bottom", "0px");
        $("#noProfile").css("height", "0px");
    }
}

$("#profileSubmitButton").live("click", function () {
    localSettings.values["characterProfile"] = $("#profileTextArea").val();
    location.reload();
});

$("#changeProfile").live("click", function () {
    showProfileSetterBar(true);
});

$("#noProfileCross").live("click", function () {
    if (profile) {
        showProfileSetterBar(false);
    }
});

function createRequest() {
    var result = null;
    if (window.XMLHttpRequest) {
        result = new XMLHttpRequest();
    }
    else if (window.ActiveXObject) {
        result = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return result;
}



