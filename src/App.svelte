<svelte:options customElement="open-mon"/>

{#if gameContext}
    <!-- game started -->
    {#if battleCtx !== undefined}
        <Battle bind:context={gameContext} bind:battleCtx={battleCtx} />
    {:else if gameContext.overWorldContext !== undefined}
        <World bind:context={gameContext} bind:overWorldCtx={gameContext.overWorldContext} {savesHolder}/>
    {/if}
{:else}
    {#if savesHolder.saves?.length > 0}
        <!-- select a save / start new -->
        <LoadSave {savesHolder}/>
    {:else}
        <!-- create a new save -->
        <PlayerCreation {savesHolder}/>
    {/if}

{/if}

{#if rotate}
    <div class="rotate">
        <img src="src/assets/common/rotate.gif" alt="Please rotate your device"/>
    </div>
{/if}

<script lang="ts">
    import "@abraham/reflection";
    import {onMount} from "svelte";
    import Battle from "./components/battle/Battle.svelte";
    import World from "./components/world/World.svelte";
    import LoadSave from "./components/saves/LoadSave.svelte";
    import PlayerCreation from "./components/saves/PlayerCreation.svelte";
    import {SaveContext, SavesHolder} from "./js/context/savesHolder";
    import type {GameContext} from "./js/context/gameContext";
    import {fade} from 'svelte/transition';
    import type {BattleContext} from "./js/context/battleContext";

    /**
     * Main component, handling screens transitions
     */
    console.log('init App.svelte');

    const savesHolder = new SavesHolder();
    let gameContext:GameContext;
    savesHolder.selectedSave$.subscribe((value: SaveContext | undefined) => {
        if (value) {
            gameContext = value.toGameContext();
        }
    });

    let battleCtx: BattleContext | undefined = undefined;
    $: if (gameContext) {
        gameContext.battleContext.subscribe((value) => {
            battleCtx = value;
        });
    }

    let rotate = false;

    // Avoid IOS zoom on double tap
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        window.document.addEventListener('touchmove', e => {
            // @ts-ignore
            if (e.scale !== 1) {
                e.preventDefault();
            }
        }, {passive: false});
    }

    // todo uncomment
    // Avoid leaving game by error
    /* window.addEventListener('beforeunload', function (event) {
         event.preventDefault();
         event.returnValue = 'Leaving already ?';
     });*/

    // Screen orientation checks
    function checkOrientation() {
        rotate = (!window.matchMedia("(orientation: landscape)").matches || window.innerWidth < window.innerHeight);
    }

    window.addEventListener('resize', () => {
        checkOrientation();
    });

    onMount(() => {
        checkOrientation();
    });

</script>

<style lang="scss">

  :root {
    box-sizing: border-box;
    touch-action: none;
    -webkit-touch-callout: none;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;

    * {
      box-sizing: border-box;
      touch-action: none;
      -webkit-touch-callout: none;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      -o-user-select: none;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
  }

  .rotate {
    position: fixed;
    top: 0;
    left: 0;
    width: 100dvw;
    height: 100svh;
    background-color: rgba(0, 0, 0, 1);
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      width: 100dvw;
    }
  }

</style>
