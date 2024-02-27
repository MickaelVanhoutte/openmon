<div class="stats" style="--zIndex:{zIndex}"
     in:slide="{{duration: 500, delay: 100,axis: 'x', easing: backInOut}}" out:fade>

    <div class="img-ability" class:enlarge={statEdit}>
        <div class="img-wrapper">

            <div class="img-bg">
                <img src="{selectedMons.sprites[selectedMons?.gender]?.front.frame1 || selectedMons.sprites.male?.front?.frame1}"
                     alt="{selectedMons.name} img"/>
            </div>
        </div>

        <div class="ability">
            <span class="_name">{selectedMons.currentAbility}</span>
            <div class="_desc">
                {abilities.find(ability => ability.names === selectedMons.currentAbility)?.description.replace(mechanicRegex, "").replace(/\[/g, '').replace(/\]/g, '')}
            </div>
        </div>
    </div>
    <div class="table-wrap">
        <table>
            <thead>
            <tr>
                <th>
                    {#if !isBattle}
                        <button class="edit" class:flash={selectedMons.evsToDistribute > 0}
                                on:click={() => statEdit = !statEdit}>
                        <span class="svg">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path
                                    d="M5.33409 4.54491C6.3494 3.63637 7.55145 2.9322 8.87555 2.49707C9.60856 3.4128 10.7358 3.99928 12 3.99928C13.2642 3.99928 14.3914 3.4128 15.1245 2.49707C16.4486 2.9322 17.6506 3.63637 18.6659 4.54491C18.2405 5.637 18.2966 6.90531 18.9282 7.99928C19.5602 9.09388 20.6314 9.77679 21.7906 9.95392C21.9279 10.6142 22 11.2983 22 11.9993C22 12.7002 21.9279 13.3844 21.7906 14.0446C20.6314 14.2218 19.5602 14.9047 18.9282 15.9993C18.2966 17.0932 18.2405 18.3616 18.6659 19.4536C17.6506 20.3622 16.4486 21.0664 15.1245 21.5015C14.3914 20.5858 13.2642 19.9993 12 19.9993C10.7358 19.9993 9.60856 20.5858 8.87555 21.5015C7.55145 21.0664 6.3494 20.3622 5.33409 19.4536C5.75952 18.3616 5.7034 17.0932 5.0718 15.9993C4.43983 14.9047 3.36862 14.2218 2.20935 14.0446C2.07212 13.3844 2 12.7002 2 11.9993C2 11.2983 2.07212 10.6142 2.20935 9.95392C3.36862 9.77679 4.43983 9.09388 5.0718 7.99928C5.7034 6.90531 5.75952 5.637 5.33409 4.54491ZM13.5 14.5974C14.9349 13.7689 15.4265 11.9342 14.5981 10.4993C13.7696 9.0644 11.9349 8.57277 10.5 9.4012C9.06512 10.2296 8.5735 12.0644 9.40192 13.4993C10.2304 14.9342 12.0651 15.4258 13.5 14.5974Z"></path></svg>
                        </span>
                            <span>({selectedMons.evsToDistribute} EVs)</span>
                        </button>
                    {/if}
                </th>
                <th>Value</th>
                <th>IVs</th>
                <th>EVs</th>
            </tr>
            </thead>
            <tbody>
            {#each statsKeys as key}
                <tr>
                    <td style="color:{natureColor(key,selectedMons.nature)}">{key.replace(/attack/i, 'atk').replace(/defense/i, 'def').replace("special", "sp.").toUpperCase()}</td>
                    <td>
                        {#if key === 'hp'}{selectedMons.currentHp} /{/if}{selectedMons.currentStats[key]}</td>
                    <td style="color: {ivColor(selectedMons.ivs[key])}">{selectedMons.ivs[key]}</td>
                    <td>{selectedMons.evs[key]}</td>
                </tr>
            {/each}
            </tbody>
        </table>
    </div>
</div>

<div class="stats-edit" style="--zIndex:{zIndex+1}" class:open={statEdit}>
    <div class="stats-wrapper" bind:this={graphWrapper}>
        <canvas bind:this={graph} use:makeChart={data, config}></canvas>
    </div>

    <div class="stat-values">
        <table>
            <thead>
            <tr>
                <th>STAT</th>
                <th>VALUE</th>
                <th>IV</th>
                <th width="40%">EV ({selectedMons.evsToDistribute})</th>
            </tr>
            </thead>
            <tbody>

            {#each statsKeys as key}
                <tr>
                    <td style="color:{natureColor(key,selectedMons.nature)}">{key.replace(/attack/i, 'atk').replace(/defense/i, 'def').replace("special", "sp.").toUpperCase()}</td>
                    <td>
                        {#if key === 'hp'}{selectedMons.currentHp} /{/if}{selectedMons.currentStats[key]}</td>

                    <td style="color: {ivColor(selectedMons.ivs[key])}">{selectedMons.ivs[key]}</td>
                    <td>
                        <div class="inputs">
                            <div class="double">
                                <button disabled={disabled(key, 10)} on:click={() => addEv(key, 10) }>++</button>
                                <button disabled={disabled(key, 1)} on:click={() => addEv(key, 1) }>+</button>
                            </div>
                            <div>
                                <span>{selectedMons.evs[key]}</span>
                            </div>
                            <div class="double">
                                <button disabled={disabled(key, -1)} on:click={() => addEv(key, -1) }>-</button>
                                <button disabled={disabled(key, -10)} on:click={() => addEv(key, -10) }>- -</button>
                            </div>
                        </div>
                    </td>
                </tr>
            {/each}

            </tbody>
        </table>

    </div>


</div>

<script lang="ts">
    import {SelectedSave} from "../../../js/saves/saves.js";
    import Chart from 'chart.js/auto';
    import abilities from "../../../assets/data/final/abilities.json";
    import {Nature, PokemonInstance} from "../../../js/pokemons/pokedex";
    import {slide, fade} from 'svelte/transition';
    import {backInOut} from "svelte/easing";

    export let save: SelectedSave;
    export let selected: number;

    export let statEdit: boolean;
    export let graphWrapper: HTMLDivElement;
    export let graph: HTMLCanvasElement;

    export let isBattle: boolean;

    export let zIndex;

    export let pkmnList: PokemonInstance[];

    $:selectedMons = pkmnList[selected];
    $:statsKeys = Object.keys(selectedMons.stats).filter(key => key !== 'total' && key !== 'accuracy' && key !== 'evasion');
    $:percent = Math.floor(selectedMons.currentHp * 100 / selectedMons?.currentStats.hp)

    function disabled(key: string, testValue: number) {
        if (testValue > 0) {
            // add 1/10, must have enough evs to distribute or not maxed
            return selectedMons.evsToDistribute - testValue < 0 || selectedMons.evs[key] + testValue > 252;
        } else {
            // remove 1/10, must already have evs distributed and  not go below 0
            return selectedMons.evs[key] === 0 || selectedMons.evs[key] + testValue <= 0;
        }

    }

    let mechanicRegex = /\{mechanic:.*?\}/g;

    function ivColor(value: number) {

        if (value >= 26) {
            return '#27d227';
        } else if (value >= 16) {
            return '#fbb841';
        } else {
            return '#fb607c';
        }
    }

    function natureColor(stat: string, nature: Nature) {
        if (nature.increasedStatId === nature.decreasedStatId) {
            return 'white';
        } else if (nature.increasedStatId === stat) {
            return '#50aeff';
        } else if (nature.decreasedStatId === stat) {
            return '#fb607c';
        } else {
            return 'white';
        }
    }

    function addEv(stat: 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed', number: number) {
        selectedMons.addEv(stat, number);
        // fix force reload
        selectedMons = selectedMons;
    }

    let chart;

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
                        color: [
                            natureColor('hp', selectedMons.nature),
                            natureColor('attack', selectedMons.nature),
                            natureColor('defense', selectedMons.nature),
                            natureColor('speed', selectedMons.nature),
                            natureColor('specialDefense', selectedMons.nature),
                            natureColor('specialAttack', selectedMons.nature),
                        ],
                        font: {
                            size: 22,
                            family: 'pokemon, serif',
                            weight: '500'
                        }
                    },
                    ticks: {
                        display: false,
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


    function makeChart(ctx, d, l) {
        const myChart = new Chart(ctx, config); //init the chart
        return {
            update(u) {
                myChart.data = u.data;
                myChart.config.options = config.options;
                myChart.update('none')
            },
            destroy() {
                myChart.destroy();
            }
        }
    }


</script>

<style lang="scss">

  .stats {
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

    .img-ability {
      display: flex;
      flex-direction: column;
      width: 40%;
      height: 100%;

      transition: width 0.5s ease-in-out;

      &.enlarge {

        .ability {
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
            transition-delay: .2s;
            width: auto;
            max-height: 80%;
            margin: auto;
          }
        }
      }

      .ability {
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        background-color: rgba(44, 56, 69, 0.65);
        height: 50%;
        width: 100%;
        opacity: 1;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        padding: 2%;
        color: white;
        justify-content: space-around;
        align-items: flex-start;

        transition: all 0.5s ease-in-out;

        ._name {
          font-size: 28px;
        }

        ._desc {
          font-size: 22px;
        }
      }
    }


    .table-wrap {

      height: 100%;
      width: 60%;
      padding: 1%;
      box-sizing: border-box;
      background-color: rgba(44, 56, 69, 0.3);

      table {
        width: 100%;
        max-height: calc(100dvh - 46px);
        font-size: 26px;

        thead {
          tr th {
            color: white;
            box-sizing: border-box;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            text-align: end;
            font-weight: 400;

            button.edit {

              background-color: transparent;
              border: none;
              cursor: pointer;
              padding: 0;
              margin: 0;
              display: flex;
              flex-direction: row-reverse;
              align-items: center;
              width: 100%;
              justify-content: flex-start;
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

              &.flash .svg {
                animation: flash 2s ease-in-out infinite;
              }

              @keyframes flash {
                0% {
                  color: white;
                }
                50% {
                  color: #313e62;
                }
                100% {
                  color: white;
                }
              }
            }
          }
        }

        tbody {
          tr {
            box-sizing: border-box;

            td {
              color: white;
              padding: 1%;
              box-sizing: border-box;
              height: calc(100% / 7);
              border-bottom: 1px solid rgba(255, 255, 255, 0.2);
              text-align: end;

            }
          }
        }
      }
    }

  }

  .stats-edit {
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
    text-shadow: 1px 1px 1px black;

    &.open {
      bottom: 0;
    }

    .stats-wrapper {
      width: 40%;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;

      canvas {
        width: 100%;
        height: 100%;
      }

    }

    .stat-values {
      width: 60%;
      height: 100%;
      box-sizing: border-box;
      padding: 1%;
      background: rgba(84, 80, 108, 1);


      table {
        table-layout: fixed;
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        color: #fff;

        max-height: calc(100dvh - 46px);
        font-size: 22px;

        thead {
          tr th {
            text-align: end;
            font-weight: 400;
            font-size: 16px;
          }
        }

        tbody {
          height: calc(100% - 30px);

          tr {
            height: calc(100% / 7);
            max-height: calc(100% / 7);

            td {
              height: calc((100dvh - 46px - 16) / 6);
              border-bottom: 1px solid rgba(255, 255, 255, 0.2);
              text-align: end;
              color: var(--color, white);
              padding: 1%;
              box-sizing: border-box;

              &:first-of-type {
                text-align: end;
              }

              div.value {
                display: flex;
                justify-content: space-between;

                span {
                  color: var(--color, white);
                }
              }

              .inputs {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;

                .double {
                  display: flex;
                  flex-direction: row;
                  gap: 4px;

                  button {
                    outline: none;
                    -webkit-touch-callout: none;
                    -webkit-user-select: none;
                    -khtml-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                    touch-action: pan-x pan-y;

                    border-radius: 4px;
                    border: 1px solid black;
                    background: rgba(84, 80, 108, .2);
                    color: white;
                    padding: 2px 6px;

                    &[disabled] {
                      background-color: rgba(255, 255, 255, .5);
                    }
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
