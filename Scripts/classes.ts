  class Point{
    X: number;
    Y: number;

    constructor(X: number, Y: number){
        this.X = X;
        this.Y = Y;
    }
  }

  class Room{
    shown: boolean;
    corners: Point[];
    color: string;
  
    constructor(corners: Point[], color: string){
      this.shown = false;
      this.corners = corners;
      this.color = color;
    }

    Contains(point: Point){
        let p1: Point;
        let p2: Point;
        let inside: boolean = false;

        if (this.corners.length < 3)
        {
            return inside;
        }

        var oldPoint = new Point(
            this.corners[this.corners.length - 1].X, 
            this.corners[this.corners.length - 1].Y
        );

        for (let i: number = 0; i < this.corners.length; i++)
        {
            var newPoint = new Point(this.corners[i].X, this.corners[i].Y);

            if (newPoint.X > oldPoint.X)
            {
                p1 = oldPoint;
                p2 = newPoint;
            }
            else
            {
                p1 = newPoint;
                p2 = oldPoint;
            }

            if ((newPoint.X < point.X) == (point.X <= oldPoint.X)
                && (point.Y - p1.Y) * (p2.X - p1.X)
                < (p2.Y - p1.Y) * (point.X - p1.X))
            {
                inside = !inside;
            }

            oldPoint = newPoint;
        }

        return inside;
    }

    isClockwise(){
      let counter:number = 0;

      var oldPoint = new Point(
          this.corners[this.corners.length - 1].X, 
          this.corners[this.corners.length - 1].Y
      );

      for (let i: number = 0; i < this.corners.length; i++)
      {
        var newPoint = new Point(this.corners[i].X, this.corners[i].Y);
        counter += (newPoint.X - oldPoint.X) * (newPoint.Y + oldPoint.Y)
        oldPoint = newPoint;
      }

      return counter > 0;
    }
  }

  class Grid{
    type: string;
    width: number;
    offsetX: number;
    offsetY: number;
    distance: number;
    unit: string;

    constructor(){
      this.type = "none";
      this.width = 50;
      this.offsetX = 0;
      this.offsetY = 0;
      this.distance = 5;
      this.unit = 'ft';
    }
  }

  class Map{
    rooms: Room[];
    imageSrc: string;
    showMap: boolean;

    xOffset: number;
    yOffset: number;
    zoom: number;

    gridSettings:Grid;

    UniqueID: number;
  
    constructor(){
      this.rooms = [];
      this.imageSrc = "";
      this.showMap = false;
      this.xOffset = 0;
      this.yOffset = 0;
      this.zoom = 1;

      this.gridSettings = new Grid();

      this.UniqueID = Math.random();
    }
  }

  class Project{
    ProjectID: string;
    PIN: string;
    maps: Map[];
    selectedIndex: number = 0;
  
    constructor(){
      this.maps = [];
      let map: Map = new Map();      
      this.maps.push(map);
      this.ProjectID = "";
      this.PIN = this.generateNewPassword();
    }

    currentMap(){
        return this.maps[this.selectedIndex]
    }

    generateNewPassword(){
      var characters = '0123456789';
      let id = '';
      for (let i = 0; i < 4; i++) {
        id += characters[Math.floor(Math.random() * characters.length)];
      }
      return id;
    }

    addMap(){
      let map: Map = new Map();
      this.maps.push(map);
      this.selectedIndex = this.maps.length - 1;
    }
  }