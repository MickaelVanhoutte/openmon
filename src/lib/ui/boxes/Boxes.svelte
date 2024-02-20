<div class="boxes">
    <div class="party">
        <div class="title"><span>Party</span></div>
        <div class="entries">
            {#each save.player.monsters as pokemon, i}
                <div class="entry" class:over={selectZone === 'party' && over === i }
                     on:click={() => openOptions(new BoxSelection( 'party', i, selectedBox, pokemon))}>
                    <div>
                        <span>{pokemon.name}</span>
                        <span>Lv. {pokemon.level}</span>
                    </div>
                    <img src={pokemon.sprites[pokemon?.gender]?.front.frame1 || pokemon.sprites.male?.front?.frame1}
                         alt={pokemon.name}/>

                </div>
            {/each}
        </div>
    </div>

    <div class="preview" class:opened={previewOpened}></div>

    <div class="box">
        <div class="box-change" class:over={selectZone === 'box-change'}>
            <span on:click={() => prevBox()}> prev</span>
            <span> {box.name} </span>
            <span on:click={() => nextBox()}> next</span>
        </div>
        <div class="entries">

            {#each box.values as entry, index}
                <div class="entry"
                     class:over={selectZone === 'box' && over === index}
                     class:selected={firstSelection?.box === selectedBox && firstSelection?.index === index}
                     on:click={() => openOptions(new BoxSelection( 'box', index, selectedBox, entry))}
                >
                    <div class="title"
                         class:show={firstSelection?.box === selectedBox && firstSelection?.index === index && firstSelection.selected instanceof PokemonInstance && !firstSelection.moving}>
                        {entry?.name}
                    </div>
                    {#if entry instanceof PokemonInstance}
                        <img src={entry.sprites[entry?.gender]?.front.frame1 || entry.sprites.male?.front?.frame1}
                             alt={entry.name}>
                    {/if}
                </div>
            {/each}
        </div>
    </div>

    <div class="options" class:opened={optionsOpened}>
        <ul>
            <li>MOVE</li>
            <li>SUMMARY</li>
            <li>RELEASE</li>
            <li on:click={() => optionsOpened = false}>CANCEL</li>
        </ul>
    </div>
</div>

<script lang="ts">

    import {onMount} from "svelte";
    import {SelectedSave} from "../../js/saves/saves";
    import {BoxSelection} from "../../js/pokemons/boxes";
    import {PokemonInstance} from "../../js/pokemons/pokedex";

    let selectZone: 'party' | 'box' | 'box-change' = 'box';
    export let boxOpened: boolean;
    export let save: SelectedSave;

    let selectedBox = 0;
    let over: number = 0;

    $:box = save.boxes[selectedBox];

    let previewOpened: boolean;
    let optionsOpened: boolean;
    let selectedOption: number = 0;
    let firstSelection: BoxSelection;
    let secondSelection: BoxSelection;

    function openOptions(selection: BoxSelection) {
        selectedOption = 0;
        optionsOpened = true;
        firstSelection = selection;
    }

    function prevBox() {
        selectedBox = selectedBox - 1;
        if (selectedBox < 0) {
            selectedBox = save.boxes.length - 1;
        }
        selectZone = "box-change";
        over = 0;
    }

    function nextBox() {
        selectedBox = selectedBox + 1;
        if (selectedBox > save.boxes.length - 1) {
            selectedBox = 0;
        }
        selectZone = "box-change";
        over = 0;
    }

    const listener = (e) => {

        if (!optionsOpened) {
            if (e.key === 'Escape') {
                boxOpened = false;
            }

            if (e.key === 'ArrowLeft') {
                if (selectZone === 'box') {
                    if (over === 0 || over % 6 === 0) {
                        selectZone = 'party';
                        over = over / 6;
                    } else {
                        over--;
                    }
                } else if (selectZone === 'party') {
                    selectZone = 'box';
                    over = ((over + 1) * 6 - 1);
                } else if (selectZone === 'box-change') {
                    prevBox();
                }
            } else if (e.key === 'ArrowRight') {
                if (selectZone === 'box') {
                    if (over === 5 || over % 6 === 5) {
                        selectZone = 'party';
                        over = ((over + 1) / 6 - 1);
                    } else {
                        over++;
                    }
                } else if (selectZone === 'party') {
                    selectZone = 'box';
                    over = over * 6;
                } else if (selectZone === 'box-change') {
                    nextBox();
                }
            } else if (e.key === 'ArrowUp') {
                if (selectZone === 'box') {
                    if (over - 6 >= 0) {
                        over -= 6;
                    } else {
                        selectZone = 'box-change';
                    }
                } else if (selectZone === 'party') {
                    if (over - 1 >= 0) {
                        over--;
                    } else {
                        over = save.player.monsters.length;
                    }
                } else if (selectZone === 'box-change') {
                    selectZone = 'box';
                    over = box.values.length - 1;
                }
            } else if (e.key === 'ArrowDown') {
                if (selectZone === 'box') {
                    if (over + 6 < box.values.length) {
                        over += 6;
                    } else {
                        selectZone = 'box-change';
                    }
                } else if (selectZone === 'party') {
                    if (over + 1 < save.player.monsters.length) {
                        over++;
                    } else {
                        over = 0;
                    }
                } else if (selectZone === 'box-change') {
                    selectZone = 'box';
                    over = 0;
                }
            } else if (e.key === 'Enter') {
                if (!optionsOpened) {
                    if (selectZone === 'box') {
                        if (box[over] instanceof PokemonInstance) {
                            openOptions(new BoxSelection('box', over, selectedBox, box[over]));
                        }
                    } else if (selectZone === 'party') {
                        if (save.player.monsters[over] instanceof PokemonInstance) {
                            openOptions(new BoxSelection('party', over, selectedBox, box[over]));
                        }
                    }

                } else {
                    // todo map options
                }
            }
        } else {
            if (e.key === 'ArrowDown') {
                selectedOption = selectedOption + 1;
                if (selectedOption > 3) {
                    selectedOption = 0;
                }
            } else if (e.key === 'ArrowUp') {
                selectedOption = selectedOption - 1;
                if (selectedOption < 0) {
                    selectedOption = 3;
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

  .boxes {
    position: absolute;
    top: 0;
    left: 0;
    width: 100dvw;
    height: 100dvh;
    background-image: url("src/assets/menus/p-sum.jpg");
    background-size: cover;
    background-position: top left;
    background-repeat: round;
    z-index: 9;

    display: flex;
    flex-direction: row;

    .options {
      position: absolute;
      font-size: 32px;
      font-weight: 500;
      text-align: left;
      bottom: -100%;
      right: 1%;
      padding: 22px 36px 22px 36px;
      background: rgb(220, 231, 233);
      background: linear-gradient(180deg, rgba(220, 231, 233, 1) 0%, rgba(255, 255, 255, 1) 50%, rgba(220, 231, 233, 0.713344712885154) 100%);
      border: 2px solid #54506c;
      border-radius: 8px;
      box-sizing: border-box;
      transition: bottom 0.3s ease-in-out;

      &.opened {
        bottom: 1%;
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

    .party {
      height: 100%;
      width: 25%;

      display: flex;
      flex-direction: column;

      .title {
        height: 46px;
        width: 100%;

        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }

      .entries {
        height: calc(100dvh - 46px);
        width: 100%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        gap: 1%;

        .entry {
          color: white;
          font-size: 18px;
          height: calc((100dvh - 46px - 6%) / 6);
          width: 23dvw;
          margin: 0 auto;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 4px;
          padding-left: 4%;

          div {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
          }

          &:hover, &.over {
            background-color: rgba(255, 255, 255, 0.2);
          }

          img {
            height: 100%;
          }
        }
      }
    }

    .box {
      height: 100%;
      width: 75%;

      .box-change {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        height: 46px;
        width: 99%;

        &.over {
          background-color: rgba(0, 0, 0, 0.2);
        }

        span {


        }
      }

      .entries {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 1%;
        box-sizing: border-box;
        width: 100%;
        height: calc(100dvh - 46px);

        .entry {
          width: calc(94% / 6);
          height: calc(92% / 6);
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          align-content: center;
          flex-direction: row;
          position: relative;
          border-radius: 4px;

          &.over {
            background-color: rgba(255, 255, 255, 0.2);
          }

          .title {
            position: absolute;
            top: -24px;
            right: -12.5%;
            width: 125%;
            height: 16px;
            background-color: white;
            color: black;
            text-align: center;
            padding: 2px;
            border-radius: 8px;
            font-size: 16px;
            display: none;

            box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.5);

            &.show {
              display: block;
            }
          }

          img {
            height: 90%;
          }

          &.selected {
            background-color: rgba(0, 0, 0, 0.8);

            img {
              position: absolute;
              top: -2%;
            }
          }
        }
      }
    }
  }

</style>
