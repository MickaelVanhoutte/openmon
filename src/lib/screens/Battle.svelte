<div class="battle">
    <div bind:this={gifsWrapper} class="wrapper">

    </div>

    <!-- UI -->
    <EnemyInfo/>
    <AllyInfo/>
    <ActionBar bind:switchOpened={switchOpened} bind:bagOpened={bagOpened}/>

    {#if switchOpened}
        <PokemonList {save} {isBattle} bind:switchOpened={switchOpened} zIndex={zIndexNext}
                     onChange={(pkm) => !!pkm && pkm !==0 && sendSwitchAction(pkm)}/>
    {/if}

    {#if changePokemon}
        <PokemonList {save} {isBattle} bind:forceChange={changePokemon} bind:switchOpened={switchOpened} zIndex={zIndexNext}
                     onChange={(pkm) => !!pkm && pkm !==0 && send(pkm)}/>
    {/if}

    {#if bagOpened}
        <Bag {save} {isBattle} bind:bagOpened zIndex={zIndexNext} onChange="{(item) => sendObjectAction(item)}"/>
    {/if}
</div>
<script lang="ts">

    import {BagObject, BattleContext, BattleState, SwitchAction} from "../js/battle/battle";
    import {Position} from "../js/sprites/drawers";
    import {onMount} from "svelte";
    import ActionBar from "../ui/battle/ActionBar.svelte";
    import EnemyInfo from "../ui/battle/EnemyInfo.svelte";
    import AllyInfo from "../ui/battle/AllyInfo.svelte";
    import type {SelectedSave} from "../js/saves/saves";
    import {BATTLE_STATE} from "../js/const";
    import PokemonList from "../ui/main/PokemonList.svelte";
    import type {PokemonInstance} from "../js/pokemons/pokedex";
    import Bag from "../ui/main/Bag.svelte";
    import type {AItem} from "../js/items/items";

    export let gifsWrapper: HTMLDivElement;
    export let save: SelectedSave;

    export let switched = false;

    let switchOpened = false;

    let bagOpened = false;

    let zIndexNext = 8;

    export let isBattle = true;

    let battleState: BattleState | undefined;

    $:changePokemon = battleState?.changePokemon;

    BATTLE_STATE.subscribe(value => {
        battleState = value.state;
    });

    if (battleState) {
        battleState.onPokemonChange = () => {
            battleLoopContext.allydrawn = false;
        }

        battleState.onClose = (win: boolean) => {
            if (!win) {
                // tp back to the start
                this.save.map.playerMovedOffset = new Position(0, 0);
            }
            setTimeout(() => {
                // animate the battle closing
                battleState = undefined;
                BATTLE_STATE.set({state: undefined});
                //window.cancelAnimationFrame(battleLoopContext.id);
            }, 2000);
        }
    }

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

    function battle() {

        setInterval(() => {
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
                if (!battleLoopContext.opponentdrawn) {

                    opponent = document.createElement('img') as HTMLImageElement;
                    opponent.classList.add('opponent-sprite');
                    opponent.src = battleState?.opponentCurrentMonster.sprites?.male?.front.frame1 || 'src/assets/monsters/bw/0.png';
                    opponent.onload = () => {

                        opponent.style.setProperty('--width', opponent.naturalWidth + 'px');
                        opponent.style.setProperty('--height', opponent.naturalHeight + 'px');
                        gifsWrapper.appendChild(opponent);
                        battleLoopContext.opponentdrawn = true;
                    }
                }
                if (!battleLoopContext.allydrawn) {
                    console.log('redraw');
                    if (!ally) {
                        ally = document.createElement('img') as HTMLImageElement;
                        ally.classList.add('ally-sprite');
                    }
                    if (ally) {
                        ally.src = battleState?.playerCurrentMonster.sprites?.male?.back.frame1 || 'src/assets/monsters/bw/0.png';
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

    function sendSwitchAction(newMonster: PokemonInstance) {
        if (battleState?.playerCurrentMonster) {
            battleState?.selectAction(new SwitchAction(newMonster));
        }
    }

    function send(pokemon: PokemonInstance) {
        // TODO this code should be in the battle state
        if (battleState?.playerCurrentMonster) {
            let pkmnIndex = battleState.player.monsters.indexOf(pokemon);
            // exchange 0 and pkmnIndex in the array
            [battleState.player.monsters[0], battleState.player.monsters[pkmnIndex]] = [battleState.player.monsters[pkmnIndex], battleState.player.monsters[0]];
            battleState.playerCurrentMonster = battleState.player.monsters[0];
            battleState.participants.add(this.playerCurrentMonster);
            battleState.changePokemon = false;
            battleState.currentMessageV = `What should ${battleState.playerCurrentMonster.name} do?`;
            BATTLE_STATE.set(new BattleContext(battleState));
            battleLoopContext.allydrawn = false;
        }
    }

    function sendObjectAction(item: { item: number, target: PokemonInstance }) {

        // todo check if item can be applied before sending
        if (battleState?.playerCurrentMonster) {
            battleState?.selectAction(new BagObject(item.item, item.target, battleState.playerCurrentMonster, battleState.player));
        }
        bagOpened = false;
    }


    /**
     * From battle
     * Battle -> Bag (item) -> PokemonList (pokemon)
     *           onchange(pokemon, item)  <- onchange(pokemont)
     *
     * From world
     * World -> Bag (item) -> PokemonList (pokemon) : use
     *
     * World -> PokemonList (pokemon) -> bag (item) : use
     *
     *
     */

    onMount(() => {
        battle();
        window.addEventListener('keydown', (e) => {
            if (e.key === 'x') {
                battleLoopContext.debug = !battleLoopContext.debug;
            }
        });
    });
</script>

<style lang="scss">

  .battle {
    z-index: 7;
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
    //border-radius: 0 0 5% 20% ;
  }

  /*  @media screen and (max-width: 1100px) {
      .wrapper :global(.ally-sprite) {
        width: calc(var(--width) * .75);
        height: calc(var(--height) * .75);
        bottom: 30%;
      }

      .wrapper :global(.opponent-sprite) {
        width: var(--width);
        height: var(--height);
        bottom: 57%;
      }

      .wrapper :global(.battle-bg) {
        height: 70%;
      }
    }*/
</style>
