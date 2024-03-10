<div class="world-wrapper" bind:this={wrapper} class:blur={context.overWorldContext.menus.wakeUp}>
    <canvas bind:this={canvas} id="main" width="1024" height="1024"></canvas>

    <Menu bind:context={context}/>

    {#if hasDialog}
        <DialogView bind:dialog={currentAction} bind:aButton={aButtonValue}/>
    {/if}

    {#if evolutions?.length > 0}
        <Evolution bind:context={context}/>
    {/if}

    {#if !context.overWorldContext.menus.pokemonListOpened && !context.overWorldContext.menus.bagOpened}
        <button on:click={() => context.overWorldContext.menus.menuOpened = !context.overWorldContext.menus.menuOpened} class="start">start</button>
    {/if}

   <!-- {#if battleState && battleState?.starting && !context.overWorldContext.menus.pokemonListOpened && !context.overWorldContext.menus.bagOpened }
        <div class="battleStart"></div>
    {/if}

    {#if !context.overWorldContext.menus.pokemonListOpened && !context.overWorldContext.menus.bagOpened}
        <div class="battleEnd" class:active={battleState && battleState?.ending || context.overWorldContext?.changingMap}></div>
    {/if}
-->

    {#if context.overWorldContext.menus.wakeUp}
        <div class="wakeUp">
            <div class="top"></div>
            <div class="bot"></div>
        </div>
    {/if}
    {#if context.overWorldContext.menus.starterSelection}
        <StarterSelection bind:context={context} bind:canvasWidth={canvasWidth} bind:aButton={aButtonValue} bind:bButton={bButtonValue}/>
    {/if}

    <div class="joysticks" bind:this={joysticks}></div>

    <!-- unused for now (keybooard/mouse or touch is enough -->
    <div class="ab-buttons" bind:this={abButtonsC}></div>

    <div class="run-toggle">
        {#if context.overWorldContext?.running}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.82986 8.78986L7.99998 9.45588V13H5.99998V8.05H6.015L11.2834 6.13247C11.5274 6.03855 11.7922 5.99162 12.0648 6.0008C13.1762 6.02813 14.1522 6.75668 14.4917 7.82036C14.678 8.40431 14.848 8.79836 15.0015 9.0025C15.9138 10.2155 17.3653 11 19 11V13C16.8253 13 14.8823 12.0083 13.5984 10.4526L12.9008 14.4085L15 16.17V23H13V17.1025L10.7307 15.1984L10.003 19.3253L3.10938 18.1098L3.45667 16.1401L8.38071 17.0084L9.82986 8.78986ZM13.5 5.5C12.3954 5.5 11.5 4.60457 11.5 3.5C11.5 2.39543 12.3954 1.5 13.5 1.5C14.6046 1.5 15.5 2.39543 15.5 3.5C15.5 4.60457 14.6046 5.5 13.5 5.5Z"></path>
            </svg>
        {:else}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.61713 8.71233L10.8222 6.38373C11.174 6.12735 11.6087 5.98543 12.065 6.0008C13.1764 6.02813 14.1524 6.75668 14.4919 7.82036C14.6782 8.40431 14.8481 8.79836 15.0017 9.0025C15.914 10.2155 17.3655 11 19.0002 11V13C16.8255 13 14.8825 12.0083 13.5986 10.4526L12.901 14.4085L14.9621 16.138L17.1853 22.246L15.3059 22.93L13.266 17.3256L9.87576 14.4808C9.32821 14.0382 9.03139 13.3192 9.16231 12.5767L9.67091 9.6923L8.99407 10.1841L6.86706 13.1116L5.24902 11.9361L7.60016 8.7L7.61713 8.71233ZM13.5002 5.5C12.3956 5.5 11.5002 4.60457 11.5002 3.5C11.5002 2.39543 12.3956 1.5 13.5002 1.5C14.6047 1.5 15.5002 2.39543 15.5002 3.5C15.5002 4.60457 14.6047 5.5 13.5002 5.5ZM10.5286 18.6813L7.31465 22.5116L5.78257 21.226L8.75774 17.6803L9.50426 15.5L11.2954 17L10.5286 18.6813Z"></path>
            </svg>
        {/if}

        <label class="switch">
            <input type="checkbox" checked="{context.overWorldContext?.running ? true : undefined}"
                   on:change={() => context.overWorldContext.running = !context.overWorldContext?.running}>
            <span>
            </span>
        </label>
    </div>
</div>

<script lang="ts">

    import {ABButtons, keys, lastKey, resetKeys} from "../js/commands/keyboard";
    import {onDestroy, onMount} from "svelte";
    import Menu from "./menus/Menu.svelte";
    import JoystickController from 'joystick-controller';
    import {OpenMap} from "../js/mapping/maps.js";
    import type {Jonction} from "../js/mapping/collisions";
    import DialogView from "./common/DialogView.svelte";
    import type {Script} from "../js/scripting/scripts";
    import {type Writable, writable} from "svelte/store";
    import type {NPC} from "../js/characters/npc";
    import Evolution from "./common/Evolution.svelte";
    import StarterSelection from "./common/StarterSelection.svelte";
    import {Position} from "../js/mapping/positions";
    import type {GameContext} from "../js/context/gameContext";

    /**
     * Overworld component.
     * Main game loop, menus, battle starting...
     */

    export let context: GameContext;

    let canvas: HTMLCanvasElement;
    let wrapper: HTMLDivElement;
    let abButtonsC: HTMLDivElement;
    let joysticks: HTMLDivElement;
    let canvasWidth: number;
    let canvasCtx: CanvasRenderingContext2D;
    $:evolutions = context?.player?.monsters?.filter(p => p.canEvolve());


    /*
    Positions (put that in context ?)
     */
    let playerPosition: Position = new Position();
    let playerPositionInPx: Position = new Position();
    let targetPosition: Position = new Position();

    let walkerPositionInPx: Position = new Position();
    let walkerTargetPosition: Position = new Position();
    let walkerDirection: 'down' | 'up' | 'left' | 'right' = 'down';

    let abButtons: ABButtons;
    let joystick: JoystickController;


    function initContext() {
       // overworldContext = new WorldContext(save);
        mainLoop();
        loadMap(context.map);
    }

    /*
    Game loop
     */
    function mainLoop() {
        context.overWorldContext.frames.frameId = window.requestAnimationFrame(mainLoop);

        canvasCtx.imageSmoothingEnabled = true;
        canvasCtx.imageSmoothingQuality = 'high';


        let now = Date.now();
        let elapsed = now - context.overWorldContext.frames.then;

        if (elapsed > context.overWorldContext.frames.fpsInterval &&
            context?.map &&
            //!battleState?.ending && // TODO ?
            //!overworldContext.displayChangingMap &&
            evolutions?.length === 0) {
            context.overWorldContext.frames.then = now - (elapsed % context.overWorldContext.frames.fpsInterval);

            canvasCtx.fillStyle = 'black';
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            /*
            Update & draw
             */
            updatePosition(playerPositionInPx, targetPosition);
            updatePosition(walkerPositionInPx, walkerTargetPosition);
            context.map.npcs.forEach(npc => {
                updateNPCPosition(npc);
            });
            drawElements();


            if (canMove()) {

                let moved = move();
                if (moved) {

                    /*Position checks*/
                    checkForStepInScript();
                    checkForFunction();
                    checkForBattle();
                    checkForInSight();
                }
            }

            /*
            use "x" to display debug info
             */
            if (context.overWorldContext.frames.debug) {
                canvasCtx.font = "12px Arial";
                let fps = Math.round(1 / elapsed * 1000);

                canvasCtx.fillStyle = 'black';
                canvasCtx.fillRect(0, 0, 160, 60);

                canvasCtx.fillStyle = 'white';
                canvasCtx.fillText(`Player position: ${playerPosition.x}, ${playerPosition.y}`, 10, 10);
                canvasCtx.fillText(`Player moving: ${context.player.moving}`, 10, 20);
                canvasCtx.fillText(`Player direction: ${context.player.direction}`, 10, 30);
                canvasCtx.fillText(`Player offset: ${context.map.playerMovedOffset.x}, ${context.map.playerMovedOffset.y}`, 10, 40);
                canvasCtx.fillText(`fps: ${fps}`, 10, 50);
            }
        }
    }


    /*
    Scripts
     */

    $:currentScript = context?.playingScript;
    $:currentAction = currentScript?.currentAction;
    $:hasDialog = currentAction?.type === 'Dialog';

    let aButtonValue: Writable<boolean> = writable(false);
    let bButtonValue: Writable<boolean> = writable(false);
    aButtonValue.subscribe(value => {
        keys.a.pressed = value;
        if (value && !context.playingScript) {
            let interactive = context.map?.elementInFront(playerPosition, context.player.direction);
            let scripts = interactive?.interact(context, playerPosition);
            let newScript = scripts?.[0];
            let previous = scripts?.[1];
            if (newScript) {
                context.playScript(newScript, previous);
            } else {
                previous?.resume(context);
            }

        }
    })

    function checkForGameStart(): boolean {
        if (context.isNewGame && !context.overWorldContext.menus.wakeUp) {
            let script = context.scriptsByTrigger.get('onGameStart')?.at(0);
            context.overWorldContext.menus.wakeUp = true;
            setTimeout(() => {
                context.isNewGame = false;
                context.overWorldContext.menus.wakeUp = false;
                if (script) {
                    context.playScript(script, undefined, () => context.overWorldContext.menus.starterSelection = true);
                }
            }, 5000);
            return true;
        }
        return false;
    }

    function checkForStepInScript() {
        let stepScript: Script | undefined;
        if (context.map?.scripts && context.map.scripts?.length > 0 && !context.playingScript) {
            // TODO allow range of positions
            stepScript = context.map.scripts.find(s => s.triggerType === 'onStep' && s.stepPosition?.x === playerPosition.x && s.stepPosition?.y === playerPosition.y);
        }

        if (stepScript !== undefined && !stepScript?.played || stepScript?.replayable) {
            context.playScript(stepScript);
        }

        return stepScript;
    }


    /*
    Map change (load and junctions)
     */
    function checkForFunction() {
        if (context.map === undefined) return;
        let jonction = context.map.jonctionAt(playerPosition);
        if (jonction !== undefined) {
            changeMap(jonction);
        }
    }

    function loadMap(map: OpenMap) {
// TODO all that should be in context
        playerPosition = new Position(
            map.playerMovedOffset.x + map.playerInitialPosition.x,
            map.playerMovedOffset.y + map.playerInitialPosition.y);

        playerPositionInPx = new Position(
            Math.floor(playerPosition.x * (16 * context.overWorldContext.frames.imageScale)),
            Math.floor(playerPosition.y * (16 * context.overWorldContext.frames.imageScale)));
        targetPosition = new Position(playerPositionInPx.x, playerPositionInPx.y);

        walkerPositionInPx = new Position(
            Math.floor(playerPosition.x * (16 * context.overWorldContext.frames.imageScale)),
            Math.floor((playerPosition.y - 1) * (16 * context.overWorldContext.frames.imageScale)));
        walkerTargetPosition = new Position(walkerPositionInPx.x, walkerPositionInPx.y);

        map.npcs?.forEach(npc => {
            npc.positionInPx = new Position(
                Math.floor(npc.position.x * (16 * context.overWorldContext.frames.imageScale)),
                Math.floor(npc.position.y * (16 * context.overWorldContext.frames.imageScale)));
            npc.targetPositionInPx = new Position(npc.positionInPx.x, npc.positionInPx.y);
        });

        context.overWorldContext.changingMap = true;
        //overworldContext.displayChangingMap = true;

        let onEnterScript: Script | undefined;
        if (map.scripts && map.scripts?.length > 0) {
            onEnterScript = map.scripts?.find(s => s.triggerType === 'onEnter');
        }

        let npcOnEnter = map.npcs.filter(npc => npc.movingScript);

        context.map = map;

        setTimeout(() => {
            context.overWorldContext.changingMap = false;

            if (onEnterScript) {
                context.playScript(onEnterScript)
            }
            if (npcOnEnter?.length > 0) {
               // overworldContext.playMvts(npcOnEnter);
            }

        }, 4000);
        setTimeout(() => {
            //overworldContext.displayChangingMap = false;
            checkForGameStart();
        }, 2000);
    }

    function changeMap(jonction: Jonction) {
        let map = OpenMap.fromInstance(context.MAPS[jonction.mapIdx], new Position(0, 0));
        map.playerInitialPosition = map.jonctions.find(j => j.id === jonction.id)?.start || new Position(0, 0);
        loadMap(map);
    }

    /*
    Positions update
     */
    function canMove(): boolean {
      /*  return !menuOpened &&
            !pokemonListOpened &&
            !openSummary &&
            !bagOpened &&
            !boxOpened &&
            !overworldContext.playingScript &&
            !overworldContext.displayChangingMap &&
            !battleState?.starting &&
            !starterSelection;
            */
        // TODO: set pause
       return !context.overWorldContext.isPaused;
    }

    function move(): boolean {
        const deltaX = targetPosition.x - playerPositionInPx.x;
        const deltaY = targetPosition.y - playerPositionInPx.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        let direction = context.player.direction;
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

            const xChanger = (x: number) => direction === 'left' ? x - 1 : direction === 'right' ? x + 1 : x;
            const yChanger = (y: number) => direction === 'up' ? y - 1 : direction === 'down' ? y + 1 : y;

            const futureX = xChanger(playerPosition.x);
            const futureY = yChanger(playerPosition.y);

            if (context.player.direction !== direction) {
                context.player.direction = direction;
                return false;
            } else if (context.map && !context.map.hasBoundaryAt(new Position(futureX, futureY))) {
                context.player.moving = true;

                walkerDirection = tmpSave;
                walkerTargetPosition = new Position(
                    targetPosition.x,
                    targetPosition.y
                );

                targetPosition = new Position(
                    Math.floor(targetPosition.x + (xChanger(0) * 16 * context.overWorldContext.frames.imageScale)),
                    Math.floor(targetPosition.y + (yChanger(0) * 16 * context.overWorldContext.frames.imageScale))
                );
                playerPosition = new Position(futureX, futureY);

                context.map.playerMovedOffset.x = xChanger(context.map.playerMovedOffset.x);
                context.map.playerMovedOffset.y = yChanger(context.map.playerMovedOffset.y);
            }
        }
        return move;
    }

    function easeInOutQuad(t: number) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function updateNPCPosition(npc: NPC) {

        if (!npc.positionInPx || !npc.targetPositionInPx) return;
        npc.targetPositionInPx = new Position(
            Math.floor(npc.targetPosition.x * (16 * context.overWorldContext.frames.imageScale)),
            Math.floor(npc.targetPosition.y * (16 * context.overWorldContext.frames.imageScale)));


        const deltaX = npc.targetPositionInPx.x - npc.positionInPx.x;
        const deltaY = npc.targetPositionInPx.y - npc.positionInPx.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const speed = context.overWorldContext.frames.walk;
        if (distance > 6) {

            const easedDistance = easeInOutQuad(Math.min(1, distance / 5));
            // Interpolate between current and target positions with eased distance
            npc.positionInPx.x += deltaX * easedDistance * speed;
            npc.positionInPx.y += deltaY * easedDistance * speed;
        } else {
            // Snap to the target position if movement is small
            npc.positionInPx.x = npc.targetPositionInPx.x;
            npc.positionInPx.y = npc.targetPositionInPx.y;
            //npc.moving = false;
            npc.position = new Position(npc.targetPosition.x, npc.targetPosition.y);
        }
    }

    function updatePosition(positionInPx: Position, targetPosition: Position) {

        const deltaX = targetPosition.x - positionInPx.x;
        const deltaY = targetPosition.y - positionInPx.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const speed = context.overWorldContext.running ? context.overWorldContext.frames.run : context.overWorldContext.frames.walk;
        if (distance > 6) {
            const easedDistance = easeInOutQuad(Math.min(1, distance / 5));
            // Interpolate between current and target positions with eased distance
            positionInPx.x += deltaX * easedDistance * speed;
            positionInPx.y += deltaY * easedDistance * speed;
        } else {
            // Snap to the target position if movement is small
            context.player.moving = false;
            positionInPx.x = targetPosition.x;
            positionInPx.y = targetPosition.y;
        }
    }

    function drawElements() {
        if (context.map === undefined) return;

        // Background
        let mapDimensions = context.map.draw(canvasCtx, context.map, context.overWorldContext.frames.imageScale, playerPositionInPx, context.overWorldContext.frames.debug);

        // Player & walker
        context.player.draw(canvasCtx, 'overworld', context.overWorldContext.frames.playerScale, playerPositionInPx, mapDimensions, context.map.hasBattleZoneAt(playerPosition));


        context.map.npcs.forEach(npc => {
            npc.draw(canvasCtx, playerPositionInPx, npc, context.overWorldContext.frames.playerScale, mapDimensions);
        });

        // Foreground
        if (context.map?.foreground !== undefined) {
            context.map.drawFG(canvasCtx, context.map, context.overWorldContext.frames.imageScale, playerPositionInPx, context.overWorldContext.frames.debug);
        }
    }

    /*
    Battle start
     */
    function checkForBattle() {
        if (context.map && context.map.hasBattleZoneAt(playerPosition) && Math.random() < 0.07) {
            let monster = context.map.randomMonster();
            context.startBattle(context.POKEDEX.findById(monster.id).result.instanciate(monster.level));
        }
    }

    function checkForInSight() {
        if (context.map?.npcs && context.map?.npcs?.length > 0) {
            let npcsWithInSightScript: NPC[] = context.map.npcs.filter(npc =>
                npc.mainScript &&
                (!npc.mainScript.played || npc.mainScript.replayable) &&
                npc.mainScript.triggerType === 'onSight'
            );

            npcsWithInSightScript.forEach(npc => {
                //let inSight = npc.isInSight(playerPosition);
                // player is in sight if the npc looks in his direction and is within 3 tiles
                //get 3 tiles in front of the npc  :
                let positionsInFront: Position[];
                if (npc.direction === 'down') {
                    positionsInFront = [new Position(npc.position.x, npc.position.y + 1), new Position(npc.position.x, npc.position.y + 2), new Position(npc.position.x, npc.position.y + 3)];
                } else if (npc.direction === 'up') {
                    positionsInFront = [new Position(npc.position.x, npc.position.y - 1), new Position(npc.position.x, npc.position.y - 2), new Position(npc.position.x, npc.position.y - 3)];
                } else if (npc.direction === 'left') {
                    positionsInFront = [new Position(npc.position.x - 1, npc.position.y), new Position(npc.position.x - 2, npc.position.y), new Position(npc.position.x - 3, npc.position.y)];
                } else {
                    positionsInFront = [new Position(npc.position.x + 1, npc.position.y), new Position(npc.position.x + 2, npc.position.y), new Position(npc.position.x + 3, npc.position.y)];
                }
                let inSight = positionsInFront.some(p => p.x === playerPosition.x && p.y === playerPosition.y);

                if (inSight) {
                    console.log('in sight !');
                    context.playScript(npc.mainScript);
                }
            });
        }
    }

    /*
    Controls
     */

    const keyUpListener = (e: KeyboardEvent) => {
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
    const keyDownListener = (e: KeyboardEvent) => {
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
                    context.overWorldContext.running = !context.overWorldContext.running;
                    break;
                case 'x':
                    context.overWorldContext.frames.debug = !context.overWorldContext.frames.debug;
                    break;
                case 'Escape':
                    context.overWorldContext.menus.menuOpened = !context.overWorldContext.menus.menuOpened;
            }
        } else {
            switch (e.key) {
                case 'Escape':
                    context.overWorldContext.menus.menuOpened = false;
            }
        }
    };

    const jsCallback = (data: any) => {
        // convert data.angle (radian) to a direction (top, bottom, left, right)
        if (!context.overWorldContext.isPaused) {
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
        canvasCtx?.clearRect(0, 0, canvas.width, canvas.height);
        window.cancelAnimationFrame(context.overWorldContext.frames.frameId);
        window.removeEventListener('keydown', keyDownListener);
        window.removeEventListener('keyup', keyUpListener);
        joystick?.destroy();
        abButtons?.destroy();
    });

    onMount(() => {
        canvasCtx = canvas.getContext('2d');
        window.addEventListener('keydown', keyDownListener);
        window.addEventListener('keyup', keyUpListener);

        console.log(context)

        initContext();

        canvasWidth = Math.min(window.innerWidth, canvas.width);

        abButtons = new ABButtons(abButtonsC, (a, b) => {
            aButtonValue.set(a);
            bButtonValue.set(b);
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

    &.blur {
      animation: blurry 5s linear infinite;
    }

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

  .wakeUp {
    position: absolute;
    top: 0;
    left: 0;
    width: 100dvw;
    height: 100dvh;
    z-index: 10;
    pointer-events: none;

    .top, .bot {
      position: absolute;
      width: 100%;
      height: 50dvh;
      background: black;
      z-index: 11;
      pointer-events: none;
    }

    .top {
      top: 0;
      animation: blinkingDown 5s forwards;
    }

    .bot {
      bottom: 0;

      animation: blinkingTop 5s forwards;
    }

  }

  @keyframes -global-blinkingDown {
    20% {
      top: -50%;
    }
    25% {
      top: 0;
    }

    40% {
      top: -50%;
    }
    50% {
      top: 0;
    }
    65% {
      top: -50%;
    }
    75% {
      top: 0;
    }
    100% {
      top: -50%
    }
  }

  @keyframes -global-blinkingTop {
    20% {
      bottom: -50%;
    }
    25% {
      bottom: 0;
    }
    40% {
      bottom: -50%;
    }
    50% {
      bottom: 0;
    }
    65% {
      bottom: -50%;
    }
    75% {
      bottom: 0;
    }
    100% {
      bottom: -50%
    }
  }

  @keyframes -global-blurry {
    0% {
      filter: blur(3px) brightness(1.5);
      -webkit-filter: blur(3px) brightness(1.5);
    }
    100% {
      filter: blur(0) brightness(1);
      -webkit-filter: blur(0) brightness(1);
    }
  }

</style>
