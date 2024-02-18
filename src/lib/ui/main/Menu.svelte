<!-- TOOD : Pokedex, Options, Credits-->

<div class="menu-wrapper" class:open={menuOpened}>

    <div class="grid">
        <ul id="hexGrid">


            <li class="hex">
                <div class="hexIn" class:selected={selected === 0}>
                    <a class="hexLink" on:click={() => menuOpened = false}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.0001 10.0001L19.0003 19L17.0003 19L17.0002 12.0001L9.41409 12V17.4142L2.99988 11L9.41409 4.58578L9.41409 10L19.0001 10.0001Z"></path></svg>
                        <h1>Back</h1>
                        <div class='img'></div>
                    </a>
                </div>
            </li>



            <li class="hex">
                <div class="hexIn" class:selected={selected === 1}>
                    <a class="hexLink" on:click={() => openList()}>
                        <img src="src/assets/menus/pokeball.png" alt="pokemons">
                        <h1>Pokémons</h1>
                        <div class='img'></div>
                    </a>
                </div>
            </li>

            <li class="hex">
                <div class="hexIn" class:selected={selected === 2}>
                    <a class="hexLink" on:click={() => openBag()}>
                        <img src="src/assets/menus/bag.png" alt="bag">
                        <h1>Bag</h1>
                        <div class='img'></div>
                    </a>
                </div>
            </li>
            <li class="hex">
                <div class="hexIn" class:selected={selected === 3}>
                    <a class="hexLink">
                        <img src="src/assets/menus/trainer.png" alt="trainer">
                        <h1>Trainer</h1>
                        <div class='img'></div>
                    </a>
                </div>
            </li>
            <li class="hex">
                <div class="hexIn" class:selected={selected === 4}>
                    <a class="hexLink" on:click={()=> saveCurrent()}>
                        <img src="src/assets/menus/save.png" alt="save">
                        <h1>Save</h1>
                        <div class='img'></div>
                    </a>
                </div>
            </li>
        </ul>
    </div>
</div>

