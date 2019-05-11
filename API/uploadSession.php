<?php
if (!isset($_POST['JSON']))
    echo 'KO|No json document attached';
else if(!isset($_POST['projectID']) || $_POST['projectID'] == 'undefined' || $_POST['projectID'] == '')
    echo 'KO|No Project ID supplied';
else {
    $filename = $_POST['projectID'];
    $jsonStr = $_POST['JSON'];

    $path = '../ressources/sessions/' . $filename . '.json';

    if(file_exists($path)){
        unlink($path) or die ('Error while deleting file');
    }
    
    $file = fopen($path, 'w') or die('Error while opening file');
    fwrite($file, $jsonStr) or die();
    fclose($file) or die();

    echo 'OK|Saved succesful';
    exit;
  }
?>