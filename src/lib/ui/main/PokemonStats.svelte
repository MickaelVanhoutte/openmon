<div class="stats">
    <div class="stats-wrapper" bind:this={graphWrapper}>
        <canvas bind:this={graph}></canvas>
    </div>

    <div class="stat-values">
        <table>
            <thead>
            <tr>
                <th width="40%" class="th invisible" style="color:rgba(242, 228, 3, .5)">STATS</th>
                <th width="10%" class="th">IV</th>
                <th width="50%" class="th" style="color:rgb(242, 228, 3)">EV ({selectedMons.evsToDistribute})</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>
                    <div class="value">
                        <span style="color:{selectedMons.nature.increasedStatId === 'hp'? '#1383f6' : selectedMons.nature.decreasedStatId === 'hp' ? '#e74462' : 'white'}">HP</span>
                        <span>{selectedMons.currentHp}/{selectedMons.currentStats.hp}</span>
                    </div>
                </td>
                <td style="--color:{ivColor(selectedMons.ivs.hp)}">{selectedMons.ivs.hp}</td>
                <td class="td inputs">
                    <div class="double">
                        <button disabled={plusDisabled} on:click={() => addEv('hp', 1) }>+</button>
                        <button disabled={plusPlusDisabled} on:click={() => addEv('hp', 10) }>++</button>

                    </div>
                    <div>
                        <span>{selectedMons.evs.hp}</span>
                    </div>
                    <div class="double">
                        <button disabled={minusHpDisabled} on:click={() => addEv('hp', -1) }>-</button>
                        <button disabled={minusMinusHpDisabled} on:click={() => addEv('hp', -10) }>- -</button>
                    </div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="value">
                        <span style="color:{selectedMons.nature.increasedStatId === 'attack'? '#1383f6' : selectedMons.nature.decreasedStatId === 'attack' ? '#e74462' : 'white'}">ATK.</span>
                        <span>{selectedMons.currentStats.attack}</span>
                    </div>
                </td>
                <td style="--color:{ivColor(selectedMons.ivs.attack)}">{selectedMons.ivs.attack}</td>
                <td class="td inputs">
                    <div class="double">
                        <button disabled={plusDisabled} on:click={() => addEv('attack', 1) }>+</button>
                        <button disabled={plusPlusDisabled} on:click={() => addEv('attack', 10) }>++</button>

                    </div>
                    <div>
                        <span>{selectedMons.evs.attack}</span>
                    </div>
                    <div class="double">
                        <button disabled={minusAttackDisabled} on:click={() => addEv('attack', -1) }>-</button>
                        <button disabled={minusMinusAttackDisabled} on:click={() => addEv('attack', -10) }>--</button>
                    </div>
                </td>

            </tr>
            <tr>
                <td>
                    <div class="value">
                        <span style="color:{selectedMons.nature.increasedStatId === 'defense'? '#1383f6' : selectedMons.nature.decreasedStatId === 'defense' ? '#e74462' : 'white'}">DEF.</span>
                        <span>{selectedMons.currentStats.defense}</span>
                    </div>
                </td>
                <td style="--color:{ivColor(selectedMons.ivs.defense)}">{selectedMons.ivs.defense}</td>
                <td class="td inputs">
                    <div class="double">
                        <button disabled={plusDisabled} on:click={() => addEv('defense', 1) }>+</button>
                        <button disabled={plusPlusDisabled} on:click={() => addEv('defense', 10) }>++</button>

                    </div>
                    <div>
                        <span>{selectedMons.evs.defense}</span>
                    </div>
                    <div class="double">
                        <button disabled={minusDefenseDisabled} on:click={() => addEv('defense', -1) }>-</button>
                        <button disabled={minusMinusDefenseDisabled} on:click={() => addEv('defense', -10) }>--</button>
                    </div>
                </td>

            </tr>
            <tr>
                <td>
                    <div class="value">
                        <span style="color:{selectedMons.nature.increasedStatId === 'specialAttack'? '#1383f6' : selectedMons.nature.decreasedStatId === 'specialAttack' ? '#e74462' : 'white'}">SP.ATK</span>
                        <span>{selectedMons.currentStats.specialAttack}</span>
                    </div>
                </td>
                <td style="--color:{ivColor(selectedMons.ivs.specialAttack)}">{selectedMons.ivs.specialAttack}</td>
                <td class="inputs">
                    <div class="double">
                        <button disabled={plusDisabled} on:click={() => addEv('specialAttack', 1) }>+</button>
                        <button disabled={plusPlusDisabled} on:click={() => addEv('specialAttack', 10) }>++</button>

                    </div>
                    <div>
                        <span>{selectedMons.evs.specialAttack}</span>
                    </div>
                    <div class="double">
                        <button disabled={minusSpecialAttackDisabled} on:click={() => addEv('specialAttack', -1) }>-
                        </button>
                        <button disabled={minusMinusSpecialAttackDisabled}
                                on:click={() => addEv('specialAttack', -10) }>--
                        </button>
                    </div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="value">
                        <span style="color:{selectedMons.nature.increasedStatId === 'specialDefense'? '#1383f6' : selectedMons.nature.decreasedStatId === 'specialDefense' ? '#e74462' : 'white'}">SP.DEF</span>
                        <span>{selectedMons.currentStats.specialDefense}</span>
                    </div>
                </td>
                <td style="--color:{ivColor(selectedMons.ivs.specialDefense)}">{selectedMons.ivs.specialDefense}</td>
                <td class="td inputs">
                    <div class="double">
                        <button disabled={plusDisabled} on:click={() => addEv('specialDefense', 1) }>+</button>
                        <button disabled={plusPlusDisabled} on:click={() => addEv('specialDefense', 10) }>++</button>

                    </div>
                    <div>
                        <span>{selectedMons.evs.specialDefense}</span>
                    </div>
                    <div class="double">
                        <button disabled={minusSpecialDefenseDisabled} on:click={() => addEv('specialDefense', -1) }>-
                        </button>
                        <button disabled={minusMinusSpecialDefenseDisabled}
                                on:click={() => addEv('specialDefense', -10) }>
                            --
                        </button>
                    </div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="value">
                        <span style="color:{selectedMons.nature.increasedStatId === 'speed'? '#1383f6' : selectedMons.nature.decreasedStatId === 'speed' ? '#e74462' : 'white'}">SPEED</span>
                        <span>{selectedMons.currentStats.speed}</span>
                    </div>
                </td>
                <td class="td"
                    style="--color:{ivColor(selectedMons.ivs.speed)}">{selectedMons.ivs.speed}</td>
                <td class="td inputs">
                    <div class="double">
                        <button disabled={plusDisabled} on:click={() => addEv('speed', 1) }>+</button>
                        <button disabled={plusPlusDisabled} on:click={() => addEv('speed', 10) }>++</button>

                    </div>
                    <div>
                        <span>{selectedMons.evs.speed}</span>
                    </div>
                    <div class="double">
                        <button disabled={minusSpeedDisabled} on:click={() => addEv('speed', -1) }>-</button>
                        <button disabled={minusMinusSpeedDisabled} on:click={() => addEv('speed', -10) }>--</button>
                    </div>
                </td>
            </tr>
            </tbody>
        </table>

    </div>


