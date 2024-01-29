{#if battle.initiated}
    <BattleScene bind:opened={opened}
                 bind:battleState={battle.battleState}
                 bind:battleStart={battleStart}/>
{/if}

<Menu bind:menuOpened={menuOpened} bind:player={character}/>

<script lang="ts">
    import {Character} from "../js/model/player";
    import {keydownListener, keys, keyupListener, lastKey} from "../js/commands/keyboard";
    import {Position} from "../js/model/sprites";
    import {battleBackground, BattleState} from "../js/model/battle";
    import BattleScene from "./BattleScene.svelte";
    import Menu from "./main/Menu.svelte";
    import {testMap} from "../js/maps/test-map";
    import type {Monster} from "../js/model/monster";

    export let opened = false;
    export let menuOpened = false;
    export let battleStart = false;

    export let currentMap = testMap;

    export let canvas: HTMLCanvasElement;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    export let character: Character;
    character.position = new Position(
        testMap.playerPosition.x * 48,
        testMap.playerPosition.y * 48
    );

    export let battle: {
        initiated: boolean,
        battleState?: BattleState,
        frameElapsed?: number,
        startDate?: Date,
    } = {
        initiated: false,
        frameElapsed: 0,
    }

    let monsterPositionOffset = 0;
    let initialOpponentPosition = new Position(0, 0);
    let initialAllyPosition = new Position(0, 0);

    let mainLoopContext = {
        fps: 12,
        then: Date.now(),
        fpsInterval: 1000 / 12,
        id: 0,
    }

    let battleLoopContext = {
        fps: 12,
        then: Date.now(),
        fpsInterval: 1000 / 12,
        goDown: true,
        id: 0,
    }

    const movedOffset = new Position(0, 0);

    function mainLoop() {
        mainLoopContext.id = window.requestAnimationFrame(mainLoop);

        let now = Date.now();
        let elapsed = now - mainLoopContext.then;

        if (elapsed > mainLoopContext.fpsInterval) {
            mainLoopContext.then = now - (elapsed % mainLoopContext.fpsInterval);

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            currentMap.drawBackground(ctx, movedOffset);
            character.draw(ctx);
            //currentMap.drawForeground(ctx, movedOffset); // FIXME non transparent tiles

            let allowedMove = true;
            character.moving = false;

            // Stop battle if initiated
            if (battle.initiated) {
                return;
            }

            if (!menuOpened) {
                // Check for battle
                if (keys.down.pressed || keys.up.pressed || keys.left.pressed || keys.right.pressed) {

                    if (currentMap.hasBattleZoneAt(currentMap.playerPosition) && Math.random() < 0.1) {
                        let monster = currentMap.randomMonster();
                        window.cancelAnimationFrame(mainLoopContext.id);
                        initiateBattle(monster);
                    }
                }

                // Move player
                if (keys.down.pressed && lastKey === 'ArrowDown') {

                    if (currentMap.hasBoundaryAt(new Position(currentMap.playerPosition.x, currentMap.playerPosition.y + 1))) {
                        allowedMove = false;
                    }

                    character.moving = true;
                    character.direction = 'down';
                    if (allowedMove) {
                        movedOffset.y++;
                    }
                }
                if (keys.up.pressed && lastKey === 'ArrowUp') {

                    if (currentMap.hasBoundaryAt(new Position(currentMap.playerPosition.x, currentMap.playerPosition.y - 1))) {
                        allowedMove = false;
                    }
                    character.moving = true
                    character.direction = 'up';
                    if (allowedMove) {
                        movedOffset.y--;
                    }
                }
                if (keys.left.pressed && lastKey === 'ArrowLeft') {

                    if (currentMap.hasBoundaryAt(new Position(currentMap.playerPosition.x - 1, currentMap.playerPosition.y))) {
                        allowedMove = false;
                    }

                    character.moving = true;
                    character.direction = 'left';
                    if (allowedMove) {
                        movedOffset.x--;
                    }
                }
                if (keys.right.pressed && lastKey === 'ArrowRight') {

                    if (currentMap.hasBoundaryAt(new Position(currentMap.playerPosition.x + 1, currentMap.playerPosition.y))) {
                        allowedMove = false;
                    }
                    character.moving = true;
                    character.direction = 'right';
                    if (allowedMove) {
                        movedOffset.x++;
                    }
                }
                currentMap.updatePlayerPosition(movedOffset);
            }
        }

    }

    function battleLoop() {
        battleLoopContext.id = window.requestAnimationFrame(battleLoop);
        console.log('start battle loop');
        let now = Date.now();
        let elapsed = now - battleLoopContext.then;

        if (elapsed > battleLoopContext.fpsInterval) {

            if (!battle.initiated) {
                return;
            }

            battleLoopContext.then = now - (elapsed % battleLoopContext.fpsInterval);
            battle.frameElapsed++;

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            battleBackground.draw(ctx, canvas);

            battle.battleState?.opponentCurrentMonster?.draw(ctx, 'front');
            battle.battleState?.playerCurrentMonster?.draw(ctx, 'back');

            // animate monsters
            if (!!battle.battleState?.opponentCurrentMonster?.position) {
                battleLoopContext.goDown = battle.frameElapsed <= 10;
                if (battleLoopContext.goDown) {
                    monsterPositionOffset++;
                } else {
                    monsterPositionOffset--;
                }
                battle.battleState.opponentCurrentMonster.position.y = initialOpponentPosition.y - monsterPositionOffset;
                battle.battleState.playerCurrentMonster.position.y = initialAllyPosition.y + monsterPositionOffset;
                if (battle.frameElapsed > 20) {
                    battle.frameElapsed = 0;
                }
            }
        }

    }

    function initiateBattle(opponent: Monster | Character) {
        battle.frameElapsed = 0;
        battle.initiated = true;
        battle.startDate = new Date();
        battle.battleState = new BattleState(character, opponent, canvas);
        initialOpponentPosition = {...battle.battleState.opponentCurrentMonster.position};
        initialAllyPosition = {...battle.battleState.playerCurrentMonster.position};
        unbindKeyboard();

        battle.battleState.onClose = () => {
            stopBattle(battleLoopContext.id);
        }
        battleStart = true;
        setTimeout(() => {
            battleStart = false;
            opened = true;
            battleLoop();
        }, 2000);
    }

    function stopBattle(loopId: number) {
        window.cancelAnimationFrame(battleLoopContext.id);
        battle.battleState = undefined;
        battle.initiated = false;
        battle.startDate = undefined;
        battleStart = false;
        opened = false;
        menuOpened = false;
        mainLoop();
        bindKeyboard();
    }

    function bindKeyboard() {
        window.addEventListener('keydown', keydownListener());
        window.addEventListener('keyup', keyupListener());
        window.addEventListener('keydown', openMenuListener);
    }

    function unbindKeyboard() {
        window.removeEventListener('keydown', keydownListener());
        window.removeEventListener('keyup', keyupListener());
        window.removeEventListener('keydown', openMenuListener);
    }

    function openMenuListener(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            menuOpened = !menuOpened;
        }
    }

    bindKeyboard();
    mainLoop();

</script>
