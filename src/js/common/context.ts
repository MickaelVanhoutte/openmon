import type {Character, Player} from "../characters/player";
import type {Script} from "./scripts";
import type {OpenMap} from "../mapping/maps";
import {NPC} from "../characters/npc";
import {Position} from "../sprites/drawers";
import {PokemonInstance} from "../pokemons/pokedex";
import {BattleContext, BattleState} from "../battle/battle";
import {Settings} from "../characters/settings";
import {BATTLE_STATE, POKEDEX} from "../const";

export class WorldContext {
    id: number = 0;

    map?: OpenMap;

    then: number = Date.now();
    fpsInterval: number = 1000 / 18;
    imageScale: number = 2.5;
    playerScale: number = .83;
    running: boolean = false;
    walk: number = .3;
    run: number = .6;
    debug: boolean = false;
    displayChangingMap: boolean = false;
    changingMap: boolean = false;

    player: Player;
    playingScript?: Script;

    settings?: Settings;

    constructor(player: Player, settings?: Settings) {
        this.player = player;
        this.settings = settings;
    }

    playScript(script?: Script, previous?: Script) {
        if (script && !this.playingScript) {
            script.onEnd = () => {
                this.playingScript = undefined;
                previous?.resume(this);
            };
            this.playingScript = script;
            script.start(this);
        }
    }

    playMvts(npcs: (NPC | undefined)[]) {
        npcs.forEach((npc) => {
            npc?.movingScript?.start(this);
        });
    }

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

    initiateBattle(opponent: PokemonInstance | Character) {

        if (opponent instanceof NPC && opponent?.monsterIds?.length > 0) {
            opponent.monsters = opponent.monsterIds.map((id) => {
                return POKEDEX.findById(id).result.instanciate(6);
            });
        }


        let bContext = new BattleContext();
        bContext.state = new BattleState(this.player, opponent, this.settings || new Settings())
        BATTLE_STATE.set(bContext);

        setTimeout(() => {
            BATTLE_STATE.update(value => {
                if (value.state) {
                    value.state.starting = false;
                    value.state.pokemonsAppearing = true;
                }
                return value;
            });
        }, 2000);

        setTimeout(() => {
            BATTLE_STATE.update(value => {
                if (value.state) {
                    value.state.pokemonsAppearing = false;
                }
                return value;
            });
        }, 3500);
    }
}
