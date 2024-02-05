<svelte:options customElement="open-mon"/>

{#if saveContext.saves.length === 0 || saveContext.newGame}
    <PlayerCreation bind:saveContext/>
{/if}
{#if saveContext.saves.length > 0 && !saveContext.selected && !saveContext.newGame}
    <LoadSave bind:saveContext/>
{/if}
{#if saveContext.selected}
    {#if battleState && !battleState.starting}
        <div class="battle-wrapper">
            <Battle bind:save={saveContext.selected}/>
        </div>
    {:else}
        <World bind:save={saveContext.selected} bind:saveContext/>
    {/if}
{/if}

<script lang="ts">

    import LoadSave from "./lib/screens/LoadSave.svelte";
    import World from "./lib/screens/World.svelte";
    import Battle from "./lib/screens/Battle.svelte";
    import PlayerCreation from "./lib/screens/PlayerCreation.svelte";
    import {BATTLE_STATE, BattleState} from "./lib/js/battle/battle";
    import {SaveContext} from "./lib/js/saves/saves";

    export let saveContext = new SaveContext();

    let battling: boolean;
    let battleState: BattleState | undefined;
    let endingBattle = false;

    BATTLE_STATE.subscribe(value => {
        battleState = value.state;
        if (value.state && value.state.ending) {
            endingBattle = true;
            setTimeout(() => {
                endingBattle = false;
            }, 4000);
        }
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
