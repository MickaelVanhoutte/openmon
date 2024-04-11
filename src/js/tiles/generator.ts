import { Layer, NatureTileSet, Tile, } from "./tiles";

//@ts-ignore
import FastNoiseLite from "fastnoise-lite";

export function distance_squared(x: number, y: number, width: number, height: number): number {
    let dx = width * 0.4 - x * ( width / height) * .8;
    let dy = height * 0.5 - y * ( height / width) ;
    // make it centered even if the map is not a square
    // if (width > height) {
    //     dx = dx * ;
    // } else {
    //     dy = dy ;
    // }
    return dx * dx +  dy * dy;
}

export class MapGenerator {
    private baseLayer: Biome;
    private forestLayer: Biome;
    private citiesLayer: Biome;

    constructor() {
        this.baseLayer = new BaseBiome();
        this.forestLayer = new ForestBiome();
        this.citiesLayer = new CitiesBiome();
    }

    async generate(width: number = 200, height: number = 200): Promise<Array<Layer>> {

        let base = await this.baseLayer.getLayer(width, height);
        //let cities = await this.citiesLayer.getLayer(width, height, base);
        let forest = await this.forestLayer.getLayer(width, height, base);
        return [ base, forest];


        // return new Promise((resolve, reject) => {
        //     this.baseLayer.getLayer(width, height).then((baseLayer) => {
        //         this.forestLayer.getLayer(width, height, baseLayer).then((forestLayer) => {
        //             return resolve([baseLayer, forestLayer]);
        //         });
        //     }).catch((error) => {
        //         console.log(error);
        //     });
        // });
    }
}

export abstract class Biome {

    abstract getLayer(width: number, height: number, baseLayer?: Layer): Promise<Layer>;
}

export class BaseBiome extends Biome {

    nature: NatureTileSet;
    noise: FastNoiseLite;
    cities: CitiesBiome;

    constructor() {
        super();
        this.nature = new NatureTileSet();
        this.noise = new FastNoiseLite();
        this.noise.SetNoiseType(FastNoiseLite.NoiseType.Perlin);
        this.noise.SetFrequency(0.025);

        this.cities = new CitiesBiome();
    }

    getLayer(width: number, height: number, baseLayer?: Layer): Promise<Layer> {
        let noiseData: number[][] = this.baseNoise(width, height);
        return this.baseLayer(width, height, noiseData);
    }

    private baseLayer(width: number, height: number, noiseData: number[][]): Promise<Layer> {

        return new Promise((resolve, reject) => {
            let layer = new Layer(this.nature, 0, width, height);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let tile = this.getNoiseTile(noiseData, x, y);
                    layer.setTile(y, x, tile);
                }
            }

            return resolve(layer);
        });
    }

    private baseNoise(width: number, height: number) {
        // No more than 40% of the map can be water
        const validate = (waterTiles: number | undefined) => { return !!waterTiles && waterTiles < width * height * 0.6; };
        let waterTiles = undefined;


        let noiseData: number[][] = [];

        // while (!validate(waterTiles)) {
        waterTiles = 0;
        this.noise.SetSeed(Math.random() * 1000);
        noiseData = [];
        let maxD = width * width * 0.1 + height * height * 0.1;

        for (let y = 0; y < height; y++) {
            noiseData[y] = [];

            for (let x = 0; x < width; x++) {
                let d = distance_squared(y, x, width, height);
                let value = (0.9 - 2 * d / maxD) + (this.noise.GetNoise(y, x) * 2) - .5;
                noiseData[y][x] = value;

                if (value < -1) {
                    waterTiles++;
                }
            }
        }
        //}
        return noiseData;
    }

    getNoiseTile(noise: number[][], x: number, y: number): Tile {

        if (noise[y][x] < -2) {
            return this.nature.water2();
        } else if (noise[y][x] < -1.5) {
            return this.nature.water1();
        } else if (noise[y][x] < -1) {
            return this.nature.sand();
        }else if(noise[y][x] < -0.85){
            return this.nature.ground1();
        } else if (noise[y][x] < 0.5) {
            return this.nature.grass();
        } else if (noise[y][x] < .65) {
            return this.nature.ground1();
        } else if (noise[y][x] < .9) {
            return this.nature.ground2();
        }
        return this.nature.ground3();
    }
}

export class CitiesBiome extends Biome {

    nature: NatureTileSet;

    constructor() {
        super();
        this.nature = new NatureTileSet();
    }

