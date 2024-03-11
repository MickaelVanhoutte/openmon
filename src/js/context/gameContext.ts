import {MapSave, OpenMap} from "../mapping/maps";
import {type Character, Player} from "../characters/player";
import {Settings} from "../characters/settings";
import {Pokedex, PokemonInstance} from "../pokemons/pokedex";
import {PokemonBox} from "../pokemons/boxes";
import {Position} from "../mapping/positions";
import {OverworldContext} from "./overworldContext";
import {BattleContext} from "./battleContext";
import type {Script} from "../scripting/scripts";
import type {NPC} from "../characters/npc";
import {ItemsReferences} from "../items/items";
import {firstBeach} from "../mapping/maps/firstBeach";
import {BattleEvents} from "../battle/battle-model";

/**
 * The current game context
 */
export class GameContext {

    ITEMS = new ItemsReferences();
    POKEDEX = new Pokedex();
    MAPS: Record<number, OpenMap> = {
        0: firstBeach,
    }

    isNewGame: boolean;
    player: Player;
    boxes: Array<PokemonBox>;
    map: OpenMap;
    settings: Settings;

    isBattle: boolean = false;
    overWorldContext: OverworldContext;
    battleContext?: BattleContext;

    playingScript?: Script;
    scriptsByTrigger: Map<string, Script[]> = new Map<string, Script[]>();

    constructor(player: Player, boxes: Array<PokemonBox>, map: MapSave, settings: Settings, isNewGame: boolean) {
        this.player = player;
        this.boxes = boxes;
        this.map = OpenMap.fromInstance(this.MAPS[map.mapId], map.playerPosition);
        this.settings = settings;
        this.isNewGame = isNewGame;
        let allScripts: Script[] = this.map.scripts
            .concat(this.map.npcs.map((npc) => npc.mainScript).filter((script) => script !== undefined) as Script[])
            .concat(this.map.npcs.map((npc) => npc.dialogScripts).flat().filter((script) => script !== undefined) as Script[])
            .concat(this.map.npcs.map((npc) => npc.movingScript).filter((script) => script !== undefined) as Script[]);
        allScripts.forEach((script) => {
            if (this.scriptsByTrigger.has(script.triggerType)) {
                this.scriptsByTrigger.get(script.triggerType)?.push(script);
            } else {
                this.scriptsByTrigger.set(script.triggerType, [script]);
            }
        });
        this.overWorldContext = new OverworldContext();
    }

    startBattle(opponent: PokemonInstance | Character): BattleContext {
        let events = new BattleEvents();
        events.onEnd = (result) => {
            this.isBattle = false;
            this.battleContext = undefined;

            if (!result.win) {
                // tp back to the start // TODO pokecenter position
                this.map.playerMovedOffset = new Position(0, 0);
            } else if (result.caught) {
                // add caught pokemon to team if space or in the box
                if (this.player.monsters.length < 6) {
                    this.player.monsters.push(result.caught);
                } else {
                    // first available space in boxes
                    if (!this.boxes.every(box => box.isFull())) {
                        // @ts-ignore
                        this.boxes[this.boxes.indexOf(this.boxes.find(box => !box.isFull()))].add(result.caught);
                    }
                }
            }
        }

        let battleContext = new BattleContext(this.player, opponent, this.settings, events);
        this.isBattle = true;
        this.battleContext = battleContext;
        return battleContext;
    }

    playScript(script?: Script, previous?: Script, onEnd?: () => void) {
        if (script && !this.playingScript) {
            script.onEnd = () => {
                this.playingScript = undefined;
                this.overWorldContext.isPaused = false;
                if (previous) {
                    if (onEnd) {
                        previous.onEnd = onEnd;
                    }
                    previous?.resume(this);
                } else {
                    if (onEnd) {
                        onEnd();
                    }
                }

            };
            this.playingScript = script;
            this.overWorldContext.isPaused = true;
            script.start(this);
        }
    }


    playMvts(npcs: (NPC | undefined)[]) {
        npcs.forEach((npc) => {
            npc?.movingScript?.start(this);
        });
    }

    // TODO : rework following code
    followerAt(position: Position): boolean {
        return this.behindPlayerPosition()?.x === position.x && this.behindPlayerPosition()?.y === position.y;
    }

    behindPlayerPosition() {
        let playerPosition = this.map?.playerPosition;
        if (playerPosition) {
            let direction = this.player.direction;
            switch (direction) {
                case 'up':
                    return new Position(playerPosition.x, playerPosition.y + 1);
                case 'down':
                    return new Position(playerPosition.x, playerPosition.y - 1);
                case 'left':
                    return new Position(playerPosition.x + 1, playerPosition.y);
                case 'right':
                    return new Position(playerPosition.x - 1, playerPosition.y);
            }
        }
    }

    /*toSaveContext(): SaveContext {
        return new SaveContext(0, Date.now(), new MapSave(this.map.mapId, this.map.playerMovedOffset), this.player, this.boxes, this.settings);
    }*/
}

