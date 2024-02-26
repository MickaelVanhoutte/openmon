<div class="dialog">
    <div class="dialog-content">
        <div class="dialog-text" class:animate={animate} bind:this={text}>
            <div>{current}</div>
        </div>
        {#if animate}
            <div class="dialog-buttons">
                <button on:click={() => next()}>OK</button>
            </div>
        {/if}
    </div>
</div>

<script lang="ts">

    import {onMount} from "svelte";
    import type {WorldContext} from "../../js/common/context";
    import type {Dialog} from "../../js/common/scripts";

    export let context: WorldContext;
    export let dialog: Dialog;

    export let animate: boolean = true;
    export let text: HTMLDivElement;

    $:current = dialog?.current.text || '';


    function next() {
        if (dialog?.next()) {
            text.classList.remove("animate");
            setTimeout(() => {
                if(animate) text.classList.add("animate");
            }, 100);
        }
    }

    const listener = (e: KeyboardEvent) => {
        if (e.key === "Enter" && animate) {
            next();
        }
    };

    onMount(() => {
        window.addEventListener("keydown", listener);
        return () => {
            window.removeEventListener("keydown", listener);
        }
    });
</script>

<style lang="scss">

  .dialog {
    position: absolute;
    bottom: 1dvh;
    left: 1dvw;
    width: 98dvw;
    height: 25dvh;
    z-index: 20;

    background: rgb(220, 231, 233);
    background: linear-gradient(180deg, rgba(220, 231, 233, 1) 0%, rgba(255, 255, 255, 1) 50%, rgba(220, 231, 233, 0.713344712885154) 100%);
    border: 2px solid #54506c;
    border-radius: 8px;
    box-sizing: border-box;
    padding: 2%;
    font-size: 32px;
    font-weight: 500;
    color: black;

    .dialog-content {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .dialog-text {
        display: inline-block;

        &.animate div {
          border-right: .15em solid orange;
          animation: typing 1s steps(20, end) forwards, blink-caret .5s step-end infinite;
        }

        div {
          overflow: hidden;
          white-space: nowrap;
        }
      }

      @keyframes typing {
        from {
          width: 0
        }
        to {
          width: 100%
        }
      }

      /* The typewriter cursor effect */
      @keyframes blink-caret {
        from, to {
          border-color: transparent
        }
        50% {
          border-color: orange
        }
      }
    }

  }

</style>
