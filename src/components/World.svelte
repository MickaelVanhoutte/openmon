<div class="world-wrapper" bind:this={wrapper}>
    <canvas bind:this={canvas} id="main" width="1024" height="1024"></canvas>

    <Menu bind:menuOpened bind:pokemonListOpened bind:bagOpened bind:openSummary bind:boxOpened
          bind:save bind:saveContext/>

    {#if hasDialog}
        <DialogView bind:context={mainLoopContext} bind:dialog={currentAction}/>
    {/if}

    {#if evolutions?.length > 0}
        <Evolution bind:context={mainLoopContext}/>
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

    <!-- unused for now (keybooard/mouse or touch is enough -->
    <!--<div class="ab-buttons" bind:this={abButtonsC}></div>-->
</div>

<script lang="ts">

    import {ABButtons, keys, lastKey, resetKeys} from "../js/commands/keyboard";
    import {Position} from "../js/sprites/drawers";
    import {BattleContext, BattleState} from "../js/battle/battle";
    import {PokemonInstance} from "../js/pokemons/pokedex";
    import {Character} from "../js/player/player";
    import {onDestroy, onMount} from "svelte";
    import Menu from "./menus/Menu.svelte";
    import {BATTLE_STATE, MAP_DRAWER, MAPS, POKE_WALKER, POKEDEX} from "../js/const";
    import {SaveContext, SelectedSave} from "../js/saves/saves";
    import JoystickController from 'joystick-controller';
    import {OpenMap} from "../js/mapping/maps.js";
    import type {Jonction} from "../js/mapping/collisions";
    import {Settings} from "../js/player/settings";
    import {WorldContext} from "../js/common/context";
    import DialogView from "./common/DialogView.svelte";
    import type {Script} from "../js/common/scripts";
    import {Dialog} from "../js/common/scripts";
    import Evolution from "./Evolution.svelte";

    /**
     * Overworld component.
     * Main game loop, menus, battle starting...
     */

    export let canvas: HTMLCanvasElement;
    export let wrapper: HTMLDivElement;
    export let abButtonsC: HTMLDivElement;
    export let joysticks: HTMLDivElement;
    export let saveContext: SaveContext;
    export let save: SelectedSave;

    let ctx;
    let battleState: BattleState | undefined;
    $:evolutions = mainLoopContext?.player?.monsters?.filter(p => p.canEvolve());

    /*
    Menus states
     */
    let menuOpened = false;
    let pokemonListOpened = false;
    let bagOpened = false;
    let openSummary = false;
    let boxOpened = false;


    let mainLoopContext = new WorldContext(save.player);

    /*
    Positions (put that in context ?
     */
    let playerPosition: Position = new Position();
    let playerPositionInPx: Position = new Position();
    let targetPosition: Position = new Position();

    let walkerPositionInPx: Position = new Position();
    let walkerTargetPosition: Position = new Position();
    let walkerDirection: 'down' | 'up' | 'left' | 'right' = 'down';

    let abButtons;
    let joystick;

    BATTLE_STATE.subscribe(value => {
        battleState = value.state;
    });


    function initContext() {
        mainLoop();
        loadMap(save.map);
    }

    /*
    Game loop
     */
    function mainLoop() {
        mainLoopContext.id = window.requestAnimationFrame(mainLoop);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';


        let now = Date.now();
        let elapsed = now - mainLoopContext.then;

        if (elapsed > mainLoopContext.fpsInterval && mainLoopContext?.map && !battleState?.ending && !mainLoopContext.displayChangingMap && evolutions?.length === 0) {
            mainLoopContext.then = now - (elapsed % mainLoopContext.fpsInterval);

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            /*
            Update & draw
             */
            updatePosition(playerPositionInPx, targetPosition);
            updatePosition(walkerPositionInPx, walkerTargetPosition);
            drawElements();


            if (canMove()) {
                let moved = move();
                if (moved) {

                    /*
                        Positioon checks
                    */
                    checkForStepInScript();
                    checkForFunction();
                    checkForBattle();
                }
            }

            /*
            use "x" to display debug info
             */
            if (mainLoopContext.debug) {
                ctx.font = "12px Arial";
                let fps = Math.round(1 / elapsed * 1000);

                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, 160, 60);

                ctx.fillStyle = 'white';
                ctx.fillText(`Player position: ${playerPosition.x}, ${playerPosition.y}`, 10, 10);
                ctx.fillText(`Player moving: ${mainLoopContext.player.moving}`, 10, 20);
                ctx.fillText(`Player direction: ${mainLoopContext.player.direction}`, 10, 30);
                ctx.fillText(`Player offset: ${mainLoopContext.map.playerMovedOffset.x}, ${mainLoopContext.map.playerMovedOffset.y}`, 10, 40);
                ctx.fillText(`fps: ${fps}`, 10, 50);
            }
        }
    }


    /*
    Scripts
     */
    $:playingScript = mainLoopContext?.playingScript;
    $:currentAction = playingScript && playingScript?.currentAction;
    $:hasDialog = currentAction && currentAction instanceof Dialog;

    function checkForStepInScript() {
        let stepScript: Script | undefined;
        if (mainLoopContext.map?.scripts && mainLoopContext.map.scripts?.length > 0 && !mainLoopContext.playingScript) {
            // TODO allow range of positions
            stepScript = mainLoopContext.map.scripts.find(s => s.triggerType === 'onStep' && s.stepPosition?.x === playerPosition.x && s.stepPosition?.y === playerPosition.y);
        }

        if (stepScript !== undefined && !stepScript?.played || stepScript?.replayable) {
            mainLoopContext.playScript(stepScript);
        }

        return stepScript;
    }


    /*
    Map change (load and junctions)
     */
    function checkForFunction() {

        if (mainLoopContext.map === undefined) return;
        let jonction = mainLoopContext.map.jonctionAt(playerPosition);
        if (jonction !== undefined) {
            changeMap(jonction);
        }
    }

    function drawJunctionArrow() {
        if (mainLoopContext.map) {
            if (mainLoopContext.player.direction === 'down' && mainLoopContext.map.jonctionAt(new Position(playerPosition.x, playerPosition.y + 1))) {
                MAP_DRAWER.drawArrow(ctx, "down", playerPosition, mainLoopContext.imageScale);
            } else if (mainLoopContext.player.direction === 'up' && mainLoopContext.map.jonctionAt(new Position(playerPosition.x, playerPosition.y - 1))) {
                MAP_DRAWER.drawArrow(ctx, "up", playerPosition, mainLoopContext.imageScale);
            } else if (mainLoopContext.player.direction === 'right' && mainLoopContext.map.jonctionAt(new Position(playerPosition.x + 1, playerPosition.y))) {
                MAP_DRAWER.drawArrow(ctx, "right", playerPosition, mainLoopContext.imageScale);
            } else if (mainLoopContext.player.direction === 'left' && mainLoopContext.map.jonctionAt(new Position(playerPosition.x - 1, playerPosition.y))) {
                MAP_DRAWER.drawArrow(ctx, "left", playerPosition, mainLoopContext.imageScale);
            }
        }
    }

    function loadMap(map: OpenMap) {

        playerPosition = new Position(
            map.playerMovedOffset.x + map.playerInitialPosition.x,
            map.playerMovedOffset.y + map.playerInitialPosition.y);

        playerPositionInPx = new Position(
            Math.floor(playerPosition.x * (16 * mainLoopContext.imageScale)),
            Math.floor(playerPosition.y * (16 * mainLoopContext.imageScale)));
        targetPosition = new Position(playerPositionInPx.x, playerPositionInPx.y);

        walkerPositionInPx = new Position(
            Math.floor(playerPosition.x * (16 * mainLoopContext.imageScale)),
            Math.floor((playerPosition.y - 1) * (16 * mainLoopContext.imageScale)));
        walkerTargetPosition = new Position(walkerPositionInPx.x, walkerPositionInPx.y);

        mainLoopContext.changingMap = true;
        mainLoopContext.displayChangingMap = true;

        let onEnterScript: Script | undefined;
        if (map.scripts !== undefined && map.scripts?.length > 0) {
            onEnterScript = map.scripts?.find(s => s.triggerType === 'onEnter');
        }

        save.save.map = map;
        mainLoopContext.map = map;
        setTimeout(() => {
            mainLoopContext.changingMap = false;
            if (onEnterScript) {
                mainLoopContext.playScript(onEnterScript)
            }

        }, 4000);
        setTimeout(() => {
            mainLoopContext.displayChangingMap = false;
        }, 2000);
    }

    function changeMap(jonction: Jonction) {
        let map = OpenMap.fromInstance(MAPS[jonction.mapIdx]);
        map.playerInitialPosition = map.jonctions.find(j => j.id === jonction.id)?.start || new Position(0, 0);
        loadMap(map);
    }

    /*
    Positions update
     */
    function canMove(): boolean {
        return !menuOpened &&
            !pokemonListOpened &&
            !openSummary &&
            !bagOpened &&
            !boxOpened &&
            !mainLoopContext.playingScript &&
            !mainLoopContext.displayChangingMap &&
            !battleState?.starting;
    }

    function move(): boolean {
        let direction = mainLoopContext.player.direction;
        let tmpSave = direction;

        let move = false;
        if (keys.down.pressed && lastKey.key === 'ArrowDown') {
            direction = 'down';
            move = true;
        }
        if (keys.up.pressed && lastKey.key === 'ArrowUp') {
            direction = 'up';
            move = true;
        }
        if (keys.left.pressed && lastKey.key === 'ArrowLeft') {
            direction = 'left';
            move = true;
        }
        if (keys.right.pressed && lastKey.key === 'ArrowRight') {
            direction = 'right';
            move = true;
        }

        if (move) {

            const xChanger = (x) => direction === 'left' ? x - 1 : direction === 'right' ? x + 1 : x;
            const yChanger = (y) => direction === 'up' ? y - 1 : direction === 'down' ? y + 1 : y;

            const futureX = xChanger(playerPosition.x);
            const futureY = yChanger(playerPosition.y);

            if (mainLoopContext.player.direction !== direction) {
                mainLoopContext.player.direction = direction;
                return false;
            } else if (mainLoopContext.map && !mainLoopContext.map.hasBoundaryAt(new Position(futureX, futureY))) {
                mainLoopContext.player.moving = true;

                walkerDirection = tmpSave;
                walkerTargetPosition = new Position(
                    targetPosition.x,
                    targetPosition.y
                );

                targetPosition = new Position(
                    Math.floor(targetPosition.x + (xChanger(0) * 16 * mainLoopContext.imageScale)),
                    Math.floor(targetPosition.y + (yChanger(0) * 16 * mainLoopContext.imageScale))
                );
                playerPosition = new Position(futureX, futureY);

                mainLoopContext.map.playerMovedOffset.x = xChanger(mainLoopContext.map.playerMovedOffset.x);
                mainLoopContext.map.playerMovedOffset.y = yChanger(mainLoopContext.map.playerMovedOffset.y);
            }
        }
        return move;
    }

    function updatePosition(positionInPx: Position, targetPosition: Position) {
        function easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }

        const deltaX = targetPosition.x - positionInPx.x;
        const deltaY = targetPosition.y - positionInPx.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const speed = 0.45;
        if (distance > 8) {
            const easedDistance = easeInOutQuad(Math.min(1, distance / 5));
            // Interpolate between current and target positions with eased distance
            positionInPx.x += deltaX * easedDistance * speed;
            positionInPx.y += deltaY * easedDistance * speed;
        } else {
            // Snap to the target position if movement is small
            mainLoopContext.player.moving = false;
            positionInPx.x = targetPosition.x;
            positionInPx.y = targetPosition.y;
        }
    }

    function drawElements() {
        if (mainLoopContext.map === undefined) return;

        // Background
        let mapDimensions = MAP_DRAWER.draw(ctx, mainLoopContext.map, mainLoopContext.imageScale, playerPositionInPx, mainLoopContext.debug);

        drawJunctionArrow();

        // Player & walker
        if (mainLoopContext.player.direction === 'up') {
            mainLoopContext.player.draw(ctx, 'overworld', mainLoopContext.playerScale, playerPositionInPx, mapDimensions);
            POKE_WALKER.draw(ctx, playerPositionInPx, walkerDirection, mainLoopContext.playerScale, mainLoopContext.player.moving, walkerPositionInPx, mainLoopContext.player.monsters.at(0), mapDimensions);
        } else {
            POKE_WALKER.draw(ctx, playerPositionInPx, walkerDirection, mainLoopContext.playerScale, mainLoopContext.player.moving, walkerPositionInPx, mainLoopContext.player.monsters.at(0), mapDimensions);
            mainLoopContext.player.draw(ctx, 'overworld', mainLoopContext.playerScale, playerPositionInPx, mapDimensions);
        }

        // Foreground
        if (mainLoopContext.map?.foreground !== undefined) {
            MAP_DRAWER.drawFG(ctx, mainLoopContext.map, mainLoopContext.imageScale, playerPositionInPx, mainLoopContext.debug);
        }
    }

    /*
    Battle start
     */
    function checkForBattle() {
        if (mainLoopContext.map && mainLoopContext.map.hasBattleZoneAt(playerPosition) && Math.random() < 0.07) {
            let monster = mainLoopContext.map.randomMonster();
            initiateBattle(POKEDEX.findById(monster.id).result.instanciate(monster.level));
        }
    }

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
    }

    /*
    Controls
     */

    const keyUpListener = (e) => {
        if (canMove()) {
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
        if (canMove()) {
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

    const jsCallback = (data) => {
        // convert data.angle (radian) to a direction (top, bottom, left, right)
        if (!menuOpened && !pokemonListOpened) {
            resetKeys();
            if (data.angle) {
                let degrees = data.angle * (180 / Math.PI);

                if (degrees < 0) {
                    degrees = 360 + degrees;
                }

                if (degrees > 45 && degrees < 135) {
                    keys.down.pressed = true;
                    lastKey.key = 'ArrowDown';
                } else if (degrees > 135 && degrees < 225) {
                    keys.left.pressed = true;
                    lastKey.key = 'ArrowLeft';
                } else if (degrees > 225 && degrees < 315) {
                    keys.up.pressed = true;
                    lastKey.key = 'ArrowUp';
                } else {
                    keys.right.pressed = true;
                    lastKey.key = 'ArrowRight';
                }
            }
        }
    }

    onDestroy(() => {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        window.cancelAnimationFrame(mainLoopContext.id);
        window.removeEventListener('keydown', keyDownListener);
        window.removeEventListener('keyup', keyUpListener);
        joystick?.destroy();
        abButtons?.destroy();
    });

    onMount(() => {
        ctx = canvas.getContext('2d');
        window.addEventListener('keydown', keyDownListener);
        window.addEventListener('keyup', keyUpListener);
        initContext();

        /*
        unused for now (keybooard/mouse or touch is enough
        abButtons = new ABButtons(abButtonsC, (a, b) => {
            keys.a.pressed = a;
            keys.b.pressed = b;
            console.log('a', a, 'b', b);
        });
        */

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
    box-sizing: border-box;
    padding: 2px 0;
    display: flex;
    border-radius: 8px;
    background-color: rgba(44, 56, 69, 0.95);
    outline: none;
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
