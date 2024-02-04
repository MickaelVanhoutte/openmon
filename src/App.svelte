<svelte:options customElement="open-mon"/>

{#if saveContext && pokedex?.ready}
    {#if context}

        {#if battleState && !battleState.starting}
            <div class="battle-wrapper">
                <Battle bind:context
                        bind:canvas={canvas}
                        bind:pokedex={pokedex}>
                </Battle>

                <!-- UI -->
                <EnemyInfo/>
                <AllyInfo/>
                <ActionBar/>
            </div>
        {:else}
            <World bind:context
                   bind:canvas={canvas}
                   bind:pokedex={pokedex}/>
        {/if}

    {:else}
        <svelte:component this="{saveContext?.saves.length > 0 && !saveContext?.fresh ? LoadSave : PlayerCreation}"
                          bind:saveContext
                          bind:pokedex={pokedex}
        >
        </svelte:component>
    {/if}
{/if}

{#if battleState && battleState?.starting}
    <div class="battleStart"></div>
{/if}

{#if endingBattle}
    <div class="battleEnd"></div>
{/if}


<canvas bind:this={canvas} id="main" width="1024" height="1024"></canvas>


<script lang="ts">

    import {Pokedex} from "./lib/js/pokemons/pokedex";
    import LoadSave from "./lib/screens/LoadSave.svelte";
    import World from "./lib/screens/World.svelte";
    import Battle from "./lib/screens/Battle.svelte";
    import PlayerCreation from "./lib/screens/PlayerCreation.svelte";
    import pokedexJson from "./assets/data/final/pokedexBW-animated.json";
    import {Save, SaveContext} from "./lib/js/saves/saves";
    import {onMount} from "svelte";
    import {BATTLE_STATE, BattleState} from "./lib/js/battle/battle";
    import ActionBar from "./lib/ui/battle/ActionBar.svelte";
    import AllyInfo from "./lib/ui/battle/AllyInfo.svelte";
    import EnemyInfo from "./lib/ui/battle/EnemyInfo.svelte";

    export let canvas;

    export let pokedex = new Pokedex(pokedexJson);

    let saves: Save[] = localStorage.getItem('saves') && JSON.parse(localStorage.getItem('saves')).map((save: any) => {
        Object.setPrototypeOf(save, Save.prototype);
        save.setPrototypes();
        return save;
    }) || [];

    let battling: boolean;

    let saveContext = new SaveContext(saves);

    let battleState: BattleState | undefined;
    let endingBattle = false;

    BATTLE_STATE.subscribe(value => {
        console.log('battle state', value);
        battleState = value.state;
        if (value.state && value.state.ending) {
            endingBattle = true;
            setTimeout(() => {
                endingBattle = false;
            }, 4000);
        }
    });

    // todo passer image scale
    let imageScale = 3;
    let tileSizeInPx = 16 * imageScale;

    $:context = saveContext && saveContext.save ? saveContext.save : null;


    onMount(() => {
        resize();
    });

    function resize() {

    }


    window.addEventListener('resize', () => {
        resize();
    });

    window.addEventListener('orientationchange', () => {
        resize();
    });


</script>

<style lang="scss">

  canvas {
    z-index: -1;
    width: 1024px;
    height: auto;
    overflow: hidden;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .battle-wrapper {
    z-index: 1;
    width: auto;
    max-width: 100dvh;
    height: 100vh;
    overflow: hidden;
    position: relative;
    margin: auto;
  }

  @media screen and (orientation: portrait) {
    canvas {
      width: auto;
      height: 1024px;
    }
  }

  @media screen  and (orientation: landscape){
    .battle-wrapper {
      width: 100dvw;
      max-width: 100dvw;
      height: 100dvh;
      overflow: hidden;
    }
  }

  .battleStart {
    opacity: 0;
    background: #000000;
    height: 100dvh;
    width: 100dvw;
    position: absolute;
    top: 0;
    left: 0;
    transition: opacity 0.5s ease-in-out;
    z-index: 2;
    animation: blink 2s ease-in-out;
  }

  @keyframes blink {
    0% {
      opacity: 1;
    }
    20% {
      opacity: 0;
    }
    40% {
      opacity: 1;
    }
    60% {
      opacity: 0;
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .battleEnd {
    opacity: 0;
    background: #000000;
    height: 100dvh;
    width: 100dvw;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    animation: fade-out 4s ease-in-out;
  }

  @keyframes fade-out {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }


  /*

  #canvas-wrapper {
    width: 100dvw;
    height: 100dvh;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    -webkit-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);


    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100dvw;
      height: 100dvh;
    }
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100vh;

    &.ready {
      opacity: .2;
    }
  }

  .u-swing {
    animation: swing 3000ms infinite;
  }

  @keyframes swing {
    20% {
      -webkit-transform: rotate(15deg);
      transform: rotate(15deg)
    }

    40% {
      -webkit-transform: rotate(-10deg);
      transform: rotate(-10deg)
    }

    60% {
      -webkit-transform: rotate(5deg);
      transform: rotate(5deg)
    }

    80% {
      -webkit-transform: rotate(-5deg);
      transform: rotate(-5deg)
    }

    to {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg)
    }
  }

  $size: 120px;

  .o-pokeball {
    width: $size;
    height: $size;
    border-radius: $size;
    border: solid calc($size / 25) black;
    position: relative;
    background: linear-gradient(to bottom, #EEEEEE 0%, #FFFFFF 100%);;
    margin: 10px auto;

    &:before,
    &:after {
      content: "";
      display: block;
    }

    &,
    &:before,
    &:after {
      transition: all 600ms cubic-bezier(.67, .4, .36, .75);
    }

    &:before {
      width: $size;
      height: calc($size / 2) - calc($size / 25 / 2);
      border-bottom: solid calc($size / 25) black;
      border-radius: calc($size / 2) calc($size / 2) 0 0;
      background: linear-gradient(to bottom, #d10000 0%, #ff0000 50%);
    }

    &:after {
      content: "";
      width: calc($size / 5);
      height: calc($size / 5);
      background: linear-gradient(to bottom, #fff 0%, #ccc 100%);
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      box-shadow: 0 0 0 calc($size / 50) black,
      0 0 0 calc($size / 25) #ddd,
      0 0 0 calc($size / 14) black,
      0 0 calc($size / 10) calc($size / 17) rgba(0, 0, 0, 0.4);
    }
  }

  .buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 120px;
    position: absolute;
    left: calc(50dvw - 100px);
    top: calc(50dvh - 40px);

    .letsgo {
      position: relative;

      .pika {
        width: 200px;
        height: 200px;
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 1;
      }

      .start-btn {
        width: 200px;
        height: 80px;
        border-radius: 16px;
        position: relative;
        z-index: 2;
        font-family: pokemon, serif;
        font-size: 36px;

        box-shadow: inset #009688 0 0 0 5px,
        inset #059c8e 0 0 0 1px,
        inset #0cab9c 0 0 0 10px,
        inset #1fbdae 0 0 0 11px,
        inset #8ce9ff 0 0 0 16px,
        inset #48e4d6 0 0 0 17px,
        inset #e5f9f7 0 0 0 21px,
        inset #bfecf7 0 0 0 22px;
        text-shadow: 3px 3px 1px #bfecf7;

        cursor: pointer;

        &:hover {

          color: #fff;
          box-shadow: inset #009688 0 0 0 5px;
          text-shadow: none;
          font-weight: bold;
          background: #009688;

          + .pika {
            animation: bounce 1s infinite;
          }
        }
      }

      @keyframes bounce {
        0%, 20%, 53%, 80%, to {
          -webkit-animation-timing-function: cubic-bezier(.215, .61, .355, 1);
          animation-timing-function: cubic-bezier(.215, .61, .355, 1);
          -webkit-transform: translateZ(0);
          transform: translateZ(0)
        }

        40%, 43% {
          -webkit-transform: translate3d(0, -30px, 0);
          transform: translate3d(0, -30px, 0)
        }

        40%, 43%, 70% {
          -webkit-animation-timing-function: cubic-bezier(.755, .05, .855, .06);
          animation-timing-function: cubic-bezier(.755, .05, .855, .06)
        }

        70% {
          -webkit-transform: translate3d(0, -15px, 0);
          transform: translate3d(0, -15px, 0)
        }

        90% {
          -webkit-transform: translate3d(0, -4px, 0);
          transform: translate3d(0, -4px, 0)
        }
      }

    }
  }

  #preview {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  */

</style>
