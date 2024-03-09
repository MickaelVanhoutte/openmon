<svelte:options customElement="open-mon"/>

{#if saveContext?.saves.length === 0 || saveContext.newGame}
    <PlayerCreation bind:saveContext/>
{/if}
{#if saveContext?.saves.length > 0 && !saveContext?.selected && !saveContext.newGame}
    <LoadSave bind:saveContext/>
{/if}
{#if saveContext?.selected}
    {#if battleState && !battleState.starting}
        <Battle bind:save={saveContext.selected}/>
    {:else}
        <World bind:save={saveContext.selected} bind:saveContext/>
    {/if}
{/if}

{#if rotate}
    <div class="rotate">
        <img src="src/assets/common/rotate.gif" alt="Please rotate your device"/>
    </div>
{/if}

<script lang="ts">
    import "@abraham/reflection";
    import LoadSave from "./components/saves/LoadSave.svelte";
    import World from "./components/World.svelte";
    import Battle from "./components/battle/Battle.svelte";
    import PlayerCreation from "./components/saves/PlayerCreation.svelte";
    import {BattleState} from "./js/battle/battle";
    import {SaveContext} from "./js/saves/saves";
    import {BATTLE_STATE} from "./js/const";
    import {onMount} from "svelte";

    /**
     * Main component, handling screens transitions
     */

    export let saveContext = new SaveContext();
    // TODO : should be in the World component (battle fade)
    let battling: boolean;
    let battleState: BattleState | undefined;

    let rotate = false;

    BATTLE_STATE.subscribe(value => {
        battleState = value.state;
    });

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
