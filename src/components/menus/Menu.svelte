<div class="menu-wrapper" class:open={context.overWorldContext.menus.menuOpened}>

    <div class="grid">
        <ul id="hexGrid">

            <li class="hex">
                <div class="hexIn" class:selected={selected === 1}>
                    <button class="hexLink" on:click={() => openBoxes()} tabindex="1">
                        <img src="src/assets/menus/boxes.png" alt="pc boxes">
                        <span class="title">Boxes</span>
                        <span class='img'></span>
                    </button>
                </div>
            </li>


            <li class="hex">
                <div class="hexIn" class:selected={selected === 2}>
                    <button class="hexLink" on:click={() => openBag()} tabindex="1">
                        <img src="src/assets/menus/bag.png" alt="bag">
                        <span class="title">Bag</span>
                        <span class='img'></span>
                    </button>
                </div>
            </li>


            <li class="hex">
                <div class="hexIn" class:selected={selected === 0}>
                    <button class="hexLink" on:click={() => openList()} tabindex="1">
                        <img src="src/assets/menus/pokeball.png" alt="pokemons">
                        <span class="title">Pokémons</span>
                        <span class='img'></span>
                    </button>
                </div>
            </li>


            <li class="hex">
                <!-- EMPTY MIDDLE -->
            </li>


            <li class="hex">
                <div class="hexIn" class:selected={selected === 3}>
                    <button class="hexLink" on:click={() => pokedex()} tabindex="1">
                        <img src="src/assets/menus/pokedex.png" alt="pc boxes">
                        <span class="title">Pokedex</span>
                        <span class='img'></span>
                    </button>
                </div>
            </li>

            <li class="hex">
                <div class="hexIn" class:selected={selected === 5}>
                    <button class="hexLink" on:click={()=> saveCurrent()} tabindex="1">
                        <img src="src/assets/menus/save.png" alt="save">
                        <span class="title">Save</span>
                        <span class='img'></span>
                    </button>
                </div>
            </li>


            <li class="hex">
                <div class="hexIn" class:selected={selected === 4}>
                    <button class="hexLink" on:click={() => trainer()} tabindex="1">
                        <img src="src/assets/menus/trainer.png" alt="trainer">
                        <span class="title">Trainer</span>
                        <span class='img'></span>
                    </button>
                </div>
            </li>


            <li class="hex">
                <div class="hexIn" class:selected={selected === 6}>
                    <button class="hexLink" on:click={() => close()} tabindex="1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.0001 10.0001L19.0003 19L17.0003 19L17.0002 12.0001L9.41409 12V17.4142L2.99988 11L9.41409 4.58578L9.41409 10L19.0001 10.0001Z"></path>
                        </svg>
                        <span class="title">Back</span>
                        <span class='img'></span>
                    </button>
                </div>
            </li>
        </ul>
    </div>
</div>

