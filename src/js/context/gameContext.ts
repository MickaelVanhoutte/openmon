import { MapSave, OpenMap } from "../mapping/maps";
import { Player } from "../characters/player";
import { CharacterPosition, type Character } from "../characters/characters-model";
import { Settings } from "../characters/settings";
import { Pokedex, PokemonInstance } from "../pokemons/pokedex";
import { PokemonBox } from "../pokemons/boxes";
import { Position } from "../mapping/positions";
import { OverworldContext } from "./overworldContext";
import { BattleContext } from "./battleContext";
import type { Script } from "../scripting/scripts";
import type { NPC } from "../characters/npc";
import { ItemsReferences } from "../items/items";
import { firstBeach } from "../mapping/maps/firstBeach";
import { writable, type Writable } from "svelte/store";
import { SaveContext } from "./savesHolder";

/**
 * The current game context
 */
export class GameContext {

    ITEMS = new ItemsReferences();
    POKEDEX = new Pokedex();
    MAPS: Record<number, OpenMap> = {
        0: firstBeach,
    }

    id: number;
    isNewGame: boolean;
    player: Player;
    boxes: Array<PokemonBox>;
    map: OpenMap;
    settings: Settings;

    overWorldContext: OverworldContext;
    battleContext: Writable<BattleContext | undefined> = writable(undefined);

    playingScript?: Script;
    scriptsByTrigger: Map<string, Script[]> = new Map<string, Script[]>();

    constructor(id: number, player: Player, boxes: Array<PokemonBox>, map: MapSave, settings: Settings, isNewGame: boolean) {
        this.id = id;
        this.player = Player.fromInstance(player);
        this.boxes = boxes.map((box) => new PokemonBox(box.name, box.values.map((pkmn) => pkmn ? pkmn as PokemonInstance : undefined)));
        this.map = OpenMap.fromInstance(this.MAPS[map.mapId], isNewGame ? this.MAPS[map.mapId].playerInitialPosition :  player.position.positionOnMap);
        this.settings = settings;
        this.isNewGame = isNewGame;
        
        this.overWorldContext = new OverworldContext(this.map);
        this.player.position = new CharacterPosition(this.map.playerInitialPosition.x, this.map.playerInitialPosition.y);
    
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

        

        this.bindKeys();
    }

    bindKeys() {
        this.overWorldContext.keys.a.subscribe((value) => {
            if (value && !this.overWorldContext.isPaused) {
                let interactive = this.map?.elementInFront(this.player.position.positionOnMap, this.player.position.direction);
                let scripts = interactive?.interact(this.player.position.positionOnMap);
                let newScript = scripts?.[0];
                let previous = scripts?.[1];
                if (newScript) {
                    this.playScript(newScript, previous);
                } else {
                    previous?.resume(this);
                }
            }

        });

        this.overWorldContext.keys.up.subscribe((value) => {
            this.handleDirectionKey(value, 'up');
        });

        this.overWorldContext.keys.down.subscribe((value) => {
            this.handleDirectionKey(value, 'down');
        });

        this.overWorldContext.keys.left.subscribe((value) => {
            this.handleDirectionKey(value, 'left');
        });

        this.overWorldContext.keys.right.subscribe((value) => {
            this.handleDirectionKey(value, 'right');
        });

        
    }

    handleDirectionKey(value: boolean, direction: 'up' | 'down' | 'left' | 'right') {
        if(this.player.position.positionOnMap.x !== this.player.position.targetPosition.x || this.player.position.positionOnMap.y !== this.player.position.targetPosition.y){
            return;
        }

        if (value && !this.overWorldContext.isPaused) {
            this.player.position.targetDirection = direction;
            if (this.player.position.targetDirection !== this.player.position.direction) {
                this.player.position.direction = this.player.position.targetDirection;
                return;
            }

            const xChanger = (x: number) => this.player.position.direction === 'left' ? x - 1 : this.player.position.direction === 'right' ? x + 1 : x;
            const yChanger = (y: number) => this.player.position.direction === 'up' ? y - 1 : this.player.position.direction === 'down' ? y + 1 : y;

            const futureX = xChanger(this.player.position.targetPosition.x);
            const futureY = yChanger(this.player.position.targetPosition.y);

            if(Math.abs(futureX - this.player.position.positionOnMap.x) > 1 || Math.abs(futureY - this.player.position.positionOnMap.y) > 1){
                return;
            }

            const futurePosition = new Position(futureX, futureY);

            if (!this.map.hasBoundaryAt(futurePosition)) {
                this.player.moving = true;
                this.player.position.setFuturePosition(futureX, futureY);
            }
        }
    }

    startBattle(opponent: PokemonInstance | Character) {

        let battleContext = new BattleContext(this.player, opponent, this.settings);
        let unsubscribe = battleContext.events.end.subscribe((result) => {
            if (result) {
                unsubscribe();
                if (!result.win) {
                    // tp back to the start // TODO pokecenter position
                    this.player.position.positionOnMap = this.map.playerInitialPosition;
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
                this.battleContext.set(undefined);
            }
        });
        this.battleContext.set(battleContext);
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
        let playerPosition = this.player.position.positionOnMap;
        if (playerPosition) {
            let direction = this.player.position.direction;
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

    toSaveContext(): SaveContext {
        return new SaveContext(this.id, Date.now(), new MapSave(this.map.mapId), this.player, this.boxes, this.settings);
    }
}

