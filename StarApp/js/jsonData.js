// Gets data from the blizzard server regarding your currently chosen characters. The data is parsed
// to a JSON structure and then sent forward to the callback function
// If necessary an extraString can be set for instance "matches" or "ladders" if you wan't these data instead
function getJsonData(callback, extraString) {
    var jsonData;
    var url = profileURL + extraString;

    try {
        var req = createRequest(); // defined above
        req.open("GET", url, true);
        req.send();
    }
    catch(e) {
        
    }
    // Create the callback:
    req.onreadystatechange = function () {
        if (req.readyState != 4) return; // Not there yet
        if (req.status != 200) {
            return;
        }
        // Request successful, read the response
        var resp = req.responseText;
        jsonData = JSON.parse(resp);
        callback(jsonData);
    }
}

// Gets the ladder data for the specific id which is then parsed ot JSON format and sent
// to callback function
function getLadderJsonData(callback, ladderId) {
    var jsonData;
    var url = "http://" + host + "/api/sc2/ladder/" + ladderId;

    try {
        var req = createRequest(); // defined above
        req.open("GET", url, true);
        req.send();
    }
    catch (e) {

    }
    // Create the callback:
    req.onreadystatechange = function () {
        if (req.readyState != 4) return; // Not there yet
        if (req.status != 200) {
            return;
        }
        // Request successful, read the response
        var resp = req.responseText;
        jsonData = JSON.parse(resp);
        callback(jsonData);
    }
}