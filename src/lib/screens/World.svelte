<div class="world-wrapper" bind:this={wrapper}>
    <canvas bind:this={canvas} id="main" width="1024" height="1024"></canvas>

    <Menu bind:menuOpened bind:pokemonListOpened bind:bagOpened bind:openSummary bind:boxOpened
          bind:save bind:saveContext/>


    {#if mainLoopContext.dialog}
        <Dialog bind:context={mainLoopContext}/>
    {/if}

    {#if !pokemonListOpened && !bagOpened}
        <button on:click={() => menuOpened = !menuOpened} class="start">start</button>
    {/if}

    {#if battleState && battleState?.starting && !pokemonListOpened && !bagOpened }
        <div class="battleStart"></div>
    {/if}

    {#if !pokemonListOpened && !bagOpened}
        <div class="battleEnd" class:active={battleState && battleState?.ending || mainLoopContext.changingMap}></div>
    {/if}
    <div class="joysticks" bind:this={joysticks}></div>
    <div class="ab-buttons" bind:this={abButtonsC}></div>
</div>

<script lang="ts">

    import {ABButtons, keys, lastKey, resetKeys} from "../js/commands/keyboard";
    import {Position} from "../js/sprites/drawers";
    import {BattleContext, BattleState} from "../js/battle/battle";
    import {PokemonInstance} from "../js/pokemons/pokedex";
    import {Character} from "../js/player/player";
    import {onDestroy, onMount} from "svelte";
    import Menu from "../ui/Menu.svelte";
    import {BATTLE_STATE, MAP_DRAWER, MAPS, POKEDEX} from "../js/const";
    import {SaveContext, SelectedSave} from "../js/saves/saves";
    import JoystickController from 'joystick-controller';
    import {OpenMap} from "../js/mapping/maps.js";
    import type {Jonction} from "../js/mapping/collisions";
    import {Settings} from "../js/player/settings";
    import {WorldContext} from "../js/common/context";
    import Dialog from "../ui/common/Dialog.svelte";

    export let canvas: HTMLCanvasElement;
    export let wrapper: HTMLDivElement;
    export let abButtonsC: HTMLDivElement;
    export let joysticks: HTMLDivElement;
    export let saveContext: SaveContext;
    export let save: SelectedSave;

    let ctx;
    let battleState: BattleState | undefined;
    let menuOpened = false;
    let pokemonListOpened = false;
    let bagOpened = false;
    let openSummary = false;
    let boxOpened = false;
    let igTime: any;

    BATTLE_STATE.subscribe(value => {
        battleState = value.state;
    });


    let mainLoopContext = new WorldContext();

    let playerPosition = new Position(
        save.map.playerMovedOffset.x + save.map.playerInitialPosition.x,
        save.map.playerMovedOffset.y + save.map.playerInitialPosition.y);

    let playerPositionInPx = new Position(
        Math.floor(playerPosition.x * (16 * mainLoopContext.imageScale)),
        Math.floor(playerPosition.y * (16 * mainLoopContext.imageScale)));

    let targetPosition = new Position(playerPositionInPx.x, playerPositionInPx.y);

    function changeMap(jonction: Jonction) {
        mainLoopContext.changingMap = true;
        let map = OpenMap.fromInstance(MAPS[jonction.mapIdx]);
        map.playerInitialPosition = map.jonctions.find(j => j.id === jonction.id)?.start || new Position(0, 0);
        save.save.map = map;
        mainLoopContext.displayChangingMap = true;
        setTimeout(() => {
            mainLoopContext.changingMap = false;
        }, 4000);
        setTimeout(() => {
            mainLoopContext.displayChangingMap = false;
        }, 2000);
    }

    function mainLoop() {
        mainLoopContext.id = window.requestAnimationFrame(mainLoop);
        ctx.font = "12px Arial";
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        let now = Date.now();
        let elapsed = now - mainLoopContext.then;


        if (elapsed > mainLoopContext.fpsInterval && !mainLoopContext.displayChangingMap) {
            mainLoopContext.then = now - (elapsed % mainLoopContext.fpsInterval);

            //  day night  cycle
            igTime = Math.floor(now / 1000 / 60);

            // acccelerate time
            /*let hour =  Math.floor(igTime / 60 % 24) ;
            console.log(hour)
            let filter = 'brightness(1)';
            if (hour > 22 || hour < 4) {
                filter = 'brightness(.35)';
            }else if( hour > 19 || hour < 6) {
                filter = 'brightness(.6)';
            } else if(hour > 17 || hour < 8) {
                filter = 'brightness(.8) hue-rotate(-56deg)';
            }
            wrapper.style.filter = filter;*/

            if (!pokemonListOpened && !bagOpened) {


                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const deltaX = targetPosition.x - playerPositionInPx.x;
                const deltaY = targetPosition.y - playerPositionInPx.y;
                const speed = .66;

                if (Math.abs(deltaX * speed) > 1 || Math.abs(deltaY * speed) > 1) {
                    // Update player position gradually
                    playerPositionInPx.x += deltaX * speed;
                    playerPositionInPx.y += deltaY * speed;
                } else {
                    // Snap to the target position if movement is small
                    save.player.moving = false;
                    playerPositionInPx.x = targetPosition.x;
                    playerPositionInPx.y = targetPosition.y;

                }


                MAP_DRAWER.draw(ctx, save.map, mainLoopContext.imageScale, playerPositionInPx, mainLoopContext.debug);
                save.player.draw(ctx, "overworld", mainLoopContext.playerScale);
                if (save.map.foreground !== undefined) {
                    MAP_DRAWER.drawFG(ctx, save.map, mainLoopContext.imageScale, playerPositionInPx, mainLoopContext.debug);
                }

                if (elapsed > mainLoopContext.fpsInterval / 2) {
                    /* if (save.player.direction === 'down' && save.map.jonctionAt(new Position(positionOnMap.x, positionOnMap.y + 1))) {
                         MAP_DRAWER.drawArrow(ctx, "down", positionOnMap, mainLoopContext.imageScale);
                     } else if (save.player.direction === 'up' && save.map.jonctionAt(new Position(positionOnMap.x, positionOnMap.y - 1))) {
                         MAP_DRAWER.drawArrow(ctx, "up", positionOnMap, mainLoopContext.imageScale);
                     } else if (save.player.direction === 'right' && save.map.jonctionAt(new Position(positionOnMap.x + 1, positionOnMap.y))) {
                         MAP_DRAWER.drawArrow(ctx, "right", positionOnMap, mainLoopContext.imageScale);
                     } else if (save.player.direction === 'left' && save.map.jonctionAt(new Position(positionOnMap.x - 1, positionOnMap.y))) {
                         MAP_DRAWER.drawArrow(ctx, "left", positionOnMap, mainLoopContext.imageScale);
                     }*/
                }

                let allowedMove = true;


                // Stop if initiated
                if (battleState?.starting) {
                    return;
                }

                // Check for battle
                if (keys.down.pressed || keys.up.pressed || keys.left.pressed || keys.right.pressed) {

                    let jonction = save.map.jonctionAt(playerPosition);
                    if (jonction !== undefined) {
                        changeMap(jonction);
                    }
                    // battle ?
                    if (save.map.hasBattleZoneAt(playerPosition) && Math.random() < 0.07) {
                        let monster = save.map.randomMonster();
                        window.cancelAnimationFrame(mainLoopContext.id);
                        initiateBattle(POKEDEX.findById(monster.id).result.instanciate(monster.level));
                    }
                }

                // Move player
                if (keys.down.pressed && lastKey.key === 'ArrowDown') {
                    if (save.player.direction !== 'down') {
                        save.player.direction = 'down';
                    } else {
                        if (save.map.hasBoundaryAt(new Position(playerPosition.x, playerPosition.y + 1))) {
                            allowedMove = false;
                        }

                        save.player.moving = true;
                        save.player.direction = 'down';
                        if (allowedMove) {
                            targetPosition = new Position(targetPosition.x, Math.floor(targetPosition.y + (16 * mainLoopContext.imageScale)));
                            playerPosition = new Position(playerPosition.x, playerPosition.y + 1);
                            save.map.playerMovedOffset.y++;
                        }
                    }
                }
                if (keys.up.pressed && lastKey.key === 'ArrowUp') {

                    if (save.player.direction !== 'up') {
                        save.player.direction = 'up';
                    } else {
                        if (save.map.hasBoundaryAt(new Position(playerPosition.x, playerPosition.y - 1))) {
                            allowedMove = false;
                        }
                        save.player.moving = true
                        save.player.direction = 'up';
                        if (allowedMove) {
                            targetPosition = new Position(targetPosition.x, Math.floor(targetPosition.y - (16 * mainLoopContext.imageScale)));
                            playerPosition = new Position(playerPosition.x, playerPosition.y - 1);
                            save.map.playerMovedOffset.y--;
                        }
                    }
                }
                if (keys.left.pressed && lastKey.key === 'ArrowLeft') {

                    if (save.player.direction !== 'left') {
                        save.player.direction = 'left';
                    } else {

                        if (save.map.hasBoundaryAt(new Position(playerPosition.x - 1, playerPosition.y))) {
                            allowedMove = false;
                        }

                        save.player.moving = true;
                        save.player.direction = 'left';
                        if (allowedMove) {
                            targetPosition = new Position(Math.floor(targetPosition.x - (16 * mainLoopContext.imageScale)), targetPosition.y);
                            playerPosition = new Position(playerPosition.x - 1, playerPosition.y);
                            save.map.playerMovedOffset.x--;
                        }
                    }
                }
                if (keys.right.pressed && lastKey.key === 'ArrowRight') {

                    if (save.player.direction !== 'right') {
                        save.player.direction = 'right';
                    } else {


                        if (save.map.hasBoundaryAt(new Position(playerPosition.x + 1, playerPosition.y))) {
                            allowedMove = false;
                        }
                        save.player.moving = true;
                        save.player.direction = 'right';
                        if (allowedMove) {
                            targetPosition = new Position(Math.floor(targetPosition.x + (16 * mainLoopContext.imageScale)), targetPosition.y);
                            playerPosition = new Position(playerPosition.x + 1, playerPosition.y);
                            save.map.playerMovedOffset.x++;
                        }
                    }
                }

                if (mainLoopContext.debug) {
                    let fps = Math.round(1 / elapsed * 1000);

                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, 160, 60);

                    ctx.fillStyle = 'white';
                    ctx.fillText(`Player position: ${playerPosition.x}, ${playerPosition.y}`, 10, 10);
                    ctx.fillText(`Player moving: ${save.player.moving}`, 10, 20);
                    ctx.fillText(`Player direction: ${save.player.direction}`, 10, 30);
                    ctx.fillText(`Player offset: ${save.map.playerMovedOffset.x}, ${save.map.playerMovedOffset.y}`, 10, 40);
                    ctx.fillText(`fps: ${fps}`, 10, 50);
                }
            }
        }
    }


    const keyUpListener = (e) => {
        if (!menuOpened && !pokemonListOpened && !openSummary && !bagOpened && !boxOpened) {
            switch (e.key) {
                case 'ArrowDown' :
                    keys.down.pressed = false;
                    break;
                case 'ArrowUp' :
                    keys.up.pressed = false;
                    break;
                case 'ArrowRight' :
                    keys.right.pressed = false;
                    break;
                case 'ArrowLeft' :
                    keys.left.pressed = false;
                    break;
                /* case 'Shift':
                     save.player.running = false;
                     mainLoopContext.fpsInterval = 1000 / 10;
                     break;*/
            }
        }
    };

    const keyDownListener = (e) => {
        if (!menuOpened && !pokemonListOpened && !openSummary && !bagOpened && !boxOpened) {
            switch (e.key) {
                case 'ArrowDown' :
                    lastKey.key = 'ArrowDown';
                    keys.down.pressed = true;
                    break;
                case 'ArrowUp' :
                    lastKey.key = 'ArrowUp';
                    keys.up.pressed = true;
                    break;
                case 'ArrowRight' :
                    lastKey.key = 'ArrowRight';
                    keys.right.pressed = true;
                    break;
                case 'ArrowLeft' :
                    lastKey.key = 'ArrowLeft';
                    keys.left.pressed = true;
                    break;
                /* case 'Shift':
                     save.player.running = true;
                     mainLoopContext.fpsInterval = 1000 / 24;
                     break;*/
                case 'x':
                    mainLoopContext.debug = !mainLoopContext.debug;
                    break;
                case 'Escape':
                    menuOpened = !menuOpened;
            }
        } else {
            switch (e.key) {
                case 'Escape':
                    menuOpened = false;
            }
        }
    };


    function initiateBattle(opponent: PokemonInstance | Character) {

        let bContext = new BattleContext();
        bContext.state = new BattleState(save.player, opponent, save.settings || new Settings())
        BATTLE_STATE.set(bContext);

        setTimeout(() => {
            BATTLE_STATE.update(value => {
                if (value.state) {
                    value.state.starting = false;
                    value.state.pokemonsAppearing = true;
                }
                return value;
            });
        }, 2000);

        setTimeout(() => {
            BATTLE_STATE.update(value => {
                if (value.state) {
                    value.state.pokemonsAppearing = false;
                }
                return value;
            });
        }, 3500);

        unbindKeyboard();
    }

    function bindKeyboard() {
        window.addEventListener('keydown', keyDownListener);
        window.addEventListener('keyup', keyUpListener);
    }

    function unbindKeyboard() {
        window.removeEventListener('keydown', keyDownListener);
        window.removeEventListener('keyup', keyUpListener);
    }

    const jsCallback = (data) => {
        // convert data.angle (radian) to a direction (top, bottom, left, right)
        if (!menuOpened && !pokemonListOpened) {
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
        }
    }

    let abButtons;
    let joystick;

    onDestroy(() => {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        window.cancelAnimationFrame(mainLoopContext.id);
        unbindKeyboard();
        joystick?.destroy();
        abButtons?.destroy();
    });

    onMount(() => {
        ctx = canvas.getContext('2d');
        bindKeyboard();
        mainLoop();
        abButtons = new ABButtons(abButtonsC, (a, b) => {
            keys.a.pressed = a;
            keys.b.pressed = b;
            console.log('a', a, 'b', b);
        });
        joystick = new JoystickController({
            dynamicPosition: true,
            dynamicPositionTarget: joysticks,
            containerClass: 'joysticks',
            distortion: true,
        }, jsCallback);
    });

</script>

<style lang="scss">
  .world-wrapper {
    position: absolute;
    width: 100dvw;
    height: 100dvh;
    overflow: hidden;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .joysticks {
      height: 100dvh;
      width: calc(99dvw - 130px);
      z-index: 7;
      position: absolute;
      left: 0;
      top: 0;
    }
  }

  canvas {
    z-index: -1;
    width: 1024px;
    height: auto;
    overflow: hidden;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .start {
    font-family: pokemon, serif;
    position: absolute;
    bottom: 5dvh;
    left: calc(50% - 25px);
    width: 60px;
    /* height: 24px; */
    box-sizing: border-box;
    padding: 2px 0;
    display: flex;
    border-radius: 8px;
    background-color: rgba(44, 56, 69, 0.95);
    outline: none;
    /* background-size: cover; */
    z-index: 8;
    font-size: 18px;
    border: 1px solid #000000;
    color: white;
    justify-content: center;
    align-items: center;

  }

  .battleStart {
    opacity: 0;
    background: #000000;
    height: 100dvh;
    width: 100dvw;
    position: absolute;
    top: 0;
    left: 0;
    transition: opacity 0.5s ease-in-out;
    z-index: 2;
    animation: blink 2s ease-in-out;
  }

  @keyframes blink {
    0% {
      opacity: 1;
    }
    20% {
      opacity: 0;
    }
    40% {
      opacity: 1;
    }
    60% {
      opacity: 0;
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .battleEnd {
    opacity: 0;
    background: #000000;
    height: 100dvh;
    width: 100dvw;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 6;

    &.active {
      animation: fade-out 4s ease-in-out;
    }
  }

  @keyframes fade-out {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
</style>
