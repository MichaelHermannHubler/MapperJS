/* #region  Global Variables */

var isPressedDown = false;
var img;
var color;
var startPoint;
var canvas;

var project;
var corners = [];
var running = false;

var changed = false;

var counter = 0;

/* #endregion */

/* #region  Setup */
function preload() {
  
}

function setup() {
  let width =  $(window).width() - 250;
  let height = $(window).height() - $("nav").height() * 2 - 50;

  canvas = createCanvas(width, height);
  canvas.parent('content');

  project = new Project();
  project.currentMap().imageSrc = './ressources/Images/Sword-Coast-Map_HighRes.jpg';
  
  img = loadImage('./ressources/Images/Sword-Coast-Map_HighRes.jpg');
}

function CanvasSizeChanged(){
  if(canvas){
    let width = 0;
    if($("#sidebar")[0].offsetLeft < 0)
      width = $(window).width() - 30;
    else
      width = $(window).width() - 250;

    let height = $(window).height() - $("nav").height() * 2 - 50;
    resizeCanvas(width, height);
  }
}

function reloadImage(){
  img = loadImage(project.currentMap().imageSrc);
}

/* #endregion */

/* #region  Draw */
function draw() {
  let map = project.currentMap();

  clear();
  scale(map.zoom);
  translate(map.xOffset, map.yOffset);

  image(img, 0, 0);

  if(!running){
    map.rooms.forEach(room => {
      drawRoom(room);
    });

    drawCurrentAction();
  } else{
    counter++;
    if(counter % 30 == 0){
      counter = 0; // overflow prevention
      sendMap(map);
    }

    if(map.showMap){
      map.rooms.forEach(room => {
        drawRunningRoom(room, false);
      });
    }else{
      fill("#00000055");

      beginShape();
      vertex(0, 0);
      vertex(img.width, 0);
      vertex(img.width, img.height);
      vertex(0, img.height);

      map.rooms.forEach(room => {
          drawRoomContour(room);
      });

      endShape(CLOSE);

      map.rooms.forEach(room => {
        drawRunningRoom(room, false);
      });
    }
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

function drawRoom(room) {
  let mycolor = room.color + "80";

  fill(mycolor);
  beginShape();
  room.corners.forEach(corner => {
    vertex(corner.X, corner.Y);
  });
  endShape(CLOSE);
}

function drawRunningRoom(room, showOn) {
  let mycolor = room.color;
  mycolor = pSBC(-0.3, mycolor);
  mycolor += "80";

  if(room.shown == showOn){
    fill(mycolor);
    beginShape();
    room.corners.forEach(corner => {
      vertex(corner.X, corner.Y);
    });
    endShape(CLOSE);
  }
}

function drawCurrentAction(){
  switch($('.btn-group-vertical > .btn.active')[0].id){
    case "Draw-Rectangle":
      if(isPressedDown){
        let xmin = min(startPoint.X, getMouseX());
        let ymin = min(startPoint.Y, getMouseY());
        
        let mycolor = color + "80";

        fill(mycolor);
        rect(xmin, ymin, abs(startPoint.X- getMouseX()), abs(startPoint.Y - getMouseY()));
      }

      break;
      case "Draw-Polygon":
      case "Draw-Free":
        if(corners.length > 0){
          noFill();
          strokeWeight(1/getZoom());
          ellipse(corners[0].X, corners[0].Y, (20 / getZoom()), (20 / getZoom()));
          noFill();
          strokeWeight(1/getZoom());
          beginShape();
          corners.forEach(corner => {
            vertex(corner.X, corner.Y);
          });
          endShape();
        }
        break;
  }
}

function drawGrid(){
  let map = project.currentMap();

  offsetX = map.gridSettings.offsetX % map.gridSettings.width;
  offsetY = map.gridSettings.offsetY % map.gridSettings.width;

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

/* #endregion  */

/* #region  Mouse Actions */
function mousePressed(){
  if(isModalOpen()) return;

  if(mouseButton === LEFT){
    isPressedDown = true;
    switch($('.btn-group-vertical > .btn.active')[0].id){
      case "Draw-Rectangle":
        startPoint = {X: getMouseX(), Y: getMouseY()};
        color = getRandomColor();
        break;
      case "Draw-Free":
        corners.push(new Point(getMouseX(), getMouseY()));
        break;
    }
  }
}

function mouseReleased(){
  if(isModalOpen()) return;

  if(mouseButton === LEFT){
    isPressedDown = false;
    switch($('.btn-group-vertical > .btn.active')[0].id){
      case "Draw-Rectangle":
        let xmin = min(startPoint.X, getMouseX());
        let ymin = min(startPoint.Y, getMouseY());
        let xmax = max(startPoint.X, getMouseX());
        let ymax = max(startPoint.Y, getMouseY());

        corners = [];
        corners.push(new Point(xmin, ymin));
        corners.push(new Point(xmin, ymax));
        corners.push(new Point(xmax, ymax));
        corners.push(new Point(xmax, ymin));

        completeRoom(color);

        startPoint = null;
        break;
      case "Draw-Free":
        if(corners.length > 0 && corners[0].X - (10 / getZoom()) < getMouseX() && getMouseX() < corners[0].X + (10 / getZoom()) 
          && corners[0].Y - (10 / getZoom()) < getMouseY() && getMouseY() < corners[0].Y + (10 / getZoom()) ) 
          completeRoom();
        else{
          corners.push(new Point(getMouseX(), getMouseY()));
        }
        break;
    }
  } else if(mouseButton === RIGHT){
    let p = new Point(getMouseX(), getMouseY());

    for(let i = 0; i < project.currentMap().rooms.length; i++){
      let room =  project.currentMap().rooms[i];
      if(room.Contains(p)){
        project.currentMap().rooms.splice(i, 1);
        i--;
      }
    }
  }
}

function mouseClicked(){   
  if(isModalOpen()) return;

  switch($('.btn-group-vertical > .btn.active')[0].id){
    case "Draw-Polygon":
      if(mouseX < 0 || mouseX > canvas.width || mouseY < 0 || mouseY > canvas.height)
        break;

      if(corners.length > 0 && corners[0].X - (10 / getZoom()) < getMouseX() && getMouseX() < corners[0].X + (10 / getZoom()) 
        && corners[0].Y - (10 / getZoom()) < getMouseY() && getMouseY() < corners[0].Y + (10 / getZoom()) ) 
        completeRoom();
      else{
        corners.push(new Point(getMouseX(), getMouseY()));
      }
      break;
    case "Tool-Select":
      let p = new Point(getMouseX(), getMouseY());
      let contained = false; 

      if(p.X > 0 && p.Y > 0){
        for(let i = 0; i < project.currentMap().rooms.length; i++){
          let room =  project.currentMap().rooms[i];
          if(room.Contains(p)){
            room.shown = !room.shown;
            contained = true;
          }
        }

        if(!contained){
          project.currentMap().showMap = ! project.currentMap().showMap;
        }
      }
      break;
  }
}

function mouseDragged(event){  
  if(isModalOpen()) return;

  if(mouseButton === LEFT){
    switch($('.btn-group-vertical > .btn.active')[0].id){
      case "Draw-Free":
        corners.push(new Point(getMouseX(), getMouseY()));
        break;
      case "Move-Drag":
        project.currentMap().xOffset += event.movementX / getZoom();
        project.currentMap().yOffset += event.movementY / getZoom();
        break;
    }
  }else if(mouseButton == CENTER){
    project.currentMap().xOffset += event.movementX / getZoom();
    project.currentMap().yOffset += event.movementY / getZoom();
  }
}

function mouseWheel(event) {
  if(isModalOpen()) return;

  project.currentMap().zoom -= event.delta / 5000.0;
  return false;
}
/* #endregion */

/* #region  Helper Methods */
function getRandomColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function completeRoom(localColor) {
  localColor = localColor|| getRandomColor();
  let room = new Room(corners, localColor);

  if(polygonArea(corners) > 10)
  {
    project.currentMap().rooms.push(room);
    changed = true;
  }
  corners = [];
}

function polygonArea(points)  
{    
  let area = 0;  // Accumulates area in the loop   

  for (let i = 0, j = points.length - 1; i < points.length; i++)
  { 
      area = area +  (points[j].X + points[i].X) * (points[j].Y - points[i].Y); 
      j = i; 
  }   
  return abs(area) / 2; 
}

function sendMap(map){
  let jsonStr = JSON.stringify(map);

  let url = 'API/uploadSession.php';
  let xhr = new XMLHttpRequest();
  let fd = new FormData();
  xhr.open("POST", url, true);

  fd.append("JSON", jsonStr);
  fd.append("projectID", project.ProjectID);

  xhr.send(fd);
}
/* #endregion */

/* #region  Abstraction Methods */
  function getZoom(){
    return project.currentMap().zoom;
  }

  function getMouseX(){
    return mouseX / getZoom() - project.currentMap().xOffset;
  }

  function getMouseY(){
    return mouseY / getZoom() - project.currentMap().yOffset;
  }

  function isModalOpen(){
    if($('#modal-Open-Project').hasClass('show'))
      return true;
    if($('#modal-fileUpload').hasClass('show'))
      return true;
    if($('#modal-Settings').hasClass('show'))
      return true;
    return false;
  }

  /* #endregion */