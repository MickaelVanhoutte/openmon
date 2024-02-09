<div class="screen">

    <div class="tabs">
        <div class="current" style="--index: {tab}">
            <span>{tabs[tab]}</span>

            <div class="bubbles">
                {#if tab === 1}
                    <span class="bubble off" on:click={() => tab = 0}></span>
                {:else if tab === 2}
                    <span class="bubble off" on:click={() => tab = 0}></span>
                    <span class="bubble off" on:click={() => tab = 1}></span>
                {/if}

                <span class="bubble"></span>
            </div>
        </div>
        <button style="--index: 0" class:active={tab === 0} on:click={() => tab = 0}><span></span></button>
        <button style="--index: 1" class:active={tab === 1} on:click={() => tab = 1}><span></span></button>
        <button style="--index: 2" class:active={tab === 2} on:click={() => tab = 2}><span></span></button>

        <button class="previous" on:click={()=> previous() }>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 16L6 10H18L12 16Z"></path>
            </svg>
        </button>
        <button class="next" on:click={()=> next() }>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8L18 14H6L12 8Z"></path>
            </svg>
        </button>

        <button class="back" on:click={()=>openSummary=false}>BACK</button>
    </div>

    <div class="tab-content">

        {#if tab === 0}
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

                <div class="memo">
                    <span class="title">TRAINER MEMO</span>
                    <p>{selectedMons.nature.toUpperCase() || 'UNKNOWN'} nature.</p>
                    <p>Met in PALLET TOWN at Lv 5.</p>
                </div>

            </div>
        {:else if tab === 1}
            <div class="stats">
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

                <div class="stat-values">

                    <ul>
                        <li class="hp">
                            <span class="th">HP</span>
                            <span class="td main">{selectedMons.currentHp}/{selectedMons.currentStats.hp}</span>
                            <span class="td">{selectedMons.ivs.hp}</span>
                            <span class="td">{selectedMons.evs.hp}</span>

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
                            <span class="td">{selectedMons.ivs.attack}</span>
                            <span class="td">{selectedMons.evs.attack}</span>

                        </li>
                        <li>
                            <span class="th">DEFENSE</span>
                            <span class="td main">{selectedMons.currentStats.defense}</span>
                            <span class="td">{selectedMons.ivs.defense}</span>
                            <span class="td">{selectedMons.evs.defense}</span>

                        </li>
                        <li>
                            <span class="th">SP.ATK</span>
                            <span class="td main">{selectedMons.currentStats.specialAttack}</span>
                            <span class="td">{selectedMons.ivs.specialAttack}</span>
                            <span class="td">{selectedMons.evs.specialAttack}</span>
                        </li>
                        <li>
                            <span class="th">SP.DEF</span>
                            <span class="td main">{selectedMons.currentStats.specialDefense}</span>
                            <span class="td">{selectedMons.ivs.specialDefense}</span>
                            <span class="td">{selectedMons.evs.specialDefense}</span>
                        </li>
                        <li>
                            <span class="th">SPEED</span>
                            <span class="td main">{selectedMons.currentStats.speed}</span>
                            <span class="td">{selectedMons.ivs.speed}</span>
                            <span class="td">{selectedMons.evs.speed}</span>
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
                                {abilities.find(ability => ability.names === selectedMons.currentAbility)?.description}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        {:else if tab === 2}
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
        {/if}
    </div>
</div>


<script lang="ts">
    import {onMount} from "svelte";
    import {SelectedSave} from "../../js/saves/saves";
    import {typeChart} from "../../js/battle/battle";
    import abilities from "../../../assets/data/final/abilities.json";

    export let save: SelectedSave;
    export let selected: number
    export let openSummary: boolean;

    let mechanicRegex = /{[^}]*}/g;

    $:selectedMons = save.player.monsters[selected];
    $:description = selectedMons.moves[selectedMove].description
        ?.replace("$effect_chance", selectedMons?.moves[selectedMove]?.effectChance)
        ?.replace(mechanicRegex, "");
    $:percent = Math.floor(selectedMons.currentHp * 100 / selectedMons?.currentStats.hp)

    let tab = 0;
    let selectedMove = 0;

    const tabs = {
        0: 'POKEMON INFO',
        1: 'POKEMON STATS',
        2: 'POKEMON SKILLS'
    }

    const listener = (e: KeyboardEvent) => {
        if (openSummary) {
            if (e.key === "ArrowRight") {
                tab = (tab + 1) % 3;
            } else if (e.key === "ArrowLeft") {
                tab = (tab + 2) % 3;
            } else if (e.key === "Escape") {
                openSummary = false;
            }

            if (tab === 2) {
                if (e.key === "ArrowDown") {
                    selectedMove = (selectedMove + 1) % selectedMons.moves.length;
                    console.log(selectedMons.moves[selectedMove].description);
                } else if (e.key === "ArrowUp") {
                    selectedMove = (selectedMove + selectedMons.moves.length - 1) % selectedMons.moves.length;
                }
            } else {
                if (e.key === "ArrowDown") {
                    next();
                } else if (e.key === "ArrowUp") {
                    previous();
                }
            }
        }
    }

    onMount(() => {
        window.addEventListener("keydown", listener);
        return () => {
            window.removeEventListener("keydown", listener);
        }
    })

    function previous() {
        selectedMove = 0;
        selected = selected === 0 ? save.player.monsters.length - 1 : selected - 1;
    }

    function next() {
        selectedMove = 0;
        selected = selected === save.player.monsters.length - 1 ? 0 : selected + 1;
    }
</script>

<style lang="scss">

  .screen {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    width: 100dvw;
    height: 100dvh;
    z-index: 9;

    .tabs {
      height: 46px;
      width: 100%;

      display: flex;
      align-items: center;

      background-color: #0078c0;
      font-size: 32px;
      color: white;
      text-shadow: 3px 1px 2px #54506c;


      .current {
        width: calc(40% + (var(--index) + 1) * 80px);
        height: 100%;
        background-color: #e0d898;
        display: flex;
        align-items: center;
        border-radius: 0 50px 50px 0;
        z-index: 2;
        position: relative;
        box-sizing: border-box;
        padding-left: 10%;
        justify-content: space-between;

        .bubbles {
          display: flex;
          gap: 62px;
          padding-right: 30px;

          .bubble {
            height: 26px;
            width: 18px;
            background-color: white;
            border-radius: 16px;
            position: relative;
            z-index: 9;

            &.off {
              background-color: rgba(84, 80, 108, 0.33);
            }
          }
        }

      }

      button {
        background-color: #68c0c8;
        border: none;
        width: 80px;
        height: 46px;
        position: absolute;
        left: calc(40% + var(--index) * 80px);
        top: 0;
        z-index: 1;

        &.back {
          font-family: pokemon, serif;
          right: 2%;
          background: none;
          font-size: 32px;
          color: white;
          text-shadow: 3px 1px 2px #54506c;
        }

        &.previous {
          right: 12%;
          background: none;
          font-size: 32px;
          color: white;
          display: flex;
          align-items: center;
        }

        &.next {
          right: 20%;
          background: none;
          font-size: 32px;
          color: white;
          display: flex;
          align-items: center;
        }

        &:nth-child(4) {
          border-radius: 0 50px 50px 0;
        }

        span {
          height: 26px;
          width: 18px;
          background-color: #0078c0;
          border-radius: 16px;
          position: absolute;
          z-index: 9;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }


      }
    }

    .tab-content {
      height: calc(100% - 46px);
      width: 100%;
      box-sizing: border-box;
      background-color: white;
    }

    .summary, .stats, .skills {
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
    }

    .summary {
      background-image: linear-gradient(0deg, #f8cfa8 25%, #f8a890 25%, #f8a890 50%, #f8cfa8 50%, #f8cfa8 75%, #f8a890 75%, #f8a890 100%);
      background-size: 16.00px 16.00px;

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

      .memo {
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
      }
    }

    .stats {
      background-image: linear-gradient(0deg, #f8d058 25%, #f8e878 25%, #f8e878 50%, #f8d058 50%, #f8d058 75%, #f8e878 75%, #f8e878 100%);
      background-size: 16.00px 16.00px;

      .stat-values {
        width: 60%;
        height: 60%;
        position: absolute;
        top: 0;
        right: 0;
        box-sizing: border-box;


        ul {
          list-style: none;
          margin: 0;
          padding: 2%;
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-sizing: border-box;

          li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;


            /*&.hp {
              position: relative;
              margin-bottom: 14px;

              .p-hp {

                width: 40%;
                display: flex;
                //gap: 16px;
                background-color: #262626;
                color: orange;
                align-items: center;
                justify-content: space-evenly;
                border-radius: 8px;
                padding: 0 3px;

                position: absolute;
                bottom: -17px;
                right: 0;

                font-size: 20px;

                .progressbar-wrapper {

                  height: 8px;
                  width: 100%;
                  background-color: #595b59;
                  border-radius: 4px;
                  border: 2px solid white;


                  .progressbar {
                    width: var(--width);
                    height: 100%;
                    background: rgb(184, 244, 166);
                    background: linear-gradient(0deg, rgba(184, 244, 166, 1) 0%, rgba(86, 170, 58, 1) 30%, rgba(86, 170, 58, 1) 50%, rgba(86, 170, 58, 1) 70%, rgba(184, 244, 166, 1) 100%);
                    text-align: center;
                    border-radius: 2px;

                    transition: width 1s ease-in-out, background 1s ease-in-out 1s;

                    &.warning {
                      background: rgb(255, 241, 164);
                      background: linear-gradient(0deg, rgba(255, 241, 164, 1) 0%, rgba(255, 194, 16, 1) 30%, rgba(255, 194, 16, 1) 50%, rgba(255, 194, 16, 1) 70%, rgba(255, 241, 164, 1) 100%);
                    }

                    &.danger {
                      background: rgb(244, 177, 159);
                      background: linear-gradient(0deg, rgba(244, 177, 159, 1) 0%, rgba(223, 85, 48, 1) 30%, rgba(223, 85, 48, 1) 50%, rgba(223, 85, 48, 1) 70%, rgba(244, 177, 159, 1) 100%);
                    }
                  }
                }
              }
            }*/


            .th {
              min-width: 30%;
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
              width: 18%;
              color: #54506c;
              background-color: #f8f0e8;
              padding: 0 8px;
              text-transform: uppercase;
              border-radius: 8px;
              font-size: 24px;
              line-height: 1.1;
              display: flex;
              justify-content: flex-end;
              gap: 16px;

              &.main {
                width: 34%;
              }
            }
          }
        }
      }

      .others {
        width: 98%;
        height: 36%;
        position: absolute;
        bottom: 2%;
        left: 1%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 2%;

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
                border-bottom: 3px solid #f8f9d8;
                padding: 0 16px;
                border-radius: 4px;
                display: flex;
                justify-content: space-between;

                &.value {
                  text-align: right;
                  background-color: #f8f9d8;
                  border-bottom: 3px solid #f9f8a1;
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
            padding: 10px;
            font-size: 21px;
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
              font-size: 24px;
              background-color: #f9f8a1;
              border-radius: 8px;
              padding: 4px 16px;
            }
          }


        }
      }
    }

    .skills {
      background-image: linear-gradient(0deg, #97e8d0 25%, #a7f0d8 25%, #a7f0d8 50%, #97e8d0 50%, #97e8d0 75%, #a7f0d8 75%, #a7f0d8 100%);
      background-size: 16.00px 16.00px;

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
        width: 38%;
        height: 34%;
        position: absolute;
        bottom: 2%;
        left: 1%;
        background-color: #f0f8f8;
        box-sizing: border-box;
        border-radius: 8px;
        padding: 4px 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        word-wrap: break-word;
        word-break: break-word;
        border: 4px solid #54506c;
      }
    }
  }
</style>
