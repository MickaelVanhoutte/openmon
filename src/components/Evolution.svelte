<div class="evolution">

    <div class="evolve">
        <img src={current} alt="evolve" class="pokemon" class:current={mainCurrent} bind:this={currentImg}
             style="animation: {mainAnimation};"/>
        <img src={next} alt="evolve" class="pokemon" class:current={nextCurrent} bind:this={nextImg}
             style="animation: {nextAnimation};"/>
    </div>
    <div class="circle-wrap" bind:this={circlesWrap}>
        <div class="circle c1"></div>
        <div class="circle c2"></div>
        <div class="circle c3"></div>
        <div class="circle c4"></div>
        <div class="circle c5"></div>
    </div>

    <div class="bubble-wrap" bind:this={bubblesWrap}>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
    </div>

    {#if dialog}
        <DialogView bind:dialog={dialog} bind:animate={animateD}/>
    {/if}
</div>



<script lang="ts">
    import type {PokemonInstance} from "../js/pokemons/pokedex";
    import {POKEDEX} from "../js/const";
    import {onMount} from "svelte";
    import type {WorldContext} from "../js/common/context";
    import DialogView from "./common/DialogView.svelte";
    import {Dialog, Message} from "../js/common/scripts";

    export let context: WorldContext;

    let evolve: PokemonInstance = context?.player?.monsters?.find(p => p.canEvolve());

    export let currentImg: HTMLImageElement;
    export let nextImg: HTMLImageElement;

    export let circlesWrap: HTMLDivElement;
    export let bubblesWrap: HTMLDivElement;

    let current = evolve?.sprites && evolve?.sprites[evolve?.gender]?.front?.frame1 || evolve?.sprites?.male?.front?.frame1;
    let nextPoke = POKEDEX.findById(parseInt(evolve?.evolution[0]?.id+'' || '0'))?.result;
    let next = nextPoke?.sprites && nextPoke?.sprites[evolve?.gender]?.front?.frame1 || nextPoke?.sprites?.male?.front?.frame1
    const animationTime = 12;

    let dialog = new Dialog([
        new Message(`What ? ${evolve?.name} is evolving!`, 'System'),
    ]);
    let animateD = false;

    let timedout = false;
    $: mainAnimation = timedout ? `evolve-out ${animationTime}s forwards` : '';
    $: nextAnimation = timedout ? `evolve-in ${animationTime}s forwards` : '';
    $: mainCurrent = timedout ? '' : 'current';
    $: nextCurrent = timedout ? 'current' : '';

    function evolveAnimation() {


        let circles = [...circlesWrap.children];
        let bubbles = [...bubblesWrap.children];

        timedout = false;
        setTimeout(() => {
            dialog = new Dialog(
                [new Message(`Congratulations! Your ${evolve?.name} has evolved into ${nextPoke?.name}!`, 'System')]
            );
            evolve.evolve(POKEDEX.findById(parseInt(evolve?.evolution[0]?.id +'' || '0')));
        }, 500 + animationTime * 1000);

        timedout = true
        circles.map((el, i) => el.style.animation = `tunnel ${animationTime}s linear ${i * .1}s`);
        bubbles.map((el, i) => el.style.animation = `bubble .4s reverse ${(animationTime - 2) + i * .05}s`);

    }

    onMount(() => {

        setTimeout(() => {
            evolveAnimation();
        }, 1000);
    });
</script>

<style lang="scss">

  @keyframes -global-evolve-out {
    0% {
      visibility: visible;
      filter: brightness(100%);
      transform: scale(1);
    }
    16.6%, 33.2%, 41.5%, 49.8%, 53.95%, 58.1%, 62.25%, 66.4%, 68.475%, 70.55%, 72.625%, 74.7%, 76.775%, 78.85%, 80.925% {
      filter: brightness(0%) invert(100%);
      opacity: 1;
      transform: scale(1);
    }
    24.9%, 37.35%, 45.65%, 51.875%, 56.025%, 60.175%, 64.325%, 67.4375%, 69.5125%, 71.5875%, 73.6625%, 75.7375%, 77.8125%, 79.8875%, 81.9625% {
      filter: brightness(0%) invert(100%);
      opacity: 0;
      transform: scale(0.25);
    }
    83.3%, 100% {
      visibility: hidden;
      filter: brightness(0%) invert(100%);
      opacity: 0;
      transform: scale(0.25);
    }
  }

  @keyframes -global-evolve-in {
    0%, 16.6%, 33.2%, 41.5%, 49.8%, 53.95%, 58.1%, 62.25%, 66.4%, 68.475%, 70.55%, 72.625%, 74.7%, 76.775%, 78.85%, 80.925% {
      visibility: visible;
      filter: brightness(0%) invert(100%);
      opacity: 0;
      transform: scale(0.25);
    }
    24.9%, 37.35%, 45.65%, 51.875%, 56.025%, 60.175%, 64.325%, 67.4375%, 69.5125%, 71.5875%, 73.6625%, 75.7375%, 77.8125%, 79.8875%, 81.9625%, 96% {
      filter: brightness(0%) invert(100%);
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 1;
      filter: brightness(100%);
      transform: scale(1);
      visibility: visible;
    }
  }

  @keyframes -global-tunnel {
    0%, 16.517%, 33.283%, 41.583%, 49.883%, 58.183%, 66.483%, 83.083% {
      transform: scale(0.6);
      opacity: 0;
    }
    16.6%, 33.366%, 41.666%, 49.966%, 58.266%, 66.566%, 83.166% {
      transform: scale(0.6);
      opacity: 1;
    }
    20.75%, 37.35%, 45.65%, 53.95%, 62.25%, 70.55%, 87.15% {
      transform: scale(3.5);
      opacity: 1;
    }
    24.9%, 41.5%, 49.8%, 58.1%, 66.4%, 74.7%, 91.3% {
      transform: scale(7);
      opacity: 0;
    }
  }

  @keyframes -global-bubble {
    100% {
      transform: translate(0, 140px);
      opacity: 0;
    }
    90%, 10% {
      opacity: 1;
    }
    5%, 0% {
      opacity: 0;
    }
  }

  .evolution {
    position: absolute;
    top: 0;
    left: 0;
    width: 100dvw;
    height: 100dvh;
    background: rgba(0, 0, 0, 1);

    z-index: 12;

    .evolve {
      display: flex;
      height: 75%;
      width: 100%;
      justify-content: center;
      align-items: center;
      position: relative;


      img.pokemon {

        width: auto;
        height: 60%;
        display: block;
        margin: auto;
        user-select: none;

        position: absolute;
        opacity: 1;
        visibility: visible;

        &:not(.current) {
          opacity: 0;
          visibility: hidden;
        }
      }
    }

    .circle {
      position: absolute;
      left: 50%;
      top: 40%;
      margin: calc(-1 * (45dvh / 2)) 0 0 calc(-1 * (45dvh / 2));
      width: 45dvh;
      height: 45dvh;
      border-radius: 50%;
      opacity: 0;

      &.c1 {
        box-shadow: 0 0 8px 65px rgba(128, 206, 255, .5);
      }

      &.c2 {
        box-shadow: 0 0 8px 65px rgba(117, 202, 255, .65);
      }

      &.c3 {
        box-shadow: 0 0 8px 65px rgba(87, 190, 255, .8);
      }

      &.c4 {
        box-shadow: 0 0 8px 65px rgba(117, 202, 255, .65);
      }

      &.c5 {
        box-shadow: 0 0 8px 65px rgba(128, 206, 255, .5);
      }
    }

    //Bubbles
    .bubble-wrap {

      .bubble {
        position: absolute;
        left: 50%;
        top: 10%;
        opacity: 0;
        border-radius: 50%;
      }

      @for $i from 1 through 20 {
        .bubble:nth-child(#{$i}) {
          $size: random(30)+px;
          height: $size;
          width: $size;
          margin: calc(-1 * ($size / 2)) 0 0 calc(-1 * ($size / 2));
          transform: translate(random(300) - 150px, random(100)-200px);
          animation-delay: $i * 0.05s;
          background: hsl(0%, 0%, 100%);
        }

      }
    }
  }

</style>