{#if context.overWorldContext.menus.pokemonListOpened}
    <PokemonList bind:context bind:isBattle onChange={() => 0} zIndex="{9}"/>
{/if}

{#if context.overWorldContext.menus.bagOpened}
    <Bag bind:context bind:isBattle zIndex="{9}"/>
{/if}

{#if context.overWorldContext.menus.boxOpened}
    <Boxes bind:context/>
{/if}


<script lang="ts">

    import PokemonList from "./pokemon-list/PokemonList.svelte";
    import {onMount} from "svelte";
    import Bag from "./bag/Bag.svelte";
    import Boxes from "./boxes/Boxes.svelte";
    import type {GameContext} from "../../js/context/gameContext";

    // todo check, export might not be needed for most of them

    export let context: GameContext
    export let isBattle = false;

    let selected = 0;

    function saveCurrent() {
        // TODO
        context.overWorldContext.menus.menuOpened = false;
        //saveContext = saveContext.updateSave(save.save);
    }

    function openList() {
        context.overWorldContext.menus.menuOpened = false;
        context.overWorldContext.menus.pokemonListOpened = true;
    }

    function openBag() {
        context.overWorldContext.menus.menuOpened = false;
        context.overWorldContext.menus.bagOpened = true;
    }

    function openBoxes() {
        context.overWorldContext.menus.menuOpened = false;
        context.overWorldContext.menus.boxOpened = true
    }

    function trainer() {
        // TODO
    }

    function pokedex() {
        // TODO
    }

    function close() {
        context.overWorldContext.menus.menuOpened = false;
    }

    const listener = (e: KeyboardEvent) => {
        if (context.overWorldContext.menus.menuOpened) {
            if (e.key === "ArrowDown") {
                selected = selected === 0 ? 6 : selected - 1;
            } else if (e.key === "ArrowUp") {
                selected = selected === 6 ? 0 : selected + 1;
            } else if (e.key === "Enter") {
                if (selected === 0) {
                    openList();
                } else if (selected === 1) {
                    openBoxes()
                } else if (selected === 2) {
                    openBag();
                } else if (selected === 3) {
                    pokedex();
                } else if (selected === 4) {
                    trainer();
                } else if (selected === 5) {
                    saveCurrent();
                } else if (selected === 6) {
                    close();
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
    background: rgba(44, 56, 69, .6);
    background: radial-gradient(circle, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.6) 36%, rgba(0, 0, 0, .75) 50%, rgba(0, 0, 0, 1) 100%);
    z-index: -3;
    opacity: 0;
    transition: all .2s ease-in-out;

    &.open {
      z-index: 10;
      opacity: 1;
    }

    .grid {
      width: 80dvh;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-51%, -45%);


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
        transition: all 0.2s;
        backface-visibility: hidden;
        will-change: transform;

        &:last-of-type {
          width: 30%;
          position: absolute;
          bottom: 39.5%;
          left: -20%;
        }
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
        transition: all 0.2s;

        button {
          padding: 0;
          border: none;
          outline: none;
          background: none;
        }
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

      .hex img {
        position: absolute;
        height: 20px;
        width: 20px;
        scale: 2;
        top: 50%;
        left: 50%;
        transform-origin: left;
        transform: rotate(0deg) translate(-50%, -50%);
        z-index: 2;
      }

      .hex svg {
        position: absolute;
        height: 50%;
        width: auto;
        top: 25%;
        left: 50%;
        transform-origin: left;
        transform: rotate(0deg) translate(-50%, -50%);
        z-index: 2;
      }

      .hex svg {
        height: 33%;
        top: 38%;
      }

      .hex span.title, .hex p {
        width: 100%;
        box-sizing: border-box;
        font-weight: 500;
        font-size: 20px;
        font-family: pokemon, serif;
        opacity: 1;
        z-index: 1;
        color: white;
        text-shadow: none;
        position: absolute;
        bottom: 22%;
        left: 0;
        text-transform: uppercase;
      }


      .img {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(53, 156, 196, .8);
        background-size: cover;
        overflow: hidden;
        -webkit-clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      }

      .hexIn.selected {
        span.title {
          //color: white;
          //text-shadow: 1px 1px 6px black;
          color: rgba(0, 0, 0, .85);
        }

        img, svg {
          position: absolute;
          -webkit-backface-visibility: hidden;
          animation: shake 0.5s ease-in-out infinite;
        }

        .img {
          background: rgba(255, 255, 255, .6);
          //background: rgba(53, 156, 196, .8);
        }
      }

      @keyframes shake {
        0% {
          transform: rotate(0deg) translate(-50%, -50%);
        }
        25% {
          transform: rotate(10deg) translate(-50%, -50%);
        }
        50% {
          transform: rotate(0) translate(-50%, -50%);
        }
        75% {
          transform: rotate(-10deg) translate(-50%, -50%);
        }
        100% {
          transform: rotate(0deg) translate(-50%, -50%);
        }
      }

      .img:before, .img:after {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        content: '';
        opacity: 0;
        transition: opacity 0.2s;
      }

      .hexLink:hover span.title, .hexLink:focus span.title,
      .hexLink:hover p, .hexLink:focus p {
        opacity: 1;
        transition: 0.2s;
      }


      .hexIn.selected .img:before,
      .hexIn.selected .img:after,
      .hexIn.selected .hexLink,
      .hexIn:hover .img:before,
      .hexIn:hover .img:after,
      .hexIn:hover .hexLink {
        opacity: 1;

        .hexLink span.title, .hexLink p {
          opacity: 1;
          transition: 0.2s;
        }
      }


      #hexGrid {
        padding-bottom: 8%;
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
