import { MapSave, OpenMap } from "../mapping/maps";
import { Player } from "../characters/player";
import { CharacterPosition, type Character, type Interactive } from "../characters/characters-model";
import { Settings } from "../characters/settings";
import { Pokedex, PokemonInstance, SavedEntry } from "../pokemons/pokedex";
import { PokemonBox } from "../pokemons/boxes";
import { Position } from "../mapping/positions";
import { MenuType, OverworldContext, SceneType } from "./overworldContext";
import { BattleContext } from "./battleContext";
import { Dialog, Message, Script } from "../scripting/scripts";
import { NPC } from "../characters/npc";
import { ItemsReferences } from "../items/items";
import { firstBeach } from "../mapping/maps/firstBeach";
import { writable, type Writable } from "svelte/store";
import { SaveContext } from "./savesHolder";
import type { Jonction } from "../mapping/collisions";
//import { TourGuideClient } from "@sjmc11/tourguidejs/src/Tour"
//import { GUIDES_STEPS } from "./guides-steps";
import { pokecenter1 } from "../mapping/maps/pokecenter1";
import { forest } from "../mapping/maps/forest";
import { OverworldSpawn } from "../characters/overworld-spawn";
import { Flags, Objective, ObjectiveState, QUESTS, Quest, QuestState } from "../scripting/quests";
import { Notifications } from "../scripting/notifications";
import { BattleType } from "../battle/battle-model";


/**
 * The current game context
 */
export class GameContext {

