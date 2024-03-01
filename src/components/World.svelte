<div class="world-wrapper" bind:this={wrapper}>
    <canvas bind:this={canvas} id="main" width="1024" height="1024"></canvas>

    <Menu bind:menuOpened bind:pokemonListOpened bind:bagOpened bind:openSummary bind:boxOpened
          bind:save bind:saveContext/>

    {#if hasDialog}
        <DialogView bind:context={mainLoopContext} bind:dialog={currentAction} bind:aButton={aButtonValue}/>
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
    <div class="ab-buttons" bind:this={abButtonsC}></div>

    <div class="run-toggle">
        {#if mainLoopContext.running}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.82986 8.78986L7.99998 9.45588V13H5.99998V8.05H6.015L11.2834 6.13247C11.5274 6.03855 11.7922 5.99162 12.0648 6.0008C13.1762 6.02813 14.1522 6.75668 14.4917 7.82036C14.678 8.40431 14.848 8.79836 15.0015 9.0025C15.9138 10.2155 17.3653 11 19 11V13C16.8253 13 14.8823 12.0083 13.5984 10.4526L12.9008 14.4085L15 16.17V23H13V17.1025L10.7307 15.1984L10.003 19.3253L3.10938 18.1098L3.45667 16.1401L8.38071 17.0084L9.82986 8.78986ZM13.5 5.5C12.3954 5.5 11.5 4.60457 11.5 3.5C11.5 2.39543 12.3954 1.5 13.5 1.5C14.6046 1.5 15.5 2.39543 15.5 3.5C15.5 4.60457 14.6046 5.5 13.5 5.5Z"></path>
            </svg>
        {:else}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.61713 8.71233L10.8222 6.38373C11.174 6.12735 11.6087 5.98543 12.065 6.0008C13.1764 6.02813 14.1524 6.75668 14.4919 7.82036C14.6782 8.40431 14.8481 8.79836 15.0017 9.0025C15.914 10.2155 17.3655 11 19.0002 11V13C16.8255 13 14.8825 12.0083 13.5986 10.4526L12.901 14.4085L14.9621 16.138L17.1853 22.246L15.3059 22.93L13.266 17.3256L9.87576 14.4808C9.32821 14.0382 9.03139 13.3192 9.16231 12.5767L9.67091 9.6923L8.99407 10.1841L6.86706 13.1116L5.24902 11.9361L7.60016 8.7L7.61713 8.71233ZM13.5002 5.5C12.3956 5.5 11.5002 4.60457 11.5002 3.5C11.5002 2.39543 12.3956 1.5 13.5002 1.5C14.6047 1.5 15.5002 2.39543 15.5002 3.5C15.5002 4.60457 14.6047 5.5 13.5002 5.5ZM10.5286 18.6813L7.31465 22.5116L5.78257 21.226L8.75774 17.6803L9.50426 15.5L11.2954 17L10.5286 18.6813Z"></path>
            </svg>
        {/if}

        <label class="switch">
            <input type="checkbox" checked="{mainLoopContext.running ? 'checked' : ''}"
                   on:change={mainLoopContext.running = !mainLoopContext.running}>
            <span>
            </span>
        </label>
    </div>
</div>

<script lang="ts">

    import {ABButtons, keys, lastKey, resetKeys} from "../js/commands/keyboard";
    import {Position} from "../js/sprites/drawers";
    import {BattleContext, BattleState} from "../js/battle/battle";
    import {PokemonInstance} from "../js/pokemons/pokedex";
    import {Character} from "../js/player/player";
    import {onDestroy, onMount} from "svelte";
    import Menu from "./menus/Menu.svelte";
    import {BATTLE_STATE, MAP_DRAWER, MAPS, NPC_DRAWER, POKE_WALKER, POKEDEX} from "../js/const";
    import {SaveContext, SelectedSave} from "../js/saves/saves";
    import JoystickController from 'joystick-controller';
    import {OpenMap} from "../js/mapping/maps.js";
    import type {Jonction} from "../js/mapping/collisions";
    import {Settings} from "../js/player/settings";
    import {WorldContext} from "../js/common/context";
    import DialogView from "./common/DialogView.svelte";
    import type {Script} from "../js/common/scripts";
    import {Dialog, Scriptable} from "../js/common/scripts";
    import Evolution from "./Evolution.svelte";
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";

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
    Positions (put that in context ?)
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

    $:currentScript = mainLoopContext.playingScript;
    $:currentAction = currentScript?.currentAction;
    $:hasDialog = currentAction?.type === 'Dialog';

    let aButtonValue: Writable<boolean> = writable(false);
    aButtonValue.subscribe(value => {
        keys.a.pressed = value;
        if(value){
            let interactive = mainLoopContext.map?.elementInFront(playerPosition, mainLoopContext.player.direction);
            let script = interactive?.interact(mainLoopContext, playerPosition);
            console.log(script);
            mainLoopContext.playScript(script);
        }
    })

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
        const deltaX = targetPosition.x - playerPositionInPx.x;
        const deltaY = targetPosition.y - playerPositionInPx.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

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


        move = move && distance < 16;

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
        const speed = mainLoopContext.running ? mainLoopContext.run : mainLoopContext.walk;
        if (distance > 6) {
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

        mainLoopContext.map.npcs.forEach(npc => {
            NPC_DRAWER.draw(ctx, playerPositionInPx, npc.direction, mainLoopContext.playerScale, npc.moving, new Position(
                Math.floor(npc.position.x * (16 * mainLoopContext.imageScale)),
                Math.floor(npc.position.y * (16 * mainLoopContext.imageScale))), npc.spriteId, mapDimensions);
        });

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
                case 'Shift':
                    mainLoopContext.running = !mainLoopContext.running;
                    break;
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

        abButtons = new ABButtons(abButtonsC, (a, b) => {
            /* keys.a.pressed = a;
             keys.b.pressed = b;
             console.log('a', a, 'b', b);*/
            /*if (!mainLoopContext.playingScript) {
                mainLoopContext.running = b;
            }*/
            aButtonValue.set(a);
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
      z-index: 6;
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
    bottom: 2dvh;
    left: calc(50% - 25px);
    height: 24px;
    box-sizing: border-box;
    text-align: center;
    padding: 0 16px;
    display: flex;
    border-radius: 12px;
    background-color: rgba(44, 56, 69, 0.95);
    outline: none;
    z-index: 7;
    font-size: 18px;
    border: none;
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

  .run-toggle {

    position: absolute;
    bottom: 2dvh;
    left: 1dvw;
    z-index: 7;

    display: flex;

    svg {
      height: 24px;
      color: rgba(44, 56, 69, 0.95);
    }

    $primary: rgba(44, 56, 69, 0.95);
    $lightGrey: rgba(44, 56, 69, 0.95);

    .switch {
      height: 24px;
      display: block;
      position: relative;
      cursor: pointer;

      input {
        display: none;

        & + span {
          padding-left: 50px;
          min-height: 24px;
          line-height: 24px;
          display: block;
          color: $lightGrey;
          position: relative;
          vertical-align: middle;
          white-space: nowrap;
          transition: color .3s ease;

          &:before,
          &:after {
            content: '';
            display: block;
            position: absolute;
            border-radius: 12px;
          }

          &:before {
            top: 0;
            left: 0;
            width: 42px;
            height: 24px;
            background: $lightGrey;
            transition: all .3s ease;
          }

          &:after {
            width: 18px;
            height: 18px;
            background: #fff;
            top: 3px;
            left: 3px;
            box-shadow: 0 1px 3px rgba(#121621, .1);
            transition: all .45s ease;
          }
        }

        &:checked {
          & + span {
            &:before {
              background: rgba($primary, .85);
            }

            &:after {
              background: #fff;
              transform: translate(18px, 0);
            }
          }
        }
      }
    }

  }
</style>
