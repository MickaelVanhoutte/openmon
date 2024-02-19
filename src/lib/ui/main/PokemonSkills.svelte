<div class="skills"  style="--zIndex:{zIndex}"
     in:slide="{{duration: 500, delay: 100, axis: 'x', easing: backInOut}}" out:fade>
    <div class="img-skillDesc">
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
            {#each selectedMons.moves as move, index}
                <div class="move" class:selected={index === selectedMove}
                     on:click={() => selectedMove = index}>
                                <span style="--bg:{typeChart[move.type].color}"
                                      class="type">{move.type.toUpperCase()}</span>

                    <div class="flex-row">
                        <div class="flex-col">
                            <span class="name">{move.name}</span>
                            <span>{move.category ===  'no-damage' ? 'status' : move.category }</span>
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

<script lang="ts">

    import {typeChart} from "../../js/battle/battle";
    import {SelectedSave} from "../../js/saves/saves";
    import { slide, fade } from 'svelte/transition';
    import {backInOut} from "svelte/easing";

    export let save: SelectedSave;
    export let selected: number

    export let zIndex;
    export let selectedMove: number;


    let mechanicRegex = /{[^}]*}/g;

    $:selectedMons = save.player.monsters[selected];
    $:description = selectedMons.moves[selectedMove].description
        ?.replace("$effect_chance", selectedMons?.moves[selectedMove]?.effectChance)
        ?.replace(mechanicRegex, "");

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

      .img-wrapper {
        height: 50%;
        width: 100%;
        display: flex;
        flex-direction: column;
        background-color: rgba(44, 56, 69, 0.65);
        justify-content: space-between;

        .img-bg {
          display: flex;
          justify-content: center;
          height: 100%;
          width: 100%;

          img {
            width: auto;
            height: 80%;
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
      background-color: rgba(44, 56, 69, 0.5);

      .__wrapper {

        display: flex;
        flex-direction: column;
        gap: 4%;
        padding: 1% 3%;
        height: 100%;
        box-sizing: border-box;

        .move {
          background: rgb(220,231,233);
          background: linear-gradient(180deg, rgba(220,231,233,1) 0%, rgba(255,255,255,1) 50%, rgba(220,231,233,0.713344712885154) 100%);
          color: #54506c;
          padding: 12px;
          border-radius: 8px;
          position: relative;
          height: calc((100% - 4 * 4%) / 4);
          box-sizing: border-box;
          text-shadow: none;

          .flex-row {
            gap: 10%;
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
            font-size: 26px;
            position: absolute;
            top: -4px;
            left: -10px;
          }

          .name {
            font-size: 26px;
            text-transform: uppercase;
            /*position: absolute;
            left: 50%;
            top: 10%;
            transform: translateX(-50%);*/
          }

          .pp {
            font-size: 26px;
            text-transform: uppercase;
            /* position: absolute;
             right: 2%;
             bottom: 10%;*/
          }
        }
      }
    }

  }

</style>
