
<!-- TOOD : Pokedex, Options, Credits-->

<div class="menu-wrapper" class:open={menuOpened}>

    <div class="grid">
        <ul id="hexGrid">
            <li class="hex">
                <div class="hexIn">
                    <a class="hexLink" on:click={() => openList()}>
                        <img src="src/assets/menus/pokeball.png" alt="pokemons">
                        <h1>Pokémons</h1>
                        <div class='img'></div>
                    </a>
                </div>
            </li>

            <li class="hex">
                <div class="hexIn">
                    <a class="hexLink" href="#">
                        <img src="src/assets/menus/bag.png" alt="bag">
                        <h1>Bag</h1>
                        <div class='img'></div>
                    </a>
                </div>
            </li>
            <li class="hex">
                <div class="hexIn">
                    <a class="hexLink" href="#">
                        <img src="src/assets/menus/trainer.png" alt="trainer">
                        <h1>Trainer</h1>
                        <div class='img'></div>
                    </a>
                </div>
            </li>
            <li class="hex">
                <div class="hexIn">
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

    let menuSize = window.innerHeight * .2;

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
      .hex img {
       /* left: -100%;
        right: -100%;
        width: auto;
        height: 100%;
        margin: 0 auto;*/
        position: absolute;
        height: 50%;
        width: auto;
        top: 35%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
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
        color: rgba(255, 255, 255 , .65);
        position: absolute;
        bottom: 6%;
      }



      .img {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgb(118,167,177);
        background: radial-gradient(circle at 10% 20%, rgb(69, 86, 102) 0%, rgb(34, 34, 34) 90%);
        //background-image: linear-gradient(to bottom right, #434343 0%, black 100%);
        //background-image: linear-gradient(to bottom right, #38A2D7, #561139);
        //background: linear-gradient(149deg, rgba(118,167,177,1) 0%, rgba(91,103,138,0.9206276260504201) 11%, rgba(13,21,42,0.9122242647058824) 100%);
        background-position: center center;
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
      .hexLink:hover p, .hexLink:focus p {
        opacity: 1;
        transition: 0.8s;
      }


      .hexIn:hover .img:before,
      .hexIn:hover .img:after,
      .hexIn:hover .hexLink {
        opacity: 1;
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
