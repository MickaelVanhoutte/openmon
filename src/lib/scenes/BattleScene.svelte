{#if battleState}
    <ActionBar bind:opened={opened} bind:battleState={battleState}/>
    <AllyInfo bind:opened={opened} bind:monster={battleState.playerCurrentMonster}/>
    <EnemyInfo bind:opened={opened} bind:monster={battleState.opponentCurrentMonster}/>
{/if}

<div class="battleStart" class:hide={opened} class:animate={battleStart}>
</div>

<script lang="ts">
    import AllyInfo from "./battle/AllyInfo.svelte";
    import ActionBar from "./battle/ActionBar.svelte";
    import EnemyInfo from "./battle/EnemyInfo.svelte";
    import type {BattleState} from "../js/model/battle";

    export let opened;
    export let battleStart;

    export let battleState: BattleState;
</script>

<style lang="scss">
  .battleStart {

    opacity: 0;
    visibility: hidden;
    background: #000000;
    height: 100dvh;
    width: 100dvw;
    position: absolute;
    top: 0;
    left: 0;
    transition: opacity 0.5s ease-in-out;
    z-index: 2;

    &.animate {
      visibility: visible;
      animation: animate 2s ease-in-out;
    }

    &.hide {
      visibility: hidden;
      opacity: 0;
    }
  }

  @media screen and (max-width: 1100px) and (orientation: portrait) {
    .battleStart {
      height: 100dvw;
      width: 100dvh;
    }
  }

  @keyframes animate {
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
</style>
