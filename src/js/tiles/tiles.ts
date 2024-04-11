export class Tile {
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(type: string, x: number, y: number, width: number = 16, height: number = 16, offset: number = 1) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

export class Layer {
    order: number;
    tileSet: Tileset;
    width: number;
    height: number;
    tiles: Tile[][];

    constructor(tileSet: Tileset, order: number, width: number, height: number) {
        this.order = order;
        this.tileSet = tileSet;
        this.width = width;
        this.height = height;
        this.tiles = new Array(height);
        for (let i = 0; i < height; i++) {
            this.tiles[i] = new Array(width);
        }
    }

    setTile(x: number, y: number, tile: Tile) {
        this.tiles[x][y] = tile;
    }

    getTile(x: number, y: number): Tile {
        return this.tiles[x][y];
    }
}

export class Tileset {
    source: string;
    width: number;
    height: number;
    offset: number;
    tileSize: number;

    constructor(source: string, width: number, height: number, offset: number = 1, tileSize: number = 16) {
        this.source = source;
        this.width = width;
        this.height = height;
        this.offset = offset;
        this.tileSize = tileSize;
    }

    getTile(type: string,x: number, y: number): Tile {
        return new Tile(
            type,
            x * this.tileSize + (this.offset * x + 1),
            y * this.tileSize + (this.offset * y + 1)
        );
    }
}

export class NatureTileSet extends Tileset {
    constructor() {
        super("src/assets/tileset/tileset.png", 477, 800);
    }

    public randomTile(): Tile {
        // return randomly one of the following tile methods
        const random = Math.floor(Math.random() * 10);
        switch (random) {
            case 0:
                return this.tree1();
            case 1:
                return this.tree2();
            case 2:
                return this.tree3();
            case 3:
                return this.grass();
            case 4:
                return this.ground1();
            case 5:
                return this.ground2();
            case 6:
                return this.ground3();
            case 7:
                return this.battleGrass();
            case 8:
                return this.sand();
            case 9:
                return this.water1();
            default:
                return this.transparent();
        }
    }

    noTile(): Tile {
        return this.getTile('dontAdd', 0, 1);
    }

    transparent(): Tile {
        return this.getTile('transparent', 0, 1);
    }

    water1(): Tile {
        return this.getTile('water',11, 1);
    }

    water2(): Tile {
        return this.getTile('water',11, 5);
    }

    sand(): Tile {
        return this.getTile('sand', 0, 0);
    }

    grass(): Tile {
        return this.getTile('grass', 6, 0);
    }

    ground1(): Tile {
        return this.getTile('ground', 0, 6);
    }

    ground2(): Tile {
        return this.getTile('ground', 0, 42);
    }

    ground3(): Tile {
        return this.getTile('ground', 0, 12);
    }

    battleGrass(): Tile {
        return this.getTile('battle-grass', 7, 0);
    }

    tree1(): Tile {
        return this.getTile('tree', 17, 13);
    }

    tree2(): Tile {
        return this.getTile('tree', 17, 14);
    }

    tree3(): Tile {
        return this.getTile('tree', 17, 15);
    }
}
