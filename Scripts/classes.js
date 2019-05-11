var Point = /** @class */ (function () {
    function Point(X, Y) {
        this.X = X;
        this.Y = Y;
    }
    return Point;
}());
var Room = /** @class */ (function () {
    function Room(corners, color) {
        this.shown = false;
        this.corners = corners;
        this.color = color;
    }
    Room.prototype.Contains = function (point) {
        var p1;
        var p2;
        var inside = false;
        if (this.corners.length < 3) {
            return inside;
        }
        var oldPoint = new Point(this.corners[this.corners.length - 1].X, this.corners[this.corners.length - 1].Y);
        for (var i = 0; i < this.corners.length; i++) {
            var newPoint = new Point(this.corners[i].X, this.corners[i].Y);
            if (newPoint.X > oldPoint.X) {
                p1 = oldPoint;
                p2 = newPoint;
            }
            else {
                p1 = newPoint;
                p2 = oldPoint;
            }
            if ((newPoint.X < point.X) == (point.X <= oldPoint.X)
                && (point.Y - p1.Y) * (p2.X - p1.X)
                    < (p2.Y - p1.Y) * (point.X - p1.X)) {
                inside = !inside;
            }
            oldPoint = newPoint;
        }
        return inside;
    };
    Room.prototype.isClockwise = function () {
        var counter = 0;
        var oldPoint = new Point(this.corners[this.corners.length - 1].X, this.corners[this.corners.length - 1].Y);
        for (var i = 0; i < this.corners.length; i++) {
            var newPoint = new Point(this.corners[i].X, this.corners[i].Y);
            counter += (newPoint.X - oldPoint.X) * (newPoint.Y + oldPoint.Y);
            oldPoint = newPoint;
        }
        return counter > 0;
    };
    return Room;
}());
var Map = /** @class */ (function () {
    function Map() {
        this.rooms = [];
        this.imageSrc = "";
        this.showMap = false;
        this.xOffset = 0;
        this.yOffset = 0;
        this.zoom = 1;
    }
    return Map;
}());
var Project = /** @class */ (function () {
    function Project() {
        this.selectedIndex = 0;
        this.maps = [];
        var map = new Map();
        this.maps.push(map);
        this.ProjectID = "";
        this.PIN = this.generateNewPassword();
    }
    Project.prototype.currentMap = function () {
        return this.maps[this.selectedIndex];
    };
    Project.prototype.generateNewPassword = function () {
        var characters = '0123456789';
        var id = '';
        for (var i = 0; i < 4; i++) {
            id += characters[Math.floor(Math.random() * characters.length)];
        }
        return id;
    };
    Project.prototype.addMap = function () {
        var map = new Map();
        this.maps.push(map);
        this.selectedIndex = this.maps.length - 1;
    };
    return Project;
}());
