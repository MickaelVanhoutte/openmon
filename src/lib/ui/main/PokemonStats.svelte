<div class="stats">
    <div class="img-wrapper" class:enlarge={statEdit}>
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

    <div class="stat-values" class:minimize={statEdit}>

        <ul>
            <li class="head">
                <div class="edit" class:flash={selectedMons.evsToDistribute > 0}>
                    <button on:click={() => statEdit = !statEdit}>
                        <span class="svg">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path
                                    d="M5.33409 4.54491C6.3494 3.63637 7.55145 2.9322 8.87555 2.49707C9.60856 3.4128 10.7358 3.99928 12 3.99928C13.2642 3.99928 14.3914 3.4128 15.1245 2.49707C16.4486 2.9322 17.6506 3.63637 18.6659 4.54491C18.2405 5.637 18.2966 6.90531 18.9282 7.99928C19.5602 9.09388 20.6314 9.77679 21.7906 9.95392C21.9279 10.6142 22 11.2983 22 11.9993C22 12.7002 21.9279 13.3844 21.7906 14.0446C20.6314 14.2218 19.5602 14.9047 18.9282 15.9993C18.2966 17.0932 18.2405 18.3616 18.6659 19.4536C17.6506 20.3622 16.4486 21.0664 15.1245 21.5015C14.3914 20.5858 13.2642 19.9993 12 19.9993C10.7358 19.9993 9.60856 20.5858 8.87555 21.5015C7.55145 21.0664 6.3494 20.3622 5.33409 19.4536C5.75952 18.3616 5.7034 17.0932 5.0718 15.9993C4.43983 14.9047 3.36862 14.2218 2.20935 14.0446C2.07212 13.3844 2 12.7002 2 11.9993C2 11.2983 2.07212 10.6142 2.20935 9.95392C3.36862 9.77679 4.43983 9.09388 5.0718 7.99928C5.7034 6.90531 5.75952 5.637 5.33409 4.54491ZM13.5 14.5974C14.9349 13.7689 15.4265 11.9342 14.5981 10.4993C13.7696 9.0644 11.9349 8.57277 10.5 9.4012C9.06512 10.2296 8.5735 12.0644 9.40192 13.4993C10.2304 14.9342 12.0651 15.4258 13.5 14.5974Z"></path></svg>
                        </span>
                        <span>({selectedMons.evsToDistribute} EVs)</span>
                    </button>
                </div>
                <span class="th main">VALUE</span>
                <span class="th">IV</span>
                <span class="th">EV</span>
            </li>

            <li>
                <span class="th"
                      style="color:{natureColor('hp',selectedMons.nature)}"
                >HP</span>
                <span class="td main">{selectedMons.currentHp}/{selectedMons.currentStats.hp}</span>
                <span class="td" style="--color:{ivColor(selectedMons.ivs.hp)}">{selectedMons.ivs.hp}</span>
                <span class="td inputs">
                                <span>{selectedMons.evs.hp}</span>
                            </span>
            </li>
            <li>
                <span class="th"
                      style="color:{natureColor('attack',selectedMons.nature)}"
                >ATTACK</span>
                <span class="td main">{selectedMons.currentStats.attack}</span>
                <span class="td"
                      style="--color:{ivColor(selectedMons.ivs.attack)}">{selectedMons.ivs.attack}</span>
                <span class="td inputs">
                                <span>{selectedMons.evs.attack}</span>
                            </span>

            </li>
            <li>
                <span class="th"
                      style="color:{natureColor('defense',selectedMons.nature)}"
                >DEFENSE</span>
                <span class="td main">{selectedMons.currentStats.defense}</span>
                <span class="td"
                      style="--color:{ivColor(selectedMons.ivs.defense)}">{selectedMons.ivs.defense}</span>
                <span class="td inputs">
                                <span>{selectedMons.evs.defense}</span>
                            </span>

            </li>
            <li>
                <span class="th"
                      style="color:{natureColor('specialAttack',selectedMons.nature)}"
                >SP.ATK</span>
                <span class="td main">{selectedMons.currentStats.specialAttack}</span>
                <span class="td"
                      style="--color:{ivColor(selectedMons.ivs.specialAttack)}">{selectedMons.ivs.specialAttack}</span>
                <span class="td inputs">
                                <span>{selectedMons.evs.specialAttack}</span>
                            </span>
            </li>
            <li>
                <span class="th"
                      style="color:{natureColor('specialDefense',selectedMons.nature)}"
                >SP.DEF</span>
                <span class="td main">{selectedMons.currentStats.specialDefense}</span>
                <span class="td"
                      style="--color:{ivColor(selectedMons.ivs.specialDefense)}">{selectedMons.ivs.specialDefense}</span>
                <span class="td inputs">
                                <span>{selectedMons.evs.specialDefense}</span>
                            </span>
            </li>
            <li>
                <span class="th"
                      style="color:{natureColor('speed',selectedMons.nature)}"
                >SPEED</span>
                <span class="td main">{selectedMons.currentStats.speed}</span>
                <span class="td"
                      style="--color:{ivColor(selectedMons.ivs.speed)}">{selectedMons.ivs.speed}</span>
                <span class="td inputs">
                                <span>{selectedMons.evs.speed}</span>
                            </span>
            </li>
        </ul>

    </div>
    <div class="others" class:minimize={statEdit}>

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
            <div class="title">
                <span class="td">{selectedMons.currentAbility}</span>
            </div>
            <div class="desc">
                {abilities.find(ability => ability.names === selectedMons.currentAbility)?.description.replace(mechanicRegex, "")}
            </div>
        </div>
    </div>
