var img;
var map;

function setup(){
  let width =  $(window).width();
  let height = $(window).height() - 6;
  
  canvas = createCanvas(width, height);
  canvas.parent('content');
  noLoop();
}

function draw(){
  if(!img) return;

  clear();
  background(0);
  scale(map.zoom);
  translate(map.xOffset, map.yOffset);

  image(img, 0, 0);

  if(map.showMap){
    map.rooms.forEach(room => {
      drawRunningRoom(room);
    });
  }else{
    fill(0);
    strokeWeight(0);

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

  drawGrid();
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

function drawGrid(){
  offsetX = map.gridSettings.offsetX % map.gridSettings.width;
  offsetY = map.gridSettings.offsetY % map.gridSettings.width;
  strokeWeight(0.5);

  switch(map.gridSettings.type){
    case "square":
      for(let x = offsetX; x < img.width; x += map.gridSettings.width){
        line(x, 0, x, img.height);
      }
      for(let y = offsetY; y < img.height; y += map.gridSettings.width){
        line(0, y, img.width, y);
      }
      break;
    case "hex":
      for (let x = offsetX - map.gridSettings.width * 6 / 4; x < img.width; x += map.gridSettings.width * 6 / 4)
      {
        for (let y = offsetY - map.gridSettings.width; y < img.height; y += map.gridSettings.width)
        {
          noFill();
          beginShape();
          vertex(x, y + map.gridSettings.width / 2);
          vertex(x + map.gridSettings.width / 4, y);
          vertex(x + map.gridSettings.width * 3 / 4, y);
          vertex(x + map.gridSettings.width, y + map.gridSettings.width / 2);
          vertex(x + map.gridSettings.width * 3 / 4, y + map.gridSettings.width);
          vertex(x + map.gridSettings.width / 4, y + map.gridSettings.width);
          vertex(x, y + map.gridSettings.width / 2);
          endShape();
        }
      }

      for (let x = offsetX - map.gridSettings.width * 2 / 4; x < img.width; x += map.gridSettings.width * 6 / 4)
      {
        for (let y = offsetY - map.gridSettings.width / 2; y < img.height; y += map.gridSettings.width)
        {
          line(x, y,  x + map.gridSettings.width / 2, y);
        }
      }
      break;
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
  }, 5000);
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

  map.gridSettings.type = obj.gridSettings.type;
  map.gridSettings.width = obj.gridSettings.width;
  map.gridSettings.offsetX = obj.gridSettings.offsetX;
  map.gridSettings.offsetY = obj.gridSettings.offsetY;
  map.gridSettings.distance = obj.gridSettings.distance;
  map.gridSettings.unit = obj.gridSettings.unit;

  map.rooms = [];
  obj.rooms.forEach(room => {
    let newRoom = new Room();
    newRoom.shown = room.shown;
    newRoom.color = room.color;
    newRoom.corners = room.corners;

    map.rooms.push(newRoom);
  });

  if(load) img = loadImage('../' + map.imageSrc);
}

function mouseWheel(event) {
  map.zoom -= event.delta / 5000.0;
  return false;
}

function mouseDragged(event){  
  map.xOffset += event.movementX / map.zoom;
  map.yOffset += event.movementY / map.zoom;
}

function CanvasSizeChanged(){
  if(canvas){
    let width =  $(window).width();
    let height = $(window).height() - 6;
    
    resizeCanvas(width, height);
  }
}