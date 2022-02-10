<?php
    include("secret.php");
    $strJsonFileContents = file_get_contents("response.json");
    $array = json_decode($strJsonFileContents, true);

    $accessToken = $array["access_token"];

    function getRegion($regionId) {
        if ($regionId == '1') {
            return 'us';
        } elseif ($regionId == '2') {
            return 'eu';
        } elseif ($regionId == '3') {
            return 'kr';
        } else {
            return 'eu';
        }
    }

	$opts = [
        'http' => [
            'method' => 'GET',
            'header' => [
                'User-Agent: PHP'
            ]
        ]
    ];

    $context = stream_context_create($opts);
    $action = $_GET['action'];

    if ($action == 'getProfile') {
        $profileId = $_GET['profileId'];
        $realm = $_GET['realm'];
        $regionId = $_GET['regionId'];

        $region = getRegion($regionId);

        $url = 'https://'.$region.'.api.blizzard.com/sc2/legacy/profile/'.$regionId.'/'.$realm.'/'.$profileId;
        $url .= ('?access_token='.$accessToken);

        $resp = file_get_contents($url, false, $context);
        echo $resp;
    } else if ($action == 'getLadders') {
        $profileId = $_GET['profileId'];
        $realm = $_GET['realm'];
        $regionId = $_GET['regionId'];
        
        $region = getRegion($regionId);

        $url = 'https://'.$region.'.api.blizzard.com/sc2/legacy/profile/'.$regionId.'/'.$realm.'/'.$profileId.'/ladders';
        $url .= ('?access_token='.$accessToken);

        $resp = file_get_contents($url, false, $context);
        echo $resp;
    } else if ($action == 'getMatches') {
        $profileId = $_GET['profileId'];
        $realm = $_GET['realm'];
        $regionId = $_GET['regionId'];

        $region = getRegion($regionId);

        $url = 'https://'.$region.'.api.blizzard.com/sc2/legacy/profile/'.$regionId.'/'.$realm.'/'.$profileId.'/matches';
        $url .= ('?access_token='.$accessToken);

        $resp = file_get_contents($url, false, $context);
        echo $resp;
    } else if ($action == 'getLadderData') {
        $ladderId = $_GET['ladderId'];
        $regionId = $_GET['regionId'];

        $region = getRegion($regionId);

        $url = 'https://'.$region.'.api.blizzard.com/sc2/legacy/ladder/'.$regionId.'/'.$ladderId;
        $url .= ('?access_token='.$accessToken);

        $resp = file_get_contents($url, false, $context);
        echo $resp;
    } else {
        echo null;
    }    
?>
