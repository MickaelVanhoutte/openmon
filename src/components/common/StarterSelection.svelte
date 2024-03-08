<div class="starter-select" style="--cnv-width: {canvasWidth}px">

    <div class="pokeballs" style="--ang:{angle}">

        {#each monsters as monster, index}
            <div class="pokeball"
                 style="--translateZ:{translateZ}px;
                 --rotateY: {index * (360/monsters?.length)}deg;">
                <img class="image" alt="poke-{monster.id}" src="{monster.sprites?.male?.front?.frame1}"
                     class:current={monster.id === currentPokemon.id}/>

                <!--<div class="image" style="background-image: url({monster.sprites?.male?.front?.frame1})"
                     class:current={monster.id === currentPokemon.id}>
                </div>-->
            </div>
        {/each}
        <div class="fade"></div>
    </div>
</div>

<div class="pagination">
    <button on:click={() => prev()}>←</button>
    <button on:click={() => next()}>→</button>
</div>

<DialogView {dialog}/>

<script lang="ts">

    import {onMount} from "svelte";
    import DialogView from "./DialogView.svelte";
    import {POKEDEX} from "../../js/const";
    import {Dialog, Message} from "../../js/common/scripts";
    import type {Writable} from "svelte/store";
    import type {WorldContext} from "../../js/common/context";

    export let context: WorldContext;
    export let canvasWidth;
    export let starterSelection: boolean;

    export let aButton: Writable<boolean>;

    let translateZ = canvasWidth * .4;

    let monsters = [
        POKEDEX.findById(1).result,
        POKEDEX.findById(4).result,
        POKEDEX.findById(7).result,
        POKEDEX.findById(179).result,
        POKEDEX.findById(183).result,
        POKEDEX.findById(246).result,
    ];

    let angle = 0;

    let currentIndex = 0;
    let currentPokemon = monsters[0];

    $:dialog = new Dialog([new Message(`Is ${currentPokemon.name} your starter?`)]);

    function prev() {
        angle -= (360 / monsters?.length);
        currentIndex = (currentIndex + 1) % monsters.length;
        currentPokemon = monsters[currentIndex];
    }

    function next() {
        angle += (360 / monsters?.length);
        currentIndex = (currentIndex - 1 + monsters.length) % monsters.length;
        currentPokemon = monsters[currentIndex];
    }

    function select() {
        context.player.monsters.push(currentPokemon.instanciate(5));
        starterSelection = false;
    }

    const keyDownListener = (e) => {
        switch (e.key) {
            case 'ArrowRight' :
                next();
                break;
            case 'ArrowLeft' :
                prev();
                break;
            case 'Enter' :
                select();
        }
    };
    let unsubscribe;

    onMount(() => {
        window.addEventListener('keydown', keyDownListener);
        setTimeout(() => {
            unsubscribe = aButton?.subscribe((value) => {
                if (value) {
                    select();
                }
            });
        }, 1000);

        return () => window.removeEventListener('keydown', keyDownListener);
    });

</script>
<style lang="scss">

  .starter-select {
    position: absolute;
    top: 0;
    left: calc(50dvw - var(--cnv-width, 100dvw) / 2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100dvh;
    width: var(--cnv-width, 100dvw);
    z-index: 8;

    perspective: 700px;
    perspective-origin: center;

    .pokeballs {
      transform-style: preserve-3d;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotateY(calc(var(--ang, 0) * 1deg)) translateY(-7dvh);
      transition: all 0.5s ease-in-out;

      .pokeball {
        border-radius: 20%;
        width: 25dvh;
        height: 25dvh;
        position: absolute;
        margin-top: -10dvh;
        background: rgba(0, 0, 0, 0.6);
        transform: rotateY(var(--rotateY, 0deg)) translateZ(var(--translateZ, 0px));

        &::before {
          content: "";
          height: 100%;
          width: 100%;
          opacity: .4;
          z-index: -1;
          border-radius: 20%;
          border: 4px solid black;
          box-sizing: border-box;
          background: url(src/assets/common/squared-ball.png);
          background-repeat: no-repeat;
          background-size: cover;
          background-position: 50% 50%;
          position: absolute;
        }

        .image {
          height: 60%;

          // center
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);

          &:not(.current) {
            filter: brightness(0);
          }
        }
      }
    }

    @keyframes spin {
      0% {
        transform: rotateY(0deg);
      }
      100% {
        transform: rotateY(360deg);
      }
    }

    .fade {
      background: rgba(0, 0, 0, 0.6);
      width: 100dvw;
      height: 100dvh;
      position: absolute;
      left: -50dvw;
      top: -40dvh;
      transform: rotateY(calc(var(--ang) * -1deg)) translateZ(110px);
      transition: all 0.5s ease-in-out;
    }

  }

  .pagination {

    position: absolute;
    bottom: 30%;
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 13;

    button {
      padding: 0;
      border: none;
      cursor: pointer;
      width: 44px;
      color: black;
      background: #fffa;
      height: 44px;
      margin: 0 10px;
      font-family: "Roboto", sans-serif;
      font-size: 20px;
      border-radius: 100%;
      transition: all 0.2s ease-in-out;
    }
  }
</style>
