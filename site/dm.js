var Piece = /** @class */ (function () {
    function Piece(node, meta) {
        this.width = 1;
        this.height = 1;
        this.x = parseFloat(node.getAttribute("left")) - 1;
        this.y = parseFloat(node.getAttribute("top")) - 1;
        this.id = node.getAttribute("id");
        this.onDiscover = node.getAttribute("onDiscover");
        this.info = node.getAttribute("info");
        this.onDiscoverAction = node.getAttribute("onDiscoverAction");
        this.onSearch = node.getAttribute("onSearch");
        this.img = "img/tiles/" + this.id + "_US.png";
        var pdata = meta[this.id];
        if (pdata) {
            this.width = pdata.width;
            this.height = pdata.height;
        }
        // sort out rotations
        var rot = node.getAttribute("rotation");
        var w = this.width;
        var h = this.height;
        if (rot === "rightward") {
            this.rotation = 90;
            this.width = h;
            this.height = w;
        }
        if (rot === "downward") {
            this.rotation = 0;
        }
        if (rot === "leftward") {
            this.rotation = 270;
            this.width = h;
            this.height = w;
        }
        if (rot === "upward") {
            this.rotation = 180;
        }
    }
    Piece.prototype.contains = function (x, y) {
        return (x >= this.x) && (y >= this.y) && (x < this.x + this.width) && (y < this.y + this.height);
    };
    Piece.prototype.hide = function () {
        this.div.style.display = "none";
    };
    Piece.prototype.search = function (dm) {
        var result = this.onSearch;
        delete this.onSearch;
        if (this.id.indexOf("SecretDoor") === 0) {
            this.div.style.display = "inline";
            return "You find a secret door!";
        }
        return result;
    };
    Piece.prototype.discover = function (dm) {
        if (this.onDiscoverAction) {
            if (this.onDiscoverAction === "discoverall") {
                dm.discoverAll();
            }
        }
        if (this.id.indexOf("Letter") === 0) {
            // can't make letters visible - need to tie in the speech afterwards
            return this.onDiscover;
        }
        if (this.id.indexOf("Number") === 0) {
            // can't make letters visible - need to tie in the speech afterwards
            return this.onDiscover;
        }
        if (this.id.indexOf("SecretDoor") === 0) {
            return this.onDiscover;
        }
        if (this.id.indexOf("Trap") >= 0) {
            return this.onDiscover;
        }
        if (this.id.indexOf("FallingRock") >= 0) {
            return this.onDiscover;
        }
        this.div.style.display = "inline";
        return this.onDiscover;
    };
    Piece.prototype.createDiv = function (parent, bx, by, tileWidth, tileHeight) {
        var _this = this;
        var xp = bx + (this.x * tileWidth);
        var yp = by + (this.y * tileHeight);
        var cell = document.createElement("div");
        cell.style.width = (tileWidth * this.width) + "px";
        cell.style.height = (tileHeight * this.height) + "px";
        cell.style.left = xp + "px";
        cell.style.top = yp + "px";
        cell.id = this.x + "-" + this.y + "-" + this.id;
        cell.style.overflow = "visible";
        cell.className = "cell";
        //cell.style.background = "red";
        var img = document.createElement("img");
        img.style.transform = "rotate(" + this.rotation + "deg) ";
        img.style.transformOrigin = "top left";
        img.style.display = "block";
        img.style.margin = "0 auto";
        img.style.position = "absolute";
        if (this.id == "Door") {
            if (this.rotation == 0) {
                img.style.marginLeft = "-5px";
                img.style.marginTop = "23px";
            }
            if (this.rotation == 90) {
                img.style.marginLeft = "23px";
                img.style.marginTop = "-5px";
            }
            if (this.rotation == 270) {
                img.style.marginLeft = "-11px";
                img.style.marginTop = "-5px";
            }
            if (this.rotation == 180) {
                img.style.marginLeft = "-5px";
                img.style.marginTop = "-10px";
            }
        }
        img.onload = function () {
            if (_this.rotation == 90) {
                img.style.left = img.height + "px";
            }
            if (_this.rotation == 180) {
                img.style.left = img.width + "px";
                img.style.top = img.height + "px";
            }
            if (_this.rotation == 270) {
                img.style.top = img.width + "px";
            }
            if ((_this.rotation == 0) && (_this.id != "Door")) {
                if ((_this.width == 1) && (_this.height == 1)) {
                    img.style.left = ((tileWidth - img.width) / 2) + "px";
                    img.style.top = ((tileHeight - img.height) / 2) + "px";
                }
            }
        };
        img.src = this.img;
        cell.appendChild(img);
        this.div = cell;
        cell.style.display = "none";
        parent.appendChild(cell);
    };
    return Piece;
}());
var Room = /** @class */ (function () {
    function Room(data) {
        this.discovered = false;
        this.x = data.x;
        this.y = data.y;
        this.width = data.width;
        this.height = data.height;
    }
    Room.prototype.contains = function (x, y) {
        return (x >= this.x) && (y >= this.y) && (x < this.x + this.width) && (y < this.y + this.height);
    };
    Room.prototype.getPieceCount = function () {
        var count = 0;
        for (var yp = 0; yp < this.height; yp++) {
            for (var xp = 0; xp < this.width; xp++) {
                if (dm.getRoomAt(this.x + xp, this.y + yp) == this) {
                    var p = dm.getPieceAt(this.x + xp, this.y + yp);
                    if (p) {
                        count++;
                    }
                }
            }
        }
        return count;
    };
    Room.prototype.discover = function (dm, log) {
        if ((this.getPieceCount() < 2) && (dm.special == "rolltoroom")) {
            // roll to determine room
            var roll = Math.floor((Math.random() * 12) + 1);
            var pid = "Number" + roll;
            if ((roll == 2) || (roll == 12)) {
                pid = "Number2-12";
            }
            if (roll == 1) {
                pid = "Number11";
            }
            var piece = dm.getPiece(pid);
            dm.log("As you step through the door you teleport. You roll a " + roll + ". Move to this room");
            dm.highlightRoom(dm.getRoomAt(piece.x, piece.y));
            dm.waitForClick();
            return;
        }
        if (this.discovered == true) {
            var result = "You find nothing of interest.";
            // search
            for (var yp = 0; yp < this.height; yp++) {
                for (var xp = 0; xp < this.width; xp++) {
                    if (dm.getRoomAt(this.x + xp, this.y + yp) == this) {
                        var searchMessage = dm.search(this.x + xp, this.y + yp);
                        if (searchMessage) {
                            result = searchMessage;
                        }
                    }
                }
            }
            if (log == true) {
                dm.log("You search the room.  " + result);
            }
        }
        else {
            this.div.style.cursor = "zoom-in";
            this.discovered = true;
            var result = "";
            for (var yp = 0; yp < this.height; yp++) {
                for (var xp = 0; xp < this.width; xp++) {
                    if (dm.getRoomAt(this.x + xp, this.y + yp) == this) {
                        var discoverMessage = dm.discover(this.x + xp, this.y + yp);
                        if (discoverMessage) {
                            result = discoverMessage;
                        }
                    }
                }
            }
            if (log == true) {
                dm.log("Place the pieces as shown.  " + result);
                dm.waitForClick();
            }
        }
    };
    Room.prototype.createDiv = function (dm, parent, bx, by, tileWidth, tileHeight) {
        var _this = this;
        var xp = bx + (this.x * tileWidth);
        var yp = by + (this.y * tileHeight);
        var cell = document.createElement("div");
        cell.style.width = (tileWidth * this.width) + "px";
        cell.style.height = (tileHeight * this.height) + "px";
        cell.style.left = xp + "px";
        cell.style.top = yp + "px";
        cell.id = this.x + "-" + this.y + "-Room";
        cell.style.overflow = "visible";
        cell.className = "cell";
        cell.style.cursor = "alias";
        this.div = cell;
        cell.onmousedown = function () {
            _this.discover(dm, true);
        };
        parent.appendChild(cell);
    };
    return Room;
}());
/// <reference path="Piece.ts"/>
/// <reference path="Room.ts"/>
var HeroQuestDM = /** @class */ (function () {
    function HeroQuestDM(id) {
        var _this = this;
        this.bx = 34;
        this.by = 34;
        this.width = 26;
        this.height = 19;
        this.rooms = new Array();
        this.pieces = new Array();
        this.tileWidth = 33.25;
        this.tileHeight = 33.25;
        this.placedStairs = false;
        this.intro = false;
        this.introText = "";
        this.leave = "";
        this.board = document.getElementById(id);
        var urlParams = new URLSearchParams(window.location.search);
        this.meta = this.loadJSON("data/piecesmeta.json");
        this.map = this.loadXML("data/HQBase_EU/" + urlParams.get("quest") + "_EU.xml");
        this.title = this.map.getElementsByTagName("quest")[0].getAttribute("name");
        this.wandering = this.map.getElementsByTagName("quest")[0].getAttribute("wandering");
        this.special = this.map.getElementsByTagName("quest")[0].getAttribute("special");
        this.introText = this.map.getElementsByTagName("speech")[0].getAttribute("intro");
        this.leave = this.map.getElementsByTagName("speech")[0].getAttribute("leave");
        document.getElementById("title").innerHTML = this.title;
        document.getElementById("wandering").innerHTML = "Wandering Monster: " + this.wandering;
        var objects = this.map.getElementsByTagName("object");
        for (var i = 0; i < objects.length; i++) {
            var object = objects[i];
            var p = new Piece(object, this.meta);
            this.pieces.push(p);
            p.createDiv(this.board, this.bx, this.by, this.tileWidth, this.tileHeight);
        }
        this.loadRooms();
        var darks = this.map.getElementsByTagName("dark");
        for (var i = 0; i < darks.length; i++) {
            var dark = darks[i];
            var x = parseFloat(dark.getAttribute("left")) - 1;
            var y = parseFloat(dark.getAttribute("top")) - 1;
            var width = parseFloat(dark.getAttribute("width"));
            var height = parseFloat(dark.getAttribute("height"));
            var xp = this.bx + (x * this.tileWidth);
            var yp = this.by + (y * this.tileHeight);
            var cell = document.createElement("div");
            cell.style.width = (this.tileWidth * width) + "px";
            cell.style.height = (this.tileHeight * height) + "px";
            cell.style.left = xp + "px";
            cell.style.top = yp + "px";
            cell.style.background = "rgba(0,0,0,0.7)";
            cell.id = x + "-" + y;
            cell.className = "cell";
            this.board.appendChild(cell);
        }
        document.getElementById("modal").onmousedown = function (event) {
            _this.clicked();
        };
        this.log("Welcome to " + this.title);
        this.waitForClick();
    }
    HeroQuestDM.prototype.clicked = function () {
        for (var i = 0; i < this.rooms.length; i++) {
            this.rooms[i].div.style.background = "transparent";
        }
        synth.cancel();
        this.hideClickMessage();
        this.nextStep();
    };
    HeroQuestDM.prototype.waitForClick = function () {
        document.getElementById("modal").style.display = "inline";
    };
    HeroQuestDM.prototype.hideClickMessage = function () {
        document.getElementById("modal").style.display = "none";
        for (var i = 0; i < this.rooms.length; i++) {
            this.rooms[i].div.style.background = "transparent";
        }
    };
    HeroQuestDM.prototype.log = function (text) {
        var root = document.getElementById("loginner");
        var div = document.createElement("div");
        div.className = "logentry";
        div.innerHTML = text;
        if (root.childNodes.length == 0) {
            root.appendChild(div);
        }
        else {
            root.insertBefore(div, root.childNodes[0]);
        }
        var utterThis = new SpeechSynthesisUtterance(text);
        synth.speak(utterThis);
    };
    HeroQuestDM.prototype.discoverAll = function () {
        for (var i = 0; i < this.rooms.length; i++) {
            this.rooms[i].discover(this, false);
        }
    };
    HeroQuestDM.prototype.discover = function (x, y) {
        var result = "";
        for (var i = 0; i < this.pieces.length; i++) {
            if (this.pieces[i].contains(x, y)) {
                var discoverMessage = this.pieces[i].discover(this);
                if (discoverMessage) {
                    result = discoverMessage;
                }
            }
        }
        // special cases for doors that exist in two rooms
        for (var i = 0; i < this.pieces.length; i++) {
            if (this.pieces[i].id == "Door") {
                var door = this.pieces[i];
                if (door.rotation == 0) { // downwards
                    if ((door.x == x) && (door.y == y - 1)) {
                        door.discover(this);
                    }
                }
                if (door.rotation == 180) { // upwards
                    if ((door.x == x) && (door.y == y + 1)) {
                        door.discover(this);
                    }
                }
                if (door.rotation == 90) { // rightwards
                    if ((door.x == x - 1) && (door.y == y)) {
                        door.discover(this);
                    }
                }
                if (door.rotation == 270) { // leftwards
                    if ((door.x == x + 1) && (door.y == y)) {
                        door.discover(this);
                    }
                }
            }
        }
        return result;
    };
    HeroQuestDM.prototype.search = function (x, y) {
        var result = "";
        for (var i = 0; i < this.pieces.length; i++) {
            if (this.pieces[i].contains(x, y)) {
                var searchMessage = this.pieces[i].search(this);
                if (searchMessage) {
                    result = searchMessage;
                }
            }
        }
        return result;
    };
    HeroQuestDM.prototype.getPiece = function (name) {
        for (var i = 0; i < this.pieces.length; i++) {
            if (this.pieces[i].id == name) {
                return this.pieces[i];
            }
        }
        return null;
    };
    HeroQuestDM.prototype.getPieceAt = function (x, y) {
        for (var i = 0; i < this.pieces.length; i++) {
            if (this.pieces[i].contains(x, y)) {
                return this.pieces[i];
            }
        }
        return null;
    };
    HeroQuestDM.prototype.getRoomAt = function (x, y) {
        for (var i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].contains(x, y)) {
                return this.rooms[i];
            }
        }
        return null;
    };
    HeroQuestDM.prototype.nextStep = function () {
        if (this.introText) {
            this.log(this.introText);
            delete this.introText;
            this.waitForClick();
        }
        else if (this.placedStairs === false) {
            this.placedStairs = true;
            var startingPiece = null;
            var stairway = false;
            for (var i = 0; i < this.pieces.length; i++) {
                if (this.pieces[i].id == "Stairway") {
                    startingPiece = this.pieces[i];
                    stairway = true;
                }
            }
            for (var i = 0; i < this.pieces.length; i++) {
                if (this.pieces[i].info == "start") {
                    startingPiece = this.pieces[i];
                    stairway = false;
                }
            }
            var room = this.getRoomAt(startingPiece.x, startingPiece.y);
            room.discover(this, false);
            if (stairway) {
                this.log("This is where your heroes begin, place them around the stairway on your game board.");
            }
            else {
                this.log("This is where your heroes begin, place them in the room.");
            }
            this.waitForClick();
        }
        else if (this.intro === false) {
            this.intro = true;
            this.log("Continue playing on your board. Click on the rooms as you choose to explore them - I will give you instructions");
            this.waitForClick();
        }
        else {
            // hide monsters
            for (var i = 0; i < this.pieces.length; i++) {
                var id = this.pieces[i].id;
                if (!this.meta[id]) {
                    this.pieces[i].hide();
                }
            }
        }
    };
    HeroQuestDM.prototype.loadXML = function (ref) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", ref, false);
        xmlhttp.send();
        return xmlhttp.responseXML;
    };
    HeroQuestDM.prototype.loadJSON = function (ref) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", ref, false);
        xmlhttp.send();
        return JSON.parse(xmlhttp.responseText);
    };
    HeroQuestDM.prototype.highlightRoom = function (room) {
        room.div.style.background = "rgba(0,255,0,0.5)";
        if (!room.discovered) {
            room.discover(this, true);
        }
    };
    HeroQuestDM.prototype.loadRooms = function () {
        var data = this.loadJSON("data/roomsmeta.json");
        this.hallway = new Room({ x: 0, y: 0, height: 19, width: 26 });
        this.hallway.createDiv(this, this.board, this.bx, this.by, this.tileWidth, this.tileHeight);
        for (var i = 0; i < data.length; i++) {
            var room = new Room(data[i]);
            room.createDiv(this, this.board, this.bx, this.by, this.tileWidth, this.tileHeight);
            this.rooms.push(room);
        }
        this.rooms.push(this.hallway);
    };
    return HeroQuestDM;
}());
var synth = window.speechSynthesis;
window.onbeforeunload = function () {
    synth.cancel();
    if (dm.leave) {
        dm.log(dm.leave);
    }
};
var dm = new HeroQuestDM("board");
//# sourceMappingURL=dm.js.map