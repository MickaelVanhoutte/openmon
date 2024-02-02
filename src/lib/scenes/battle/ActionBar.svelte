<div class="action-bar" class:show={show}>

    <div class="info">
        <div class="_inner">
            {#if !moveOpened}
                {currentMessage?.toUpperCase()}
            {:else}
                <div class="move-desc">
                    <div class="_desc">
                        <p>
                            {
                                battleState?.playerCurrentMonster?.moves[selectedMoveIdx].description
                                    .replace("$effect_chance", battleState?.playerCurrentMonster?.moves[selectedMoveIdx].effectChance)
                            }
                        </p>
                    </div>
                    <div class="stats">
                        <p> PP :
                            {battleState?.playerCurrentMonster?.moves[selectedMoveIdx].currentPp}
                            / {battleState?.playerCurrentMonster?.moves[selectedMoveIdx].pp}
                        </p>
                        <p> Type : {battleState?.playerCurrentMonster?.moves[selectedMoveIdx].category}</p>
                        <p> Power/ACC
                            {battleState?.playerCurrentMonster?.moves[selectedMoveIdx].power}
                            / {battleState?.playerCurrentMonster?.moves[selectedMoveIdx].accuracy} %
                        </p>
                    </div>
                </div>
            {/if}
        </div>
    </div>


    {#if moveOpened}
        <div class="moves">
            {#each battleState?.playerCurrentMonster?.moves as move, index}
                <button class="action-btn" style="--color:#dc5959" {disabled}
                        class:selected={selectedMoveIdx === index}
                        on:mouseover={() => selectedMoveIdx = index}
                        on:click={() =>selectMove(move)}>
                    {move.name.toUpperCase()}
                </button>
            {/each}
        </div>

    {:else}

        <div class="actions">

            <button class="action-btn" style="--color:#dc5959" {disabled}
                    on:click={toggleMoveSelection} class:selected={ selectedOptionIdx === 0}>
                FIGHT
            </button>

            <button class="action-btn" style="--color:#eca859" {disabled} class:selected={ selectedOptionIdx === 1}>
                BAG
            </button>

            <button class="action-btn" style="--color:#7EAF53" {disabled} class:selected={ selectedOptionIdx === 2}>
                POKEMONS
            </button>

            <button class="action-btn" style="--color:#599bdc" {disabled} class:selected={ selectedOptionIdx === 2}
                    on:click={escape}>
                RUN
            </button>

        </div>
    {/if}

</div>

<script lang="ts">

    import {Attack, BATTLE_STATE, BattleState, RunAway} from "../../js/battle/battle";
    import {onMount} from "svelte";

    let moveOpened = false;
    let show = false;

    let battleState: BattleState | undefined;
    let currentMessage = '';
    let disabled = false;

    BATTLE_STATE.subscribe(value => {
        console.log('battle state changed', value.state);
        battleState = value.state;
        if (value.state) {
            currentMessage = value.state.currentMessageV;
            disabled = !value.state.isPlayerTurnV;
        }
    });

    let selectedMoveIdx = 0;
    let selectedOptionIdx = 0;

    function toggleMoveSelection() {
        moveOpened = !moveOpened;
    }

    function escape() {
        if (battleState) {
            battleState.selectAction(new RunAway(battleState.playerCurrentMonster));
        }
    }

    function selectMove(move) {
        if (battleState) {
            battleState.selectAction(new Attack(move, 'opponent', battleState.playerCurrentMonster));
            moveOpened = false;
        }
    }

    window.addEventListener('keydown', (e) => {
        if (!battleState) {
            return;
        }
        if (e.key === 'ArrowUp') {
            if (moveOpened) {
                selectedMoveIdx = selectedMoveIdx === 0 ? battleState.playerCurrentMonster.moves.length - 1 : selectedMoveIdx - 1;
            } else {
                selectedOptionIdx = selectedOptionIdx === 0 ? 3 : selectedOptionIdx - 1;
            }
        } else if (e.key === 'ArrowDown') {
            if (moveOpened) {
                selectedMoveIdx = selectedMoveIdx === battleState.playerCurrentMonster.moves.length - 1 ? 0 : selectedMoveIdx + 1;
            } else {
                selectedOptionIdx = selectedOptionIdx === 3 ? 0 : selectedOptionIdx + 1;
            }
        } else if (e.key === 'Enter') {
            if (moveOpened) {
                selectMove(battleState.playerCurrentMonster.moves[selectedMoveIdx]);
            } else {
                if (selectedOptionIdx === 0) {
                    toggleMoveSelection();
                } else if (selectedOptionIdx === 3) {
                    escape();
                }
            }
        } else if (e.key === 'Escape') {
            toggleMoveSelection();

        }
    })

    onMount(() => {
        show = true;
    });
</script>

<style lang="scss">

  @keyframes appear {
    from {
      bottom: -25dvh;
    }
    to {
      bottom: 0dvh;
    }
  }

  .action-bar {
    z-index: 9;
    background-color: white;

    height: 25dvh;
    width: 100dvw;
    position: absolute;
    bottom: -25dvh;
    left: 0;

    transition: bottom 0.5s ease-in-out;

    box-shadow: inset #009688 0 0 0 5px,
    inset #059c8e 0 0 0 1px,
    inset #0cab9c 0 0 0 10px,
    inset #1fbdae 0 0 0 11px,
    inset #8ce9ff 0 0 0 16px,
    inset #48e4d6 0 0 0 17px,
    inset #e5f9f7 0 0 0 21px,
    inset #bfecf7 0 0 0 22px;
    text-shadow: 3px 3px 1px #bfecf7;

    display: flex;

    font-size: 64px;

    animation: appear 0.5s ease-in forwards;

    .info {

      width: 50%;
      height: 100%;

      display: flex;
      align-items: center;
      align-content: center;
      justify-content: space-around;
      position: relative;

      ._inner {
        position: absolute;
        left: 17px;
        z-index: 1;
        height: calc(100% - 55px);
        border: 10px solid black;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        text-transform: capitalize;

        .move-desc {
          text-transform: initial;
          font-size: 46px;
          word-break: break-word;
          box-sizing: border-box;
          padding: 0 20px;

          display: flex;
          align-items: center;
          gap: 16px;

          p {
            margin: 0;
          }

          ._desc {
            width: 50%;
          }

          .stats {
            width: 50%;
          }
        }
      }
    }

    .actions, .moves {
      width: 50%;
      height: 100%;
      display: flex;
      background: #FFFFFF;
      border: 14px solid #595b59;
      border-radius: 8px;
      box-sizing: border-box;
      padding: 12px;
      z-index: 2;

      flex-wrap: wrap;
      gap: 12px;

    }
  }

  /*
    @media screen and (max-width: 1100px) and (orientation: portrait) {
      .action-bar  {
        bottom: 0;
        right: 0;
        width: 100dvh;
        height: 33dvw;
        !*font-size: 38px;*!

        .action-btn {
          !*font-size: 32px;*!
        }

        .info ._inner .move-desc {
          !*font-size: 32px;
          gap: 0;*!
        }
      }
    }*/


  .action-btn {
    background-color: var(--color);

    font-size: 64px;
    color: white;
    border-radius: 24px;
    border: 6px solid #595b59;
    font-family: pokemon, serif;

    transition: color 0.3s ease-in-out, opacity 0.3s ease-in-out;
    flex: 48%;

    &:hover, &.selected {
      cursor: pointer;
      opacity: .96;
      color: #262626;
    }

    &[disabled] {
      opacity: .5;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  @media screen and (max-width: 1100px) {
    .action-bar {
      font-size: 32px;

      .actions, .moves {
        padding: 2px;
        gap: 4px;
        border: 8px solid #595b59;

        .action-btn {
          font-size: 32px;
        }
      }

      .info ._inner {
        left: 10px;
        height: calc(100% - 37px);
        border: 8px solid black;

        .move-desc {
          font-size: 32px;
        }
      }
    }
  }
</style>
