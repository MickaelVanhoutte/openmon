<div class="stats">
    <div class="stats-wrapper" >
        <canvas bind:this={graph}></canvas>
    </div>

    <div class="stat-values">

        <ul>
            <li class="head">
                <span class="th invisible"></span>
                <span class="th main">VALUE</span>
                <span class="th">IV</span>
                <span class="th">EV. ({selectedMons.evsToDistribute})</span>
            </li>

            <li class="hp">
                <span class="th">HP</span>
                <span class="td main">{selectedMons.currentHp}/{selectedMons.currentStats.hp}</span>
                <span class="td" style="--color:{ivColor(selectedMons.ivs.hp)}">{selectedMons.ivs.hp}</span>
                <span class="td inputs">
                                <button disabled={plusDisabled} on:click={() => addEv('hp', 1) }>+</button>
                                <span>{selectedMons.evs.hp}</span>
                                <button disabled={minusHpDisabled} on:click={() => addEv('hp', -1) }>-</button>
                            </span>

                <!--<div class="p-hp">
                    <span>HP</span>
                    <div class="progressbar-wrapper">
                        <div class="progressbar" class:warning={percent <= 50} class:danger={percent < 15 }
                             style="&#45;&#45;width:{percent + '%'}">
                        </div>
                    </div>
                </div>-->
            </li>
            <li>
                <span class="th">ATTACK</span>
                <span class="td main">{selectedMons.currentStats.attack}</span>
                <span class="td"
                      style="--color:{ivColor(selectedMons.ivs.attack)}">{selectedMons.ivs.attack}</span>
                <span class="td inputs">
                                <button disabled={plusDisabled} on:click={() => addEv('attack', 1) }>+</button>
                                <span>{selectedMons.evs.attack}</span>
                                <button disabled={minusAttackDisabled} on:click={() => addEv('attack', -1) }>-</button>
                            </span>

            </li>
            <li>
                <span class="th">DEFENSE</span>
                <span class="td main">{selectedMons.currentStats.defense}</span>
                <span class="td"
                      style="--color:{ivColor(selectedMons.ivs.defense)}">{selectedMons.ivs.defense}</span>
                <span class="td inputs">
                                <button disabled={plusDisabled} on:click={() => addEv('defense', 1) }>+</button>
                                <span>{selectedMons.evs.defense}</span>
                                <button disabled={minusDefenseDisabled}
                                        on:click={() => addEv('defense', -1) }>-</button>
                            </span>

            </li>
            <li>
                <span class="th">SP.ATK</span>
                <span class="td main">{selectedMons.currentStats.specialAttack}</span>
                <span class="td"
                      style="--color:{ivColor(selectedMons.ivs.specialAttack)}">{selectedMons.ivs.specialAttack}</span>
                <span class="td inputs">
                                <button disabled={plusDisabled} on:click={() => addEv('specialAttack', 1) }>+</button>
                                <span>{selectedMons.evs.specialAttack}</span>
                                <button disabled={minusSpecialAttackDisabled}
                                        on:click={() => addEv('specialAttack', -1) }>-</button>
                            </span>
            </li>
            <li>
                <span class="th">SP.DEF</span>
                <span class="td main">{selectedMons.currentStats.specialDefense}</span>
                <span class="td"
                      style="--color:{ivColor(selectedMons.ivs.specialDefense)}">{selectedMons.ivs.specialDefense}</span>
                <span class="td inputs">
                                <button disabled={plusDisabled} on:click={() => addEv('specialDefense', 1) }>+</button>
                                <span>{selectedMons.evs.specialDefense}</span>
                                <button disabled={minusSpecialDefenseDisabled}
                                        on:click={() => addEv('specialDefense', -1) }>-</button>
                            </span>
            </li>
            <li>
                <span class="th">SPEED</span>
                <span class="td main">{selectedMons.currentStats.speed}</span>
                <span class="td"
                      style="--color:{ivColor(selectedMons.ivs.speed)}">{selectedMons.ivs.speed}</span>
                <span class="td inputs">
                                <button disabled={plusDisabled} on:click={() => addEv('speed', 1) }>+</button>
                                <span>{selectedMons.evs.speed}</span>
                                <button disabled={minusSpeedDisabled} on:click={() => addEv('speed', -1) }>-</button>
                            </span>
            </li>
        </ul>

    </div>
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
    import abilities from "../../../assets/data/final/abilities.json";
    import {SelectedSave} from "../../js/saves/saves.js";
    import Chart from 'chart.js/auto';
    import {onMount} from "svelte";

    export let save: SelectedSave;
    export let selected: number;

    export let graph: HTMLCanvasElement;

    let mechanicRegex = /{[^}]*}/g;

    $:selectedMons = save.player.monsters[selected];

    $:percent = Math.floor(selectedMons.currentHp * 100 / selectedMons?.currentStats.hp)
    $:plusDisabled = selectedMons.evsToDistribute === 0;
    $:minusHpDisabled = selectedMons.evs.hp === 0;
    $:minusAttackDisabled = selectedMons.evs.attack === 0;
    $:minusDefenseDisabled = selectedMons.evs.defense === 0;
    $:minusSpecialAttackDisabled = selectedMons.evs.specialAttack === 0;
    $:minusSpecialDefenseDisabled = selectedMons.evs.specialDefense === 0;
    $:minusSpeedDisabled = selectedMons.evs.speed === 0;

    function ivColor(value: number) {

        if (value >= 26) {
            return 'green';
        } else if (value >= 16) {
            return '#9B6A0F';
        } else {
            return '#E61717';
        }
    }

    function addEv(stat: 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed', number: number) {
        if (selectedMons.evsToDistribute >= number && selectedMons.evs[stat] + number >= 0) {
            selectedMons.addEv(stat, number);
            // fix force reload
            selectedMons = selectedMons;
        }
    }

    $:data = {
        labels: [
            'HP',
            'Attack',
            'Defense',
            'Speed',
            'Sp. Def',
            'Sp. Atk',
        ],
        datasets: [{
            label: 'current',
            data: [selectedMons.currentStats.hp, selectedMons.currentStats.attack, selectedMons.currentStats.defense, selectedMons.currentStats.speed, selectedMons.currentStats.specialDefense, selectedMons.currentStats.specialAttack],
            fill: true,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            pointBackgroundColor: 'rgb(255, 99, 132)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(255, 99, 132)'
        }, {
            label: 'EVs',
            data: [selectedMons.evs.hp, selectedMons.evs.attack, selectedMons.evs.defense, selectedMons.evs.speed, selectedMons.evs.specialDefense, selectedMons.evs.specialAttack],
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            pointBackgroundColor: 'rgb(54, 162, 235)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(54, 162, 235)'
        }]
    };

    $:config = {
        type: 'radar',
        data: data,
        options: {
            scales: {
                r: {
                    pointLabels: {
                        display: true,
                        color: 'white'
                    },
                    ticks: {
                        display: false // Hides the labels in the middle (numbers)
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.3)',
                    }
                },

            },
            plugins: {
                legend: {
                    display: false,
                    color: 'white'
                },
                title: {
                    display: false,
                },
                datalabels: {
                    display: false,
                }
            },
            elements: {
                line: {
                    borderWidth: 2

                }
            }
        },
    };

    $:ctx = graph?.getContext('2d');

    let chart;
    $: {
        chart?.destroy();
        chart = new Chart(ctx, config);
    };
