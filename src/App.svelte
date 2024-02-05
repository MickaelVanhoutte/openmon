<svelte:options customElement="open-mon"/>

{#if saveContext}
    {#if context}

        {#if battleState && !battleState.starting}
            <div class="battle-wrapper">
                <Battle bind:context
                >
                </Battle>

                <!-- UI -->
                <EnemyInfo/>
                <AllyInfo/>
                <ActionBar/>
            </div>
        {:else}
            <World bind:context
            />
        {/if}

    {:else}
        <svelte:component this="{saveContext?.saves.length > 0 && !saveContext?.fresh ? LoadSave : PlayerCreation}"
                          bind:saveContext
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

<script lang="ts">

    import LoadSave from "./lib/screens/LoadSave.svelte";
    import World from "./lib/screens/World.svelte";
    import Battle from "./lib/screens/Battle.svelte";
    import PlayerCreation from "./lib/screens/PlayerCreation.svelte";
    import {Save, SaveContext} from "./lib/js/saves/saves";
    import {onMount} from "svelte";
    import {BATTLE_STATE, BattleState} from "./lib/js/battle/battle";
    import ActionBar from "./lib/ui/battle/ActionBar.svelte";
    import AllyInfo from "./lib/ui/battle/AllyInfo.svelte";
    import EnemyInfo from "./lib/ui/battle/EnemyInfo.svelte";

    export let canvas;

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

  @media screen and (orientation: landscape) {
    .battle-wrapper {
      width: 100dvw;
      max-width: 100dvw;
      height: 100dvh;
      overflow: hidden;
    }
  }

  @media screen and (orientation: landscape) and (min-width: 1680px) {
    .battle-wrapper {
      width: auto;
      max-width: 1024px;
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


</style>
