<div class="bag"
     in:slide="{{duration: 500, delay: 100, axis: 'x', easing: backInOut}}" out:fade>

    <div class="tabs">
        <div class="current" style="--index: {tab}">
            <span>{tabs[tab]}</span>

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


        <button class="back" on:click={() => back()}>BACK</button>

    </div>
    <div class="tab-content">

        <ul class="item-list">
            {#each pocket as [id, qty]}
                <li>
                    <div class="item">
                        <span>{ITEMS.getItem(id)?.name}</span>
                        <span>x {qty}</span>
                    </div>
                </li>
            {/each}
        </ul>
    </div>
</div>

<script lang="ts">

    import {SelectedSave} from "../../js/saves/saves";
    import {onMount} from "svelte";
    import {backInOut} from "svelte/easing";
    import {fade, slide} from 'svelte/transition';
    import {ITEMS} from "../../js/const";


    export let bagOpened: boolean;
    export let save: SelectedSave;
    export let isBattle = false;


    let tab = 0;
    const tabs = {
        0: 'HEALING',
        1: 'POKEBALLS',
        2: 'REVIVE'
    };

    const categories = {
        0: 'potions',
        1: 'balls',
        2: 'revives'
    };

    console.log(save.player.bag);
    $:pocket =  Object.keys(save.player.bag[categories[tab]]).map(id => [id, save.player.bag[categories[tab]][id]]);

    function back() {
        bagOpened = false;
    }

    const listener = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            bagOpened = false;
        } else if (e.key === "ArrowRight") {
            tab = (tab + 1) % 3;
        } else if (e.key === "ArrowLeft") {
            tab = (tab + 2) % 3;
        } else if (e.key === "Escape") {
            back();
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
    z-index: 8;

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
      background-image: url("src/assets/menus/p-sum.jpg");
      background-blend-mode: soft-light;

      .item-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        padding: 0;
        margin: 0;
        overflow-y: auto;
        height: calc(100%);
        box-sizing: border-box;

        li {
          width: 30%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10px;
          box-sizing: border-box;

          .item {
            width: 100%;
            height: 100%;
            background-color: #0e2742f0;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 10px;
            box-shadow: 0 0 10px 0 black;
            font-size: 24px;
            color: white;
            text-shadow: 1px 1px 1px black;
          }
        }
      }
    }
  }
</style>
