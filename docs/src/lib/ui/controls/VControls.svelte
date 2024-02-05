<div bind:this={wrapper} class="controllers">


</div>

<script lang="ts">
    import JoystickController from 'joystick-controller';
    import {onMount} from "svelte";
    import {keys, lastKey, resetKeys} from "../../js/commands/keyboard";

    export let wrapper;

    onMount(() => {
        const joystick = new JoystickController({
            dynamicPosition: true,
            dynamicPositionTarget: wrapper,
            distortion: true,
        }, (data) => {
            console.log(data);
            // convert data.angle (radian) to a direction (top, bottom, left, right)
            resetKeys();
            if (data.angle) {
                let direction;
                let degrees = data.angle * (180 / Math.PI);

                if (degrees < 0) {
                    degrees = 360 + degrees;
                }

                if (degrees > 45 && degrees < 135) {
                    direction = 'bottom';
                    keys.down.pressed = true;
                    lastKey.key = 'ArrowDown';
                } else if (degrees > 135 && degrees < 225) {
                    direction = 'left';
                    keys.left.pressed = true;
                    lastKey.key = 'ArrowLeft';
                } else if (degrees > 225 && degrees < 315) {
                    direction = 'top';
                    keys.up.pressed = true;
                    lastKey.key = 'ArrowUp';
                } else {
                    direction = 'right';
                    keys.right.pressed = true;
                    lastKey.key = 'ArrowRight';
                }
            }

        });
    });


</script>

<style lang="scss">
  .controllers {
    z-index: 7;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100dvw;
    height: 33dvh;
  }
</style>
