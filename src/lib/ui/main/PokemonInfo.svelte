<div class="summary">

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

    <div class="infos">
        <ul>
            <li>
                <span class="th">No</span>
                <span class="td">{("00" + selectedMons.id).slice(-3)}</span>
            </li>
            <li>
                <span class="th">NAME</span>
                <span class="td">{selectedMons.name}</span>
            </li>
            <li>
                <span class="th">TYPE</span>
                <span class="td">
                                {#each selectedMons.types as type}
                                    <span style="--bg:{typeChart[type].color}" class="type">{type}</span>
                                {/each}
                            </span>
            </li>
            <li>
                <span class="th">OT</span>
                <span class="td">{save.player.name}</span>
            </li>
            <li>
                <span class="th">ITEM</span>
                <span class="td">NONE</span>
            </li>
        </ul>
    </div>

  <!--  <div class="memo">
        <span class="title">TRAINER MEMO</span>
        <p>{selectedMons.nature.toUpperCase() || 'UNKNOWN'} nature.</p>
        <p>Met in PALLET TOWN at Lv 5.</p>
    </div>
-->

    <div class="others">

        <div class="exp">
            <span class="th">EXP.</span>
            <table>
                <tr>
                    <td><span>EXP POINTS</span><span class="value">{selectedMons.currentXp}</span></td>
                    <td><span>NEXT LV.</span><span class="value">{selectedMons.xpToNextLevel}</span></td>
                </tr>
            </table>
        </div>

        <div class="ability">
            <div class="name-desc">
                <div class="title">
                    <span class="th">ABILITY</span>
                    <span class="td">{selectedMons.currentAbility}</span>
                </div>
                <div class="desc">
                    {abilities.find(ability => ability.names === selectedMons.currentAbility)?.description.replace(mechanicRegex, "")}
                </div>
            </div>
        </div>
    </div>
</div>

<script lang="ts">
    import {typeChart} from "../../js/battle/battle.js";
    import {SelectedSave} from "../../js/saves/saves.js";
    import abilities from "../../../assets/data/final/abilities.json";

    export let save: SelectedSave;
    export let selected: number;

    let mechanicRegex = /{[^}]*}/g;

    $:selectedMons = save.player.monsters[selected];
</script>


<style lang="scss">
  .summary {
    background-image: linear-gradient(0deg, #f8cfa8 25%, #f8a890 25%, #f8a890 50%, #f8cfa8 50%, #f8cfa8 75%, #f8a890 75%, #f8a890 100%);
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


    .infos {
      width: 60%;
      height: 100%;
      position: absolute;
      top: 0;
      right: 0;
      border-top: 4px solid #e0f8f8;
      border-right: 4px solid #e0f8f8;
      box-sizing: border-box;

      ul {
        list-style: none;
        margin: 0;
        padding: 8px 32px;
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 1.5%;
        box-sizing: border-box;

        li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;

          .th {
            width: 40%;
            text-align: center;
            height: 12px;
            border-radius: 4px;
            background-color: #54506c;
            line-height: 8px;
            font-size: 36px;
            color: white;
            text-shadow: 3px 1px 2px #54506c;
          }

          .td {
            width: 60%;
            color: #54506c;
            background-color: #f8f0e8;
            padding: 0 26px;
            font-size: 36px;
            text-transform: uppercase;
            border-radius: 8px;

            display: flex;
            justify-content: space-around;
            gap: 16px;

            .type {
              background-color: var(--bg);
              color: white;
              text-shadow: 3px 1px 2px #54506c;
              font-size: 26px;
              border-radius: 8px;
              padding: 4px;
              display: flex;
              flex-grow: 1;
              gap: 8px;
              justify-content: center;
              max-width: 50%;
              width: 40%;
            }
          }
        }
      }
    }

    /*.memo {
      position: absolute;
      bottom: 2%;
      left: 1%;
      width: 98%;
      height: 27%;
      background-color: #f8f0e8;
      padding: 16px;
      box-sizing: border-box;
      border-radius: 8px;

      .title {
        text-align: center;
        height: 12px;
        width: 30%;
        border-radius: 4px;
        background-color: #54506c;
        line-height: 8px;
        font-size: 36px;
        color: white;
        text-shadow: 3px 1px 2px #54506c;
        position: absolute;
        top: -12px;
        left: 0;
      }

      p {
        margin: 0;
        font-size: 32px;
        color: #54506c;
        border-bottom: 2px solid #e7e8c0;
      }
    }*/

    .others {
      width: 98%;
      max-height: 39%;
      position: absolute;
      bottom: 2%;
      left: 1%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 8px;

      .exp {
        display: flex;
        justify-content: space-between;
        gap: 2%;
        padding: 0;

        .th {
          text-align: center;
          height: 12px;
          width: 20%;
          border-radius: 4px;
          background-color: #54506c;
          line-height: 8px;
          font-size: 32px;
          color: white;
          text-shadow: 3px 1px 2px #54506c;
        }

        table {
          width: 78%;
          font-size: 24px;
          color: #54506c;
          text-transform: uppercase;
          border-radius: 8px;
          display: flex;
          flex-direction: column;

          tr {
            display: flex;
            justify-content: space-between;
            border-radius: 8px;
            gap: 1%;

            td {
              width: 50%;
              background-color: #f9f8a1;
              padding: 0 16px;
              border-radius: 4px;
              display: flex;
              justify-content: space-between;

              &.value {
                text-align: right;
                background-color: #f8f9d8;
              }
            }
          }
        }
      }

      .ability {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 1%;
        padding: 0;
        box-sizing: border-box;

        .title {
          width: 21%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
          justify-content: space-around;
        }

        .th {
          display: block;
          text-align: center;
          height: 12px;
          width: 100%;
          border-radius: 4px;
          background-color: #54506c;
          line-height: 8px;
          font-size: 32px;
          color: white;
          text-shadow: 3px 1px 2px #54506c;
        }

        .td {
          color: #54506c;
          background-color: #f8f0e8;
          padding: 8px;
          font-size: 22px;
          text-align: center;
          font-weight: bold;
          text-transform: uppercase;
          border-radius: 8px;
          box-sizing: border-box;
          width: 100%;
        }

        .name-desc {
          display: flex;
          flex-direction: row;
          gap: 2%;
          align-items: flex-end;

          .desc {
            width: 78%;
            font-size: 22px;
            background-color: #f9f8a1;
            border-radius: 8px;
            padding: 1%;
          }
        }


      }
    }
  }
</style>
