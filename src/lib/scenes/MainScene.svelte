{#if battle.initiated}
    <BattleScene bind:opened={opened}
                 bind:battleState={battle.battleState}
                 bind:battleStart={battleStart}/>

{:else}
    <div class="set outline">
        <nav class="d-pad">
            <span class="up" on:pointerdown={move('ArrowUp')} on:pointerup={stop('ArrowUp')}></span>
            <span class="right" on:pointerdown={move('ArrowRight')} on:pointerup={stop('ArrowRight')}></span>
            <span class="down" on:pointerdown={move('ArrowDown')} on:pointerup={stop('ArrowDown')}></span>
            <span class="left" on:pointerdown={move('ArrowLeft')} on:pointerup={stop('ArrowLeft')}></span>
        </nav>
    </div>
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

    let imageScale = Math.min(4, Math.max(2, window.innerWidth / currentMap.background.width))
    //let imageScale = Math.min(4, Math.max(2, Math.min(canvas.width / currentMap.background.width, canvas.height / currentMap.background.height)));
    let tileSizeInPx = 16 * imageScale;

    export let character: Character;
    character.positionOnMap = new Position(
        testMap.playerInitialPosition.x,
        testMap.playerInitialPosition.y
    );
    character.positionOnScreen = new Position(
        testMap.playerInitialPosition.x * tileSizeInPx,
        testMap.playerInitialPosition.y * tileSizeInPx
    );

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        //image scale based on screen size, image do not have to fit the screen

        imageScale = Math.min(4, Math.max(2, window.innerWidth / currentMap.background.width))// Math.min(4, Math.max(2, Math.min(canvas.width / currentMap.background.width, canvas.height / currentMap.background.height)));
        console.log(imageScale);

        tileSizeInPx = 16 * imageScale;

        character.positionOnScreen = new Position(
            testMap.playerInitialPosition.x * tileSizeInPx,
            testMap.playerInitialPosition.y * tileSizeInPx
        );
    }

    window.addEventListener('resize', () => {
        resize();
    });

    window.addEventListener('orientationchange', () => {
        resize();
    });

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
        //ctx.scale(imageScale, imageScale);
        let now = Date.now();
        let elapsed = now - mainLoopContext.then;

        if (elapsed > mainLoopContext.fpsInterval) {
            mainLoopContext.then = now - (elapsed % mainLoopContext.fpsInterval);

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            currentMap.drawBackground(ctx, movedOffset, imageScale);
            //currentMap.drawBoundaries(ctx, movedOffset, imageScale);
            //currentMap.drawBattleZones(ctx, movedOffset, imageScale);

            character.draw(ctx, movedOffset, imageScale, currentMap.background.width, currentMap.background.height);
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

                    if (currentMap.hasBattleZoneAt(character.positionOnMap) && Math.random() < 0.1) {
                        character.frames.val = 0;
                        let monster = currentMap.randomMonster();
                        window.cancelAnimationFrame(mainLoopContext.id);
                        initiateBattle(monster);
                    }
                }

                // Move player
                if (keys.down.pressed && lastKey.key === 'ArrowDown') {

                    if (currentMap.hasBoundaryAt(new Position(character.positionOnMap.x, character.positionOnMap.y + 1))) {
                        allowedMove = false;
                    }

                    character.moving = true;
                    character.direction = 'down';
                    if (allowedMove) {
                        movedOffset.y++;
                    }
                }
                if (keys.up.pressed && lastKey.key === 'ArrowUp') {

                    if (currentMap.hasBoundaryAt(new Position(character.positionOnMap.x, character.positionOnMap.y - 1))) {
                        allowedMove = false;
                    }
                    character.moving = true
                    character.direction = 'up';
                    if (allowedMove) {
                        movedOffset.y--;
                    }
                }
                if (keys.left.pressed && lastKey.key === 'ArrowLeft') {

                    if (currentMap.hasBoundaryAt(new Position(character.positionOnMap.x - 1, character.positionOnMap.y))) {
                        allowedMove = false;
                    }

                    character.moving = true;
                    character.direction = 'left';
                    if (allowedMove) {
                        movedOffset.x--;
                    }
                }
                if (keys.right.pressed && lastKey.key === 'ArrowRight') {

                    if (currentMap.hasBoundaryAt(new Position(character.positionOnMap.x + 1, character.positionOnMap.y))) {
                        allowedMove = false;
                    }
                    character.moving = true;
                    character.direction = 'right';
                    if (allowedMove) {
                        movedOffset.x++;
                    }
                }
                character.updatePosition(currentMap.playerInitialPosition, movedOffset);
            }
        }

    }

    function battleLoop() {
        battleLoopContext.id = window.requestAnimationFrame(battleLoop);

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
        stopCommands();
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
        character.moving = false;
    }

    bindKeyboard();
    mainLoop();

