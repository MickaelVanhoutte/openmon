<svelte:options accessors={true}/>


<BattleScene bind:opened={opened} bind:battleStart={battleStart} bind:opponent={currentMap.currentMonster}
             bind:player={player}/>

<Menu bind:menuOpened={menuOpened} bind:player={player}/>

<script lang="ts">
    import {Player} from "../js/model/player";
    import {map1} from "../js/maps/map1";
    import {keydownListener, keys, keyupListener, lastKey} from "../js/commands/keyboard";
    import {Boundary, rectangularCollision} from "../js/model/collisions";
    import {MonsterSprite, Position} from "../js/model/sprites";
    import {battleSprite} from "../js/model/battle";
    import BattleScene from "./BattleScene.svelte";
    import Menu from "./main/Menu.svelte";


    export let opened = false;
    export let menuOpened = false;
    export let battleStart = false;

    export let currentMap = map1;

    export let canvas: HTMLCanvasElement;


    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;


    export let player = new Player('Player 1', canvas);

    const forwardBy = 12;

    const movables = [currentMap.background, currentMap.foreground, ...currentMap.boundaries, ...currentMap.battleZones];

    const battle = {
        initiated: false
    }

    function animate() {
        const mainLoopId = window.requestAnimationFrame(animate);

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        currentMap.background.draw(ctx, canvas);
        player.sprite.draw(ctx, canvas);

        if (currentMap.foreground) {
            currentMap.foreground.draw(ctx, canvas);
        }

        let allowedMove = true;
        player.sprite.moving = false;

        if (battle.initiated) {
            return;
        }


        if (!menuOpened) {

            if (keys.down.pressed || keys.up.pressed || keys.left.pressed || keys.right.pressed) {

                for (let i = 0; i < currentMap.battleZones.length; i++) {
                    const battleZone = currentMap.battleZones[i];

                    // calculate overlapping area between player and the battleZone
                    const overlappingArea = Math.max(0, Math.min(player.sprite.position.x + player.sprite.width, battleZone.position.x + battleZone.width) - Math.max(player.sprite.position.x, battleZone.position.x)) *
                        Math.max(0, Math.min(player.sprite.position.y + player.sprite.height, battleZone.position.y + battleZone.height) - Math.max(player.sprite.position.y, battleZone.position.y)) / (player.sprite.width * player.sprite.height);

                    if (rectangularCollision(
                        player.sprite,
                        battleZone
                    ) && overlappingArea >= 0.5 && Math.random() < 0.01) {
                        let monster = currentMap.randomMonster(canvas);
                        battle.initiated = true;
                        window.cancelAnimationFrame(mainLoopId);
                        initiateBattle(monster);
                        break;
                    }
                }
            }

            if (keys.down.pressed && lastKey === 'ArrowDown') {

                for (let i = 0; i < currentMap.boundaries.length; i++) {
                    let boundary = currentMap.boundaries[i];
                    if (rectangularCollision(
                        player.sprite,
                        new Boundary(new Position(boundary.position.x, boundary.position.y - forwardBy))
                    )) {
                        allowedMove = false;
                        break;
                    }
                }

                player.sprite.moving = true;
                player.sprite.image = player.sprite?.sprites?.front || player.sprite.image;
                if (allowedMove) {
                    movables.forEach(movable => {
                        movable.position.y -= forwardBy;
                    });
                }
            }
            if (keys.up.pressed && lastKey === 'ArrowUp') {

                for (let i = 0; i < currentMap.boundaries.length; i++) {
                    let boundary = currentMap.boundaries[i];
                    if (rectangularCollision(
                        player.sprite,
                        new Boundary(new Position(boundary.position.x, boundary.position.y + forwardBy))
                    )) {
                        allowedMove = false;
                        break;
                    }
                }
                player.sprite.moving = true
                player.sprite.image = player.sprite?.sprites?.back || player.sprite.image;
                if (allowedMove) {
                    movables.forEach(movable => {
                        movable.position.y += forwardBy;
                    });
                }
            }
            if (keys.left.pressed && lastKey === 'ArrowLeft') {

                for (let i = 0; i < currentMap.boundaries.length; i++) {
                    let boundary = currentMap.boundaries[i];
                    if (rectangularCollision(
                        player.sprite,
                        new Boundary(new Position(boundary.position.x + forwardBy, boundary.position.y))
                    )) {
                        allowedMove = false;
                        break;
                    }
                }

                player.sprite.moving = true;
                player.sprite.image = player.sprite?.sprites?.left || player.sprite.image;
                if (allowedMove) {
                    movables.forEach(movable => {
                        movable.position.x += forwardBy;
                    });
                }
            }
            if (keys.right.pressed && lastKey === 'ArrowRight') {

                for (let i = 0; i < currentMap.boundaries.length; i++) {
                    let boundary = currentMap.boundaries[i];
                    if (rectangularCollision(
                        player.sprite,
                        new Boundary(new Position(boundary.position.x - forwardBy, boundary.position.y))
                    )) {
                        allowedMove = false;
                        break;
                    }
                }
                player.sprite.moving = true;
                player.sprite.image = player.sprite?.sprites?.right || player.sprite.image;
                if (allowedMove) {
                    movables.forEach(movable => {
                        movable.position.x -= forwardBy;
                    });
                }
            }
        }
    }



    function initiateBattle(opponent: MonsterSprite) {

        initialOpponentPosition = {...opponent.position} || initialOpponentPosition;
        initialAllyPosition = {...player.monsters.at(0).position} || initialAllyPosition;

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

    let fps = 20;
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
            player.monsters.at(0)?.draw(ctx);

            if (!!currentMap.currentMonster?.position) {
                if (monsterPositionOffset < 10) {
                    monsterPositionOffset++;
                    currentMap.currentMonster.position.y = initialOpponentPosition.y - monsterPositionOffset
                    player.monsters.at(0).position.y = initialAllyPosition.y + monsterPositionOffset;
                } else {
                    monsterPositionOffset = 0;
                    currentMap.currentMonster.position.y = initialOpponentPosition.y;
                    player.monsters.at(0).position.y = initialAllyPosition.y;
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
