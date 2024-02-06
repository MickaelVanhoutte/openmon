<div class="enemy-info">

    <div class="name-lvl">
        <span>{battleState?.opponentCurrentMonster?.name}</span>
        <span>Lv.{battleState?.opponentCurrentMonster.level}</span>
    </div>

    <div class="hp">
        <span>HP</span>
        <div class="progressbar-wrapper">
            <div class="progressbar" class:warning={percent <= 50} class:danger={percent < 15 }
                 style="--width:{percent + '%'}"></div>
        </div>
    </div>

</div>

<script lang="ts">

    import {BattleState} from "../../js/battle/battle";
    import {BATTLE_STATE} from "../../js/const";

    let battleState: BattleState | undefined;

    let currentHp = 0;
    let percent = 0;


    BATTLE_STATE.subscribe(value => {
        battleState = value.state;
        currentHp = battleState?.opponentCurrentMonster?.currentHp || 0;
        percent = Math.floor(currentHp * 100 / battleState?.opponentCurrentMonster?.currentStats.hp);
    });

</script>

<style lang="scss">

  @keyframes appear {
    from {
      left: -30%;
    }
    to {
      left: 1%;
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
    z-index: 9;

    background-color: antiquewhite;

    height: fit-content;
    min-width: 36%;
    position: absolute;
    top: 2%;
    left: -30%;

    border: 14px solid #595b59;
    border-radius: 10px;

    padding: 8px 16px;

    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: space-evenly;
    box-sizing: border-box;

    font-size: 46px;

    animation: appear .5s ease-in forwards, bounce 2s ease-in-out infinite;

    .name-lvl {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      //gap: 8px;
    }

    .hp {

      width: 60%;
      display: flex;
      //gap: 16px;
      background-color: #262626;
      color: orange;
      align-items: center;
      justify-content: space-evenly;
      border-radius: 8px;
      padding: 3px;

      span {
        padding: 0 0 0 12px;
        font-weight: bold;
      }

      .progressbar-wrapper {

        height: 24px;
        width: 100%;
        background-color: #595b59;
        border-radius: 4px;
        border: 2px solid white;

        .progressbar {
          width: var(--width);
          height: 100%;
          background: rgb(184, 244, 166);
          background: linear-gradient(0deg, rgba(184, 244, 166, 1) 0%, rgba(86, 170, 58, 1) 30%, rgba(86, 170, 58, 1) 50%, rgba(86, 170, 58, 1) 70%, rgba(184, 244, 166, 1) 100%);
          text-align: center;
          border-radius: 2px;

          transition: width 1s ease-in-out, background 1s ease-in-out 1s;

          &.warning {
            background: rgb(255, 241, 164);
            background: linear-gradient(0deg, rgba(255, 241, 164, 1) 0%, rgba(255, 194, 16, 1) 30%, rgba(255, 194, 16, 1) 50%, rgba(255, 194, 16, 1) 70%, rgba(255, 241, 164, 1) 100%);
          }

          &.danger {
            background: rgb(244, 177, 159);
            background: linear-gradient(0deg, rgba(244, 177, 159, 1) 0%, rgba(223, 85, 48, 1) 30%, rgba(223, 85, 48, 1) 50%, rgba(223, 85, 48, 1) 70%, rgba(244, 177, 159, 1) 100%);
          }
        }
      }
    }
  }

  @media screen and (max-width: 1100px) {
    .enemy-info {
      font-size: 26px;
      border: 8px solid #595b59;

      width: 50%;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      right: 0;

      .name-lvl {
        gap: 8px;
      }

      .hp {
        width: 80%;
        height: 18px;

        .progressbar-wrapper {
          height: 14px;
        }
      }
    }
  }
</style>
