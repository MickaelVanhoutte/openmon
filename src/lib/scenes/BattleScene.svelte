<ActionBar bind:opened={opened}/>
<AllyInfo bind:opened={opened} bind:monster={currentMonster}/>
<EnemyInfo bind:opened={opened} bind:monster={opponent}/>

<div class="battleStart" class:hide={opened} class:animate={battleStart}>
</div>

<script lang="ts">
    import AllyInfo from "./battle/AllyInfo.svelte";
    import ActionBar from "./battle/ActionBar.svelte";
    import EnemyInfo from "./battle/EnemyInfo.svelte";
    import {Character} from "../js/model/player";
    import type {Monster} from "../js/model/monster";

    export let opened;
    export let battleStart;

    export let opponent: Monster;

    export let player: Character;

    export let currentMonster = player?.monsters?.at(0);
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