    getLayer(width: number, height: number, baseLayer?: Layer | undefined): Promise<Layer> {
        return new Promise((resolve, reject) => {
            let cities = new Layer(new NatureTileSet(), 1, width, height);
            const chunks: Array<Array<number[]>> = this.findRegions(baseLayer!);
            console.log(chunks);
            chunks.forEach((chunk) => {
                const tile = this.nature.randomTile();
                for (let i = 0; i < chunk.length; i++) {
                    cities.setTile(chunk[i][1],chunk[i][0], tile);
                }
            });
            return resolve(cities);
        });
    }


    findRegions(layer: Layer, tileType: string[] = ['grass'], minWidth: number = 16, minHeight: number = 16, maxWidth: number = 32, maxHeight: number = 32): Array<Array<number[]>> {
        const rows = layer.width;
        const cols = layer.height;
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const chunks: Array<Array<number[]>> = [];

        function isInsideGrid(row: number, col: number) {
            return row >= 0 && row < rows && col >= 0 && col < cols;
        }


        function reachedMinSize(chunk: number[][], minWidth: number, minHeight: number): boolean {
            //first coordinate
            let firstX = chunk[0][0];
            let firstY = chunk[0][1];
            let lastYForFirstX = chunk.findLastIndex((coord) => coord[0] === firstX);
            return chunk.filter((coord) => coord[0] === firstX).length > minWidth && chunk.filter((coord) => coord[1] === firstY).length > minHeight;
        }

        function reachedMaxSize(chunk: number[][], maxWidth: number, maxHeight: number): boolean {
            //first coordinate
            let firstX = chunk[0][0];
            let firstY = chunk[0][1];
            return chunk.filter((coord) => coord[0] === firstX).length >= maxWidth && chunk.filter((coord) => coord[1] === firstY).length >= maxHeight;
        }

        function dfs(row: number, col: number): Array<number[]> {
            const stack: Array<number[]> = [[row, col]];
            const chunk = [];

            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;
            let chunkWidth = -Infinity;
            let chunkHeight = -Infinity;

            while (stack.length) {
                //@ts-ignore
                const [r, c] = stack.pop();

                if (!isInsideGrid(r, c) || visited[r][c] || !tileType.includes(layer.getTile(c, r)?.type)) {
                    continue;
                }

                visited[r][c] = true;
                chunk.push([r, c]);

                minX = Math.min(minX, c);
                minY = Math.min(minY, r);
                maxX = Math.max(maxX, c);
                maxY = Math.max(maxY, r);

                chunkWidth = maxX - minX + 1;
                chunkHeight = maxY - minY + 1;



                //console.log(chunkWidth, chunkHeight)
                //check every cols are filled

                if (!reachedMinSize(chunk, minWidth, minHeight) && !reachedMaxSize(chunk, maxWidth, maxHeight)) {
                    stack.push([r, c - 1]); // Left
                    stack.push([r, c + 1]); // Right
                    stack.push([r - 1, c]); // Top
                    stack.push([r + 1, c]); // Bottom
                }

                // // Check if neighboring tiles are within the desired chunk dimensions
                // if (chunkWidth < maxWidth && isInsideGrid(r, c - 1) && !visited[r][c - 1] && tileType.includes(layer.getTile(r, c - 1)?.type)) {
                //     stack.push([r, c - 1]); // Left
                // }
                // if (chunkWidth < maxWidth && isInsideGrid(r, c + 1) && !visited[r][c + 1] && tileType.includes(layer.getTile(r, c + 1)?.type)) {
                //     stack.push([r, c + 1]); // Right
                // }
                // if (chunkHeight < maxHeight && isInsideGrid(r - 1, c) && !visited[r - 1][c] && tileType.includes(layer.getTile(r - 1, c)?.type)) {
                //     stack.push([r - 1, c]); // Top
                // }
                // if (chunkHeight < maxHeight && isInsideGrid(r + 1, c) && !visited[r + 1][c] && tileType.includes(layer.getTile(r + 1, c)?.type)) {
                //     stack.push([r + 1, c]); // Bottom
                // }
            }

            if (reachedMaxSize(chunk, maxWidth, maxHeight)) {
                //console.log(chunk);
                return chunk;
            }
            return [];
        }

        // Function to check if two rectangles intersect
        function doRectanglesIntersect(rect1: { minX: number, maxX: number, minY: number, maxY: number }, rect2: { minX: number, maxX: number, minY: number, maxY: number }) {
            return (
                rect1.minX <= rect2.maxX &&
                rect1.maxX >= rect2.minX &&
                rect1.minY <= rect2.maxY &&
                rect1.maxY >= rect2.minY
            );
        }

        // Function to calculate the bounding box of a chunk
        function calculateBoundingBox(chunk: number[][]): { minX: number, maxX: number, minY: number, maxY: number } {
            const minX = Math.min(...chunk.map(coord => coord[1]));
            const maxX = Math.max(...chunk.map(coord => coord[1]));
            const minY = Math.min(...chunk.map(coord => coord[0]));
            const maxY = Math.max(...chunk.map(coord => coord[0]));
            return { minX, maxX, minY, maxY };
        }

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (!visited[i][j] && tileType.includes(layer.getTile(j, i)?.type)) {
                    let chunk: Array<number[]> = dfs(i, j);

                    // Calculate bounding box of the chunk
                    const boundingBox = calculateBoundingBox(chunk);

                    // Check if the chunk intersects with any existing chunks
                    const intersects = chunks.some(existingChunk => {
                        const existingBoundingBox = calculateBoundingBox(existingChunk);
                        return doRectanglesIntersect(boundingBox, existingBoundingBox);
                    });

                    if (!!chunk[0] && !intersects) {
                        chunks.push(chunk);
                    }
                }
            }
        }


        return chunks;
    }

}

