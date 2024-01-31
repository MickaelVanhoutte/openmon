{#if battle.initiated}
    <BattleScene bind:opened={opened}
                 bind:battleState={battle.battleState}
                 bind:battleStart={battleStart}/>

{:else}
    <!-- TODO move to another component -->
    <div class="set outline">
        <nav class="d-pad">
            <span class="up" on:pointerdown={move('ArrowUp')} on:pointerup={stop('ArrowUp')}></span>
            <span class="right" on:pointerdown={move('ArrowRight')} on:pointerup={stop('ArrowRight')}></span>
            <span class="down" on:pointerdown={move('ArrowDown')} on:pointerup={stop('ArrowDown')}></span>
            <span class="left" on:pointerdown={move('ArrowLeft')} on:pointerup={stop('ArrowLeft')}></span>
        </nav>
    </div>

    <div class="buttons-a-b">
        <button class="button-b">B</button>

        <button class="button-a">A</button>
    </div>

    <div class="buttons-start-select">
        <button class="button-start">start</button>

        <button class="button-select">select</button>
    </div>

{/if}

<Menu bind:menuOpened={menuOpened} bind:player={character}/>


<script lang="ts">

    import Menu from "./main/Menu.svelte";
    import BattleScene from "./BattleScene.svelte";
    import type {Pokedex} from "../js/pokemons/pokedex";
    import {testMap} from "../js/mapping/maps/test-map";
    import type {Character} from "../js/player/player";
    import {BattlefieldsDrawer, Position} from "../js/sprites/sprites";
    import {BattleState} from "../js/battle/battle";
    import {keydownListener, keys, keyupListener, lastKey} from "../js/commands/keyboard";
    import type {PokemonInstance} from "../js/pokemons/pokemon";
    import "@abraham/reflection";
    import {container} from "tsyringe";

    // TODO getting bigger and bigger, refactor

    export let opened = false;
    export let menuOpened = false;
    export let battleStart = false;

    export let pokedex: Pokedex;

    export let currentMap = testMap;

    export let canvas: HTMLCanvasElement;

    let battlefieldsDrawer = container.resolve(BattlefieldsDrawer);

    //let imageScale = Math.min(4, Math.max(2, window.innerWidth / currentMap.background.width));
    let imageScale = 3;
    let landscape = false;

    const ctx = canvas.getContext('2d');

    if (window.innerHeight > window.innerWidth) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth;
    } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }


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
        if (window.innerHeight > window.innerWidth) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerWidth;
        } else {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

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
        startDate?: Date,
    } = {
        initiated: false,
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
                        let monster = currentMap.randomMonster(pokedex);
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

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            battlefieldsDrawer.draw(ctx, 'default');

            battle.battleState?.opponentCurrentMonster?.draw(ctx, 'front', 50, 0, monsterPositionOffset);
            battle.battleState?.playerCurrentMonster?.draw(ctx, 'back', 0, 0, monsterPositionOffset);
        }

    }

    function initiateBattle(opponent: PokemonInstance | Character) {
        stopCommands();
        battle.initiated = true;
        battle.startDate = new Date();
        battle.battleState = new BattleState(character, opponent, canvas);
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
        window.addEventListener('keyup', keyupListener(character));
        window.addEventListener('keydown', openMenuListener);
    }

    function unbindKeyboard() {
        window.removeEventListener('keydown', keydownListener());
        window.removeEventListener('keyup', keyupListener(character));
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

  @media (max-width: 1100px) {
    .set .d-pad {
      width: 20dvw;
      height: 20dvw;
    }
  }

  .set {
    overflow: hidden;
    text-align: center;

    position: absolute;
    bottom: 8dvh;
    left: 8dvh;
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
    width: 12dvw;
    height: 12dvw;
    border-radius: 48%;
    overflow: hidden;
    z-index: 9;

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

  .buttons-a-b {
    position: absolute;
    bottom: 8dvh;
    right: 8dvh;
    z-index: 10;

    display: flex;
    flex-direction: column;
    align-content: space-between;
    align-items: center;

    button {
      width: 7dvw;
      height: 7dvw;
      border-radius: 50%;
      border: 1px solid #fff;
      background: $dpad-fg;
      color: $arrowcolor;
      font-size: 3.5rem;
      font-weight: bold;
      text-align: center;
      line-height: 10dvw;
      cursor: pointer;
      transition: all .25s;

      display: flex;
      align-content: center;
      justify-content: center;
      align-items: center;

      &:hover {
        background: $dpad-fg-hover;
      }
    }

    .button-a {
      position: relative;
      right: 6dvw;
    }
  }

</style>
