<svelte:options customElement="open-mon"/>

{#if saveContext?.saves.length === 0 || saveContext.newGame}
    <PlayerCreation bind:saveContext/>
{/if}
{#if saveContext?.saves.length > 0 && !saveContext?.selected && !saveContext.newGame}
    <LoadSave bind:saveContext/>
{/if}
{#if saveContext?.selected}
    {#if battleState && !battleState.starting}
        <div class="battle-wrapper">
            <Battle bind:save={saveContext.selected}/>
        </div>
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
    import LoadSave from "./lib/screens/LoadSave.svelte";
    import World from "./lib/screens/World.svelte";
    import Battle from "./lib/screens/Battle.svelte";
    import PlayerCreation from "./lib/screens/PlayerCreation.svelte";
    import {BattleState} from "./lib/js/battle/battle";
    import {SaveContext} from "./lib/js/saves/saves";
    import {BATTLE_STATE} from "./lib/js/const";
    import {onMount} from "svelte";

    export let saveContext = new SaveContext();

    let battling: boolean;
    let battleState: BattleState | undefined;
    let endingBattle = false;

    let rotate = false;

    BATTLE_STATE.subscribe(value => {
        battleState = value.state;
        if (value.state && value.state.ending) {
            endingBattle = true;
            setTimeout(() => {
                endingBattle = false;
            }, 4000);
        }
    });

    // ios zoom fix
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        window.document.addEventListener('touchmove', e => {
            if (e.scale !== 1) {
                e.preventDefault();
            }
        }, {passive: false});
    }

    window.addEventListener('beforeunload', function (event) {
        event.preventDefault();

        event.returnValue = 'Leaving already ?';
    });

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

  .battle-wrapper {
    z-index: 1;
    width: auto;
    max-width: 100dvh;
    height: 100dvh;
    overflow: hidden;
    position: relative;
    margin: auto;
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


</style>