</div>


<div class="stats-edit" class:open={statEdit}>
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
                        <span style="color:{natureColor('hp',selectedMons.nature)}">HP</span>
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
                        <span style="color:{natureColor('attack',selectedMons.nature)}">ATK.</span>
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
                        <span style="color:{natureColor('defense',selectedMons.nature)}">DEF.</span>
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
                        <span style="color:{natureColor('specialAttack',selectedMons.nature)}">SP.ATK</span>
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
                        <span style="color:{natureColor('specialDefense',selectedMons.nature)}">SP.DEF</span>
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
                        <span style="color:{natureColor('speed',selectedMons.nature)}">SPEED</span>
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
    import abilities from "../../../assets/data/final/abilities.json";
    import {onMount} from "svelte";
    import type {PokemonInstance} from "../../js/pokemons/pokedex";
    import {Nature} from "../../js/pokemons/pokedex";

    export let save: SelectedSave;
    export let selected: number;
    export let prevSelected: number;

    export let statEdit: boolean;
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

    let mechanicRegex = /{[^}]*}/g;


    function ivColor(value: number) {

        if (value >= 26) {
            return '#27d227';
        } else if (value >= 16) {
            return '#e8a327';
        } else {
            return '#f54949';
        }
    }

    function natureColor(stat: string, nature: Nature) {
        if (nature.increasedStatId === nature.decreasedStatId) {
            return 'white';
        } else if (nature.increasedStatId === stat) {
            return '#1383f6';
        } else if (nature.decreasedStatId === stat) {
            return '#e74462';
        } else {
            return 'white';
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

    let chart;
    $:ctx = graph?.getContext('2d');

    $: {
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

    .img-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 30%;
      height: 60%;
      background-color: #c8a8e8;
      border-right: 4px solid #54506c;
      border-bottom: 4px solid #54506c;
      box-sizing: border-box;

      transition: width 0.5s ease-in-out, height 0.5s ease-in-out;

      &.enlarge {
        width: 45%;
        height: 100%;
      }

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

    .stat-values {
      width: 70%;
      height: 70%;
      max-height: 65%;
      position: absolute;
      top: 0;
      right: 0;
      box-sizing: border-box;
      border-top: 4px solid #e0f8f8;
      border-right: 4px solid #e0f8f8;

      transition: width 0.5s ease-in-out;

      &.minimize {
        width: 55%;
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 0 1%;
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

            .edit {
              min-width: 30%;

              &.flash button .svg {
                animation: flash 2s ease-in-out infinite;
              }

              @keyframes flash {
                0% {
                  color: #54506c;
                }
                50% {
                  color: rgb(19, 131, 246);
                }
                100% {
                  color: #54506c;
                }
              }

              button {
                background-color: transparent;
                border: none;
                cursor: pointer;
                padding: 0;
                margin: 0;
                display: flex;
                align-items: center;
                width: 100%;
                justify-content: flex-start;
                font-family: pokemon, serif;
                font-size: 22px;
                gap: 2%;
                color: #54506c;
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

            .th {
              font-size: 24px;
              justify-content: flex-start;
              width: 21%;
              min-width: unset;


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
          }
        }
      }
    }

    .others {
      width: 98%;
      height: 29%;
      max-height: 29%;
      position: absolute;
      bottom: 1%;
      left: 1%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4%;
      visibility: visible;

      &.minimize {
        visibility: hidden;
      }

      .exp {
        display: flex;
        justify-content: space-between;
        align-items: center;
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
        flex-direction: row;
        justify-content: space-between;
        gap: 2%;
        padding: 0;
        box-sizing: border-box;

        .title {
          width: 20%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
          justify-content: space-around;
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


        .desc {
          width: 77%;
          font-size: 22px;
          background-color: #f9f8a1;
          border-radius: 8px;
          padding: 1%;
        }


      }
    }
  }

  .stats-edit {
    background: rgba(84, 80, 108, .95);

    border: 4px solid #54506c;
    height: calc(100% - 46px);
    width: 100%;
    box-sizing: border-box;
    position: absolute;

    z-index: 2;
    left: 0;
    bottom: -100%;
    transition: bottom 0.5s ease-in-out;

    &.open {
      bottom: 0;
    }

    .stats-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 45%;
      height: 100%;
      //background-color: rgba(84, 80, 108, .5);
      box-sizing: border-box;

      canvas {
        width: 100%;
        height: 100%;
        margin: auto;
      }

    }

    .stat-values {
      width: 55%;
      height: 100%;
      position: absolute;
      top: 0;
      right: 0;
      box-sizing: border-box;
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

                span {
                  color: var(--color, white);
                }
              }

              &.inputs {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;

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
                }
              }
            }
          }
        }
      }
    }
  }
</style>
