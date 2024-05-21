import { MapSave, OpenMap } from "../mapping/maps";
import { Player } from "../characters/player";
import { CharacterPosition, type Character } from "../characters/characters-model";
import { Settings } from "../characters/settings";
import { Pokedex, PokemonInstance, SavedEntry } from "../pokemons/pokedex";
import { PokemonBox } from "../pokemons/boxes";
import { Position } from "../mapping/positions";
import { OverworldContext, SceneType } from "./overworldContext";
import { BattleContext } from "./battleContext";
import type { Script } from "../scripting/scripts";
import type { NPC } from "../characters/npc";
import { ItemsReferences } from "../items/items";
import { firstBeach } from "../mapping/maps/firstBeach";
import { writable, type Writable } from "svelte/store";
import { SaveContext } from "./savesHolder";
import type { Jonction } from "../mapping/collisions";
import { TourGuideClient } from "@sjmc11/tourguidejs/src/Tour"
import { GUIDES_STEPS } from "./guides-steps";
import { pokecenter1 } from "../mapping/maps/pokecenter1";


/**
 * The current game context
 */
export class GameContext {

    ITEMS = new ItemsReferences();
    POKEDEX = new Pokedex();
    MAPS: Record<number, OpenMap> = {
        0: firstBeach,
        99: pokecenter1
    }

    id: number;
    updated: number;
    created: number;
    isNewGame: boolean;
    player: Player;
    boxes: Array<PokemonBox>;
    map: OpenMap;
    settings: Settings;

    overWorldContext: OverworldContext;
    battleContext: Writable<BattleContext | undefined> = writable(undefined);

    playingScript?: Script;
    scriptsByTrigger: Map<string, Script[]> = new Map<string, Script[]>();
    hasEvolutions: boolean = false;

    viewedGuides: number[];

    // Guides
    tg: TourGuideClient;

    constructor(save: SaveContext) {
        this.id = save.id;
        this.POKEDEX = new Pokedex(save.savedEntry);
        this.player = Player.fromInstance(save.player);
        this.boxes = save.boxes.map((box) => new PokemonBox(box.name, box.values.map((pkmn) => pkmn ? pkmn as PokemonInstance : undefined)));
        this.map = OpenMap.fromInstance(this.MAPS[save.currentMap.mapId], save.isNewGame ? this.MAPS[save.currentMap.mapId].playerInitialPosition : save.player.position.positionOnMap);
        this.settings = save.settings;
        this.isNewGame = save.isNewGame;
        this.created = save.created;
        this.updated = save.updated;

        this.overWorldContext = new OverworldContext(this.map);
        this.player.position = new CharacterPosition(this.map.playerInitialPosition);

        this.viewedGuides = save.viewedGuides;


        this.tg = new TourGuideClient({
            dialogClass: 'guide-dialog',
            nextLabel: '►',
            prevLabel: '◄',
            finishLabel: '✔',
            showStepProgress: false,
            closeButton: false,
            exitOnClickOutside: false,
            exitOnEscape: false,
            steps: [GUIDES_STEPS.JOYSTICK, GUIDES_STEPS.KEYBOARD_ARROWS, GUIDES_STEPS.KEYBOARD_AB].filter(step => !this.viewedGuides.includes(step.order || 0))
        });

        this.tg.onFinish(() => {
            this.tg.tourSteps.map(step => step.order || 0).forEach(step => this.viewedGuides.push(step));
        });

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
        this.checkForGameStart();
    }

