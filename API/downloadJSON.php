<?php
if(!isset($_POST["projectID"]))
    echo 'KO|Project ID missing';
else if (!isset($_POST["PIN"]))
    echo 'KO|PIN missing';
else{
    $file = '../ressources/saves/' . $_POST["projectID"] . '.json';
    $string = file_get_contents($file);
    $json_a = json_decode($string, true);
    if($json_a['PIN'] == $_POST["PIN"]){
        echo 'OK|' . $string;
    }
    else {
        echo 'KO|Invalid File - Pin Combination';
    }
}

?>