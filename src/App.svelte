<svelte:options customElement="open-mon" accessors={true}/>


{#if letsgo}
    <MainScene bind:canvas={canvas}/>

{:else}
    {#if !ready}
        <div class="loading">
            <div class="o-pokeball c-loader u-swing"></div>
            <div>Gotta catch em all... {current}</div>
        </div>
    {:else}
        <div class="buttons">
            {#if save}
                <div class="letsgo">
                    <button class="start-btn" on:click={() => letsgo = true}>Continue!</button>
                    <img class="pika" alt="Evoli" src="src/assets/monsters/heartgold-soulsilver/133.png"/>
                </div>
            {/if}
            <div class="letsgo">
                <button class="start-btn" on:click={() => letsgo = true}>New game!</button>
                <img class="pika" alt="pikachu" src="src/assets/monsters/heartgold-soulsilver/25.png"/>
            </div>
        </div>
    {/if}
{/if}

<canvas bind:this={canvas}></canvas>

<script lang="ts">
    import MainScene from "./lib/scenes/MainScene.svelte";
    import {Monster} from "./lib/js/model/monster.ts";
    import {Player} from "./lib/js/model/player.js";

    export let canvas;

    let ready = false;
    let pokedex = [];
    let images = [];
    let letsgo = false;
    let current = '';
    let save;
    let player: Player;

    localStorage.getItem('pokedex') && (pokedex = JSON.parse(localStorage.getItem('pokedex')));
    localStorage.getItem('save') && (save = JSON.parse(localStorage.getItem('save')));


    if (pokedex.length > 0) {
        ready = true;

    } else {

        // read pokedex file to load images
        fetch('/src/assets/data/pokedex-gen1.json')
            .then(response => response.json())
            .then(data => {
                data.forEach((pokemon) => {

                    const front = new Image();
                    front.src = `/src/assets/monsters/heartgold-soulsilver/${pokemon.id}.png`;

                    const back = new Image();
                    back.src = `/src/assets/monsters/heartgold-soulsilver/back/${pokemon.id}.png`;

                    const shiny = new Image();
                    shiny.src = `/src/assets/monsters/heartgold-soulsilver/shiny/${pokemon.id}.png`;

                    Promise.all(Array.from([front, back, shiny]).map(img => new Promise(resolve => {
                        img.onload = img.onerror = resolve;
                    }))).then(() => {
                        current = pokemon.name.english;
                        const monster = new Monster(pokemon.id, pokemon.name.english, pokemon.type, pokemon.profile.ability, pokemon.base, pokemon.evolution, {
                            front: front,
                            back: back,
                            shiny: shiny
                        }, null, ['Tackle']);
                        pokedex.push(monster);

                        if (pokedex.length === data.length) {
                            localStorage.setItem('pokedex', JSON.stringify(pokedex));
                            ready = true;
                        }

                    })
                });

            });
    }

</script>

<style lang="scss">

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100dvh;
  }

  .u-swing {
    animation: swing 3000ms infinite;
  }

  @keyframes swing {
    20% {
      -webkit-transform: rotate(15deg);
      transform: rotate(15deg)
    }

    40% {
      -webkit-transform: rotate(-10deg);
      transform: rotate(-10deg)
    }

    60% {
      -webkit-transform: rotate(5deg);
      transform: rotate(5deg)
    }

    80% {
      -webkit-transform: rotate(-5deg);
      transform: rotate(-5deg)
    }

    to {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg)
    }
  }

  $size: 120px;

  .o-pokeball {
    width: $size;
    height: $size;
    border-radius: $size;
    border: solid ($size/25) black;
    position: relative;
    background: linear-gradient(to bottom, #EEEEEE 0%, #FFFFFF 100%);;
    margin: 10px auto;

    &:before,
    &:after {
      content: "";
      display: block;
    }

    &,
    &:before,
    &:after {
      transition: all 600ms cubic-bezier(.67, .4, .36, .75);
    }

    &:before {
      width: $size;
      height: ($size/2) -($size/25/2);
      border-bottom: solid ($size/25) black;
      border-radius: ($size/2) ($size/2) 0 0;
      background: linear-gradient(to bottom, #d10000 0%, #ff0000 50%);
    }

    &:after {
      content: "";
      width: $size/5;
      height: $size/5;
      background: linear-gradient(to bottom, #fff 0%, #ccc 100%);
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      box-shadow: 0 0 0 ($size/50) black,
      0 0 0 ($size/25) #ddd,
      0 0 0 ($size/14) black,
      0 0 ($size/10) ($size/17) rgba(0, 0, 0, 0.4);
    }
  }

  .buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100dvh;
    width: 20dvw;
    margin: auto;
    gap: 120px;

    .letsgo {
      position: relative;

      .pika {
        width: 200px;
        height: 200px;
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 1;
      }

      .start-btn {
        width: 200px;
        height: 80px;
        border-radius: 16px;
        position: relative;
        z-index: 2;
        font-family: pokemon, serif;
        font-size: 36px;

        box-shadow: inset #009688 0 0 0 5px,
        inset #059c8e 0 0 0 1px,
        inset #0cab9c 0 0 0 10px,
        inset #1fbdae 0 0 0 11px,
        inset #8ce9ff 0 0 0 16px,
        inset #48e4d6 0 0 0 17px,
        inset #e5f9f7 0 0 0 21px,
        inset #bfecf7 0 0 0 22px;
        text-shadow: 3px 3px 1px #bfecf7;

        cursor: pointer;

        &:hover {

          color: #fff;
          box-shadow: inset #009688 0 0 0 5px;
          text-shadow: none;
          font-weight: bold;
          background: #009688;

          + .pika {
            animation: bounce 1s infinite;
          }
        }
      }

      @keyframes bounce {
        0%, 20%, 53%, 80%, to {
          -webkit-animation-timing-function: cubic-bezier(.215, .61, .355, 1);
          animation-timing-function: cubic-bezier(.215, .61, .355, 1);
          -webkit-transform: translateZ(0);
          transform: translateZ(0)
        }

        40%, 43% {
          -webkit-transform: translate3d(0, -30px, 0);
          transform: translate3d(0, -30px, 0)
        }

        40%, 43%, 70% {
          -webkit-animation-timing-function: cubic-bezier(.755, .05, .855, .06);
          animation-timing-function: cubic-bezier(.755, .05, .855, .06)
        }

        70% {
          -webkit-transform: translate3d(0, -15px, 0);
          transform: translate3d(0, -15px, 0)
        }

        90% {
          -webkit-transform: translate3d(0, -4px, 0);
          transform: translate3d(0, -4px, 0)
        }
      }

    }
  }


</style>
