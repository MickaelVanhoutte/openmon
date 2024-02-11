<div class="skills">
    <div class="img-wrapper">
        <div class="info">
            <div>
                <span>Lv{selectedMons.level}</span><span>{selectedMons.name}</span>
            </div>
            <div class="img-bg">
                <img src="{selectedMons.sprites[selectedMons.gender].front.frame1}"
                     alt="{selectedMons.name} img"/>
            </div>
        </div>
    </div>

    <div class="moves">
        <div class="__wrapper">
            {#each selectedMons.moves as move, index}
                <div class="move" class:selected={index === selectedMove}
                     on:click={() => selectedMove = index}>
                                <span style="--bg:{typeChart[move.type].color}"
                                      class="type">{move.type.toUpperCase()}</span>
                    <span class="name">{move.name}</span>
                    <span class="pp">PP {move.currentPp}/{move.pp}</span>
                </div>
            {/each}
        </div>
    </div>

    <div class="description">
        <p>
            {description}
        </p>
    </div>
</div>

<script lang="ts">

    import {typeChart} from "../../js/battle/battle";
    import {SelectedSave} from "../../js/saves/saves";

    export let save: SelectedSave;
    export let selected: number

    export let selectedMove: number;

    let mechanicRegex = /{[^}]*}/g;

    $:selectedMons = save.player.monsters[selected];
    $:description = selectedMons.moves[selectedMove].description
        ?.replace("$effect_chance", selectedMons?.moves[selectedMove]?.effectChance)
        ?.replace(mechanicRegex, "");


</script>

<style lang="scss">
  .skills {
    background-image: linear-gradient(0deg, #97e8d0 25%, #a7f0d8 25%, #a7f0d8 50%, #97e8d0 50%, #97e8d0 75%, #a7f0d8 75%, #a7f0d8 100%);
    background-size: 16.00px 16.00px;


    border: 4px solid #54506c;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    position: relative;

    .img-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 40%;
      height: 60%;
      background-color: #c8a8e8;
      border-right: 4px solid #54506c;
      border-bottom: 4px solid #54506c;
      box-sizing: border-box;

      .info {
        height: 100%;

        div:first-of-type {
          display: flex;
          justify-content: space-between;
          padding: 0 5%;
          color: white;
          font-size: 32px;
          text-shadow: 3px 1px 2px #54506c;
        }

        .img-bg {
          display: flex;
          justify-content: center;
          height: 74%;
          width: 90%;
          margin: 3% auto;
          background-image: linear-gradient(0deg, #ffffff 12.50%, #e7e7e8 12.50%, #e7e7e8 50%, #ffffff 50%, #ffffff 62.50%, #e7e7e8 62.50%, #e7e7e8 100%);
          background-size: 32.00px 32.00px;
        }
      }
    }

    .moves {
      width: 60%;
      height: 100%;
      position: absolute;
      top: 0;
      right: 0;
      border-top: 4px solid #e0f8f8;
      border-right: 4px solid #e0f8f8;
      box-sizing: border-box;

      .__wrapper {

        display: flex;
        flex-direction: column;
        gap: 4%;
        padding: 16px;
        height: 100%;
        box-sizing: border-box;

        .move {
          background-color: #f0f8f8;
          color: #54506c;
          padding: 12px;
          border-radius: 8px;
          position: relative;
          height: calc(100% / 4);
          box-sizing: border-box;

          &.selected {
            border: 4px solid #54506c;
          }

          .type {
            color: white;
            text-shadow: 3px 1px 2px #54506c;
            background-color: var(--bg);
            border-radius: 8px;
            padding: 4px;
            font-size: 26px;
            position: absolute;
            top: -4px;
            left: -10px;
          }

          .name {
            font-size: 32px;
            text-transform: uppercase;
            position: absolute;
            left: 50%;
            top: 10%;
            transform: translateX(-50%);
          }

          .pp {
            font-size: 32px;
            text-transform: uppercase;
            position: absolute;
            right: 2%;
            bottom: 10%;
          }
        }
      }
    }

    .description {
      font-size: 26px;
      width: 39%;
      height: 36%;
      position: absolute;
      bottom: 2%;
      left: 1%;
      background-color: #f0f8f8;
      box-sizing: border-box;
      border-radius: 8px;
      padding: 1%;
      display: flex;
      align-items: center;
      justify-content: center;
      word-wrap: break-word;
      word-break: break-word;
      border: 4px solid #54506c;
    }
  }
</style>
