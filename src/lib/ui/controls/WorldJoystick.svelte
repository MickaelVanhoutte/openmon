<div bind:this={wrapper} class="controllers">


</div>

<script lang="ts">
    import JoystickController from 'joystick-controller';
    import {onMount} from "svelte";
    import {keys, lastKey, resetKeys} from "../../js/commands/keyboard";

    export let wrapper;

    onMount(() => {

    });


</script>

<style lang="scss">
  .controllers {
    z-index: 12;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100dvw;
    height: 33dvh;
  }
</style>
