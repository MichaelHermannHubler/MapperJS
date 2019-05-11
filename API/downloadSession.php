<?php
if(!isset($_POST["projectID"]))
    echo 'KO|Project ID missing';
else{
    $file = '../ressources/sessions/' . $_POST["projectID"] . '.json';
    $string = file_get_contents($file);
    echo 'OK|' . $string;
}

?>