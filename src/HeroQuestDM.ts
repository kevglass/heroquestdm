/// <reference path="Piece.ts"/>
/// <reference path="Room.ts"/>

class HeroQuestDM {
    board : HTMLElement;
    bx : number = 34;
    by : number = 34;
    width: number = 26;
    height: number = 19;
    map: Document;
    meta: Array<any>;
    rooms: Array<Room> = new Array<Room>();
    pieces: Array<Piece> = new Array<Piece>();

    tileWidth : number = 33.25;
    tileHeight : number = 33.25;
    title: string;

    placedStairs: boolean = false;
    intro: boolean = false;
    introText: string = "";
    wandering: string;

    constructor(id : string) {
        this.board = document.getElementById(id);

        var urlParams = new URLSearchParams(window.location.search);

        this.meta = this.loadJSON("data/piecesmeta.json");
        this.map = this.loadXML("data/HQBase_EU/"+urlParams.get("quest")+"_EU.xml");
        this.title = this.map.getElementsByTagName("quest")[0].getAttribute("name");
        this.wandering = this.map.getElementsByTagName("quest")[0].getAttribute("wandering");
        this.introText = this.map.getElementsByTagName("speech")[0].getAttribute("intro");

        document.getElementById("title").innerHTML = this.title;
        document.getElementById("wandering").innerHTML = "Wandering Monster: "+this.wandering;

        var objects = this.map.getElementsByTagName("object");
        for (var i=0;i<objects.length;i++) {
            var object = objects[i];
            var p : Piece = new Piece(object, this.meta);

            this.pieces.push(p);
            p.createDiv(this.board, this.bx, this.by, this.tileWidth, this.tileHeight);
        }

        this.loadRooms();

        var darks = this.map.getElementsByTagName("dark");
        for (var i=0;i<darks.length;i++) {
            var dark = darks[i];

            var x : number = parseFloat(dark.getAttribute("left")) - 1;
            var y : number = parseFloat(dark.getAttribute("top")) - 1;
            var width : number = parseFloat(dark.getAttribute("width"));
            var height : number = parseFloat(dark.getAttribute("height"));
            var xp : number = this.bx + (x * this.tileWidth);
            var yp : number = this.by + (y * this.tileHeight);

            var cell : HTMLElement = document.createElement("div");
            cell.style.width = (this.tileWidth*width)+"px";
            cell.style.height = (this.tileHeight*height)+"px";
            cell.style.left = xp+"px";
            cell.style.top = yp+"px";
            cell.style.background = "rgba(0,0,0,0.7)";
            cell.id = x+"-"+y;
            cell.className = "cell";

            this.board.appendChild(cell);
        }

        document.getElementById("modal").onmousedown = (event) => {
            this.clicked();
        };

        this.log("Welcome to "+this.title);
        this.waitForClick();
    }

    clicked() {
        synth.cancel();
        this.hideClickMessage();
        this.nextStep();
    }

    waitForClick() {
        document.getElementById("modal").style.display = "inline";
    }

    hideClickMessage() {
        document.getElementById("modal").style.display = "none";
    }

    log(text: string) : void {
        var root = document.getElementById("loginner");
        var div = document.createElement("div");
        div.className = "logentry";
        div.innerHTML = text;

        if (root.childNodes.length == 0) {
            root.appendChild(div);
        } else {
            root.insertBefore(div, root.childNodes[0]);
        }
        
        var utterThis = new SpeechSynthesisUtterance(text);
        synth.speak(utterThis);
    }

    discoverAll(): any {
        for (var i=0;i<this.rooms.length;i++) {
            this.rooms[i].discover(this, false);
        }
    }

    discover(x: number, y: number) : string {
        var result : string = "";

        for (var i=0;i<this.pieces.length;i++) {
            if (this.pieces[i].contains(x,y)) {
                var discoverMessage = this.pieces[i].discover(this);
                if (discoverMessage) {
                    result = discoverMessage;
                }
            }
        }

        // special cases for doors that exist in two rooms
        for (var i=0;i<this.pieces.length;i++) {
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
    }

    search(x: number, y: number) : string {
        var result : string = "";

        for (var i=0;i<this.pieces.length;i++) {
            if (this.pieces[i].contains(x,y)) {
                var searchMessage = this.pieces[i].search(this);
                if (searchMessage) {
                    result = searchMessage;
                }
            }
        }

        return result;
    }

    getRoomAt(x: number, y:number) : Room {
        for (var i=0;i<this.rooms.length;i++) {
            if (this.rooms[i].contains(x,y)) {
                return this.rooms[i];
            }
        }

        return null;
    }

    nextStep() : void {
        if (this.introText) {
            this.log(this.introText);
            delete this.introText;
            this.waitForClick();
        } else if (this.placedStairs === false) {
            this.placedStairs = true;

            var startingPiece : Piece = null;
            var stairway : boolean = false;

            for (var i=0;i<this.pieces.length;i++) {
                if (this.pieces[i].id == "Stairway") {
                    startingPiece = this.pieces[i];
                    stairway = true;
                }
            }
            for (var i=0;i<this.pieces.length;i++) {
                if (this.pieces[i].info == "start") {
                    startingPiece = this.pieces[i];
                    stairway = false;
                }
            }

            var room: Room = this.getRoomAt(startingPiece.x, startingPiece.y);
            room.discover(this, false);

            if (stairway) {
                this.log("This is where your heroes begin, place them around the stairway on your game board.");
            } else {
                this.log("This is where your heroes begin, place them in the room.");
            }
            this.waitForClick();
        } else if (this.intro === false) {
            this.intro = true;
            this.log("Continue playing on your board. Click on the rooms as you choose to explore them - I will give you instructions");
            this.waitForClick();
        } else {
            // hide monsters
            for (var i=0;i<this.pieces.length;i++) {
                var id : string = this.pieces[i].id;
                if (!this.meta[id]) {
                    this.pieces[i].hide();
                }
            }
        }
    }

    loadXML(ref) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", ref , false);
        xmlhttp.send();
        return xmlhttp.responseXML;
    }

    loadJSON(ref) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", ref , false);
        xmlhttp.send();
        return JSON.parse(xmlhttp.responseText);
    }

    loadRooms() {
        var data = this.loadJSON("data/roomsmeta.json");
        var hallway : Room = new Room({x:0, y:0, height:19, width:26});
        hallway.createDiv(this, this.board, this.bx, this.by, this.tileWidth, this.tileHeight);

        for (var i=0;i<data.length;i++) {
            var room : Room = new Room(data[i]);
            room.createDiv(this, this.board, this.bx, this.by, this.tileWidth, this.tileHeight);
            this.rooms.push(room);
        }

        this.rooms.push(hallway);
    }
}

var synth = window.speechSynthesis;
window.onbeforeunload = function() {
    synth.cancel();
}

var dm : HeroQuestDM = new HeroQuestDM("board");
