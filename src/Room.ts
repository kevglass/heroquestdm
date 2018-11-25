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

    discover(dm: HeroQuestDM, log: boolean): void {
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