{#if pokemonListOpened}
    <PokemonList bind:save bind:pokemonListOpened bind:openSummary bind:isBattle onChange={() => 0} zIndex="{8}"/>
{/if}

{#if bagOpened}
    <Bag bind:save bind:bagOpened bind:isBattle zIndex="{8}"/>
{/if}

<script lang="ts">

    import type {SaveContext} from "../../js/saves/saves";
    import {SelectedSave} from "../../js/saves/saves";
    import PokemonList from "./PokemonList.svelte";
    import {onMount} from "svelte";
    import Bag from "./Bag.svelte";

    export let menuOpened: boolean;
    export let pokemonListOpened: boolean;
    export let bagOpened: boolean;
    export let openSummary;

    export let saveContext: SaveContext;
    export let save: SelectedSave;
    export let isBattle = false;

    let selected = 0;

    function saveCurrent() {
        // TODO confirm
        menuOpened = false;
        saveContext = saveContext.updateSave(save.save);
    }

    function openList() {
        menuOpened = false;
        pokemonListOpened = true;
    }

    function openBag() {
        menuOpened = false;
        bagOpened = true;
    }

    const listener = (e: KeyboardEvent) => {
        if (menuOpened) {
            if (e.key === "ArrowUp") {
                selected = selected === 0 ? 4 : selected - 1;
            } else if (e.key === "ArrowDown") {
                selected = selected === 4 ? 0 : selected + 1;
            } else if (e.key === "Enter") {
                if (selected === 0) {
                   menuOpened = false;
                } else if(selected === 1){
                    openList();
                } else if (selected === 2) {
                    openBag();
                } else if (selected === 3) {
                    // TODO : Trainer
                } else if (selected === 4) {
                    saveCurrent();
                }
            }
        }
    }

    onMount(() => {
        window.addEventListener("keydown", listener);
        return () => window.removeEventListener("keydown", listener);
    });

</script>

<style lang="scss">

  .menu-wrapper {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(44, 56, 69, 0.85);
    z-index: -3;
    opacity: 0;
    transition: all .2s ease-in-out;

    &.open {
      z-index: 10;
      opacity: 1;
    }

    .grid {
      width: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);


      #hexGrid {
        display: flex;
        flex-wrap: wrap;
        width: 90%;
        margin: 0 auto;
        overflow: hidden;
        font-family: sans-serif;
        list-style-type: none;
      }

      .hex {
        position: relative;
        visibility: hidden;
        outline: 1px solid transparent; /* fix for jagged edges in FF on hover transition */
        transition: all 0.5s;
        backface-visibility: hidden;
        will-change: transform;
        transition: all 0.5s;
      }

      .hex::after {
        content: '';
        display: block;
        padding-bottom: 86.602%; /* =  100 / tan(60) * 1.5 */
      }

      .hexIn {
        position: absolute;
        width: 96%;
        padding-bottom: 110.851%; /* =  width / sin(60) */
        margin: 2%;
        overflow: hidden;
        visibility: hidden;
        outline: 1px solid transparent; /* fix for jagged edges in FF on hover transition */
        -webkit-transform: rotate3d(0, 0, 1, -60deg) skewY(30deg);
        -ms-transform: rotate3d(0, 0, 1, -60deg) skewY(30deg);
        transform: rotate3d(0, 0, 1, -60deg) skewY(30deg);
        transition: all 0.5s;
      }


      .hexIn * {
        position: absolute;
        visibility: visible;
        outline: 1px solid transparent; /* fix for jagged edges in FF on hover transition */
      }

      .hexLink {
        display: block;
        width: 100%;
        height: 100%;
        text-align: center;
        color: #fff;
        overflow: hidden;
        -webkit-transform: skewY(-30deg) rotate3d(0, 0, 1, 60deg);
        -ms-transform: skewY(-30deg) rotate3d(0, 0, 1, 60deg);
        transform: skewY(-30deg) rotate3d(0, 0, 1, 60deg);
      }


      /*** HEX CONTENT **********************************************************************/
      .hex img, .hex svg {
        position: absolute;
        height: 50%;
        width: auto;
        top: 35%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
      }

      .hex svg {
        height: 33%;
      }

      .hex h1, .hex p {
        width: 100%;
        box-sizing: border-box;
        font-weight: 300;
        font-size: 26px;
        font-family: pokemon, serif;
        text-shadow: 1px 1px 6px black;
        //margin-top: 70%;
        opacity: 1;
        z-index: 1;
        color: rgba(255, 255, 255, .65);
        position: absolute;
        bottom: 6%;
      }


      .img {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: #359cc4;
        background-size: cover;
        overflow: hidden;
        -webkit-clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      }

      .img:before, .img:after {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        content: '';
        opacity: 0;
        transition: opacity 0.5s;
      }

      .img:before {
        background: rgba(22, 103, 137, 0.3)
      }

      .img:after {
        background: linear-gradient(to top, transparent, rgba(0, 0, 0, 0.5), transparent);
      }

      /*** HOVER EFFECT  **********************************************************************/


      .hexLink:hover h1, .hexLink:focus h1,
      .hexLink:hover h1, .hexLink:focus p {
        opacity: 1;
        transition: 0.8s;
      }


      .hexIn.selected .img:before,
      .hexIn.selected .img:after,
      .hexIn.selected .hexLink,
      .hexIn:hover .img:before,
      .hexIn:hover .img:after,
      .hexIn:hover .hexLink {
        opacity: 1;

        .hexLink h1, .hexLink p {
          opacity: 1;
          transition: 0.8s;
        }
      }


      #hexGrid {
        padding-bottom: calc(7.4%);
        font-size: 14px;
      }

      .hex {
        width: calc(33.333%); /* = 100 / 3 */
      }

      .hex:nth-child(5n+1) { /* first hexagon of even rows */
        margin-left: calc(16.666%); /* = width of .hex / 2  to indent even rows */
      }
    }
  }

</style>
<!--
<div class="hexagone"><div class="hexagonemain"></div></div>

.hexagone {
    position: relative;
    /* Pour rendre responsive mettre width à 100% *;
    width: 103.92305px;
    visibility: hidden;
    overflow: hidden;
    -webkit-filter : drop-shadow(5px 5px 5px rgba(0,0,0,0.6));
    filter : drop-shadow(5px 5px 5px rgba(0,0,0,0.6));
}
.hexagone:after {
    -moz-box-sizing: content-box;
    -webkit-box-sizing: content-box;
    box-sizing: content-box;
    content: "";
    display: block;
    margin-top: 28.86751%;
    padding-bottom: 86.602%;
}
.hexagone .hexagonemain{
    display: block;
    position: absolute;
    width: 100%;
    padding-bottom: 115.47005%;
    overflow: hidden;
    visibility: hidden;
    -webkit-transform: rotate3d(0, 0, 1, -60deg) skewY(30deg);
    -ms-transform: rotate3d(0, 0, 1, -60deg) skewY(30deg);
    transform: rotate3d(0, 0, 1, -60deg) skewY(30deg);
    z-index: 1;
}
.hexagone .hexagonemain:before{
    content: "";
    display: block;
    position: absolute;
    visibility: visible;
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #2c2c5b;
    -webkit-transform: skewY(-30deg) rotate3d(0, 0, 1, 60deg);
    -ms-transform: skewY(-30deg) rotate3d(0, 0, 1, 60deg);
    transform: skewY(-30deg) rotate3d(0, 0, 1, 60deg);
}-->