export class ForestBiome extends Biome {
    nature: NatureTileSet;
    noise: FastNoiseLite;

    constructor() {
        super();
        this.nature = new NatureTileSet();
        this.noise = new FastNoiseLite();
        this.noise.SetNoiseType(FastNoiseLite.NoiseType.Perlin);
        this.noise.SetFrequency(0.04);
    }

    getLayer(width: number, height: number, baseLayer?: Layer): Promise<Layer> {
        console.log(baseLayer);
        if (!baseLayer) throw new Error("Base layer is required for forest biome");
        let noiseData: number[][] = this.baseNoise(width, height);
        return Promise.resolve(this.baseLayer(width, height, noiseData, baseLayer));
    }

    private baseLayer(width: number, height: number, noiseData: number[][], baseLayer: Layer): Promise<Layer> {
        return new Promise((resolve, reject) => {
            let layer = new Layer(this.nature,2, width, height);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let tile = this.getNoiseTile(noiseData, y, x, baseLayer, layer);
                    if (tile.type !== 'dontAdd') {
                        layer.setTile(y, x, tile);
                    }
                    if (tile.type === 'tree') {
                        layer.setTile(y + 1, x, this.nature.tree2());
                        layer.setTile(y + 2, x, this.nature.tree3());

                    }
                }
            }
            console.log("resolve forest");
            return resolve(layer);
        });
    }

    private baseNoise(width: number, height: number) {
        let noiseData: number[][] = [];
        this.noise.SetSeed(Math.random() * 1000);
        noiseData = [];

        for (let y = 0; y < height; y++) {
            noiseData[y] = [];

            for (let x = 0; x < width; x++) {
                let value = this.noise.GetNoise(y, x);
                noiseData[y][x] = value;
            }
        }

        return noiseData;
    }

    getNoiseTile(noise: number[][], y: number, x: number, baseLayer: Layer, currentLayer: Layer): Tile {
        if (!!currentLayer.getTile(y, x)) {
            return this.nature.noTile();
        }

        if (baseLayer.getTile(y, x)?.type === "water") {
            return this.nature.noTile();
        }
        // else if (baseTile.type === "grass" && noise[x][y] < 0) {
        //     return this.nature.battleGrass();
        // } 
        else if (
            ((noise[y][x] < 0 && Math.random() < 0.6)
            || (noise[y][x] < 0.25 && Math.random() < 0.1))
            && y < currentLayer.height - 2
            && y > 2
            && baseLayer.getTile(y, x)?.type === "grass"
            && baseLayer.getTile(y + 1, x)?.type === "grass"
            && baseLayer.getTile(y + 2, x)?.type === "grass"
            && baseLayer.getTile(y - 1, x)?.type === "grass"
            && !currentLayer.getTile(y + 1, x)
            && !currentLayer.getTile(y + 2, x)
            && x < currentLayer.width - 1
            && x > 1
            && baseLayer.getTile(y, x + 1)?.type === "grass"
            && baseLayer.getTile(y, x - 1)?.type === "grass"


            // &&
            // baseLayer.getTile(y, x)?.type === "grass" &&
            // baseLayer.getTile(x- 1, y)?.type === "grass" &&
            // baseLayer.getTile(x+ 1, y)?.type === "grass" &&
            // baseLayer.getTile(y, x+ 1)?.type === "grass" &&
            // baseLayer.getTile(x- 1, y -1)?.type === "grass" &&
            // baseLayer.getTile(y, x)?.type === "grass" &&
            // baseLayer.getTile(y, x + 1)?.type === "grass" &&
            // baseLayer.getTile(y, x + 2)?.type === "grass"
        ) {
            return this.nature.tree1();
        }
        //return noise[x][y] < 0 ? this.nature.battleGrass() : this.nature.transparent();
        // }else if(noise[x][y] < 0.05){
        //     return this.nature.tree1();
        // }
        return this.nature.noTile();

    }
}