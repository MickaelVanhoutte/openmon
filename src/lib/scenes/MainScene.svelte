<svelte:options accessors={true}/>


<BattleScene bind:opened={opened} bind:battleStart={battleStart} bind:opponent={currentMap.currentMonster}
             bind:player={character}/>

<Menu bind:menuOpened={menuOpened} bind:player={character}/>

<script lang="ts">
    import {Character} from "../js/model/player";
    import {keydownListener, keys, keyupListener, lastKey} from "../js/commands/keyboard";
    import {Boundary, rectangularCollision} from "../js/model/collisions";
    import {MonsterSprite, Position} from "../js/model/sprites";
    import {battleSprite} from "../js/model/battle";
    import BattleScene from "./BattleScene.svelte";
    import Menu from "./main/Menu.svelte";
    import {testMap} from "../js/maps/test-map";


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

    const movedOffset = new Position(0, 0);

    const battle = {
        initiated: false
    }

    function animate() {
        const mainLoopId = window.requestAnimationFrame(animate);

        let now = Date.now();
        let elapsed = now - then;

        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);

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
                        let monster = currentMap.randomMonster(canvas);
                        battle.initiated = true;
                        window.cancelAnimationFrame(mainLoopId);
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


    function initiateBattle(opponent: MonsterSprite) {
console.log(character.monsters.at(0));
        initialOpponentPosition = {...opponent.position} || initialOpponentPosition;
        initialAllyPosition = new Position(
            canvas.width * 0.20,
            (canvas.height * 0.75) - (character.monsters.at(0).sprites.height * 5) + (20 * 5)
        );
        console.log(character.monsters.at(0), initialAllyPosition);
        character.monsters.at(0).position = {...initialAllyPosition};

        //initialAllyPosition = {...character.position} || initialAllyPosition; // FIXME
        battleStart = true;
        setTimeout(() => {
            battleStart = false;
            opened = true;
            battleAnimation();
        }, 2000);
    }


    let initialOpponentPosition = new Position(0, 0);
    let initialAllyPosition = new Position(0, 0);
    let monsterPositionOffset = 0;

    let fps = 24;
    let then = Date.now();
    let fpsInterval = 1000 / fps;

    let battleLoopId;

    function battleAnimation() {
        battleLoopId = window.requestAnimationFrame(battleAnimation);

        if (!opened) {
            window.cancelAnimationFrame(battleLoopId);
            battle.initiated = false;
            animate();
            return;
        }

        let now = Date.now();
        let elapsed = now - then;

        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            battleSprite.draw(ctx, canvas);
            currentMap.currentMonster?.draw(ctx);
            character.monsters.at(0)?.draw(ctx, canvas);

            if (!!currentMap.currentMonster?.position) {
                if (monsterPositionOffset < 10) {
                    monsterPositionOffset++;
                    currentMap.currentMonster.position.y = initialOpponentPosition.y - monsterPositionOffset
                    character.monsters.at(0).position.y = initialAllyPosition.y + monsterPositionOffset;
                } else {
                    monsterPositionOffset = 0;
                    currentMap.currentMonster.position.y = initialOpponentPosition.y;
                    character.monsters.at(0).position.y = initialAllyPosition.y;
                }
            }
        }

    }


    bindKeyboard();
    animate();
    // debug
    /*let monster = currentMap.randomMonster(canvas);
    monster.image.onload = () => {
        initiateBattle(monster);
    }*/


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

</script>
