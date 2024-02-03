import {OpenMap} from "../maps";
import {Position} from "../../sprites/drawers";

const monsters = [
    95
];


export const testMap2 = OpenMap.fromScratch('src/assets/maps/test-map2.png', '', 80, 60, [], [], monsters, new Position(11, 11), [3, 6]);
