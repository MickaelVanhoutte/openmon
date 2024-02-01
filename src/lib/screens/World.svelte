<script lang="ts">

    import {keydownListener, keys, keyupListener, lastKey} from "../js/commands/keyboard";
    import {SelectedSave} from "../js/saves/saves";
    import {Position, WoldSpriteDrawer} from "../js/sprites/drawers";
    import {BattleState} from "../js/battle/battle";
    import {Pokedex} from "../js/pokemons/pokedex";
    import {PokemonInstance} from "../js/pokemons/pokedex";
    import {Character} from "../js/player/player";
    import {onDestroy, onMount} from "svelte";

    export let context: SelectedSave;

    export let battleContext: BattleState;
    export let canvas: HTMLCanvasElement;

    export let pokedex: Pokedex;

    let battleStarted = false;

    let ctx = canvas.getContext('2d');
    ctx.font = "12px Arial";

    let mainLoopContext = {
        id: 0,
        fps: 12,
        then: Date.now(),
        fpsInterval: 1000 / 12,
        imageScale: 3,
        movedOffset: new Position(0, 0),
        debug: false
    }

    let drawer = new WoldSpriteDrawer();

    /* Sizing */

    function mainLoop() {
        mainLoopContext.id = window.requestAnimationFrame(mainLoop);

        let now = Date.now();
        let elapsed = now - mainLoopContext.then;

        if (elapsed > mainLoopContext.fpsInterval) {
            mainLoopContext.then = now - (elapsed % mainLoopContext.fpsInterval);

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            drawer.draw(ctx, context.map, mainLoopContext.movedOffset, mainLoopContext.imageScale, mainLoopContext.debug);

            context.player.draw(ctx, mainLoopContext.imageScale);
            //currentMap.drawForeground(ctx, movedOffset); // FIXME non transparent tiles

            let allowedMove = true;
            context.player.moving = false;

            // Stop battle if initiated
            if (battleContext) {
                return;
            }

            // if (!menuOpened) {
            // Check for battle
            if (keys.down.pressed || keys.up.pressed || keys.left.pressed || keys.right.pressed) {

                if (context.map.hasBattleZoneAt(context.player.positionOnMap) && Math.random() < 0.1) {
                    let monster = context.map.randomMonster();
                    window.cancelAnimationFrame(mainLoopContext.id);
                    initiateBattle(pokedex.findById(monster.id).result.instanciate(monster.level));
                }
            }

            // Move player
            if (keys.down.pressed && lastKey.key === 'ArrowDown') {

                if (context.map.hasBoundaryAt(new Position(context.player.positionOnMap.x, context.player.positionOnMap.y + 1))) {
                    allowedMove = false;
                }

                context.player.moving = true;
                context.player.direction = 'down';
                if (allowedMove) {
                    mainLoopContext.movedOffset.y++;
                }
            }
            if (keys.up.pressed && lastKey.key === 'ArrowUp') {

                if (context.map.hasBoundaryAt(new Position(context.player.positionOnMap.x, context.player.positionOnMap.y - 1))) {
                    allowedMove = false;
                }
                context.player.moving = true
                context.player.direction = 'up';
                if (allowedMove) {
                    mainLoopContext.movedOffset.y--;
                }
            }
            if (keys.left.pressed && lastKey.key === 'ArrowLeft') {

                if (context.map.hasBoundaryAt(new Position(context.player.positionOnMap.x - 1, context.player.positionOnMap.y))) {
                    allowedMove = false;
                }

                context.player.moving = true;
                context.player.direction = 'left';
                if (allowedMove) {
                    mainLoopContext.movedOffset.x--;
                }
            }
            if (keys.right.pressed && lastKey.key === 'ArrowRight') {

                if (context.map.hasBoundaryAt(new Position(context.player.positionOnMap.x + 1, context.player.positionOnMap.y))) {
                    allowedMove = false;
                }
                context.player.moving = true;
                context.player.direction = 'right';
                if (allowedMove) {
                    mainLoopContext.movedOffset.x++;
                }
            }
            context.player.updatePosition(context.map.playerInitialPosition, mainLoopContext.movedOffset);

            if (mainLoopContext.debug) {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, 160, 60);

                ctx.fillStyle = 'white';
                ctx.fillText(`Player position: ${context.player.positionOnMap.x}, ${context.player.positionOnMap.y}`, 10, 10);
                ctx.fillText(`Player moving: ${context.player.moving}`, 10, 20);
                ctx.fillText(`Player direction: ${context.player.direction}`, 10, 30);
                ctx.fillText(`Player offset: ${mainLoopContext.movedOffset.x}, ${mainLoopContext.movedOffset.y}`, 10, 40);
                ctx.fillText(`fps: ${mainLoopContext.fps}`, 10, 50);
            }
        }
    }

    function initiateBattle(opponent: PokemonInstance | Character) {
        battleStarted = true;

        setTimeout(() => {
            battleStarted = false;
            battleContext = new BattleState(context.player, opponent);

        }, 2000);

        //stopCommands();
        /*battle.initiated = true;
        battle.startDate = new Date();
        battleState = new BattleState(character, opponent, canvas);
        unbindKeyboard();

        battleState.onClose = () => {
            stopBattle(battleLoopContext.id);
        }
        battleStart = true;

        setTimeout(() => {
            battleStart = false;
            opened = true;
            battleLoop();
        }, 2000);*/
    }

    function bindKeyboard(player: Character) {
        window.addEventListener('keydown', keydownListener());
        window.addEventListener('keyup', keyupListener(player));
        window.addEventListener('keydown', openMenuListener);
    }

    function unbindKeyboard(player: Character) {
        window.removeEventListener('keydown', keydownListener());
        window.removeEventListener('keyup', keyupListener(player));
        window.removeEventListener('keydown', openMenuListener);
    }

    function openMenuListener(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            //menuOpened = !menuOpened;
        }
    }

    function move(direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') {
        return (event: MouseEvent) => {
            event.preventDefault();
            switch (direction) {
                case 'ArrowUp':
                    keys.up.pressed = true;
                    break;
                case 'ArrowDown':
                    keys.down.pressed = true;
                    break;
                case 'ArrowLeft':
                    keys.left.pressed = true;
                    break;
                case 'ArrowRight':
                    keys.right.pressed = true;
                    break;
            }
            lastKey.key = direction;
        }
    }

    function stop(direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') {
        return (event: MouseEvent) => {
            switch (direction) {
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
    }

    function stopCommands() {
        keys.down.pressed = false;
        keys.up.pressed = false;
        keys.right.pressed = false;
        keys.left.pressed = false;
        context.player.moving = false;
    }

    onDestroy(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        unbindKeyboard(context.player);
    });

    onMount(() => {
        bindKeyboard(context.player);
        mainLoop();
    });

</script>

<style lang="scss">

</style>
