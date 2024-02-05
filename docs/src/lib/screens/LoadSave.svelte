<div class="load-screen">

    <div class="preview" bind:this={preview}>
        <!-- <div class="player-wrapper" bind:this={playerWrapper}></div>
         <div class="monster-wrapper" bind:this={monsterWrapper}></div>-->
    </div>

    <div class="save-list">
        {#each saveContext.saves as save}
            <div class="save-wrapper">
                <div class="save" tabindex="0"
                     on:click={() =>  selected = save}
                     on:mouseover={() =>  selected = save}
                     on:focus={() =>  selected = save}
                >
                    <p>{new Date(save.date).toUTCString()}</p>
                    <p>{save.name} - lvl {save.player.level || 1}</p>
                </div>
                {#if selected === save}
                    <div class="actions">
                        <button class="go" on:click={handleSubmit}>
                            Continue
                        </button>
                        <button class="erase" on:click={removeSelected}>
                            Erase
                        </button>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
    <form class="new-game" on:submit|preventDefault={startNew}>
        <button type="submit">
            Start a new game
        </button>
    </form>
</div>


<script lang="ts">
    import {Save, SaveContext} from "../js/saves/saves";
    import {onMount} from "svelte";
    import {CHARACTER_SPRITES} from "../js/const";

    export let saveContext: SaveContext;

    export let preview: HTMLDivElement;

    let selected: Save;

    function drawPreview() {
        preview.innerHTML = '';

        let sprite = CHARACTER_SPRITES.getSprite(selected.player.spriteId);
        let playerImg = new Image();
        playerImg.classList.add('player');
        playerImg.src = sprite.front.source;
        playerImg.style.maxHeight = '-webkit-fill-available';
        preview.appendChild(playerImg);

        selected.player.monsters.forEach(monster => {
            let img = new Image();
            img.src = monster.sprites?.male?.front?.frame1 || 'assets/monsters/bw-animated/000.png';
            img.style.maxHeight = '-webkit-fill-available';

            preview.appendChild(img);
        });
    }

    function handleSubmit() {
        console.log('selected', selected);
        saveContext = saveContext.selectSave(selected);
        console.log('start from save', saveContext);
    }

    function removeSelected() {
        saveContext = saveContext.deleteSave(selected);
        console.log('remove save', saveContext);
        this.selected = saveContext.saves[0] || null;
    }

    function startNew() {
        saveContext = saveContext.requestNewGame();
    }

    onMount(() => {
        selected = saveContext.saves[0];
        drawPreview();
    })
</script>

<style lang="scss">

  .preview {
    width: 100%;
    height: 33%;
    display: flex;
    flex-direction: row;
    gap: 8px;
    box-sizing: border-box;
    align-content: center;
    align-items: center;
    justify-content: space-between;

    :global(img) {
      width: calc(100% / 7);
      height: auto;
    }
  }


  .load-screen {
    height: 100dvh;
    width: 100dvw;
    background: #ececec;
    color: #262626;
    box-sizing: border-box;
    padding: 2%;


    .new-game {
      position: absolute;
      bottom: 1%;
      right: 1%;

      button {
        background: #599bdc;
        color: #ececec;
        border: none;
        padding: 8px;
        border-radius: 8px;
        width: 160px;
        height: 32px;
      }
    }

    .save-list {
      height: 70%;
      width: 100%;

      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      overflow-y: scroll;

      .save-wrapper {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        gap: 8px;

        .actions {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .go {
            /* position: absolute;
             right: 1%;
             top: 1%;*/
            background: #262626;
            color: #ececec;
            border: none;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            width: 160px;
            height: 32px;
          }

          .erase {
            /*position: absolute;
            right: 1%;
            top: calc(6% + 32px);*/
            background: #dc5959;
            color: #ececec;
            border: none;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            width: 160px;
            height: 32px;
          }
        }


        .save {
          border: 1px solid #262626;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;

          display: flex;
          flex-direction: column;
          gap: 4px;

          p {
            margin: 0;
          }

        }
      }

    }
  }
</style>
