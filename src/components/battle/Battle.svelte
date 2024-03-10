<div class="battle">
    <div bind:this={gifsWrapper} class="wrapper">

    </div>

    <!-- UI -->
    <EnemyInfo {context} {battleCtx}/>
    <AllyInfo {context} {battleCtx}/>
    <ActionBar {context} {battleCtx}/>

    <!-- Menus -->
    {#if context.overWorldContext.menus.switchOpened}
        <PokemonList {context} {isBattle} zIndex={zIndexNext}
                     onChange={(pkm) => !!pkm && pkm !==0 && sendSwitchAction(pkm)}/>
    {/if}

    {#if changePokemon}
        <PokemonList {context} {isBattle} bind:forceChange={changePokemon}
                     zIndex={zIndexNext}
                     onChange={(pkm) => !!pkm && pkm !==0 && send(pkm)}/>
    {/if}

    {#if context.overWorldContext.menus.bagOpened}
        <Bag {context} {isBattle} zIndex={zIndexNext} onChange="{(result) => sendObjectAction(result)}"/>
    {/if}
</div>
<script lang="ts">

    import {onMount} from "svelte";
    import ActionBar from "./ActionBar.svelte";
    import EnemyInfo from "./EnemyInfo.svelte";
    import AllyInfo from "./AllyInfo.svelte";
    import PokemonList from "../menus/pokemon-list/PokemonList.svelte";
    import type {PokemonInstance} from "../../js/pokemons/pokedex";
    import Bag from "../menus/bag/Bag.svelte";
    import {Pokeball} from "../../js/items/items";
    import {Position} from "../../js/mapping/positions";
    import {BattleResult} from "../../js/battle/battle-model";
    import {BattleContext} from "../../js/context/battleContext";
    import type {GameContext} from "../../js/context/gameContext";
    import {Switch, UseItem} from "../../js/battle/actions/actions-selectable";
    import type {Character} from "../../js/characters/player";

    /**
     * Battle screen component, handles pokemons display.
     *
     */
    export let context: GameContext;
    export let battleCtx: BattleContext;

    let gifsWrapper: HTMLDivElement;

    export let isBattle = true;

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


    let changePokemon = false;

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

// TODO : animation
            //if (!battleState?.pokemonsAppearing) {

                // animated gifs, handle them outside the canvas
                // TODO : handle gender/shinys
                if (!battleLoopContext.opponentdrawn) {
                    if (!opponent) {
                        opponent = document.createElement('img') as HTMLImageElement;
                        opponent.classList.add('opponent-sprite');
                    }
                    if (opponent) {
                        opponent.src = battleCtx?.opponentPokemon.sprites?.male?.front.frame1 || 'src/assets/monsters/bw/0.png';
                        opponent.onload = () => {

                            opponent.style.setProperty('--width', opponent.naturalWidth + 'px');
                            opponent.style.setProperty('--height', opponent.naturalHeight + 'px');
                            gifsWrapper.appendChild(opponent);
                            battleLoopContext.opponentdrawn = true;
                        }
                    }
                }
                if (!battleLoopContext.allydrawn) {
                    if (!ally) {
                        ally = document.createElement('img') as HTMLImageElement;
                        ally.classList.add('ally-sprite');
                    }
                    if (ally) {
                        ally.src = battleCtx?.playerPokemon.sprites?.male?.back.frame1 || 'src/assets/monsters/bw/0.png';
                        ally.onload = () => {
                            ally.style.setProperty('--width', ally.naturalWidth + 'px');
                            ally.style.setProperty('--height', ally.naturalHeight + 'px');
                            gifsWrapper.appendChild(ally);
                            battleLoopContext.allydrawn = true;
                        }
                    }
                }

           // }
        }, 200);
    }

    /*
    Handle actions from menus (bag, switch)
     */

    function sendSwitchAction(newMonster: PokemonInstance) {
        if (battleCtx?.playerPokemon) {
            battleCtx?.startTurn(new Switch(newMonster, battleCtx.player));
        }
    }

    function send(pokemon: PokemonInstance) {
        // TODO this code should be in the battle state
        if (battleCtx && battleCtx?.playerPokemon) {
            let pkmnIndex = battleCtx.player.monsters.indexOf(pokemon);
            // exchange 0 and pkmnIndex in the array
            [battleCtx.player.monsters[0], battleCtx.player.monsters[pkmnIndex]] = [battleCtx.player.monsters[pkmnIndex], battleCtx.player.monsters[0]];
            battleCtx.playerPokemon = battleCtx.player.monsters[0];
            battleCtx.participants.add(battleCtx.playerPokemon);
            changePokemon = false;
            battleCtx.currentMessage.set(`What should ${battleCtx.playerPokemon.name} do?`);
            //BATTLE_STATE.set(new BattleContext(battleState));
            battleLoopContext.allydrawn = false;
        }
    }

    function sendObjectAction(result: { item: number, target?: PokemonInstance }) {
        let itm = context.ITEMS.getItem(result.item)?.instanciate();
        if (result.target && battleCtx) {
            if (itm && battleCtx && itm.doesApply(result.target, battleCtx?.playerPokemon, battleCtx)) {
                battleCtx?.startTurn(new UseItem(result.item, result.target, battleCtx.playerPokemon, battleCtx.player));
                context.overWorldContext.menus.bagOpened = false;
            } else {
                //TODO message
                alert('This item cannot be used here');
            }
        } else if (itm instanceof Pokeball && battleCtx && itm.doesApply(battleCtx.opponentPokemon, battleCtx.playerPokemon, battleCtx)) {
            battleCtx?.startTurn(new UseItem(result.item, battleCtx.opponentPokemon, battleCtx.playerPokemon, battleCtx.player));
            context.overWorldContext.menus.bagOpened = false;
        } else {
            //TODO message
            alert('This item cannot be used here');
        }

    }


    onMount(() => {
        // set events

        battleCtx.events.onPokemonChange = ((pokemon: PokemonInstance, owner: Character) => {
            // Redraw
            battleLoopContext.allydrawn = false;
            battleLoopContext.opponentdrawn = false;
        });

        battleCtx.events.onPlayerPokemonFaint = ((pokemon: PokemonInstance) => {
            changePokemon = true;
        });


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
