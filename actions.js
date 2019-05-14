window.onbeforeunload = function(){
  if(changed){
    return "You have unsaved changed, are you sure you want to leave?";
  }
}

$(document).ready(function () {
  $('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
      $(this).toggleClass('active'); 
      CanvasSizeChanged();
  });
});

function startViewer(){
  running = true;
  $("#StartViewer")[0].onclick = stopViewer;
  $("#StartViewer")[0].innerHTML = "Stop Viewer";

  //Remove Drawing Possibilities
  $('#Draw-Polygon').addClass('disabled');
  $('#Draw-Rectangle').addClass('disabled');
  $('#Draw-Free').addClass('disabled');

  $('#Draw-Polygon').removeClass('active');
  $('#Draw-Rectangle').removeClass('active');
  $('#Draw-Free').removeClass('active');

  $('#Draw-Polygon-Inp').prop('disabled', true);
  $('#Draw-Rectangle-Inp').prop('disabled', true);
  $('#Draw-Free-Inp').prop('disabled', true);

  //Add Seletcing Possibilities
  
  $('#Tool-Select-Inp').prop('disabled', false);
  $('#Tool-Select').removeClass('disabled');
  $('#Tool-Select').addClass('active');

  // Show Alert
  let node = $('#alert-FileInfos-Copy')[0].cloneNode(true);
  node.id = 'alert-FileInfos'
  node.children[0].innerHTML = "Your File Code is <b>" + project.ProjectID + "</b>. The PIN is <b>" + project.PIN + "</b>. (You only need the PIN if you save the Project and want to reload it later)"
  $('body')[0].appendChild(node);
}

function stopViewer(){
  running = false;
  $("#StartViewer")[0].onclick = startViewer;
  $("#StartViewer")[0].innerHTML = "Start Viewer";

  //Remove Seletcing Possibilities
  
  $('#Tool-Select-Inp').prop('disabled', true);
  $('#Tool-Select').addClass('disabled');
  $('#Tool-Select').removeClass('active');

  //Add Drawing Possibilities
  $('#Draw-Polygon').removeClass('disabled');
  $('#Draw-Rectangle').removeClass('disabled');
  $('#Draw-Free').removeClass('disabled');

  $('#Draw-Polygon-Inp').prop('disabled', false);
  $('#Draw-Rectangle-Inp').prop('disabled', false);
  $('#Draw-Free-Inp').prop('disabled', false);

  $('#Draw-Rectangle').addClass('active');

  //Dissmiss Alert
  $('#alert-FileInfos').alert('close');
}

function uploadFile(){
  let uploadfiles = document.querySelector('#fileinput');
  let files = uploadfiles.files;

  let file = files[0];

  if(file.size > 2097152) { //2MB
    $('#fileUpload-Error')[0].innerHTML = "Datei zu groß! Maximal 2MB erlaubt!";
    $('#fileUpload-Error')[0].style.position = 'relative';
    $('#fileUpload-Error')[0].style.top = '0px';
  }else{
    let url = 'API/uploadImage.php';
    let xhr = new XMLHttpRequest();
    let fd = new FormData();
    xhr.open("POST", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Every thing ok, file uploaded
            console.log(xhr.responseText);
            if(xhr.responseText.substr(0, 2) == 'OK'){
              let fileName = xhr.responseText.substr(3)

              project.currentMap().imageSrc = './ressources/images/' + fileName;
              reloadImage();
              //img = loadImage('./images/' + fileName);

              project.ProjectID = fileName.substr(0, fileName.indexOf('_'));
              project.currentMap().xOffset = 0;
              project.currentMap().yOffset = 0;
              project.currentMap().zoom = 1;
              $('#modal-fileUpload').modal('hide');
              $('#fileUpload-Error')[0].innerHTML = "";
              $('#fileUpload-Error')[0].style.position = 'absolute';
              $('#fileUpload-Error')[0].style.top = '-5000px';
            }else{
              $('#fileUpload-Error')[0].innerHTML = "Fehler beim Fileupload!";
              $('#fileUpload-Error')[0].style.position = 'relative';
              $('#fileUpload-Error')[0].style.top = '0px';
            }
        }
    };
    fd.append("upload_file", file);
    fd.append("projectID", project.ProjectID);
    xhr.send(fd);
  }
}

