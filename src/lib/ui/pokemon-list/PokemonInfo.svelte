<div class="summary"  style="--zIndex:{zIndex}"
     in:slide="{{duration: 500, delay: 100,axis: 'x', easing: backInOut}}" out:fade>

    <div class="img-wrapper">

        <div class="img-bg">
            <img src="{selectedMons.sprites[selectedMons?.gender]?.front.frame1 || selectedMons.sprites.male?.front?.frame1}"
                 alt="{selectedMons.name} img"/>
        </div>

        <div class="name-level">
            <span>Lv{selectedMons.level}</span><span>{selectedMons.name}</span>
        </div>

    </div>

    <div class="infos">
        <table>
            <tr>
                <td class="head">Pokedex ID</td>
                <td>{("00" + selectedMons.id).slice(-3)}</td>
            </tr>
            <tr>
                <td class="head">Name</td>
                <td>{selectedMons.name}</td>
            </tr>
            <tr>
                <td class="head">Type</td>
                <td class="types">
                    {#each selectedMons.types as type}
                        <span style="--bg:{typeChart[type].color}" class="type">{type.toUpperCase()}</span>
                    {/each}
                </td>
            </tr>
            <tr>
                <td class="head">Original trainer</td>
                <td>{save.player.name}</td>
            </tr>
            <tr>
                <td class="head">Nature</td>
                <td class="nature">
                    <span>{selectedMons.nature.identifier.toUpperCase()}</span>
                    <div>
                        <span>+ {selectedMons.nature.increasedStatId.replace(/attack/i, 'atk').replace(/defense/i, 'def').replace("special", "sp.").toUpperCase()}</span>
                        <span>- {selectedMons.nature.increasedStatId.replace(/attack/i, 'atk').replace(/defense/i, 'def').replace("special", "sp.").toUpperCase()}</span>
                    </div>
                </td>
            </tr>

            <tr>
                <td class="head">Exp.</td>
                <td class="experience">
                    <div>{selectedMons.currentXp} / {selectedMons.xpToNextLevel}</div>
                    <div class="exp">
                        <div class="progressbar-wrapper">
                            <div class="progressbar" style="--width:{expPercent + '%'}">
                            </div>
                        </div>
                    </div>

                </td>
            </tr>

            <tr>
                <td class="head">Held item</td>
                <td>{selectedMons.item?.name || 'None'}</td>
            </tr>
            {#if selectedMons.item}
                <tr>
                    <td colspan="2">
                        {selectedMons.item?.description}
                    </td>
                </tr>
            {/if}
        </table>
    </div>
</div>

<script lang="ts">
    import {typeChart} from "../../js/battle/battle.js";
    import {SelectedSave} from "../../js/saves/saves.js";
    import { slide, fade } from 'svelte/transition';
    import {backInOut} from "svelte/easing";
    import {PokemonInstance} from "../../js/pokemons/pokedex";

    export let save: SelectedSave;
    export let selected: number;

    export let zIndex;

    export let pkmnList: PokemonInstance[];

    $:selectedMons = pkmnList[selected];

    $:expPercent = Math.floor(selectedMons?.currentXp * 100 / selectedMons?.xpToNextLevel);
</script>

<style lang="scss">

  .summary {
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

    .img-wrapper {
      height: 100%;
      width: 40%;
      display: flex;
      flex-direction: column;
      background-color: rgba(44, 56, 69, 0.65);
      justify-content: space-between;

      .img-bg {
        display: flex;
        justify-content: center;
        height: 90%;
        width: 100%;

        img {
          width: auto;
          height: 80%;
          margin: auto;
        }
      }

      .name-level {
        display: flex;
        flex-direction: row;
        height: 12%;
        padding: 0 4%;
        justify-content: space-between;
        align-items: center;
        color: white;
        background-color: rgba(44, 56, 69, 0.65);
      }
    }

    .infos {
      height: 100%;
      width: 60%;
      padding: 2%;
      box-sizing: border-box;
      background-color: rgba(44, 56, 69, 0.5);

      table {
        width: 100%;
        max-height: calc(100dvh - 46px);
        font-size: 26px;

        tr {
          box-sizing: border-box;
          //max-height: calc(100% / 7);
          td {
            color: white;
            padding: 1%;
            box-sizing: border-box;
            height: calc(100% / 7);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);

            &:first-of-type {
              width: 40%;
            }

            &.head {
              color: #f8d058;
            }

            &.nature {
              display: flex;
              flex-direction: row;
              gap: 4px;
              justify-content: space-between;
              align-items: flex-end;

              span {
                color: white;
                display: flex;
                font-weight: 500;
            }

            div {
              display: flex;
              flex-direction: column;
              gap: 4px;
              font-size: 18px;
              justify-content: space-between;
            }
          }

          &.types {
            display: flex;
            gap: 8px;
            flex-direction: row;
            justify-content: flex-start;

            .type {
              background-color: var(--bg);
              color: white;
              text-shadow: 1px 1px 1px black;
              font-size: 18px;
              border-radius: 8px;
              padding: 4px 12px;
              display: flex;
              font-weight: 500;
              justify-content: center;
              max-width: 50%;
              width: 40%;
            }
          }

          &.experience {

            display: flex;
            flex-direction: column;
            gap: 4px;
            font-size: 18px;
            align-items: flex-end;

            .exp {
              width: 100%;
              display: flex;
              border: 2px solid #262626;
              background-color: #262626;
              align-items: center;
              justify-content: space-evenly;
              border-radius: 4px;
              box-sizing: border-box;

              .progressbar-wrapper {

                height: 10px;
                width: 100%;
                background-color: #595b59;
                border-radius: 4px;
                position: relative;

                .progressbar {
                  width: var(--width);
                  height: 100%;

                  background: #0e73cf;

                  border-radius: 2px;
                  display: flex;
                  text-align: center;
                  align-items: center;
                  justify-content: center;
                  transition: width 1s ease-in-out;
                }
              }
            }
          }

        }
      }
    }
  }


}

</style>
