<div class="moveEdit" class:open={moveEdit} style="--zIndex:{zIndex}">

    {#each data.columns as column}
        {@const cards = data.cards.filter((c) => c.column === column.id)}
        <div class="column"
                use:dropzone={{
				on_dropzone(card_id) {

					let card = data.cards.find((c) => c.id === card_id);
                    console.log(card_id, data.cards, card);
					card.column = column.id;
					data = data;
				}
			}}
        >
            {#if cards.length > 0}
                <div class="cards">
                    {#each cards as card}
                        {@const move = card.value}

                        <div use:draggable={card.id} draggable="true" class="move">
                                 <span style="--bg:{typeChart[move?.type]?.color}"
                                       class="type">{move?.type?.toUpperCase()}</span>

                            <div class="flex-row">
                                <div class="flex-col">
                                    <span class="name">{move?.name}</span>
                                    <span>{move?.category === 'no-damage' ? 'status' : move?.category }</span>
                                </div>

                                <div class="flex-col">
                                    <span>power {move?.power ? move.power : '/'}</span>
                                    <span class="pp">PP {move?.pp}</span>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <p>No moves...</p>
            {/if}
        </div>
    {/each}

</div>


<script lang="ts">
    import {typeChart} from "../../../js/battle/battle.js";
    import type {PokemonInstance} from "../../../js/pokemons/pokedex";
    import {POKEDEX} from "../../../js/const";
    import {dropzone, draggable} from '../../../js/common/dnd';

    export let selectedMons: PokemonInstance;
    export let moveEdit: boolean;
    export let zIndex: number;

    let allMoves = POKEDEX.findById(selectedMons.id)?.result?.moves?.filter(move => move.level <= selectedMons.level) || [];

    let data = {
        columns: [
            {
                id: 1,
                label: 'source',
            },
            {
                id: 2,
                label: 'target',
            }
        ],
        cards: allMoves.map((move, index) => {
            return {
                id: move.id + '',
                column: selectedMons.moves.map(move => move.id).includes(move.id) ? 2 : 1,
                value: move
            }
        })
    }

    console.log(data);

    /*function remove(index) {
        if (monstMoves?.length === 1) return;
        monstMoves = monstMoves.filter((_, i) => i !== index);
    }*/


</script>

<style lang="scss">
  .moveEdit {
    background: rgba(84, 80, 108, .85);
    height: calc(100% - 46px);
    width: 100%;
    box-sizing: border-box;
    position: absolute;

    z-index: var(--zIndex, 11);
    left: 0;
    bottom: -100%;
    transition: bottom 0.5s ease-in-out;

    display: flex;
    flex-direction: row;
    gap: 10%;
    text-shadow: 1px 1px 1px black;

    &.open {
      bottom: 0;
    }

    .column {
      padding: 1%;
      height: 100%;
      box-sizing: border-box;

      width:40%;

      .cards {
        display: flex;
        flex-direction: column;
        position: relative;
        padding: 1% 6%;
        gap: 4%;
        height: 100%;
        box-sizing: border-box;
        align-items: flex-end;
        overflow-y: auto;

        scrollbar-width: thin;
        scrollbar-color: #68c0c8 #0e2742f0;

        .move {
          width: 100%;
          height: calc((100dvh - 46px) * .21);
          font-size: 22px;

          &.disabled {
            opacity: 0.5;
            pointer-events: none;
          }

          .name, .pp, .type {
            font-size: 22px;
          }
        }
      }
    }
  }


  .move {
    background: rgb(220, 231, 233);
    background: linear-gradient(180deg, rgba(220, 231, 233, 1) 0%, rgba(255, 255, 255, 1) 50%, rgba(220, 231, 233, 0.713344712885154) 100%);
    color: #54506c;
    padding: 12px;
    border-radius: 8px;
    position: relative;
    height: calc((100% - 4 * 4%) / 4);
    box-sizing: border-box;
    text-shadow: none;
    width: 80%;

    .flex-row {
      gap: 6%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      width: 100%;
      padding-left: 20%;
      box-sizing: border-box;
    }

    .flex-col {
      display: flex;
      flex-direction: column;
    }

    &.selected {
      border: 3px solid #54506c;
    }

    .type {
      color: white;
      text-shadow: 1px 1px 1px black;
      background-color: var(--bg);
      border-radius: 8px;
      padding: 4px;
      font-size: 22px;
      position: absolute;
      top: -4px;
      left: -10px;
    }

    .name {
      font-size: 22px;
      text-transform: uppercase;
    }

    .pp {
      font-size: 22px;
      text-transform: uppercase;
    }
  }

  .column:global(.droppable) {
    outline: 0.1rem solid red;
    outline-offset: 0.25rem;
  }

  .column:global(.droppable) * {
    pointer-events: none;
  }
</style>


<!--
<div class="moveEdit" style="&#45;&#45;zIndex:{zIndex+1}" class:open={moveEdit}>

    <div class="all-moves">
        <div class="__wrapper" id="sourceMoves"

             use:dropzone={{
				on_dropzone(card_id) {
					const card = data.cards.find((c) => c.id === card_id);
					card.column = 'source';
					data = data;
				}
			}}

        >
            {#each allMoves as move, index (move.id)}
                <div class="move draggable" class:disabled={monstMoveIds.includes(move.id)}
                     use:draggable={move.id}

                >
                    <span style="&#45;&#45;bg:{typeChart[move.type].color}"
                          class="type">{move.type.toUpperCase()}</span>

                    <div class="flex-row">
                        <div class="flex-col">
                            <span class="name">{move.name}</span>
                            <span>{move.category === 'no-damage' ? 'status' : move.category }</span>
                        </div>

                        <div class="flex-col">
                            <span>power {move.power ? move.power : '/'}</span>
                            <span class="pp">PP {move.pp}</span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div class="monsterMoves">
        <div class="__wrapper" id="targetMoves"
             use:dropzone={{
				on_dropzone(card_id) {
					const card = monstMoves.find((c) => c.id === card_id);
					card.column = 'target';
					data = data;
				}
			}}
        >
            {#each monstMoves as move, index (move.id)}
                <div class="move" class:disabled={monstMoves?.length === 1}
                     use:draggable={move.id}>
                <span style="&#45;&#45;bg:{typeChart[move.type].color}"
                      class="type">{move.type.toUpperCase()}</span>

                    <div class="flex-row">
                        <div class="flex-col">
                            <span class="name">{move.name}</span>
                            <span>{move.category === 'no-damage' ? 'status' : move.category }</span>
                        </div>

                        <div class="flex-col">
                            <span>power {move.power ? move.power : '/'}</span>
                            <span class="pp">PP {move.pp}</span>
                        </div>
                    </div>
                    &lt;!&ndash; <button class="remove" on:click={()=>remove(index)}>
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                             <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path>
                         </svg>
                     </button>&ndash;&gt;
                </div>
            {/each}
        </div>
    </div>
</div>-->