function newProject(){
  location.reload();
}

function saveProject(){
  let jsonStr = JSON.stringify(project);
  let url = 'API/uploadJSON.php';
  let xhr = new XMLHttpRequest();
  let fd = new FormData();
  xhr.open("POST", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText);
      if(xhr.responseText.substr(0, 2) == 'OK'){
        let node = $('#alert-project-Saved-Copy')[0].cloneNode(true);
        node.id = 'alert-project-Saved'
        node.children[0].innerHTML = "Saved succesfull!<br/>Your File Code is <b>" + project.ProjectID + "</b>.<br/>The PIN is <b>" + project.PIN + "</b>."
        $('body')[0].appendChild(node);
      }
    }
  };
  fd.append("JSON", jsonStr);
  fd.append("projectID", project.ProjectID);
  xhr.send(fd);
}

function loadProject(){
  let projectID = $('#modal-Open-Project-code')[0].value;
  let pin = $('#modal-Open-Project-pin')[0].value;

  let url = 'API/downloadJSON.php';
  let xhr = new XMLHttpRequest();
  let fd = new FormData();
  xhr.open("POST", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      //console.log(xhr.responseText);
      if(xhr.responseText.substr(0, 2) == 'OK'){
        let str = xhr.responseText.substr(3);
        copyProjectFromJSON(JSON.parse(str));
        reloadImage();

        $('#modal-Open-Project').modal('hide');

        $('#modal-Open-Project-Error')[0].innerHTML = "";
        $('#modal-Open-Project-Error')[0].style.position = 'absolute';
        $('#modal-Open-Project-Error')[0].style.top = '-5000px';
      }else{
        $('#modal-Open-Project-Error')[0].innerHTML = "Error: " + xhr.responseText.substr(3);
        $('#modal-Open-Project-Error')[0].style.position = 'relative';
        $('#modal-Open-Project-Error')[0].style.top = '0px';
      }
    }
  };
  fd.append("projectID", projectID);
  fd.append("PIN", pin);
  xhr.send(fd);
}

function copyProjectFromJSON(obj){
  project = new Project();
  project.ProjectID = obj.ProjectID;
  project.PIN = obj.PIN;

  for(let i = 0; i < obj.maps.length; i++){
    if(i > 0) addMap();

    project.currentMap().imageSrc = obj.maps[i].imageSrc;
    project.currentMap().showMap = obj.maps[i].showMap;
    project.currentMap().xOffset = obj.maps[i].xOffset;
    project.currentMap().yOffset = obj.maps[i].yOffset;
    project.currentMap().zoom = obj.maps[i].zoom;

    obj.maps[i].rooms.forEach(room => {
      let newRoom = new Room();
      newRoom.shown = room.shown;
      newRoom.color = room.color;
      newRoom.corners = room.corners;

      project.currentMap().rooms.push(newRoom);
    });
  }

  project.selectedIndex = obj.selectedIndex;
}

function addMap(){
  project.addMap();

  let node = $('#map-list-Item-Copy')[0].cloneNode(true);
  node.id = '';
  node.children[0].children[0].innerHTML = "Map " + project.maps.length;
  node.classList.add('active');

  let map = project.currentMap();
  node.children[0].children[1].onclick = function() { removeMap(node, map); };
  node.onclick = function (){
    let index = 0;
    while(node != $('#mapList')[0].children[index]) index++;

    project.selectedIndex = index;
    img = loadImage(project.currentMap().imageSrc);
  }
  $('#mapList .active')[0].classList.remove('active');
  $('#mapList')[0].appendChild(node);
  node.click();
}

function removeMap(node, map){
  if(!node){
    node = $('#mapList')[0].children[0];
    map = project.maps[0];
  }

  if(project.maps.length > 1){
    node.remove();
    if(project.maps.indexOf(map) <= project.selectedIndex){
      project.selectedIndex--;
      project.maps.splice(project.maps.indexOf(map), 1);
    }else{
      project.maps.splice(project.maps.indexOf(map), 1);
    }
    $('#mapList')[0].lastElementChild.classList.add('active');
    $('#mapList')[0].lastElementChild.click();
  }
}

$("#loadProjectForm").submit(function(e) {
  e.preventDefault();
});