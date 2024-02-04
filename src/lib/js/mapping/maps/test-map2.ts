import {OpenMap} from "../maps";
import {Position} from "../../sprites/drawers";

/*const monsters = [
    95
];*/
// all from 1 to 251
const monsters = Array.from({length: 251}, (v, k) => k + 1);


export const testMap2 = OpenMap.fromScratch('src/assets/maps/test-map2.png', '', 80, 60, [], [], monsters, new Position(11, 11), new Position(0, 0), [3, 6]);