</div>

<script lang="ts">
    import {SelectedSave} from "../../js/saves/saves.js";
    import Chart from 'chart.js/auto';
    import {onMount} from "svelte";

    export let save: SelectedSave;
    export let selected: number;
    export let prevSelected: number;
    export let graphWrapper: HTMLDivElement;
    export let graph: HTMLCanvasElement;

    $:selectedMons = save.player.monsters[selected];

    $:percent = Math.floor(selectedMons.currentHp * 100 / selectedMons?.currentStats.hp)
    $:plusDisabled = selectedMons.evsToDistribute === 0;
    $:plusPlusDisabled = selectedMons.evsToDistribute < 10;
    $:minusHpDisabled = selectedMons.evs.hp === 0;
    $:minusMinusHpDisabled = selectedMons.evs.hp < 10;
    $:minusAttackDisabled = selectedMons.evs.attack === 0;
    $:minusMinusAttackDisabled = selectedMons.evs.attack < 10;
    $:minusDefenseDisabled = selectedMons.evs.defense === 0;
    $:minusMinusDefenseDisabled = selectedMons.evs.defense < 10;
    $:minusSpecialAttackDisabled = selectedMons.evs.specialAttack === 0;
    $:minusMinusSpecialAttackDisabled = selectedMons.evs.specialAttack < 10;
    $:minusSpecialDefenseDisabled = selectedMons.evs.specialDefense === 0;
    $:minusMinusSpecialDefenseDisabled = selectedMons.evs.specialDefense < 10;
    $:minusSpeedDisabled = selectedMons.evs.speed === 0;
    $:minusMinusSpeedDisabled = selectedMons.evs.speed < 10;

    function ivColor(value: number) {

        if (value >= 26) {
            return '#27d227';
        } else if (value >= 16) {
            return '#fff22b';
        } else {
            return '#f54949';
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
            ['HP', selectedMons.currentStats.hp],
            ['Attack', selectedMons.currentStats.attack],
            ['Defense', selectedMons.currentStats.defense],
            ['Speed', selectedMons.currentStats.speed],
            ['Sp. Def', selectedMons.currentStats.specialDefense],
            ['Sp. Atk', selectedMons.currentStats.specialAttack],
        ],
        datasets: [{
            label: 'current',
            data: [selectedMons.currentStats.hp, selectedMons.currentStats.attack, selectedMons.currentStats.defense, selectedMons.currentStats.speed, selectedMons.currentStats.specialDefense, selectedMons.currentStats.specialAttack],
            fill: true,
            backgroundColor: 'rgba(242, 228, 3, .3)',
            borderColor: 'rgba(242, 228, 3, 0)',
            borderWidth: 2,
            pointBorderWidth: 0,
            pointStyle: false,
            spanGaps: true,
            tension: 0
        }, {
            label: 'EVs',
            data: [selectedMons.evs.hp, selectedMons.evs.attack, selectedMons.evs.defense, selectedMons.evs.speed, selectedMons.evs.specialDefense, selectedMons.evs.specialAttack],
            fill: true,
            backgroundColor: 'rgba(242, 228, 3, 1)',
            borderColor: 'rgba(242, 228, 3, 0)',
            borderWidth: 2,
            pointBorderWidth: 0,
            pointStyle: false,
            spanGaps: true,
            tension: 0
        }]
    };

    $:config = {
        type: 'radar',
        data: data,
        responsive: true,
        maintainAspectRatio: false,
        options: {
            scales: {
                r: {
                    min: -30,
                    max: Math.max(Math.max(...Object.values({
                        ...selectedMons.currentStats,
                        total: 0
                    })), Math.max(...Object.values({...selectedMons.evs, total: 0}))),
                    beginAtZero: true,

                    pointLabels: {
                        display: true,
                        //color: 'white',
                        color: [
                            selectedMons.nature.increasedStatId === 'hp'? '#1383f6' : selectedMons.nature.decreasedStatId === 'hp' ? '#e74462' : 'white',
                            selectedMons.nature.increasedStatId === 'attack'? '#1383f6' : selectedMons.nature.decreasedStatId === 'attack' ? '#e74462' : 'white',
                            selectedMons.nature.increasedStatId === 'defense'? '#1383f6' : selectedMons.nature.decreasedStatId === 'defense' ? '#e74462' : 'white',
                            selectedMons.nature.increasedStatId === 'specialAttack'? '#1383f6' : selectedMons.nature.decreasedStatId === 'specialAttack' ? '#e74462' : 'white',
                            selectedMons.nature.increasedStatId === 'specialDefense'? '#1383f6' : selectedMons.nature.decreasedStatId === 'specialDefense' ? '#e74462' : 'white',
                            selectedMons.nature.increasedStatId === 'speed'? '#1383f6' : selectedMons.nature.decreasedStatId === 'speed' ? '#e74462' : 'white'
                        ],
                        font: {
                            size: 22,
                            family: 'pokemon, serif',
                            weight: '500'
                        }
                    },
                    ticks: {
                        display: false, // Hides the labels in the middle (numbers)
                        maxTicksLimit: 3,
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.3)',

                    },
                    gridLines: {
                        display: false
                    }
                },

            },
            plugins: {
                legend: {
                    display: false,
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

    let chart;
    $:ctx = graph?.getContext('2d');

    $: {
        if (graph && graphWrapper) {
            graph.width = graphWrapper.clientWidth;
            graph.height = graphWrapper.clientHeight;
        }
        if (prevSelected !== selected || selected === 0 || prevSelected === 0) {
            ctx = graph?.getContext('2d');
            chart?.destroy();
            chart = new Chart(ctx, config);
        } else {
            chart?.update()
        }
    }

    onMount(() => {
        graph.width = graphWrapper.clientWidth;
        graph.height = graphWrapper.clientHeight;
    });

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
      width: 45%;
      height: 102%;
      background-color: rgba(84, 80, 108, .5);
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
      width: 55%;
      height: 100%;
      position: absolute;
      top: 0;
      right: 0;
      box-sizing: border-box;
      /* border-top: 4px solid #e0f8f8;
       border-right: 4px solid #e0f8f8;*/
      font-size: 24px;

      table {

        table-layout: fixed;
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        box-sizing: border-box;

        thead {
          height: 30px;

          th {
            background-color: rgba(44, 56, 69, 0.85);
            color: #fff;
            border: 1px solid #2C3845;

            &:first-of-type {
              border-radius: 8px 0 0 0;
            }

            &:last-of-type {
              border-radius: 0 8px 0 0;
            }
          }
        }


        tbody {
          height: calc(100% - 30px);

          tr {
            height: calc(100% / 7);
            max-height: calc(100% / 7);

            &:nth-child(odd) {
              background-color: rgba(35, 96, 96, 0.91);
              color: white;
            }

            &:nth-child(even) {
              background-color: rgba(44, 56, 69, 0.85);
              color: white;
            }

            &:last-of-type {
              td:first-of-type {
                border-radius: 0 0 0 8px;
              }

              td:last-of-type {
                border-radius: 0 0 8px 0;
              }
            }


            td {
              padding: 0 8px;
              height: calc((100dvh - 46px - 30px) / 7);
              text-align: center;
              color: var(--color, white);

              div.value {
                display: flex;
                justify-content: space-between;

                span {color: var(--color, white);}
              }

              &.inputs {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;

                button {
                  -webkit-touch-callout: none;
                  -webkit-user-select: none;
                  -khtml-user-select: none;
                  -moz-user-select: none;
                  -ms-user-select: none;
                  user-select: none;
                  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

                  touch-action: pan-x pan-y;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
