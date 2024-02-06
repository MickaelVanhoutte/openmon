<canvas bind:this={canvas} id="main" width="1024" height="1024"></canvas>

<Menu bind:menuOpened bind:save bind:saveContext/>

<Joy/>

{#if battleState && battleState?.starting}
    <div class="battleStart"></div>
{/if}
{#if battleState && battleState?.ending}
    <div class="battleEnd"></div>
{/if}

<script lang="ts">

    import {keydownListener, keys, keyupListener, lastKey} from "../js/commands/keyboard";
    import {Position} from "../js/sprites/drawers";
    import {BattleContext, BattleState} from "../js/battle/battle";
    import {PokemonInstance} from "../js/pokemons/pokedex";
    import {Character} from "../js/player/player";
    import {onDestroy, onMount} from "svelte";
    import Menu from "../ui/main/Menu.svelte";
    import Joy from "../ui/controls/VControls.svelte";
    import {BATTLE_STATE, MAP_DRAWER, POKEDEX} from "../js/const";
    import {SaveContext, SelectedSave} from "../js/saves/saves";

    export let canvas: HTMLCanvasElement;

    export let saveContext: SaveContext;
    export let save: SelectedSave;

    let ctx;

    let battleState: BattleState | undefined;

    BATTLE_STATE.subscribe(value => {
        battleState = value.state;
    });

    let menuOpened = false;

    let mainLoopContext = {
        id: 0,
        then: Date.now(),
        fpsInterval: 1000 / 10,
        imageScale: window.innerWidth < 1100 ? 2 : 4.5,
        playerScale: window.innerWidth < 1100 ? .66 : 1.5,
        debug: false
    }

    /* Sizing */

    function mainLoop() {
        mainLoopContext.id = window.requestAnimationFrame(mainLoop);
        ctx.font = "12px Arial";
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        let now = Date.now();
        let elapsed = now - mainLoopContext.then;

        if (elapsed > mainLoopContext.fpsInterval) {
            mainLoopContext.then = now - (elapsed % mainLoopContext.fpsInterval);
            let positionOnMap = new Position(
                save.map.playerInitialPosition.x + save.map.playerMovedOffset.x,
                save.map.playerInitialPosition.y + save.map.playerMovedOffset.y);

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            MAP_DRAWER.draw(ctx, save.map, mainLoopContext.imageScale, mainLoopContext.debug);

            save.player.draw(ctx, "overworld", mainLoopContext.playerScale);
            //currentMap.drawForeground(ctx, movedOffset); // FIXME non transparent tiles

            let allowedMove = true;
            save.player.moving = false;

            // Stop if initiated
            if (battleState?.starting) {
                return;
            }

            // if (!menuOpened) {
            // Check for battle
            if (keys.down.pressed || keys.up.pressed || keys.left.pressed || keys.right.pressed) {

                if (save.map.hasBattleZoneAt(positionOnMap) && Math.random() < 0.1) {
                    let monster = save.map.randomMonster();
                    window.cancelAnimationFrame(mainLoopContext.id);
                    initiateBattle(POKEDEX.findById(monster.id).result.instanciate(monster.level));
                }
            }

            // Move player
            if (keys.down.pressed && lastKey.key === 'ArrowDown') {

                if (save.map.hasBoundaryAt(new Position(positionOnMap.x, positionOnMap.y + 1))) {
                    allowedMove = false;
                }

                save.player.moving = true;
                save.player.direction = 'down';
                if (allowedMove) {
                    save.map.playerMovedOffset.y++;
                }
            }
            if (keys.up.pressed && lastKey.key === 'ArrowUp') {

                if (save.map.hasBoundaryAt(new Position(positionOnMap.x, positionOnMap.y - 1))) {
                    allowedMove = false;
                }
                save.player.moving = true
                save.player.direction = 'up';
                if (allowedMove) {
                    save.map.playerMovedOffset.y--;
                }
            }
            if (keys.left.pressed && lastKey.key === 'ArrowLeft') {

                if (save.map.hasBoundaryAt(new Position(positionOnMap.x - 1, positionOnMap.y))) {
                    allowedMove = false;
                }

                save.player.moving = true;
                save.player.direction = 'left';
                if (allowedMove) {
                    save.map.playerMovedOffset.x--;
                }
            }
            if (keys.right.pressed && lastKey.key === 'ArrowRight') {

                if (save.map.hasBoundaryAt(new Position(positionOnMap.x + 1, positionOnMap.y))) {
                    allowedMove = false;
                }
                save.player.moving = true;
                save.player.direction = 'right';
                if (allowedMove) {
                    save.map.playerMovedOffset.x++;
                }
            }

            if (mainLoopContext.debug) {
                let fps = Math.round(1 / elapsed * 1000);

                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, 160, 60);

                ctx.fillStyle = 'white';
                ctx.fillText(`Player position: ${positionOnMap.x}, ${positionOnMap.y}`, 10, 10);
                ctx.fillText(`Player moving: ${save.player.moving}`, 10, 20);
                ctx.fillText(`Player direction: ${save.player.direction}`, 10, 30);
                ctx.fillText(`Player offset: ${save.map.playerMovedOffset.x}, ${save.map.playerMovedOffset.y}`, 10, 40);
                ctx.fillText(`fps: ${fps}`, 10, 50);
            }
        }
    }

    function initiateBattle(opponent: PokemonInstance | Character) {

        let bContext = new BattleContext();
        bContext.state = new BattleState(save.player, opponent)
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

        unbindKeyboard(save.player);
    }

    function bindKeyboard(player: Character) {
        window.addEventListener('keydown', keydownListener());
        window.addEventListener('keyup', keyupListener(player));
        window.addEventListener('keydown', worldActionsListener);
        window.addEventListener('keyup', worldActionsUpListener);
    }

    function unbindKeyboard(player: Character) {
        window.removeEventListener('keydown', keydownListener());
        window.removeEventListener('keyup', keyupListener(player));
        window.removeEventListener('keydown', worldActionsListener);
        window.removeEventListener('keyup', worldActionsUpListener);
    }

    function worldActionsListener(event: KeyboardEvent) {
        switch (event.key) {
            case 'Escape':
                menuOpened = !menuOpened;
                break;
            case 'A':
                //TODO
                break;
            case 'B':
                //TODO
                break;
            case 'Shift':
                save.player.running = true;
                mainLoopContext.fpsInterval = 1000 / 24;
                break;
            case 'x':
                mainLoopContext.debug = !mainLoopContext.debug;
        }
    }

    function worldActionsUpListener(event: KeyboardEvent) {
        switch (event.key) {
            case 'Shift':
                save.player.running = false;
                mainLoopContext.fpsInterval = 1000 / 16;
                break;
        }
    }

    onDestroy(() => {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        window.cancelAnimationFrame(mainLoopContext.id);
        unbindKeyboard(save.player);
    });

    onMount(() => {
        ctx = canvas.getContext('2d');
        bindKeyboard(save.player);
        mainLoop();
    });

</script>

<style lang="scss">
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

  @media screen and (orientation: portrait) {
    canvas {
      width: auto;
      height: 1024px;
    }
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
    z-index: 10;
    animation: fade-out 4s ease-in-out;
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
