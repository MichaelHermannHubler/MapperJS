<?php
  function getNextFileName($fileName){
    $i = 1;

    while (FileExists($fileName . '_' . $i)) {
      $i++;
    }

    return $fileName . '_' .$i;
  }

  function getRandomFileName(){
    $fileName = generateRandomString();
    while (FileExists($fileName)) {
      $fileName = generateRandomString();
    }

    return $fileName . '_1';
  }

  function generateRandomString() {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < 6; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
  }

  function FileExists($file){
    $result = glob('../ressources/images/' . $file . '.*');
    return count($result) > 0;
  }

  if (isset($_FILES['upload_file'])) {
    $filename = '';

    if(isset($_POST['projectID']) && $_POST['projectID'] != 'undefined' && $_POST['projectID'] != ''){
      $filename = getNextFileName($_POST['projectID']);
    }else{
      $filename = getRandomFileName();
    }

    $array = explode('.', $_FILES['upload_file']['name']);
    $extension = end($array);

    $filename = $filename . '.' . $extension;
    
    if(move_uploaded_file($_FILES['upload_file']['tmp_name'], "../ressources/images/" . $filename)){
        echo 'OK|'. $filename;
    } else {
        echo 'KO|File moving error|' . $_FILES['upload_file']['tmp_name'] . '|' . "../ressources/images/" . $filename;
    }
    exit;
  } else {
    echo 'KO|No files uploaded';
  }
?>
