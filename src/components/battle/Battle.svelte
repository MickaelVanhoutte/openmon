<div class="battle">
    <div bind:this={gifsWrapper} class="wrapper">

    </div>

    <!-- UI -->
    <EnemyInfo/>
    <AllyInfo/>
    <ActionBar bind:switchOpened={switchOpened} bind:bagOpened={bagOpened}/>

    <!-- Menus -->
    {#if switchOpened}
        <PokemonList {save} {isBattle} bind:switchOpened={switchOpened} zIndex={zIndexNext}
                     onChange={(pkm) => !!pkm && pkm !==0 && sendSwitchAction(pkm)}/>
    {/if}

    {#if changePokemon}
        <PokemonList {save} {isBattle} bind:forceChange={changePokemon} bind:switchOpened={switchOpened}
                     zIndex={zIndexNext}
                     onChange={(pkm) => !!pkm && pkm !==0 && send(pkm)}/>
    {/if}

    {#if bagOpened}
        <Bag {save} {isBattle} bind:bagOpened zIndex={zIndexNext} onChange="{(result) => sendObjectAction(result)}"/>
    {/if}
</div>
<script lang="ts">

    import {ActionsContext, BattleContext, BattleResult, BattleState} from "../../js/battle/battle";
    import {Position} from "../../js/sprites/drawers";
    import {onMount} from "svelte";
    import ActionBar from "./ActionBar.svelte";
    import EnemyInfo from "./EnemyInfo.svelte";
    import AllyInfo from "./AllyInfo.svelte";
    import type {SelectedSave} from "../../js/saves/saves";
    import {BATTLE_ACTX, BATTLE_STATE, ITEMS} from "../../js/const";
    import PokemonList from "../menus/pokemon-list/PokemonList.svelte";
    import type {PokemonInstance} from "../../js/pokemons/pokedex";
    import Bag from "../menus/bag/Bag.svelte";
    import {Pokeball} from "../../js/items/items";
    import {BagObject, SwitchAction} from "../../js/battle/actions";

    /**
     * Battle screen component, handles pokemons display.
     *
     */

    export let gifsWrapper: HTMLDivElement;
    export let save: SelectedSave;
    export let switched = false;
    export let isBattle = true;
    /*
    Menus state
     */
    let switchOpened = false;
    let bagOpened = false;
    let zIndexNext = 8;
    let drawInterval: number;

    let battleLoopContext = {
        then: Date.now(),
        fpsInterval: 1000 / 18,
        goDown: true,
        frameElapsed: 0,
        id: 0,
        debug: false,
        allydrawn: false,
        opponentdrawn: false,
        bgDrawn: false
    }

    let ally: HTMLImageElement;
    let opponent: HTMLImageElement;

    let battleState: BattleState | undefined;
    let actCtx: ActionsContext | undefined;

    $:changePokemon = actCtx?.changePokemon;
    $:{
        if (actCtx?.opponentSwitch) {
            battleLoopContext.opponentdrawn = false;
            actCtx.opponentSwitch = false;
        }
    }

    BATTLE_STATE.subscribe(value => {
        battleState = value.state;
    });

    BATTLE_ACTX.subscribe(value => {
        actCtx = value;
    });

    if (battleState) {
        battleState.onPokemonChange = () => {
            // Redraw
            battleLoopContext.allydrawn = false;
        }

        battleState.onClose = (result: BattleResult) => {
            if (!result.win) {
                // tp back to the start
                this.save.map.playerMovedOffset = new Position(0, 0);
            } else if (result.caught) {
                // add caught pokemon to team if space or in the box
                if (save.player.monsters.length < 6) {
                    save.player.monsters.push(result.caught);
                } else {
                    // first available space in boxes
                    save.boxes[save.boxes.indexOf(save.boxes.find(box => !box.isFull()))].add(result.caught);
                }
            }
            setTimeout(() => {
                // animate the battle closing
                battleState = undefined;
                BATTLE_STATE.set({state: undefined});
            }, 2000);
        }
    }


    function draw() {

        drawInterval = setInterval(() => {
            if (!battleLoopContext.bgDrawn) {
                let bg = document.createElement('img') as HTMLImageElement;
                bg.src = 'src/assets/battle/battle-grass.png';
                bg.classList.add('battle-bg');
                bg.onload = () => {
                    gifsWrapper.appendChild(bg);
                    battleLoopContext.bgDrawn = true;
                }
            }


            if (!battleState?.pokemonsAppearing) {

                // animated gifs, handle them outside the canvas
                // TODO : handle gender/shinys
                if (!battleLoopContext.opponentdrawn) {
                    if(!opponent){
                        opponent = document.createElement('img') as HTMLImageElement;
                        opponent.classList.add('opponent-sprite');
                    }
                    if(opponent) {
                        opponent.src = actCtx?.cOpponentMons.sprites?.male?.front.frame1 || 'src/assets/monsters/bw/0.png';
                        opponent.onload = () => {

                            opponent.style.setProperty('--width', opponent.naturalWidth + 'px');
                            opponent.style.setProperty('--height', opponent.naturalHeight + 'px');
                            gifsWrapper.appendChild(opponent);
                            battleLoopContext.opponentdrawn = true;
                        }
                    }
                }
                if (!battleLoopContext.allydrawn) {
                    console.log('redraw');
                    if (!ally) {
                        ally = document.createElement('img') as HTMLImageElement;
                        ally.classList.add('ally-sprite');
                    }
                    if (ally) {
                        ally.src = actCtx?.cPlayerMons.sprites?.male?.back.frame1 || 'src/assets/monsters/bw/0.png';
                        ally.onload = () => {
                            ally.style.setProperty('--width', ally.naturalWidth + 'px');
                            ally.style.setProperty('--height', ally.naturalHeight + 'px');
                            gifsWrapper.appendChild(ally);
                            battleLoopContext.allydrawn = true;
                        }
                    }
                }

            }
        }, 200);
    }

    /*
    Handle actions from menus (bag, switch)
     */

    function sendSwitchAction(newMonster: PokemonInstance) {
        if (actCtx?.cPlayerMons) {
            battleState?.selectAction(new SwitchAction(newMonster));
        }
    }

    function send(pokemon: PokemonInstance) {
        // TODO this code should be in the battle state
        if (battleState && actCtx?.cPlayerMons) {
            let pkmnIndex = actCtx.player.monsters.indexOf(pokemon);
            // exchange 0 and pkmnIndex in the array
            [actCtx.player.monsters[0], actCtx.player.monsters[pkmnIndex]] = [actCtx.player.monsters[pkmnIndex], actCtx.player.monsters[0]];
            actCtx.cPlayerMons = actCtx.player.monsters[0];
            actCtx.participants.add(actCtx.cPlayerMons);
            actCtx.changePokemon = false;
            actCtx.currentMessage = `What should ${actCtx.cPlayerMons.name} do?`;
            BATTLE_STATE.set(new BattleContext(battleState));
            battleLoopContext.allydrawn = false;
        }
    }

    function sendObjectAction(result: { item: number, target?: PokemonInstance }) {
        let itm = ITEMS.getItem(result.item)?.instanciate();
        if (result.target && actCtx) {
            if (itm && battleState && itm.doesApply(result.target, actCtx?.cPlayerMons, actCtx)) {
                battleState?.selectAction(new BagObject(result.item, result.target, actCtx.cPlayerMons, actCtx.player));
                bagOpened = false;
            } else {
                //TODO message
                alert('This item cannot be used here');
            }
        } else if (itm instanceof Pokeball && battleState && actCtx && itm.doesApply(actCtx.cOpponentMons, actCtx.cPlayerMons, actCtx)) {
            battleState?.selectAction(new BagObject(result.item, actCtx.cOpponentMons, actCtx.cPlayerMons, actCtx.player));
            bagOpened = false;
        } else {
            //TODO message
            alert('This item cannot be used here');
        }

    }


    onMount(() => {
        draw();
        window.addEventListener('keydown', (e) => {
            if (e.key === 'x') {
                battleLoopContext.debug = !battleLoopContext.debug;
            }
        });
        return () => {
            clearInterval(drawInterval);
        }
    });
</script>

<style lang="scss">

  .battle {
    z-index: 7;
    width: 100dvw;
    height: 100dvh;
    overflow: hidden;
    position: relative;
    margin: auto;
  }

  .wrapper {
    font-size: 23px;
  }

  .wrapper :global(.ally-sprite) {
    position: absolute;
    bottom: 25%;
    left: calc(25% - var(--width) / 2);
    z-index: 7;
  }

  .wrapper :global(.opponent-sprite) {
    position: absolute;
    bottom: 44%;
    right: calc(25% - var(--width) / 2);
    z-index: 7;
  }

  .wrapper :global(.battle-bg) {
    z-index: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
