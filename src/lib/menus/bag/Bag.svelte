<div class="bag" style="--zIndex: {zIndex}"
     in:slide="{{duration: 500, delay: 100, axis: 'x', easing: backInOut}}" out:fade>

    <div class="tabs">
        <div class="current" style="--index: {tab}">
            <span>{tabs[tab]}</span>

            <div class="bubbles">
                {#if tab === 1}
                    <span class="bubble off" on:click={() => changeTab(0)}></span>
                {:else if tab === 2}
                    <span class="bubble off" on:click={() => changeTab(0)}></span>
                    <span class="bubble off" on:click={() => changeTab(1)}></span>
                {/if}

                <span class="bubble"></span>
            </div>
        </div>
        <button style="--index: 0" class:active={tab === 0} on:click={() => changeTab(0)}><span></span></button>
        <button style="--index: 1" class:active={tab === 1} on:click={() => changeTab(1)}><span></span></button>
        <button style="--index: 2" class:active={tab === 2} on:click={() => changeTab(2)}><span></span></button>


        <button class="back" on:click={() => back()}>BACK</button>

    </div>
    <div class="tab-content">

        <div class="item-desc">
            <div class="content">
                <p>{ITEMS.getItem(pocket[selected][0])?.name}</p>
                <p>{ITEMS.getItem(pocket[selected][0])?.description}</p>
            </div>
        </div>

        <div class="item-list">
            <ul bind:this={list}>
                {#each pocket as [id, qty], idx}
                    <li>
                        <div class="item" class:selected={selected === idx}
                             on:click={() => {selected = idx; openOptions = true}}>
                            <span>{ITEMS.getItem(id)?.name}</span>
                            <span>x {qty}</span>
                        </div>
                    </li>
                {/each}
            </ul>
        </div>

    </div>

    <div class="options" class:hidden={!openOptions}>
        <ul>
            <li class:selected={optionSelected === 0} on:click={() => use(undefined)}>USE</li>
            <li class:selected={optionSelected === 1} on:click={() => openOptions = false}>CANCEL</li>
        </ul>
    </div>
</div>

{#if openPokemonList}
    <PokemonList bind:pokemonListOpened={openPokemonList} bind:save={save} bind:isBattle={isBattle}
                 bind:itemToUse={itemToUse} onChange={(pkmn) => use(pkmn)} zIndex="{zIndex + 1}"/>
{/if}
<script lang="ts">

    import {SelectedSave} from "../../js/saves/saves";
    import {onMount} from "svelte";
    import {backInOut} from "svelte/easing";
    import {fade, slide} from 'svelte/transition';
    import {ITEMS} from "../../js/const";
    import PokemonList from "../pokemon-list/PokemonList.svelte";
    import {PokemonInstance} from "../../js/pokemons/pokedex";
    import {Bag} from "../../js/items/bag";
    import {Pokeball} from "../../js/items/items";


    export let bagOpened: boolean;
    export let save: SelectedSave;
    export let isBattle = false;
    export let selectedMons: number | undefined;

    export let list: HTMLUListElement;

    export let zIndex;

    let openOptions = false;
    let optionSelected = 0;

    let openPokemonList = false;


    let tab = 0;
    const tabs = {
        0: 'HEALING',
        1: 'REVIVE',
        2: 'POKEBALLS',
    };

    const categories = {
        0: 'potions',
        1: 'revives',
        2: 'balls',
    };

    $:pocket = Object.keys(save.player.bag[categories[tab]]).map(id => [id, save.player.bag[categories[tab]][id]]);
    $:itemToUse = pocket[selected][0];
    let selected = 0;

    export let onChange;

    function back() {
        bagOpened = false;
    }

    function use(pkmn?: PokemonInstance) {
        openOptions = false;

        let item = pocket[selected][0];
        let instance = ITEMS.getItem(item)?.instanciate();

        if (isBattle && !(instance instanceof Pokeball) && !pkmn) {
            openPokemonList = true;
        } else if (isBattle && instance instanceof Pokeball) {
            onChange({item: item});
        } else if (isBattle && pkmn !== undefined) {
            onChange(!!item && {item: item, target: pkmn});

        } else if (!isBattle) {
            if (selectedMons !== undefined) {
                save.player.bag.use(item, save.player.monsters[selectedMons]);
                save.player.bag = new Bag(save.player.bag);
                back();
            } else {
                openPokemonList = true;
            }
        }


    }

    function changeTab(number: number) {
        tab = number;
        selected = 0;
    }

    function consumeItem() {
        save.player.bag[categories[tab]][itemToUse]--;
        if (save.player.bag[categories[tab]][itemToUse] === 0) {
            delete save.player.bag[categories[tab]][itemToUse];
        }
        //openPokemonList = false;
    }

    const listener = (e: KeyboardEvent) => {
        if (!openOptions) {
            if (e.key === "ArrowRight") {
                tab = (tab + 1) % 3;
                selected = 0;
            } else if (e.key === "ArrowLeft") {
                tab = (tab + 2) % 3;
                selected = 0;
            } else if (e.key === "ArrowUp") {
                selected = (selected + pocket.length - 1) % pocket.length;
                if (selected === pocket.length - 1) {
                    list.scroll({top: list.clientHeight - list.children[0].clientHeight, behavior: 'smooth'});
                }
            } else if (e.key === "ArrowDown") {
                selected = (selected + 1) % pocket.length;
                if (selected === 0) {
                    list.scroll({top: 0, behavior: 'smooth'});
                }
            } else if (e.key === "Enter") {
                openOptions = true;
            } else if (e.key === "Escape") {
                back();
            }
        } else {
            e.preventDefault();
            if (e.key === "ArrowUp") {
                optionSelected = optionSelected === 0 ? 1 : optionSelected - 1;
            } else if (e.key === "ArrowDown") {
                optionSelected = optionSelected === 1 ? 0 : optionSelected + 1;
            } else if (e.key === "Enter") {
                if (optionSelected === 0) {
                    use(undefined);
                } else if (optionSelected === 1) {
                    openOptions = false;
                }
            } else if (e.key === "Escape") {
                openOptions = false;
                optionSelected = 0;
            }
        }
    };

    onMount(() => {
        window.addEventListener("keydown", listener);
        return () => {
            window.removeEventListener("keydown", listener);
        };
    });


</script>

<style lang="scss">
  .bag {
    position: absolute;
    top: 0;
    left: 0;
    width: 100dvw;
    height: 100dvh;
    background-image: url("p-sum.jpg");
    z-index: var(--zIndex, 8);

    .tabs {
      height: 46px;
      width: 100%;

      display: flex;
      align-items: center;

      background-color: #0078c0;
      font-size: 32px;
      color: white;
      text-shadow: 1px 1px 1px black;


      .current {
        width: calc(35% + (var(--index) + 1) * 80px);
        height: 100%;
        background-color: #313e62;
        display: flex;
        align-items: center;
        border-radius: 0 50px 50px 0;
        z-index: 2;
        position: relative;
        box-sizing: border-box;
        padding-left: 4%;
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
              background-color: rgba(255, 255, 255, 0.5);
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
        left: calc(35% + var(--index) * 80px);
        top: 0;
        z-index: 1;

        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

        touch-action: pan-x pan-y;
        outline: none;


        &.back {
          font-family: pokemon, serif;
          right: 1%;
          background: none;
          font-size: 32px;
          color: white;
          text-shadow: 1px 1px 1px black;
        }

        &.previous, &.next {
          background: none;
          font-size: 32px;
          color: white;
          text-align: center;
          z-index: 9;

          span.arrow {
            border: solid white;
            border-width: 0 5px 5px 0;
            display: inline-block;
            padding: 5px;
          }
        }

        &.previous {
          right: 14%;
          width: 40px;

          .arrow {
            transform: rotate(-135deg);
            -webkit-transform: rotate(-135deg);
            margin-top: 5px;
          }
        }

        &.next {
          right: 20%;
          width: 40px;

          .arrow {
            transform: rotate(45deg);
            -webkit-transform: rotate(45deg);
            margin-bottom: 5px;
          }
        }

        &:nth-child(4) {
          border-radius: 0 50px 50px 0;
        }

        span:not(.arrow) {
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
      background-color: rgba(0, 0, 0, 0.3);
      background-blend-mode: soft-light;

      display: flex;
      gap: 2%;

      .item-desc {
        height: 100%;
        width: 50%;
        padding: 1%;
        box-sizing: border-box;
        font-size: 32px;
        color: white;
        text-shadow: 1px 1px 1px black;

        .content {
          display: flex;
          flex-direction: column;
          height: 100%;
          align-items: center;
          justify-content: center;
          padding: 4%;
          box-sizing: border-box;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 8px;
        }
      }

      .item-list {
        max-height: 100%;
        width: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        color: white;
        text-shadow: 1px 1px 1px black;
        padding: 2%;

        ul {
          list-style: none;
          margin: 0;
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          overflow-y: scroll;
          padding: 2%;
          box-sizing: border-box;

          //todo scrolllbar
          scrollbar-width: thin;
          scrollbar-color: #68c0c8 #0e2742f0;


          li {
            display: flex;
            width: 100%;
            align-items: center;
            justify-content: center;
          }

          .item {
            display: flex;
            width: 100%;
            justify-content: space-between;
            padding: 2%;

            &.selected {
              // underline
              border-bottom: 2px solid rgba(255, 255, 255, 0.5);
            }
          }
        }
      }
    }

    .options {
      position: absolute;
      font-size: 32px;
      font-weight: 500;
      text-align: left;
      bottom: 1%;
      right: 1%;
      padding: 22px 36px 22px 36px;
      background: rgb(220, 231, 233);
      background: linear-gradient(180deg, rgba(220, 231, 233, 1) 0%, rgba(255, 255, 255, 1) 50%, rgba(220, 231, 233, 0.713344712885154) 100%);
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
  }
</style>