</script>

<style lang="scss">
  .set {
    overflow: hidden;
    text-align: center;

    position: absolute;
    bottom: 5dvh;
    left: 5dvw;
    z-index: 10;

    .d-pad, .o-pad {
      display: inline-block;
    }
  }

  .set.setbg {
    background: #222;
  }

  .set.setbg2 {
    background: #5f9837;
  }


  $dpad-radius: 17%;
  $dpad-radius-in: 20%;
  $dpad-fg: rgba(221, 221, 221, .5);
  $dpad-fg-hover: #eee;
  $dpad-bg: #fff;
  $arrowcolor: #aaa;
  $tri-sml-a: 13px;
  $tri-sml-b: 19px;
  $tri-lrg-a: 13px;
  $tri-lrg-b: 19px;
  $dpad-arrow-shift: 5px;
  $dpad-arrow-move: 35%;
  .d-pad {
    position: relative;
    width: 200px;
    height: 200px;
    border-radius: 48%;
    overflow: hidden;

    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      border-radius: 5%;
      transform: translate(-50%, -50%);
      width: 66.6%;
      height: 66.6%;
      // background: $dpad-fg;
    }

    &:after {
      content: '';
      position: absolute;
      display: none;
      z-index: 2;
      width: 20%;
      height: 20%;
      top: 50%;
      left: 50%;
      background: $dpad-fg;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all .25s;
      cursor: pointer;
    }

    &:hover:after {
      width: 30%;
      height: 30%;
    }

    span {
      display: block;
      position: absolute;
      -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
      width: 33.3%;
      height: 43%;
      line-height: 40%;
      color: #fff;
      background: $dpad-fg;
      text-align: center;

      &:hover {
        background: $dpad-fg-hover;
      }

      &:before {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border-radius: 5px;
        border-style: solid;
        transition: all .25s;
      }

      &:after {
        content: '';
        position: absolute;
        width: 102%;
        height: 78%;
        background: $dpad-bg;
        border-radius: $dpad-radius-in;
      }
    }

    span.left, span.right {
      width: 43%;
      height: 33%;

      &:after {
        width: 78%;
        height: 102%;
      }
    }

    span.up {
      top: 0;
      left: 50%;
      transform: translate(-50%, 0);
      border-radius: $dpad-radius $dpad-radius 50% 50%;

      &:hover {
        background: linear-gradient(0deg, $dpad-fg 0%, $dpad-fg-hover 50%);
      }

      &:after {
        left: 0;
        top: 0;
        transform: translate(-100%, 0);
        border-top-left-radius: 50%;
        pointer-events: none;
      }

      &:before {
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-width: 0 $tri-sml-a $tri-sml-b $tri-sml-a;
        border-color: transparent transparent $arrowcolor transparent;
      }

      &:active:before {
        border-bottom-color: #333;
      }
    }

    span.up:hover:before {
      top: $dpad-arrow-move;
    }

    span.down {
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 0);
      border-radius: 50% 50% $dpad-radius $dpad-radius;

      &:hover {
        background: linear-gradient(180deg, $dpad-fg 0%, $dpad-fg-hover 50%);
      }

      &:after {
        right: 0;
        bottom: 0;
        transform: translate(100%, 0);
        border-bottom-right-radius: 50%;
        pointer-events: none;
      }

      &:before {
        bottom: 40%;
        left: 50%;
        transform: translate(-50%, 50%);
        border-width: $tri-sml-b $tri-sml-a 0px $tri-sml-a;
        border-color: $arrowcolor transparent transparent transparent;
      }

      &:active:before {
        border-top-color: #333;
      }
    }

    span.down:hover:before {
      bottom: $dpad-arrow-move;
    }

    span.left {
      top: 50%;
      left: 0;
      transform: translate(0, -50%);
      border-radius: $dpad-radius 50% 50% $dpad-radius;

      &:hover {
        background: linear-gradient(-90deg, $dpad-fg 0%, $dpad-fg-hover 50%);
      }

      &:after {
        left: 0;
        bottom: 0;
        transform: translate(0, 100%);
        border-bottom-left-radius: 50%;
        pointer-events: none;
      }

      &:before {
        left: 40%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-width: $tri-sml-a $tri-sml-b $tri-sml-a 0;
        border-color: transparent $arrowcolor transparent transparent;
      }

      &:active:before {
        border-right-color: #333;
      }
    }

    span.left:hover:before {
      left: $dpad-arrow-move;
    }

    span.right {
      top: 50%;
      right: 0;
      transform: translate(0, -50%);
      border-radius: 50% $dpad-radius $dpad-radius 50%;

      &:hover {
        background: linear-gradient(90deg, $dpad-fg 0%, $dpad-fg-hover 50%);
      }

      &:after {
        right: 0;
        top: 0;
        transform: translate(0, -100%);
        border-top-right-radius: 50%;
        pointer-events: none;
      }

      &:before {
        right: 40%;
        top: 50%;
        transform: translate(50%, -50%);
        border-width: $tri-sml-a 0 $tri-sml-a $tri-sml-b;
        border-color: transparent transparent transparent $arrowcolor;
      }

      &:active:before {
        border-left-color: #333;
      }
    }

    span.right:hover:before {
      right: $dpad-arrow-move;
    }
  }

  .d-pad.up span.up:before {
    border-bottom-color: #333;
  }

  .d-pad.down span.down:before {
    border-top-color: #333;
  }

  .d-pad.left span.left:before {
    border-right-color: #333;
  }

  .d-pad.right span.right:before {
    border-left-color: #333;
  }


  .clear {
    $c: #fff;
    $c-h: #6ea248;
    $c-bg: #5f9837;
    $c-t: #fff;
    $c-t-a: rgba(0, 0, 0, .6);

    .d-pad {
      border-radius: 0;

      span {
        border: 1px solid $c;
      }

      &:before, span {
        background: none;
      }

      span:after {
        display: none;
      }

      span.up:hover {
        background: linear-gradient(0deg, $c-bg 0%, $c-h 50%);
      }

      span.right:hover {
        background: linear-gradient(90deg, $c-bg 0%, $c-h 50%);
      }

      span.down:hover {
        background: linear-gradient(180deg, $c-bg 0%, $c-h 50%);
      }

      span.left:hover {
        background: linear-gradient(-90deg, $c-bg 0%, $c-h 50%);
      }

      span.up:before {
        border-bottom-color: $c-t;
      }

      span.right:before {
        border-left-color: $c-t;
      }

      span.down:before {
        border-top-color: $c-t;
      }

      span.left:before {
        border-right-color: $c-t;
      }

      span.up:active:before {
        border-bottom-color: $c-t-a;
      }

      span.right:active:before {
        border-left-color: $c-t-a;
      }

      span.down:active:before {
        border-top-color: $c-t-a;
      }

      span.left:active:before {
        border-right-color: $c-t-a;
      }
    }
  }

  .outline {
    $c: #fff;
    $c-h: #efefef;
    $c-t: rgba(0, 0, 0, .1);

    .d-pad {
      border-radius: 0;

      span {
        border: 1px solid $c-t;
      }

      &:after, &:before, span {
        //background: $c;
      }

      span:after {
        display: none;
      }

      span.up:hover {
        background: linear-gradient(0deg, $c 0%, $c-h 50%);
      }

      span.right:hover {
        background: linear-gradient(90deg, $c 0%, $c-h 50%);
      }

      span.down:hover {
        background: linear-gradient(180deg, $c 0%, $c-h 50%);
      }

      span.left:hover {
        background: linear-gradient(-90deg, $c 0%, $c-h 50%);
      }

      span.up:before {
        border-bottom-color: $c-t;
      }

      span.right:before {
        border-left-color: $c-t;
      }

      span.down:before {
        border-top-color: $c-t;
      }

      span.left:before {
        border-right-color: $c-t;
      }
    }

  }


  .setbg.white {
    $c: #fff;
    $c-t: rgba(0, 0, 0, .1);
    $c-t-a: rgba(0, 0, 0, .6);
    $c-h: #143cb9;

    .d-pad {
      &:before, span {
        background: $c;
      }

      &:after {
        display: block;
        background: $c-t;
      }

      span:after {
        border-radius: 40%;
        background: #222;
      }

      span.up:hover {
        background: $c;
      }

      span.right:hover {
        background: $c;
      }

      span.down:hover {
        background: $c;
      }

      span.left:hover {
        background: $c;
      }

      span.up:before {
        border-bottom-color: #0074D9;
      }

      span.right:before {
        border-left-color: #FF851B;
      }

      span.down:before {
        border-top-color: #3D9970;
      }

      span.left:before {
        border-right-color: #FFDC00;
      }

      span.up:active:before {
        border-bottom-color: $c-t-a;
      }

      span.right:active:before {
        border-left-color: $c-t-a;
      }

      span.down:active:before {
        border-top-color: $c-t-a;
      }

      span.left:active:before {
        border-right-color: $c-t-a;
      }
    }
  }

  // set direction active state

  .d-pad.up span.up:before {
    border-bottom-color: #333;
  }

  .d-pad.down span.down:before {
    border-top-color: #333;
  }

  .d-pad.left span.left:before {
    border-right-color: #333;
  }

  .d-pad.right span.right:before {
    border-left-color: #333;
  }
</style>
