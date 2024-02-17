<div class="bag"
     in:slide="{{duration: 500, delay: 100, axis: 'x', easing: backInOut}}" out:fade>

</div>

<script lang="ts">

    import {SelectedSave} from "../../js/saves/saves";
    import {onMount} from "svelte";
    import {backInOut} from "svelte/easing";
    import {slide, fade} from 'svelte/transition';

    export let bagOpened: boolean;
    export let save: SelectedSave;
    export let isBattle = false;

    const listener = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            bagOpened = false;
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
    background-image: url("src/assets/menus/pokemon-list.png");
    background-size: cover;
    background-position: top left;
    background-repeat: round;
    z-index: 8;
  }
</style>
