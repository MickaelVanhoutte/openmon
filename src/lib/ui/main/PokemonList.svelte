<div class="pokemon-list">

    <div class="pokemons">
        <div class="first">
            <div class="poke-card big"
                 class:selected={selected === 0}
                 class:switching={switchToIdx === 0}
                 on:click={()=> select(0)}>
                <div class="header">
                    <div class="img-wrapper">
                        <img src="{first.sprites[first.gender].front.frame1}" alt="{first.name}"/>
                    </div>
                    <div>
                        <span>{first.name}</span>
                        <span>Lv{first.level}</span>
                    </div>
                    <!-- img, name, level, gender-->
                </div>

                <div class="footer">
                    <div class="hp">
                        <span>HP</span>
                        <div class="progressbar-wrapper">
                            <div class="progressbar" class:warning={getPercentage(first) <= 50}
                                 class:danger={getPercentage(first) < 15 }
                                 style="--width:{getPercentage(first) + '%'}">
                            </div>
                        </div>
                    </div>
                    <span class="hp-value">{first.currentHp} / {first.currentStats.hp}</span>
                </div>
            </div>
        </div>
        <div class="others">

            {#each others as monster, index}
                <div class="poke-card"
                     class:selected={selected === (index + 1)}
                     class:switching={switchToIdx === (index + 1)}
                     on:click={() => select(index + 1)}>
                    <div class="header">
                        <div class="img-wrapper">
                            <img src="{monster.sprites[monster.gender].front.frame1}" alt="{monster.name}"/>
                        </div>
                        <div>
                            <span>{monster.name}</span>
                            <span>Lv{monster.level}</span>
                        </div>
                        <!-- img, name, level, gender-->
                    </div>

                    <div class="footer">
                        <div class="hp">
                            <span>HP</span>
                            <div class="progressbar-wrapper">
                                <div class="progressbar" class:warning={getPercentage(monster) <= 50}
                                     class:danger={getPercentage(monster) < 15 }
                                     style="--width:{getPercentage(monster) + '%'}">
                                </div>
                            </div>
                        </div>
                        <span class="hp-value">{monster.currentHp} / {monster.currentStats.hp}</span>
                    </div>
                </div>
            {/each}

            {#each emptyslots as empty}
                <div class="poke-card empty">

                </div>
            {/each}
        </div>
    </div>

    <div class="actions">
        <button on:click={()=>pokemonListOpened=false}>CANCEL</button>
    </div>

    <!--<div class="context">
        <div class="menu">
            <p>Choose a Pokémon</p>
        </div>
    </div>-->

    <div class="options" class:hidden={!openOptions}>
        <ul>
            <li class:selected={optionSelected === 0} on:click={() => summarize()}>SUMMARY</li>
            <li class:selected={optionSelected === 1} on:click={() => saveSwitch()}>SWITCH</li>
            <li class:selected={optionSelected === 2}>ITEM</li>
            <li class:selected={optionSelected === 3} on:click={() => openOptions = false}>CANCEL</li>
        </ul>
    </div>
</div>

{#if openSummary}
    <PokemonSummary bind:save bind:update bind:selected bind:openSummary/>
{/if}

<script lang="ts">

    import {SelectedSave} from "../../js/saves/saves";
    import {PokemonInstance} from "../../js/pokemons/pokedex";
    import PokemonSummary from "./PokemonSummary.svelte";
    import {onMount} from "svelte";

    export let pokemonListOpened;

    export let openSummary;
    export let save: SelectedSave;

    export let selected = 0;

    export let update = false;

    let first = save.player.monsters.at(0);
    let others = save.player.monsters.slice(1);

    let switchToIdx = undefined;
    let openOptions = false;
    let optionSelected = 0;


    let emptyslots = new Array(6 - save.player.monsters.length).fill(0);

    function getPercentage(monster: PokemonInstance) {
        return monster.currentHp / monster.currentStats.hp * 100;
    }

    function select(index: number) {
        if (index === selected) {
            if (switchToIdx != undefined && selected != undefined) {
                switchTo();
            } else {
                openOptions = !openOptions
            }
        } else {
            selected = index;
            openOptions = false
        }
    }

    function saveSwitch() {
        switchToIdx = selected;
        openOptions = false;
    }

    function switchTo() {
        if (switchToIdx != undefined && selected != undefined) {
            swap(save.player.monsters, selected, switchToIdx);
            first = save.player.monsters.at(0);
            others = save.player.monsters.slice(1);
            switchToIdx = undefined;
        }
    }

    const swap = (array, index1, index2) => {
        array[index1] = array.splice(index2, 1, array[index1])[0];
    };

    function summarize() {
        openOptions = false;
        openSummary = true;
    }

    const listener = (e) => {
        if (openSummary) return;
        if (!openOptions) {
            if (e.key === "ArrowUp") {
                selected = selected === 0 ? others.length : selected - 1;
            } else if (e.key === "ArrowDown") {
                selected = selected === others.length ? 0 : selected + 1;
            } else if (e.key === "Enter") {
                if (switchToIdx != undefined && selected != undefined) {
                    switchTo();
                } else {
                    openOptions = true;
                }
            }
        } else {
            if (e.key === "ArrowUp") {
                optionSelected = optionSelected === 0 ? 3 : optionSelected - 1;
            } else if (e.key === "ArrowDown") {
                optionSelected = optionSelected === 3 ? 0 : optionSelected + 1;
            } else if (e.key === "Enter") {
                if (optionSelected === 0) {
                    summarize();
                } else if (optionSelected === 3) {
                    openOptions = false;
                } else if (optionSelected === 1) {
                    saveSwitch();
                }
            }
        }
    }

    onMount(() => {
        window.addEventListener('keydown', listener);
        return () => {
            window.removeEventListener('keydown', listener);
        }
    });


</script>

<style lang="scss">

  .options {
    position: absolute;
    font-size: 32px;
    font-weight: bold;
    text-align: left;
    bottom: 1%;
    right: 1%;
    padding: 22px 36px 22px 36px;
    background-color: white;
    border: 2px solid #54506c;
    border-radius: 8px;
    box-sizing: border-box;
    transition: bottom 0.3s ease-in-out;

    &.hidden {
      bottom: -100dvh;
    }

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 16px;

      li {
        &.selected {
          &:before {
            content: "";
            width: 0;
            height: 0;
            border-top: 12px solid transparent;
            border-bottom: 12px solid transparent;
            border-left: 12px solid #262626;
            position: absolute;
            left: 5px;
            margin-top: 2px;
          }
        }
      }
    }
  }

  .pokemon-list {
    position: absolute;
    top: 0;
    left: 0;
    width: 100dvw;
    height: 100dvh;
    background-image: url("src/assets/menus/pokemon-list.png");
    background-size: cover;
    background-position: top left;
    background-repeat: round;
    z-index: 8;

    .pokemons {
      height: 100%;
      width: 100%;
      display: flex;

      .first {
        width: 40%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .others {
        width: 60%;
        padding: 1%;
        display: flex;
        flex-direction: column;
        gap: 1%;
        box-sizing: border-box;
        align-items: flex-start;
        justify-content: center;

        .poke-card {
          /*flex-grow: 1;*/
          height: calc((100dvh - (4px * 6)) / 5);

          &.empty {
            background: none;
          }
        }
      }

      .poke-card {
        font-size: 32px;
        color: white;
        text-shadow: 3px 1px 2px #54506c;
        display: flex;
        flex-direction: row;
        gap: 5%;
        width: 100%;

        padding: 0 2% 0 0;
        box-sizing: border-box;
        border-radius: 200px 8px 8px 200px;
        justify-content: space-between;
        align-items: center;

        border: 6px solid #54506c;
        background-color: #4ba1de;
        background-image: linear-gradient(0deg, #95cfe0 46%, #4ba1de 46%, #4ba1de 50%, #95cfe0 50%, #95CFE0 56%, #4BA1DE 56%, #4ba1de 100%);
        background-size: 100% 100%;

        &.big {
          flex-direction: column;
          width: 86%;
          border-radius: 4px;
          padding-top: 8%;
          padding-bottom: 4%;
          align-items: normal;


          .header {
            padding-right: 2%;
            width: 100%;

            .img-wrapper{
              img {
                max-width: 70%;
                height: auto;
              }
            }
          }

          .footer {
            width: 100%;

            .hp {
              width: 60%;
            }
          }
        }

        &.selected {
          border: 6px solid #f27241;
          background-color: #8edeee;
          background-image: linear-gradient(0deg, #bbf2fe 46%, #8edeee 46%, #8edeee 50%, #bbf2fe 50%, #bbf2fe 56%, #8edeee 56%, #8edeee 100%);
          background-size: 100% 100%;
        }

        &.switching {
          border: 6px solid greenyellow;
        }

        .header {
          display: flex;
          flex-direction: row;
          position: relative;
          justify-content: space-around;
          //gap: 2%;
          height: 100%;
          width: 55%;
          align-items: center;

          div {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .img-wrapper {
           /* width: auto;
            height: 100%;*/

            img {
              /*width: 100%;
              height: 100%;*/
              max-width: 50%;
              height: auto;
            }
          }
        }

        .footer {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          width: 45%;
          /*background-color: #95cfe0;*/

          .hp {

            width: 100%;
            display: flex;
            //gap: 16px;
            background-color: #262626;
            color: orange;
            align-items: center;
            justify-content: space-evenly;
            border-radius: 8px;
            padding: 3px;

            & > span {
              padding: 0 12px;
              font-weight: bold;
            }

            .progressbar-wrapper {

              height: 24px;
              width: 100%;
              background-color: #595b59;
              border-radius: 4px;
              border: 2px solid white;

              .hp-value {

              }

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
        }
      }
    }

    .actions {
      position: absolute;
      bottom: 4px;
      left: 4px;
      width: calc(100% / 5);

      button {
        width: 100%;
        height: 46px;
        font-size: 32px;
        text-align: center;
        font-family: pokemon, serif;
        color: white;
        text-shadow: 3px 1px 2px #54506c;
        background-color: #5c4389;
        border-radius: 20px;
        border: 6px solid #3d3e53;
      }
    }

  }

  @media screen and (max-width: 1100px) {
    .pokemon-list {
      .pokemons {
        .poke-card {
          .footer {
            .hp {
              width: 100%;
              height: 18px;

              .progressbar-wrapper {
                height: 14px;
              }
            }
          }
        }
      }
    }
  }


</style>