    bindKeys() {
        this.overWorldContext.keys.a.subscribe((value) => {
            if (value && !this.overWorldContext.isPaused) {
                let interactive = this.map?.elementInFront(this.player.position.positionOnMap, this.player.position.direction);
                let scripts = interactive?.interact(this.player.position.positionOnMap);

                // TODO interactive behind counters 
               // let interactiveBehindCounter = this.map?.elementInFront(this.player.position.positionOnMap, this.player.position.direction);
                //let scripts2 = interactive?.interact(this.player.position.positionOnMap);

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
        if (this.player.position.positionOnMap.x !== this.player.position.targetPosition.x || this.player.position.positionOnMap.y !== this.player.position.targetPosition.y) {
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

            if (Math.abs(futureX - this.player.position.positionOnMap.x) > 1 || Math.abs(futureY - this.player.position.positionOnMap.y) > 1) {
                return;
            }

            const futurePosition = new Position(futureX, futureY);
            const savedPosition = { ...this.player.position.positionOnMap };

            if (!this.map.hasBoundaryAt(futurePosition)) {

                this.player.moving = true;
                this.player.position.setFuturePosition(futureX, futureY, () => {
                    // on reach destination
                    this.checkForStepInScript();
                    this.checkForJunction();
                    this.checkForBattle();
                    this.checkForInSight();

                    // wait for the follower to end it's movement before setting next


                    if (this.player.follower) {
                        this.player.follower.position.direction = this.player.position.direction;
                        this.player.follower.moving = true;
                        this.player.follower.position.setFuturePosition(savedPosition.x, savedPosition.y);

                    }
                });



            }
        }
    }

    checkForGameStart(): boolean {

        if (this.isNewGame && !this.overWorldContext.scenes.wakeUp) {
            let script = this.scriptsByTrigger.get('onGameStart')?.at(0);
            this.overWorldContext.startScene(SceneType.WAKE_UP);
            setTimeout(() => {
                this.isNewGame = false;

                this.overWorldContext.endScene(SceneType.WAKE_UP);
                if (script) {
                    this.playScript(script, undefined, () => {
                        this.overWorldContext.startScene(SceneType.STARTER_SELECTION);
                        let unsub = setInterval(() => {
                            if (!this.overWorldContext.scenes.starterSelection) {
                                this.tg.start();
                                clearInterval(unsub);
                            }
                        }, 2000);
                    });

                }

            }, 5000);
            return true;
        } else {
            this.tg.start();
        }
        return false;
    }

    checkForJunction() {
        if (this.map === undefined) return;
        let jonction = this.map.jonctionAt(this.player.position.positionOnMap);
        if (jonction !== undefined) {
            this.changeMap(jonction);
        }
    }

    changeMap(jonction: Jonction) {
        let map = OpenMap.fromInstance(this.MAPS[jonction.mapIdx], new Position(0, 0));
        this.player.position.setPosition(jonction.start || new Position(0, 0));
        this.loadMap(map);
    }

    loadMap(map: OpenMap) {
        this.overWorldContext.changingMap = true;
        //overworldContext.displayChangingMap = true;

        let onEnterScript: Script | undefined;
        if (map.scripts && map.scripts?.length > 0) {
            onEnterScript = map.scripts?.find((s) => s.triggerType === 'onEnter');
        }

        let npcOnEnter = map.npcs?.filter((npc) => npc.movingScript);

        // TODO set in overWorldCtx
        this.map = map;

        setTimeout(() => {
            this.overWorldContext.changingMap = false;

            if (onEnterScript) {
                this.playScript(onEnterScript);
            }
            if (npcOnEnter?.length > 0) {
                this.playMvts(npcOnEnter);
            }
        }, 4000);
        setTimeout(() => {
            //overworldContext.displayChangingMap = false;
            //checkForGameStart();
        }, 2000);
    }


    checkForStepInScript() {
        let stepScript: Script | undefined;
        if (this.map?.scripts && this.map.scripts?.length > 0 && !this.playingScript) {
            // TODO allow range of positions
            stepScript = this.map.scripts.find(
                (s) =>
                    s.triggerType === 'onStep' &&
                    s.stepPosition?.x === this.player.position.positionOnMap.x &&
                    s.stepPosition?.y === this.player.position.positionOnMap.y
            );
        }

        if ((stepScript !== undefined && !stepScript?.played) || stepScript?.replayable) {
            this.playScript(stepScript);
        }

        return stepScript;
    }

    /*
    Battle start
     */
    checkForBattle() {
        if (
            this.map &&
            this.map.hasBattleZoneAt(this.player.position.positionOnMap) &&
            Math.random() < 0.07
        ) {
            let monster = this.map.randomMonster();
            // level can be base on player medium level of his team
            let level = Math.floor(this.player.monsters.reduce((acc, pkmn) => acc + pkmn.level, 0) / this.player.monsters.length);
            this.startBattle(this.POKEDEX.findById(monster.id).result.instanciate(level - 1));//monster.level
        }
    }

    checkForInSight() {
        if (this.map?.npcs && this.map?.npcs?.length > 0) {
            let npcsWithInSightScript: NPC[] = this.map.npcs.filter(
                (npc) =>
                    npc.mainScript &&
                    (!npc.mainScript.played || npc.mainScript.replayable) &&
                    npc.mainScript.triggerType === 'onSight'
            );

            npcsWithInSightScript.forEach((npc) => {
                // player is in sight if the npc looks in his direction and is within 3 tiles
                // get 3 tiles in front of the npc  :
                let positionsInFront: Position[];
                if (npc.direction === 'down') {
                    positionsInFront = [
                        new Position(npc.position.positionOnMap.x, npc.position.positionOnMap.y + 1),
                        new Position(npc.position.positionOnMap.x, npc.position.positionOnMap.y + 2),
                        new Position(npc.position.positionOnMap.x, npc.position.positionOnMap.y + 3)
                    ];
                } else if (npc.direction === 'up') {
                    positionsInFront = [
                        new Position(npc.position.positionOnMap.x, npc.position.positionOnMap.y - 1),
                        new Position(npc.position.positionOnMap.x, npc.position.positionOnMap.y - 2),
                        new Position(npc.position.positionOnMap.x, npc.position.positionOnMap.y - 3)
                    ];
                } else if (npc.direction === 'left') {
                    positionsInFront = [
                        new Position(npc.position.positionOnMap.x - 1, npc.position.positionOnMap.y),
                        new Position(npc.position.positionOnMap.x - 2, npc.position.positionOnMap.y),
                        new Position(npc.position.positionOnMap.x - 3, npc.position.positionOnMap.y)
                    ];
                } else {
                    positionsInFront = [
                        new Position(npc.position.positionOnMap.x + 1, npc.position.positionOnMap.y),
                        new Position(npc.position.positionOnMap.x + 2, npc.position.positionOnMap.y),
                        new Position(npc.position.positionOnMap.x + 3, npc.position.positionOnMap.y)
                    ];
                }
                let inSight = positionsInFront.some(
                    (p) =>
                        p.x === this.player.position.positionOnMap.x &&
                        p.y === this.player.position.positionOnMap.y
                );

                if (inSight) {
                    this.playScript(npc.mainScript);
                }
            });
        }
    }

    startBattle(opponent: PokemonInstance | Character) {
        this.overWorldContext.isPaused = true;
        let battleContext = new BattleContext(this.player, opponent, this.settings);
        let unsubscribe = battleContext.events.end.subscribe((result) => {
            if (result) {
                battleContext.events.ending.set(true);

                if (opponent instanceof PokemonInstance) {
                    this.POKEDEX.setViewed(opponent.id);
                } else {
                    opponent.monsters.forEach(pkmn => this.POKEDEX.setViewed(pkmn.id));
                }

                unsubscribe();
                if (!result.win) {
                    // tp back to the start // TODO pokecenter position
                    this.player.position.positionOnMap = this.map.playerInitialPosition;
                    this.player.monsters.forEach((pkmn) => {
                        pkmn.fullHeal();
                    });
                } else if (result.caught) {
                    this.POKEDEX.setCaught(result.caught.id);
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
                setTimeout(() => {
                    // End of battle, 2 sec later for fade out
                    this.overWorldContext.isPaused = false;
                    this.battleContext.set(undefined);
                    this.hasEvolutions = this.player.monsters.some(pkmn => pkmn.canEvolve());
                }, 2000);
            }
        });

        let unsubscribe2 = setInterval(() => {
            if (!this.player.moving) {
                this.player.followerCharge(this.overWorldContext);
                this.battleContext.set(battleContext);
                battleContext.events.starting.set(true);
                clearInterval(unsubscribe2);
            }
        }, 200);
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
        return new SaveContext(this.id, Date.now(), new MapSave(this.map.mapId), this.player, this.boxes, this.settings, this.isNewGame, this.viewedGuides, this.POKEDEX.exportForSave());
    }
}

