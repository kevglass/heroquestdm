class Piece {
    x : number;
    y : number;
    width : number = 1;
    height: number = 1;

    rotation: number;
    id : string;
    img: string;
    div: HTMLElement;

    onSearch: string;
    onDiscover: string;
    onDiscoverAction: string;
    info: string;

    constructor(node: Element, meta: Array<any>) {
        this.x = parseFloat(node.getAttribute("left")) - 1;
        this.y = parseFloat(node.getAttribute("top")) - 1;
        this.id = node.getAttribute("id");
        this.onDiscover = node.getAttribute("onDiscover");
        this.info = node.getAttribute("info");
        this.onDiscoverAction = node.getAttribute("onDiscoverAction");
        this.onSearch = node.getAttribute("onSearch");
        this.img = "img/tiles/"+this.id+"_US.png";

        var pdata = meta[this.id];
        if (pdata) {
            this.width = pdata.width;
            this.height = pdata.height;
        }

        // sort out rotations
        var rot : string = node.getAttribute("rotation");
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

    contains(x: number, y:number) : boolean {
        return (x >= this.x) && (y >= this.y) && (x < this.x + this.width) && (y < this.y + this.height);
    }

    hide() {
        this.div.style.display = "none";
    }

    search(dm : HeroQuestDM) : string {
        var result : string = this.onSearch;
        delete this.onSearch;

        if (this.id.indexOf("SecretDoor") === 0) {
            this.div.style.display = "inline";
            return "You find a secret door!";
        }
        
        return result;
    }

    discover(dm : HeroQuestDM) : string {
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
    }

    createDiv(parent, bx, by, tileWidth, tileHeight) : void {
        var xp : number = bx + (this.x * tileWidth);
        var yp : number = by + (this.y * tileHeight);

        var cell : HTMLElement = document.createElement("div");
        cell.style.width = (tileWidth*this.width)+"px";
        cell.style.height = (tileHeight*this.height)+"px";
        cell.style.left = xp+"px";
        cell.style.top = yp+"px";
        cell.id = this.x+"-"+this.y+"-"+this.id;
        cell.style.overflow = "visible";
        cell.className = "cell";
        //cell.style.background = "red";

        var img : HTMLImageElement = document.createElement("img");
        img.style.transform = "rotate("+this.rotation+"deg) ";
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
        img.onload = () => {
            if (this.rotation == 90) {
                img.style.left = img.height+"px";
            }
            if (this.rotation == 180) {
                img.style.left = img.width+"px";
                img.style.top = img.height+"px";
            }
            if (this.rotation == 270) {
                img.style.top = img.width+"px";
            }
            if ((this.rotation == 0) && (this.id != "Door")) {
                if ((this.width == 1) && (this.height == 1)) {
                    img.style.left = ((tileWidth - img.width)/ 2)+"px";
                    img.style.top = ((tileHeight - img.height)/ 2)+"px";
                }
            }

        }
        img.src = this.img;
        cell.appendChild(img);

        this.div = cell;
        cell.style.display = "none";

        parent.appendChild(cell);
    }
}