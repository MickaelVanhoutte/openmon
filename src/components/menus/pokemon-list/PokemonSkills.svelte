<div class="skills" style="--zIndex:{zIndex}"
     in:slide="{{duration: 500, delay: 100, axis: 'x', easing: backInOut}}" out:fade>
    <div class="img-skillDesc" class:enlarge={moveEdit}>
        <div class="img-wrapper">

            <div class="img-bg">
                <img src="{selectedMons.sprites[selectedMons?.gender]?.front.frame1 || selectedMons.sprites.male?.front?.frame1}"
                     alt="{selectedMons.name} img"/>
            </div>
        </div>

        <div class="skillDesc">
            {description}
        </div>
    </div>

    <div class="moves">
        <div class="__wrapper">

            <button class="edit" on:click={() => moveEdit = !moveEdit}>
                    <span class="svg">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path
                                d="M5.33409 4.54491C6.3494 3.63637 7.55145 2.9322 8.87555 2.49707C9.60856 3.4128 10.7358 3.99928 12 3.99928C13.2642 3.99928 14.3914 3.4128 15.1245 2.49707C16.4486 2.9322 17.6506 3.63637 18.6659 4.54491C18.2405 5.637 18.2966 6.90531 18.9282 7.99928C19.5602 9.09388 20.6314 9.77679 21.7906 9.95392C21.9279 10.6142 22 11.2983 22 11.9993C22 12.7002 21.9279 13.3844 21.7906 14.0446C20.6314 14.2218 19.5602 14.9047 18.9282 15.9993C18.2966 17.0932 18.2405 18.3616 18.6659 19.4536C17.6506 20.3622 16.4486 21.0664 15.1245 21.5015C14.3914 20.5858 13.2642 19.9993 12 19.9993C10.7358 19.9993 9.60856 20.5858 8.87555 21.5015C7.55145 21.0664 6.3494 20.3622 5.33409 19.4536C5.75952 18.3616 5.7034 17.0932 5.0718 15.9993C4.43983 14.9047 3.36862 14.2218 2.20935 14.0446C2.07212 13.3844 2 12.7002 2 11.9993C2 11.2983 2.07212 10.6142 2.20935 9.95392C3.36862 9.77679 4.43983 9.09388 5.0718 7.99928C5.7034 6.90531 5.75952 5.637 5.33409 4.54491ZM13.5 14.5974C14.9349 13.7689 15.4265 11.9342 14.5981 10.4993C13.7696 9.0644 11.9349 8.57277 10.5 9.4012C9.06512 10.2296 8.5735 12.0644 9.40192 13.4993C10.2304 14.9342 12.0651 15.4258 13.5 14.5974Z"></path></svg>
                    </span>
            </button>

            {#each selectedMons.moves as move, index}
                <div class="move" class:selected={index === selectedMove}
                     on:click={() => selectedMove = index}>
                                <span style="--bg:{typeChart[move.type].color}"
                                      class="type">{move.type.toUpperCase()}</span>

                    <div class="flex-row">
                        <div class="flex-col">
                            <span class="name">{move.name}</span>
                            <span>{move.category === 'no-damage' ? 'status' : move.category }</span>
                        </div>

                        <div class="flex-col">
                            <span>power {move.power ? move.power : '/'}</span>
                            <span class="pp">PP {move.currentPp}/{move.pp}</span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<div class="moveEdit" style="--zIndex:{zIndex+1}" class:open={moveEdit}>

    <div class="all-moves">
        <div class="__wrapper" id="sourceMoves"
             use:dndzone={{ items: allMoves, dropFromOthersDisabled: true, flipDurationMs: flipDurationMs, }}>
            {#each allMoves as move, index (move.id)}
                <div class="move draggable"
                     animate:flip={{duration:flipDurationMs}}
                >
                                <span style="--bg:{typeChart[move.type].color}"
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
             use:dndzone={{ items: monstMoves, flipDurationMs: flipDurationMs, dragDisabled: true, dropFromOthersDisabled: monstMoves.length === 4}}
             on:consider={onConsider} on:finalize={handleDndFinalize}>
            {#each monstMoves as move, index (move.id)}
                <div class="move" animate:flip={{duration:flipDurationMs}}>
                <span style="--bg:{typeChart[move.type].color}"
                      class="type">{move.type.toUpperCase()}</span>

                    <div class="flex-row">
                        <div class="flex-col">
                            <span class="name">{move.name}</span>
                            <span>{move.category === 'no-damage' ? 'status' : move.category }</span>
                        </div>

                        <div class="flex-col">
                            <span>power {move.power ? move.power : '/'}</span>
                            <span class="pp">PP {move.currentPp}/{move.pp}</span>
                        </div>
                    </div>
                    <button class="remove" on:click={()=>remove(index)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path>
                        </svg>
                    </button>
                </div>
            {/each}
        </div>
    </div>
</div>

<script lang="ts">

    import {typeChart} from "../../../js/battle/battle";
    import {SelectedSave} from "../../../js/saves/saves";
    import {slide, fade} from 'svelte/transition';
    import {backInOut} from "svelte/easing";
    import {MoveInstance, PokemonInstance} from "../../../js/pokemons/pokedex";
    import {POKEDEX} from "../../../js/const";
    import {dndzone} from "svelte-dnd-action";
    import {flip} from 'svelte/animate';

    const flipDurationMs = 200;

    export let save: SelectedSave;
    export let selected: number

    export let zIndex;
    export let selectedMove: number;
    export let pkmnList: PokemonInstance[];

    export let moveEdit: boolean;

    let mechanicRegex = /{[^}]*}/g;

    $:selectedMons = pkmnList[selected];
    $:description = selectedMons.moves[selectedMove].description
        ?.replace("$effect_chance", selectedMons?.moves[selectedMove]?.effectChance)
        ?.replace(mechanicRegex, "");

    let monstMoves = [];
    let allMoves = [];
    $: {
        if (selectedMons) {
            monstMoves = selectedMons.moves;
            let tmp = POKEDEX.findById(selectedMons.id)?.result?.moves?.filter(move => move.level <= selectedMons.level);
            let tmpUnique = [...new Map(tmp.map(item => [item.id, item])).values()];
            if (!allMoves || allMoves?.length !== tmpUnique?.length){
                console.log('update')
                allMoves = [...tmpUnique];
            }
        }
    }

    //$:allMoves = selectedMons && POKEDEX.findById(selectedMons.id)?.result?.moves?.filter(move => move.level <= selectedMons.level).filter(move => !selectedMons.moves.find(m => m.id === move.id));
    //$:currentMoves = selectedMons.moves;

    function handleDndConsider(e) {
        //items = e.detail.items;
        //console.log(e);
    }

    // TODO add only if length < 4 -> remove first
    function handleDndFinalize(e) {
        // items = e.detail.items;
        if (e.target.id === "targetMoves" && monstMoves.length < 4) {
            console.log(e);
            monstMoves = e.detail.items
        }

    }

    function onConsider(e) {
        console.log(e);
    }

    function remove(index) {
        if (monstMoves?.length === 1) return;
        monstMoves = monstMoves.filter((_, i) => i !== index);
    }

</script>

<style lang="scss">
  .skills {
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    position: relative;
    display: flex;
    flex-direction: row;
    background-color: #0e2742f0;
    background-image: url("src/assets/menus/p-sum.jpg");

    text-shadow: 1px 1px 1px black;
    z-index: var(--zIndex, 11);

    .img-skillDesc {
      display: flex;
      flex-direction: column;
      width: 40%;
      height: 100%;

      &.enlarge {

        .skillDesc {
          height: 0;
          opacity: 0;
          padding: 0;
        }

        .img-wrapper {
          height: 100%;
        }
      }

      .img-wrapper {
        height: 50%;
        width: 100%;
        display: flex;
        flex-direction: column;
        background-color: rgba(44, 56, 69, 0.65);
        justify-content: space-between;

        transition: all 0.5s ease-in-out;

        .img-bg {
          display: flex;
          justify-content: center;
          height: 100%;
          width: 100%;

          img {
            width: auto;
            max-height: 80%;
            margin: auto;
          }
        }
      }

      .skillDesc {
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        background-color: rgba(44, 56, 69, 0.65);
        height: 50%;
        width: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        padding: 2%;
        color: white;
        justify-content: space-around;
        align-items: flex-start;

        transition: all 0.5s ease-in-out;

        font-size: 22px;
      }
    }


    .moves {
      width: 60%;
      height: 100%;
      box-sizing: border-box;
      padding: 1%;
      background-color: rgba(44, 56, 69, 0.3);

      .__wrapper {

        display: flex;
        flex-direction: column;
        position: relative;
        gap: 4%;
        padding: 1% 3%;
        height: 100%;
        box-sizing: border-box;
        align-items: flex-end;

        .edit {
          position: absolute;
          left: 0;
          top: 0;

          background-color: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          margin: 0;
          width: 20%;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          font-family: pokemon, serif;
          font-size: 22px;
          text-shadow: 1px 1px 1px black;
          gap: 2%;
          color: white;
          outline: none;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
          touch-action: pan-x pan-y;

          svg {
            width: 32px;
            height: 32px;

          }
        }

      }
    }

  }

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

    .all-moves {
      width: 40%;
      height: 100%;
      box-sizing: border-box;
      padding: 1%;
      background-color: rgba(44, 56, 69, 0.3);

      .__wrapper {
        display: flex;
        flex-direction: column;
        position: relative;
        gap: 4%;
        padding: 1% 3%;
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

          .name, .pp, .type {
            font-size: 22px;
          }
        }
      }
    }

    .monsterMoves {
      width: 50%;
      height: 100%;
      box-sizing: border-box;
      padding: 1%;
      background-color: rgba(44, 56, 69, 0.3);

      .__wrapper {
        display: flex;
        flex-direction: column;
        position: relative;
        gap: 4%;
        padding: 1% 3%;
        height: 100%;
        box-sizing: border-box;
        align-items: flex-end;

        .move {
          width: 100%;
          height: calc((100dvh - 46px) * .21);
          font-size: 22px;

          .name, .pp, .type {
            font-size: 22px;
          }
        }

        .remove {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 30px;
          height: 30px;
          padding: 0;
          border: none;
          background: rgb(220, 231, 233);
          color: #bd4040;
          border-radius: 50%;
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


</style>
