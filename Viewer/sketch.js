var img;
var map;

function setup(){
  let width =  $(window).width();
  let height = $(window).height() - $("nav").height() - 22;
  
  canvas = createCanvas(width, height);
  canvas.parent('content');
  noLoop();
}

function draw(){
  if(!img) return;

  clear();
  scale(map.zoom);
  translate(map.xOffset, map.yOffset);

  image(img, 0, 0);

  if(map.showMap){
    map.rooms.forEach(room => {
      drawRunningRoom(room);
    });
  }else{
    fill(0);

    beginShape();
    vertex(0, 0);
    vertex(img.width, 0);
    vertex(img.width, img.height);
    vertex(0, img.height);

    map.rooms.forEach(room => {
      if(room.shown)
        drawRoomContour(room);
    });

    endShape(CLOSE);
  }
}

function drawRoomContour(room) {
  beginContour();

  //We HAVE to draw clockwise 
  if(room.isClockwise()){
    for(let i = 0; i < room.corners.length; i++){
      let corner = room.corners[i];
      vertex(corner.X, corner.Y);
    }
  }else{      
    for(let i = room.corners.length - 1; i >= 0; i--){
      let corner = room.corners[i];
      vertex(corner.X, corner.Y);
    }
  }
  endContour();
}

function drawRunningRoom(room) {
  if(!room.shown){
    fill(0);
    strokeWeight(3);
    beginShape();
    room.corners.forEach(corner => {
      vertex(corner.X, corner.Y);
    });
    endShape(CLOSE);
  }
}

function loadMap(key, initial){
  let url = '../API/downloadSession.php';
  let xhr = new XMLHttpRequest();
  let fd = new FormData();
  xhr.open("POST", url, true);
  xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
          //console.log(xhr.responseText);
          let str = xhr.responseText.substr(3);
          copyMapFromJSON(JSON.parse(str));
      }

      if(initial){
        scale(map.zoom);
        translate(map.xOffset, map.yOffset);
      
        loop();  
      }
  };
  fd.append("projectID", key);
  xhr.send(fd);

  setTimeout(() => {
    loadMap(key);
  }, 1000);
}

function copyMapFromJSON(obj){
  let load = false;

  if(!map || map.imageSrc !=  obj.imageSrc)
  {
    map = new Map();
    map.imageSrc = obj.imageSrc;
    map.xOffset = obj.xOffset;
    map.yOffset = obj.yOffset;
    map.zoom = obj.zoom;
    
    load = true;
  }
  map.showMap = obj.showMap;

  map.rooms = [];
  obj.rooms.forEach(room => {
    let newRoom = new Room();
    newRoom.shown = room.shown;
    newRoom.color = room.color;
    newRoom.corners = room.corners;

    map.rooms.push(newRoom);
  });

  if(load) img = loadImage(map.imageSrc);
}

function mouseWheel(event) {
  map.zoom -= event.delta / 5000.0;
  return false;
}

function mouseDragged(event){  
  map.xOffset += event.movementX / map.zoom;
  map.yOffset += event.movementY / map.zoom;
}