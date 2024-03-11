<div class="enemy-info">

    <div class="name-lvl">
        <span>{battleCtx?.opponentPokemon?.name}</span>
        <span>Lv.{battleCtx?.opponentPokemon.level}</span>
    </div>

    <div class="hp-status">
        <div class="status">
            {#if battleCtx?.opponentPokemon?.status}
                {battleCtx?.opponentPokemon?.status?.abr}
            {/if}
        </div>

        <div class="hp">
            <span>HP</span>
            <div class="progressbar-wrapper">
                <div class="progressbar" class:warning={percent <= 50} class:danger={percent < 15 }
                     style="--width:{percent + '%'}"></div>
            </div>
        </div>
    </div>


</div>

<script lang="ts">

    import type {GameContext} from "../../js/context/gameContext";
    import {BattleContext} from "../../js/context/battleContext";

    /**
     * Opponent HP bar
     * TODO : status style, team pokeballs;
     * TODO: use the same component for player and opponent, handle position in Battle.svelte ?
     */

    export let context: GameContext;
    export let battleCtx: BattleContext;

    let currentHp = 0;
    let percent = 0;

    battleCtx.currentAction.subscribe((_value) => {
        currentHp = battleCtx?.opponentPokemon?.currentHp || 0;
        percent = Math.floor(currentHp * 100 / battleCtx.opponentPokemon.currentStats.hp);
    });

</script>

<style lang="scss">

  @keyframes appear {
    from {
      left: -30%;
    }
    to {
      left: 2%;
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-2px);
    }
  }

  .enemy-info {
    z-index: 7;

    height: fit-content;
    min-width: 30%;
    position: absolute;
    top: 2%;
    left: -30%;

    border-radius: 10px;

    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: space-evenly;
    box-sizing: border-box;

    font-size: 24px;

    animation: appear .5s ease-in forwards, bounce 2s ease-in-out infinite;

    .name-lvl {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 28px;
      font-weight: 500;
      text-shadow: 1px 1px 1px #787b7e;
    }

    .hp-status {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }

    .status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .hp {

      width: 100%;
      display: flex;
      background-color: #262626;
      color: orange;
      align-items: center;
      justify-content: space-evenly;
      border-radius: 5px;
      padding: 2px;

      & > span {
        padding: 0 12px;
        font-weight: bold;
      }

      .progressbar-wrapper {

        height: 14px;
        width: 100%;
        background-color: #595b59;
        border-radius: 4px;
        border: 2px solid white;

        .hp-value {
          position: absolute;
        }

        .progressbar {
          width: var(--width);
          height: 100%;
          background: rgb(184, 244, 166);
          background: linear-gradient(0deg, rgb(86, 170, 58) 0%, rgb(86, 170, 58) 50%, rgb(86, 170, 58) 100%);
          border-radius: 2px;
          display: flex;
          text-align: center;
          align-items: center;
          justify-content: center;
          transition: width 1s ease-in-out;

          &.warning {
            background: rgb(255, 241, 164);
            background: linear-gradient(0deg, rgba(255, 194, 16, 1) 0%, rgba(255, 194, 16, 1) 50%, rgba(255, 194, 16, 1) 100%);
          }

          &.danger {
            background: rgb(244, 177, 159);
            background: linear-gradient(0deg, rgba(223, 85, 48, 1) 0%, rgba(223, 85, 48, 1) 50%, rgba(223, 85, 48, 1) 100%);
          }
        }
      }
    }
  }

</style>
