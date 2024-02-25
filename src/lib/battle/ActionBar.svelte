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
                                actCtx?.cPlayerMons?.moves[selectedMoveIdx].description
                                    .replace("$effect_chance", actCtx?.cPlayerMons?.moves[selectedMoveIdx].effectChance)
                            }
                        </p>
                    </div>
                    <div class="stats">
                        <p> PP :
                            {actCtx?.cPlayerMons?.moves[selectedMoveIdx].currentPp}
                            / {actCtx?.cPlayerMons?.moves[selectedMoveIdx].pp}
                        </p>
                        <p> Type : {actCtx?.cPlayerMons?.moves[selectedMoveIdx].category}</p>
                        <p> Power/ACC
                            {actCtx?.cPlayerMons?.moves[selectedMoveIdx].power}
                            / {actCtx?.cPlayerMons?.moves[selectedMoveIdx].accuracy} %
                        </p>
                    </div>
                </div>
            {/if}
        </div>
    </div>


    {#if moveOpened}
        <div class="moves">
            {#each actCtx?.cPlayerMons?.moves as move, index}
                <button class="action-btn" style="--color:{typeChart[move.type].color}" {disabled}
                        class:selected={selectedMoveIdx === index}
                        on:mouseover={() => selectMove(index)}
                        on:click={() => launchMove(index, move)}>
                    {move.name.toUpperCase()}
                </button>
            {/each}
        </div>

    {:else}

        <div class="actions">

            <button class="action-btn" style="--color:#dc5959" {disabled}
                    on:click={() => moveOpened=true} class:selected={ selectedOptionIdx === 0}>
                FIGHT
            </button>

            <button class="action-btn" style="--color:#eca859" {disabled} class:selected={ selectedOptionIdx === 1}
                    on:click={openBag}>
                BAG
            </button>

            <button class="action-btn" style="--color:#7EAF53" {disabled} class:selected={ selectedOptionIdx === 2}
                    on:click={switchOpen}>
                POKEMONS
            </button>

            <button class="action-btn" style="--color:#599bdc" {disabled} class:selected={ selectedOptionIdx === 3}
                    on:click={escape}>
                RUN
            </button>

        </div>
    {/if}

</div>

<script lang="ts">

    import {onDestroy, onMount} from "svelte";
    import {BATTLE_ACTX, BATTLE_STATE} from "../js/const";
    import type {MoveInstance} from "../js/pokemons/pokedex";
    import type {BattleState} from "../js/battle/battle";
    import {Attack, RunAway} from "../js/battle/actions";
    import {ActionsContext, typeChart} from "../js/battle/battle";

    export let switchOpened: boolean;

    export let bagOpened: boolean;

    let moveOpened = false;
    let show = false;

    let battleState: BattleState | undefined;
    let actCtx: ActionsContext | undefined;
    let currentMessage = '';
    let disabled = false;
    let selectedMoveIdx = 0;
    let selectedOptionIdx = 0;


    BATTLE_STATE.subscribe(value => {
        battleState = value.state;
    });

    BATTLE_ACTX.subscribe(value => {
        actCtx = value;
        if (value) {
            currentMessage = value.currentMessage;
            disabled = !value.isPlayerTurn;
        }
    });


    function escape() {
        if (battleState && actCtx) {
            battleState.selectAction(new RunAway(actCtx.cPlayerMons));
        }
    }

    function switchOpen() {
        switchOpened = true;
    }

    function openBag() {
        bagOpened = true;
    }

    function selectMove(idx: number) {
        selectedMoveIdx = idx;
    }

    function launchMove(idx: number, move: MoveInstance) {
        if (idx != selectedMoveIdx) {
            selectedMoveIdx = idx;
        } else if (battleState && actCtx) {
            battleState.selectAction(new Attack(move, 'opponent', actCtx.cPlayerMons));
            moveOpened = false;
        }
    }

    const listener = (e) => {
        if (!battleState || !actCtx) {
            return;
        }
        if (!bagOpened && !switchOpened && !disabled) {

            if (e.key === 'ArrowUp') {
                if (moveOpened) {
                    selectedMoveIdx = selectedMoveIdx === 0 ? actCtx.cPlayerMons.moves.length - 1 : selectedMoveIdx - 1;
                } else {
                    selectedOptionIdx = selectedOptionIdx === 0 ? 3 : selectedOptionIdx - 1;
                }
            } else if (e.key === 'ArrowDown') {
                if (moveOpened) {
                    selectedMoveIdx = selectedMoveIdx === actCtx.cPlayerMons.moves.length - 1 ? 0 : selectedMoveIdx + 1;
                } else {
                    selectedOptionIdx = selectedOptionIdx === 3 ? 0 : selectedOptionIdx + 1;
                }
            } else if (e.key === 'Enter') {
                if (moveOpened) {
                    launchMove(selectedMoveIdx, actCtx.cPlayerMons.moves[selectedMoveIdx]);
                } else {
                    if (selectedOptionIdx === 0) {
                        moveOpened = true;
                    } else if (selectedOptionIdx === 1) {
                        openBag();
                    } else if (selectedOptionIdx === 2) {
                        switchOpen();
                    } else if (selectedOptionIdx === 3) {
                        escape();
                    }
                }
            } else if (e.key === 'Escape') {
                moveOpened = false;

            }
        }
    };

    onMount(() => {
        show = true;
        window.addEventListener('keydown', listener);
    });

    onDestroy(() => {
        window.removeEventListener('keydown', listener);
    });
</script>

<style lang="scss">

  @keyframes appear {
    from {
      bottom: -25%;
    }
    to {
      bottom: 1%;
    }
  }

  .action-bar {
    z-index: 7;

    height: 25%;
    width: 98%;
    position: absolute;
    bottom: -25%;
    left: 1%;

    transition: bottom 0.5s ease-in-out;

    text-shadow: 3px 3px 1px #bfecf7;

    display: flex;

    font-size: 26px;

    animation: appear 0.5s ease-in forwards;

    .info {

      width: 50%;
      background: rgb(220, 231, 233);
      background: linear-gradient(180deg, rgba(220, 231, 233, 1) 0%, rgba(255, 255, 255, 1) 50%, rgba(220, 231, 233, 0.713344712885154) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      align-content: center;
      justify-content: space-around;
      position: relative;
      box-sizing: border-box;
      padding: 1%;

      -webkit-box-shadow: 5px 10px 21px 7px #000000;
      box-shadow: 5px 10px 21px 7px #000000;


      ._inner {
        z-index: 1;
        height: 100%;

        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        text-transform: capitalize;
        text-align: center;
        box-sizing: border-box;

        .move-desc {
          text-transform: initial;
          text-align: left;
          font-size: 20px;
          word-break: break-word;
          box-sizing: border-box;
          padding: 0 1%;

          display: flex;
          align-items: center;
          gap: 1%;

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
      border-radius: 8px;
      box-sizing: border-box;
      padding: 0 2%;
      z-index: 2;

      flex-wrap: wrap;
      gap: 8px;

    }
  }

  .action-btn {
    border: 2px solid var(--color);

    font-size: 26px;
    color: white;
    text-shadow: 1px 1px 1px var(--color);
    background-color: rgba(44, 56, 69, 0.84);
    border-radius: 8px;
    font-family: pokemon, serif;

    transition: color 0.3s ease-in-out, opacity 0.3s ease-in-out;
    flex: 48%;
    max-height: 49%;
    max-width: 48%;

    -webkit-box-shadow: 4px 6px 21px 2px #000000;
    box-shadow: 4px 6px 21px 2px #000000;

    &:hover, &.selected {
      cursor: pointer;
      background-color: rgba(44, 56, 69, 0.50);
      color: white;
      text-shadow: none;
    }


    &[disabled] {
      opacity: .5;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  .moves .action-btn {
    font-size: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
</style>