</script>


<style lang="scss">

  .stats {
    background-image: linear-gradient(0deg, #f8d058 25%, #f8e878 25%, #f8e878 50%, #f8d058 50%, #f8d058 75%, #f8e878 75%, #f8e878 100%);
    background-size: 16.00px 16.00px;

    border: 4px solid #54506c;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    position: relative;

    .stats-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 30%;
      height: 60%;
      background-color: rgba(84, 80, 108, .80);
      border-right: 4px solid #54506c;
      border-bottom: 4px solid #54506c;
      box-sizing: border-box;

      canvas {
        width: 100%;
        height: 100%;
        margin: auto;
      }

      /*.info {
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
      }*/
    }

    .stat-values {
      width: 70%;
      height: 60%;
      position: absolute;
      top: 0;
      right: 0;
      box-sizing: border-box;
      border-top: 4px solid #e0f8f8;
      border-right: 4px solid #e0f8f8;

      ul {
        list-style: none;
        margin: 0;
        padding: 2% 2% 0 2%;
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 2%;
        box-sizing: border-box;

        li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2%;
          max-height: calc(100% / 7);

          &.head {
            .th {
              font-size: 24px;
              justify-content: flex-start;
              width: 21%;
              min-width: unset;

              &.invisible {
                visibility: hidden;
                min-width: 30%;
              }

              &.main {
                width: 21%;
              }
            }
          }

          .th {
            min-width: 30%;
            text-align: center;
            height: 12px;
            border-radius: 4px;
            background-color: #54506c;
            line-height: 8px;
            font-size: 32px;
            color: white;
            text-shadow: 3px 1px 2px #54506c;
          }

          .td {
            width: 18%;
            color: var(--color, #54506c);
            font-weight: bold;
            background-color: #f8f0e8;
            padding: 0 8px;
            text-transform: uppercase;
            border-radius: 8px;
            font-size: 24px;
            line-height: 1.1;
            display: flex;
            justify-content: flex-end;

            &.inputs {
              padding: 0;
              justify-content: space-between;
              width: 21%;

              button {
                background: #54506c;
                color: white;
                border-radius: 8px;
                font-size: 16px;
                height: 26px;
                width: 26px;
                box-sizing: border-box;

                touch-action: none;
                -webkit-touch-callout: none;
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                -o-user-select: none;

                &:disabled {
                  background: rgba(84, 80, 108, 0.3);
                  color: rgba(255, 255, 255, 0.8);
                  border: 0;
                }
              }
            }

          }
        }
      }
    }

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
