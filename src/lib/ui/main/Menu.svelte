<div class="menu" class:open={menuOpened}>
    <ul>
        <li class:selected={selected===0} on:pointerover={()=>selected=0}>
            Pokedex
        </li>
        <li class:selected={selected===1} on:mouseover={()=>selected=1} on:click={() => openList()}>
            Pokemon
        </li>
        <li class:selected={selected===2} on:mouseover={()=>selected=2}>
            Bag
        </li>
        <li class:selected={selected===3} on:mouseover={()=>selected=3}>
            Trainer
        </li>
        <li class:selected={selected===4} on:mouseover={()=>selected=4} on:click={()=> saveCurrent()}>
            Save
        </li>
        <li class:selected={selected===5} on:mouseover={()=>selected=5}>
            Options
        </li>
        <li class:selected={selected===6} on:mouseover={()=>selected=6}>
            Credits
        </li>
    </ul>
</div>

<!-- TODO avoid escap open menu again -->
{#if pokemonListOpened}
    <PokemonList bind:save bind:pokemonListOpened bind:openSummary/>
{/if}

<script lang="ts">

    import type {SaveContext} from "../../js/saves/saves";
    import {SelectedSave} from "../../js/saves/saves";
    import PokemonList from "./PokemonList.svelte";
    import {onMount} from "svelte";

    export let menuOpened;

    export let pokemonListOpened;

    export let openSummary;

    export let saveContext: SaveContext;
    export let save: SelectedSave;

    let selected = 0;

    function saveCurrent() {
        saveContext = saveContext.updateSave(save.save);
        menuOpened = false;
    }

    function openList() {
        menuOpened = false;
        pokemonListOpened = true;
    }

    const listener = (e: KeyboardEvent) => {
        if (e.key === "ArrowUp") {
            selected = selected === 0 ? 6 : selected - 1;
        } else if (e.key === "ArrowDown") {
            selected = selected === 6 ? 0 : selected + 1;
        } else if (e.key === "Enter") {
            if (selected === 1) {
                openList();
            } else if (selected === 4) {
                saveCurrent();
            }
        }
    }

    onMount(() => {
        window.addEventListener("keydown", listener);
        return () => window.removeEventListener("keydown", listener);
    });

</script>

<style lang="scss">
  .menu {
    position: absolute;
    top: 0;
    right: -30%;
    width: 30%;
    height: 100%;
    font-size: 36px;
    background-color: #FFFFFF;
    z-index: 8;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    pointer-events: none;
    transition: right 0.3s ease-in-out;
    border: 3px solid #1e1e1e;
    border-radius: 16px;

    ul {
      box-shadow: inset #009688 0 0 0 5px,
      inset #059c8e 0 0 0 1px,
      inset #0cab9c 0 0 0 10px,
      inset #1fbdae 0 0 0 11px,
      inset #8ce9ff 0 0 0 16px,
      inset #48e4d6 0 0 0 17px,
      inset #e5f9f7 0 0 0 21px,
      inset #bfecf7 0 0 0 22px;
      border-radius: 12px;
      list-style: none;
      padding: 12px;
      box-sizing: border-box;
      margin: 0;
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      align-items: center;

      li {
        font-size: 2rem;
        text-align: center;
        cursor: pointer;
        flex-grow: 1;

        width: 100%;
        height: 100%;
        //min-height: 60px;

        display: flex;
        align-items: center;
        justify-content: center;

        &.selected {
          &:before {
            content: "";
            width: 0;
            height: 0;
            border-top: 12px solid transparent;
            border-bottom: 12px solid transparent;
            border-left: 12px solid #262626;
            position: absolute;
            left: 40px;
          }
        }
      }
    }

    &.open {
      opacity: 1;
      pointer-events: all;
      right: 0;
    }
  }
</style>