    ITEMS = new ItemsReferences();
    POKEDEX = new Pokedex();
    MAPS: Record<number, OpenMap> = {
        0: firstBeach,
        1: forest,
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

    questStates: QuestState[] = [];
    quests: Quest[] = [];
    currentQuest?: Quest;
    flags: Flags;

    overWorldContext: OverworldContext;
    battleContext: Writable<BattleContext | undefined> = writable(undefined);

    playingScript?: Script;
    scriptsByTrigger: Map<string, Script[]> = new Map<string, Script[]>();
    hasEvolutions: boolean = false;
    spawned?: OverworldSpawn;

    // Guides
    //tg: TourGuideClient;
    viewedGuides: number[];

    sound?: Howl;
    battleStartSound: Howl;
    battleSound: Howl;

    notifications: Notifications = new Notifications();

    weather?: {
        started: Date,
        type: 'SANDSTORM' | 'RAIN' | 'SNOW',
        intervalId: number,
        running: boolean
    };

    constructor(save: SaveContext) {
        this.id = save.id;
        this.POKEDEX = new Pokedex(save.savedEntry);
        this.player = Player.fromInstance(save.player);
        this.boxes = save.boxes.map((box) => new PokemonBox(box.name, box.values.map((pkmn) => pkmn ? pkmn as PokemonInstance : undefined)));
        this.map = OpenMap.fromInstance(this.MAPS[save.currentMap.mapId], save.isNewGame ? this.MAPS[save.currentMap.mapId].playerInitialPosition : save.player.position.positionOnMap);
        this.map.items = this.map.items.filter(i => !save.currentMap.pickedItems.includes(i.id || 0));
        this.settings = save.settings;
        this.isNewGame = save.isNewGame;
        this.created = save.created;
        this.updated = save.updated;

        this.overWorldContext = new OverworldContext(this.map);
        this.player.position = new CharacterPosition(this.map.playerInitialPosition);
        this.viewedGuides = save.viewedGuides;

        this.questStates = save.questStates;
        const lastCompleted = this.questStates.filter(q => q.completed).sort((a, b) => a.id - b.id).pop();
        this.quests = QUESTS.map(q => {
            let questState = this.questStates.find(qs => qs.id === q.id);
            return new Quest(q.id, q.name, q.description, q.objectives
                .map(o => new Objective(o.id, o.description, questState?.objectives.find(questObj => questObj.id === o.id)?.completed || false))
                , q.area, q.leaveMessage, questState?.completed || false);
        });
        console.log(lastCompleted);
        if (lastCompleted) {
            this.currentQuest = this.quests.find(q => q.id === (lastCompleted?.id + 1)) || this.quests[0];
        } else {
            this.currentQuest = this.quests[0];
        }
        this.flags = save.flags;

        // this.tg = new TourGuideClient({
        //     dialogClass: 'guide-dialog',
        //     nextLabel: '►',
        //     prevLabel: '◄',
        //     finishLabel: '✔',
        //     showStepProgress: false,
        //     closeButton: false,
        //     exitOnClickOutside: false,
        //     exitOnEscape: false,
        //     steps: [GUIDES_STEPS.JOYSTICK, GUIDES_STEPS.KEYBOARD_ARROWS, GUIDES_STEPS.KEYBOARD_AB].filter(step => !this.viewedGuides.includes(step.order || 0))
        // });

        // this.tg.onFinish(() => {
        //     this.tg.tourSteps.map(step => step.order || 0).forEach(step => this.viewedGuides.push(step));
        // });

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

        this.battleStartSound = new Howl({
            src: ['src/assets/audio/battle/battle-start.mp3'],
            autoplay: false,
            loop: false,
            volume: 0.5
        });
        this.battleSound = new Howl({
            src: ['src/assets/audio/battle/battle2.mp3'],
            autoplay: false,
            loop: true,
            volume: 0.5
        });

        this.bindKeys();
        this.checkForGameStart();
        this.loadMap(this.map);
        this.startWeatherLoop();
    }

    startWeatherLoop(){
        this.weather = {
            type: 'RAIN',
            started: new Date,
            running: true,
            intervalId: 1
        }
        // if(this.weather){
        //     if(this.weather.running){
        //         // check date to stop it
        //         let stop = false;
        //         if(stop){
        //             this.weather.running = false;
        //         }
        //     }
        // }else {

        // }
    
    }

    validateQuestObjective(questId: number, objectiveId: number) {
        let quest = this.quests.find(q => q.id === questId);
        let objective = quest?.objectives.find(o => o.id === objectiveId);
        if (objective) {
            objective.complete();
            let questState = this.questStates.find(qs => qs.id === questId);
            if (questState) {
                let obj = questState.objectives.find(o => o.id === objectiveId);
                if (obj) {
                    obj.completed = true;
                    this.notifications.notify(`Objective completed: ${objective.description}`);
                    if (quest && questState.objectives.every(o => o.completed)) {
                        questState.completed = true;
                        this.notifications.notify(`Quest completed: ${quest.name}`);

                        this.currentQuest = this.quests.find(q => q.id === questId + 1) || undefined;
                        if (this.currentQuest) {
                            this.notifications.notify(`New quest: ${this.currentQuest.name}`);
                        }
                    }
                }
            } else if (!!quest) {
                this.questStates.push(new QuestState(questId, false, quest.objectives.map(o => new ObjectiveState(o.id, o.completed))));
            }
        }
    }

    isMenuAvailable(menuKey: MenuType): boolean {
        switch (menuKey) {
            case MenuType.POKEMON_LIST:
            case MenuType.BOX:
                return this.questStates.find(q => q.id === 0)?.objectives[0].completed || false;
            case MenuType.POKEDEX:
                return this.questStates.find(q => q.id === 0)?.objectives[1].completed || false;
            case MenuType.TRAINER:
                return this.questStates.find(q => q.id === 0)?.objectives[2].completed || false;
            case MenuType.BAG:
                return this.questStates.find(q => q.id === 0)?.objectives[3].completed || false;
            default:
                return false;
        }
    }

    bindKeys() {
        this.overWorldContext.keys.a.subscribe((value) => {
            if (value && !this.overWorldContext.getPaused()) {
                let interactive = this.map?.elementInFront(this.player.position.positionOnMap, this.player.position.direction) || this.followerInFront();
                let scripts = interactive?.interact(this.player.position.positionOnMap, this);

                // interactive behind counters 
                if (!interactive) {
                    let interactiveBehindCounter = this.map?.elementBehindCounter(this.player.position.positionOnMap, this.player.position.direction);
                    scripts = interactiveBehindCounter?.interact(this.player.position.positionOnMap, this);
                }

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
    followerInFront(): Interactive | undefined {
        let elementPosition = new Position(this.player.position.positionOnMap.x, this.player.position.positionOnMap.y);
        switch (this.player.position.direction) {
            case 'up':
                elementPosition.y -= 1;
                break;
            case 'down':
                elementPosition.y += 1;
                break;
            case 'left':
                elementPosition.x -= 1;
                break;
            case 'right':
                elementPosition.x += 1;
                break;
        }
        if (this.player.follower && this.player.follower.position.positionOnMap.x === elementPosition.x && this.player.follower.position.positionOnMap.y === elementPosition.y) {
            return this.player.follower;
        }
        return undefined;
    }

    handleDirectionKey(value: boolean, direction: 'up' | 'down' | 'left' | 'right') {
        if (this.player.position.positionOnMap.x !== this.player.position.targetPosition.x || this.player.position.positionOnMap.y !== this.player.position.targetPosition.y) {
            return;
        }

        if (value && !this.overWorldContext.getPaused()) {
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

                if (this.currentQuest && this.hasQuestLimit(futurePosition)) {
                    this.playScript(new Script('onStep',
                        [
                            new Dialog([new Message(this.currentQuest.leaveMessage)]),
                        ]
                    ));

                } else {

                    this.player.moving = true;
                    this.player.position.setFuturePosition(futureX, futureY, () => {
                        // on reach destination
                        this.checkForStepInScript();
                        this.checkForJunction();
                        this.checkForBattle();
                        this.checkForInSight();

                        // wait for the follower to end it's movement before setting next

                        if (this.player.follower) {
                            this.player.follower.stepCounter += 1;
                            this.player.follower.position.direction = this.player.position.direction;
                            this.player.follower.moving = true;
                            this.player.follower.position.setFuturePosition(savedPosition.x, savedPosition.y);
                        }
                    });
                }
            }
        }
    }

    hasQuestLimit(futurePosition: Position): boolean {
        return !!this.currentQuest && !!this.currentQuest.area && this.isOutsideQuestBounds(futurePosition, this.currentQuest.area);
    }

    isOutsideQuestBounds(futurePosition: Position, area: { start: Position; end: Position; }): boolean {
        return futurePosition.x < area.start.x || futurePosition.x > area.end.x || futurePosition.y < area.start.y || futurePosition.y > area.end.y;
    }

    checkForGameStart(): boolean {

        if (this.isNewGame && !this.overWorldContext.scenes.wakeUp) {
            let script = this.scriptsByTrigger.get('onGameStart')?.at(0);
            this.overWorldContext.startScene(SceneType.WAKE_UP);

            setTimeout(() => {
                this.overWorldContext.endScene(SceneType.WAKE_UP);
                this.isNewGame = false;
                if (script) {
                    this.playScript(script, undefined, () => {
                        if (this.currentQuest) {
                            this.notifications.notify('Current quest: ' + this.currentQuest.name);
                        }
                    });
                }
            }, 5000);

            return true;
        } else {
            //this.tg.start();
            if (this.currentQuest) {
                this.notifications.notify('Current quest: ' + this.currentQuest.name);
            }
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
        if (!!this.sound) {
            this.sound.fade(0.5, 0, 900);
            setTimeout(() => {
                this.sound?.stop();
                this.sound = undefined;
            }, 900);
        }


        // stop every scripts
        this.playingScript?.interrupt();
        this.map?.npcs.forEach(npc => npc.movingScript?.interrupt());


        let map = OpenMap.fromInstance(this.MAPS[jonction.mapIdx], new Position(0, 0));
        this.player.position.setPosition(jonction.start || new Position(0, 0));
        this.loadMap(map);
    }

    playMapSound() {
        if (this.map?.sound) {
            this.sound = new Howl({
                src: ['src/assets/audio/' + this.map?.sound + '.mp3'],
                autoplay: true,
                loop: true,
                volume: 0.5
            });
        }
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

            this.playMapSound();

            if (onEnterScript) {
                this.playScript(onEnterScript);
            }
            if (npcOnEnter?.length > 0) {
                this.playMvts(npcOnEnter);
            }

            this.overworldSpawn();
        }, 1000);
        setTimeout(() => {
            //overworldContext.displayChangingMap = false;
            //checkForGameStart();
        }, 2000);
    }

    overworldSpawn() {
        setInterval(() => {
            if (!this.spawned) {
                let direction: 'up' | 'down' | 'left' | 'right' = 'right';
                let x = (this.player.position.positionOnMap.x - 20) < 0 ? 0 : this.player.position.positionOnMap.x - 20;
                if (Math.random() > 0.5) {
                    direction = 'left';
                    x = (this.player.position.positionOnMap.x + 20) > this.map.width ? this.map.width - 1 : this.player.position.positionOnMap.x + 20;
                }
                let y = (Math.floor(Math.random() * 21) - 10) + this.player.position.positionOnMap.y;
                if (y < 0) {
                    y = 0;
                }
                if (y > this.map.height) {
                    y = this.map.height - 1;
                }

                let destX = direction === 'right' ?
                    (this.player.position.positionOnMap.x + 40) > this.map.width ? this.map.width - 1 : this.player.position.positionOnMap.x + 40 :
                    (this.player.position.positionOnMap.x - 40) < 0 ? 0 : this.player.position.positionOnMap.x - 40;
                let destY = y;

                let currentPos = new CharacterPosition(new Position(x, y), direction);
                currentPos.setFuturePosition(destX, destY, () => {
                    this.spawned = undefined;
                });
                let possiblePokes = [10, 11, 13, 14, 72, 149, 165, 207];
                // randomly select one :
                let pokeId = possiblePokes[Math.floor(Math.random() * possiblePokes.length)];
                let spawned = new OverworldSpawn(currentPos,
                    this.POKEDEX.findById(pokeId).result.instanciate(5));
                this.spawned = spawned;
            }
        }, 6000);
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
            this.startBattle(this.POKEDEX.findById(monster.id).result.instanciate(level - 1), BattleType.SINGLE);//monster.level
        }
    }

    checkForInSightNpc(npcId: number): boolean {
        let npc = this.map?.npcs.find(npc => npc.id === npcId);
        let haveInSightScript = !!npc && !!npc?.mainScript && (!npc.mainScript.played || npc.mainScript.replayable) && npc.mainScript.triggerType === 'onSight';
        return !!npc && haveInSightScript && this.haveInSight(npc);
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


                if (this.haveInSight(npc)) {
                    let move = npc.movingScript?.interrupt();
                    this.playScript(npc.mainScript, move);
                }
            });
        }
    }

    private haveInSight(npc: NPC): boolean {
        // player is in sight if the npc looks in his direction and is within 3 tiles
        // get 3 tiles in front of the npc 
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
            (p) => p.x === this.player.position.positionOnMap.x &&
                p.y === this.player.position.positionOnMap.y
        );
        return inSight;
    }

    startBattle(opponent: PokemonInstance | Character, battleType: BattleType, onEnd?: () => void) {
        this.overWorldContext.setPaused(true, 'battle-start gameContext');

        if (this.sound && this.sound.playing()) {
            this.sound.fade(0.5, 0, 500);
            this.battleStartSound.play();
            setTimeout(() => {
                this.sound?.stop();
                this.battleStartSound.fade(0, 0.5, 500);
            }, 500);
        }

        setTimeout(() => {
            this.battleStartSound.stop();
            this.battleSound.play();
        }, 1500);

        console.log(battleType)
        if(battleType === BattleType.DOUBLE && this.player.monsters.length < 2){
            battleType = BattleType.SINGLE;
        }
        console.log(battleType)

        if (opponent instanceof NPC && opponent?.monsterIds?.length > 0) {
            opponent.monsters = opponent.monsterIds.map((id) => {
                let level = Math.floor(this.player.monsters.reduce((acc, pkmn) => acc + pkmn.level, 0) / this.player.monsters.length);
                // randomly add -1 to 2 levels
                level += Math.floor(Math.random() * 4) - 1;
                return this.POKEDEX.findById(id).result.instanciate(level);
            });
        }

        let battleContext = new BattleContext(this.player, opponent, this.settings, battleType);
        let unsubscribe = battleContext.events.end.subscribe((result) => {
            if (result) {
                this.battleSound.fade(0.5, 0, 1000);

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
                    this.playMapSound();
                }, 1000);

                setTimeout(() => {
                    // End of battle, 2 sec later for fade out
                    this.overWorldContext.setPaused(false, 'battle-end gameContext');
                    this.battleContext.set(undefined);
                    this.battleSound.stop();
                    this.hasEvolutions = this.player.monsters.some(pkmn => pkmn.canEvolve());
                    if (onEnd) {
                        onEnd();
                    }
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

    playScript(script?: Script, previous?: Script, onEnd?: () => void, pause: boolean = true) {
        if (script && !this.playingScript) {
            script.onEnd = () => {
                this.playingScript = undefined;
                this.overWorldContext.setPaused(false, 'script-end gameContext');
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
            this.overWorldContext.setPaused(pause, 'script-start gameContext');
            script.start(this);
        }
    }


    playMvts(npcs: (NPC | undefined)[]) {
        npcs.forEach((npc) => {
            npc?.movingScript?.start(this, false);
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
        return new SaveContext(this.id, Date.now(), new MapSave(this.map.mapId, this.map.items.filter(i => i.pickedUp).map(i => i.id || 0)), this.player, this.boxes, this.settings, this.isNewGame, this.viewedGuides, this.POKEDEX.exportForSave(), this.questStates, this.flags);
    }
}

