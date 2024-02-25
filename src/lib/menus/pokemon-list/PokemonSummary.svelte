<div class="screen" style="--zIndex:{zIndex}"
     in:slide="{{duration: 500, delay: 100,axis: 'x', easing: backInOut}}" out:fade>

    <div class="tabs">
        <div class="current" style="--index: {tab}">
            <span>{tabs[tab].replace("$POKEMON", selectedMons.name)}</span>

            <div class="bubbles">
                {#if tab === 1}
                    <span class="bubble off" on:click={() => tab = 0}></span>
                {:else if tab === 2}
                    <span class="bubble off" on:click={() => tab = 0}></span>
                    <span class="bubble off" on:click={() => tab = 1}></span>
                {/if}

                <span class="bubble"></span>
            </div>
        </div>
        <button style="--index: 0" class:active={tab === 0} on:click={() => tab = 0}><span></span></button>
        <button style="--index: 1" class:active={tab === 1} on:click={() => tab = 1}><span></span></button>
        <button style="--index: 2" class:active={tab === 2} on:click={() => tab = 2}><span></span></button>

        <button class="previous" on:click={()=> previous() }>
            <span class="arrow"></span>
        </button>
        <button class="next" on:click={()=> next() }>
            <span class="arrow"></span>
        </button>

        <button class="back" on:click={() => back()}>BACK</button>
    </div>

    <div class="tab-content">

        {#if tab === 0}
            <PokemonInfo bind:save bind:selected
                         bind:pkmnList
                         bind:zIndex={zIndexNext}/>
        {:else if tab === 1}
            <PokemonStats bind:save bind:selected bind:statEdit bind:isBattle
                          bind:pkmnList
                          bind:zIndex={zIndexNext}/>
        {:else if tab === 2}
            <PokemonSkills bind:save bind:selected bind:selectedMove
                           bind:pkmnList
                           bind:zIndex={zIndexNext}/>
        {/if}
    </div>
</div>


<script lang="ts">
    import {onMount} from "svelte";
    import {SelectedSave} from "../../js/saves/saves";
    import PokemonInfo from "./PokemonInfo.svelte";
    import PokemonStats from "./PokemonStats.svelte";
    import PokemonSkills from "./PokemonSkills.svelte";
    import type {PokemonInstance} from "../../js/pokemons/pokedex";
    import {slide, fade} from 'svelte/transition';
    import {backInOut} from "svelte/easing";

    export let save: SelectedSave;
    export let selected: number;
    export let openSummary: boolean;
    export let selectedMove = 0;
    export let statEdit = false;
    export let isBattle: boolean;

    export let pkmnList: PokemonInstance[];

    export let zIndex;
    $:zIndexNext = zIndex+1;

    let tab = 0;

    const tabs = {
        0: '$POKEMON INFO',
        1: '$POKEMON STATS',
        2: '$POKEMON SKILLS'
    }

    $:selectedMons = pkmnList[selected];
    $:evs = selectedMons.evs;

    function back() {
        if (statEdit) {
            statEdit = false;
            return;
        }
        openSummary = false;
    }

    const listener = (e: KeyboardEvent) => {
        console.log(openSummary, e.key, tab);
        if (openSummary) {
            if (e.key === "ArrowRight") {
                tab = (tab + 1) % 3;
            } else if (e.key === "ArrowLeft") {
                tab = (tab + 2) % 3;
            } else if (e.key === "Escape") {
                openSummary = false;
            }

            if (tab === 2) {
                if (e.key === "ArrowDown") {
                    selectedMove = (selectedMove + 1) % selectedMons.moves.length;
                } else if (e.key === "ArrowUp") {
                    selectedMove = (selectedMove + selectedMons.moves.length - 1) % selectedMons.moves.length;
                }
            } else {
                if (e.key === "ArrowDown") {
                    next();
                } else if (e.key === "ArrowUp") {
                    previous();
                }
            }
        }
    }

    onMount(() => {
        window.addEventListener("keydown", listener);
        return () => {
            window.removeEventListener("keydown", listener);
        }
    })

    function previous() {
        console.log(selected, pkmnList);
        console.log(selectedMons);
        selectedMove = 0;
        statEdit = false;
        selected = selected === 0 ? pkmnList.length - 1 : selected - 1;
    }

    function next() {
        console.log(selected, pkmnList);
        console.log(selectedMons);
        selectedMove = 0;
        statEdit = false;
        selected = selected === pkmnList.length - 1 ? 0 : selected + 1;
    }
</script>

<style lang="scss">

  .screen {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    width: 100dvw;
    height: 100dvh;
    z-index: var(--zIndex, 10);

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
      background-color: #0e2742f0;
      background-image: url("p-sum.jpg");
      background-blend-mode: soft-light;
    }

  }
</style>
