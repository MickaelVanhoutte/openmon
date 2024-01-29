<div class="action-bar" class:opened={opened}>

    <div class="info">
        <div class="_inner">
            {#if !moveOpened}
                {battleState?.currentMessage}
            {:else}

            {/if}
        </div>
    </div>

    {#if moveOpened}

        <div class="moves">
            {#each battleState.playerPokemon.moves as move}
                <button class="action-btn" style="--color:#dc5959" disabled="{!battleState?.isPlayerTurn}"
                        on:click={() => battleState.selectAction(move)}>
                    {move.name}
                </button>
            {/each}
        </div>

    {:else}
        <div class="actions">

            <button class="action-btn" style="--color:#dc5959" disabled="{!battleState?.isPlayerTurn}"
                    on:click={toggleMoveSelection}>
                FIGHT
            </button>

            <button class="action-btn" style="--color:#eca859" disabled="{!battleState?.isPlayerTurn}">
                BAG
            </button>

            <button class="action-btn" style="--color:#7EAF53" disabled="{!battleState?.isPlayerTurn}">
                POKEMONS
            </button>

            <button class="action-btn" style="--color:#599bdc" disabled="{!battleState?.isPlayerTurn}"
                    on:click={escape}>
                RUN
            </button>

        </div>
    {/if}

</div>

<script lang="ts">
    import {BattleState} from "../../js/model/battle";
    import {RunAway} from "../../js/model/battle";

    export let opened;
    let moveOpened = false;

    export let battleState: BattleState;

    console.log(battleState);

    function toggleMoveSelection() {
        moveOpened = !moveOpened;
    }

    function escape() {
        console.log(battleState)
        battleState.selectAction(new RunAway());
    }
</script>

<style lang="scss">
  .action-bar {
    opacity: 0;
    visibility: hidden;

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

    &.opened {
      opacity: 1;
      visibility: visible;
      bottom: 0;
    }

    .info {

      width: 50%;
      height: 100%;
      font-size: 64px;
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
      }
    }

    .actions {
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

  .action-btn {
    background-color: var(--color);

    font-size: 64px;
    color: white;
    border-radius: 24px;
    border: 6px solid #595b59;
    font-family: pokemon, serif;

    transition: color 0.3s ease-in-out, opacity 0.3s ease-in-out;
    flex: 49%;
  }

  .action-btn:hover {
    cursor: pointer;
    opacity: .96;
    color: #262626;
  }

  @media (max-width: 1280px) {
    .action-btn {
      font-size: 48px;
      flex: 30%;
    }
  }

</style>
