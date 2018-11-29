class Room {
    x: number;
    y: number;
    width: number;
    height: number;
    div: HTMLElement;
    discovered: boolean = false;

    constructor(data: any) {
        this.x = data.x;
        this.y = data.y;
        this.width = data.width;
        this.height = data.height;
    }

    contains(x: number, y: number): boolean {
        return (x >= this.x) && (y >= this.y) && (x < this.x + this.width) && (y < this.y + this.height);
    }

    getPieceCount() : number {
        var count : number = 0;

        for (var yp = 0; yp < this.height; yp++) {
            for (var xp = 0; xp < this.width; xp++) {
                if (dm.getRoomAt(this.x + xp, this.y + yp) == this) {
                    var p = dm.getPieceAt(this.x+xp, this.y+yp);
                    if (p) {
                        count++;
                    }
                }
            }
        }

        return count;
    }

    discover(dm: HeroQuestDM, log: boolean): void {
        if ((this.getPieceCount() < 2) && (dm.special == "rolltoroom")) {
            // roll to determine room
            var roll = Math.floor((Math.random()*12)+1);
            var pid : string = "Number"+roll;
            if ((roll == 2) || (roll == 12)) {
                pid = "Number2-12";
            }
            if (roll == 1) {
                pid = "Number11";
            }

            var piece : Piece = dm.getPiece(pid);
            dm.log("As you step through the door you teleport. You roll a "+roll+". Move to this room");
            dm.highlightRoom(dm.getRoomAt(piece.x, piece.y));
            dm.waitForClick();

            return;
        }

        if (this.discovered == true) {
            var result: string = "You find nothing of interest.";

            // search
            for (var yp = 0; yp < this.height; yp++) {
                for (var xp = 0; xp < this.width; xp++) {
                    if (dm.getRoomAt(this.x + xp, this.y + yp) == this) {
                        var searchMessage: string = dm.search(this.x + xp, this.y + yp);
                        if (searchMessage) {
                            result = searchMessage;
                        }
                    }
                }
            }

            if (log == true) {
                dm.log("You search the room.  " + result);
            }
        } else {
            this.div.style.cursor = "zoom-in";
            this.discovered = true;

            var result: string = "";

            for (var yp = 0; yp < this.height; yp++) {
                for (var xp = 0; xp < this.width; xp++) {
                    if (dm.getRoomAt(this.x + xp, this.y + yp) == this) {
                        var discoverMessage: string = dm.discover(this.x + xp, this.y + yp);
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
    }

    createDiv(dm: HeroQuestDM, parent, bx, by, tileWidth, tileHeight): void {
        var xp: number = bx + (this.x * tileWidth);
        var yp: number = by + (this.y * tileHeight);

        var cell: HTMLElement = document.createElement("div");
        cell.style.width = (tileWidth * this.width) + "px";
        cell.style.height = (tileHeight * this.height) + "px";
        cell.style.left = xp + "px";
        cell.style.top = yp + "px";
        cell.id = this.x + "-" + this.y + "-Room";
        cell.style.overflow = "visible";
        cell.className = "cell";
        cell.style.cursor = "alias";

        this.div = cell;

        cell.onmousedown = () => {
            this.discover(dm, true);
        };

        parent.appendChild(cell);
    }
}