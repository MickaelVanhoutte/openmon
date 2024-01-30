<svelte:options customElement="open-mon"/>

<div id="canvas-wrapper" bind:this={wrapper}>
    {#if ready && letsgo}
        <MainScene bind:canvas={canvas} bind:character={player}/>

    {:else}
        <div class="loading" class:ready={ready}>
            {#if !ready}
                <div class="o-pokeball c-loader u-swing"></div>

                <span>Gotta catch em all... {current}</span>

                <div bind:this={preview} id="preview">
                </div>
            {/if}
        </div>
        {#if ready}
            <div class="buttons">
                {#if save}
                    <div class="letsgo">
                        <button class="start-btn" on:click={() => go()}>Continue!</button>
                        <img class="pika" alt="Evoli" src="src/assets/monsters/heartgold-soulsilver/133.png"/>
                    </div>
                {/if}
                <div class="letsgo">
                    <button class="start-btn" on:click={() => go()}>New game!</button>
                    <img class="pika" alt="pikachu" src="src/assets/monsters/heartgold-soulsilver/25.png"/>
                </div>
            </div>
        {/if}
    {/if}

    <canvas bind:this={canvas}></canvas>
</div>
<script lang="ts">
    import MainScene from "./lib/scenes/MainScene.svelte";
    import {Monster, MonsterSprite, Move, Stats} from "./lib/js/model/monster.ts";
    import {Character, PlayerSprites} from "./lib/js/model/player.js";

    export let canvas;
    let wrapper;
    let player: Character;

    let pokedexReady = false;
    export let ready = false;

    let pokedex = [];
    let images = [];
    let letsgo = false;

    let save;
    let current: string;
    let preview: HTMLDivElement;
    let maxHeight = 0;


    //localStorage.getItem('pokedex') && (pokedex = JSON.parse(localStorage.getItem('pokedex')));
    //localStorage.getItem('player') && (player = JSON.parse(localStorage.getItem('player')));
    //localStorage.getItem('save') && (save = JSON.parse(localStorage.getItem('save')));

    if (pokedex.length > 0 && player) {
        pokedex.forEach(pokemon => {
            setTimeout(() => {
                const front = new Image();
                front.src = `src/assets/monsters/heartgold-soulsilver/${pokemon.id}.png`;
                preview.appendChild(front);
            }, 100);
        })
        pokedexReady = true;
        ready = true;
    } else {
        // read pokedex file to load images
        fetch('src/assets/data/pokedex-gen1.json')
            .then(response => response.json())
            .then(data => {
                data.forEach((pokemon) => {
                    current = pokemon.name.english;

                    let front = `src/assets/monsters/heartgold-soulsilver/${pokemon.id}.png`;
                    let front2 = `src/assets/monsters/heartgold-soulsilver/frame2/${pokemon.id}.png`;
                    let back = `src/assets/monsters/heartgold-soulsilver/back/${pokemon.id}.png`;
                    let shiny = `src/assets/monsters/heartgold-soulsilver/shiny/${pokemon.id}.png`;

                    setTimeout(() => {

                        const monster = new Monster(
                            pokemon.id,
                            pokemon.name.english,
                            pokemon.type,
                            pokemon.profile.ability,
                            new Stats(
                                pokemon.base['HP'],
                                pokemon.base['Attack'],
                                pokemon.base['Defense'],
                                pokemon.base['Sp. Attack'],
                                pokemon.base['Sp. Defense'],
                                pokemon.base['Speed']
                            ),
                            pokemon.evolution,
                            new MonsterSprite(front, front2, back, shiny),
                            undefined, [
                                new Move('Tackle', 'Normal', 'Physical', 40, 100, 35, 0, '', 0, 'Basic hit'),
                            ],
                            new Stats(10, 10, 10, 10, 10, 10),
                            new Stats(0, 0, 0, 10, 0, 0)
                        );

                        monster.height = Number.parseFloat(pokemon.profile.height.replace(' m', '')) * 100;

                        if (window.innerWidth < 1100) {
                            monster.spriteScale = Math.max(0.8, Math.min(monster.height / 100, 1.3));
                        } else {
                            monster.spriteScale = Math.max(1.2, Math.min(monster.height / 100, 2));
                        }


                        pokedex.push(monster);

                        if (pokedex.length === data.length) {
                            current = 'Ready!';
                            pokedexReady = true;
                            localStorage.setItem('pokedex', JSON.stringify(pokedex));
                            initCharacter();
                        }
                    }, 100);

                });
            });
    }

    function initCharacter() {
        let front = new Image();
        front.src = 'src/assets/sprites/hero_male_front.png';
        let back = new Image();
        back.src = 'src/assets/sprites/hero_male_back.png';
        let left = new Image();
        left.src = 'src/assets/sprites/hero_male_left.png';
        let right = new Image();
        right.src = 'src/assets/sprites/hero_male_right.png';
        let battle = new Image();
        battle.src = 'src/assets/sprites/hero_male_back.png';

        Promise.all(Array.from([front, back, left, right, battle].filter(img => !img.complete)).map(img => new Promise(resolve => {
            img.onload = img.onerror = resolve;
        }))).then(() => {

            let firstPoke = {
                ...pokedex.at(70),
                ivs: new Stats(31, 31, 31, 31, 31, 31),
                evs: new Stats(120, 0, 0, 255, 0, 135),
                moves: [
                    new Move('Tackle', 'Normal', 'Physical', 40, 100, 35, 0, '', 0, 'Basic hit'),
                    new Move('Growl', 'Normal', 'Status', 0, 100, 40, 0, '', 0, 'Lowers the target\'s Attack by one stage.'),
                    new Move('Tail Whip', 'Normal', 'Status', 0, 100, 30, 0, '', 0, 'Lowers the target\'s Defense by one stage.'),
                    new Move('Vine whip', 'Grass', 'Physical', 40, 100, 30, 0, '', 0, 'Strong hit with vines.'),
                ]
            };
            Object.setPrototypeOf(firstPoke, Monster.prototype);

            firstPoke.updateCurrentStats();
            firstPoke.currentHp = firstPoke.currentStats.HP;

            player = new Character("Kaiser", "MALE",
                new PlayerSprites(front, back, left, right, battle), [firstPoke]);

            ready = true;
        });


    }

    function go() {
        //openFullscreen();
        letsgo = true;
    }

    function openFullscreen() {
        if (wrapper.requestFullscreen) {
            wrapper.requestFullscreen();
        } else if (wrapper.webkitRequestFullscreen) { /* Safari */
            wrapper.webkitRequestFullscreen();
        } else if (wrapper.msRequestFullscreen) { /* IE11 */
            wrapper.msRequestFullscreen();
        }
    }

</script>

<style lang="scss">

  #canvas-wrapper {
    width: 100dvw;
    height: 100dvh;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    -webkit-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100dvw;
      height: 100dvh;
    }
  }

  /*@media (max-width: 1100px) and (orientation: portrait) {
    #canvas-wrapper {
      -webkit-transform: rotate(89.99deg);
      -moz-transform: rotate(89.99deg);
      -o-transform: rotate(89.99deg);
      -ms-transform: rotate(89.99deg);
      transform: rotate(89.99deg);
      transform-origin: right top;
      width: 100dvh;
      height: 100dvw;
      overflow: hidden;
      position: absolute;
      top: 100%;
      left: unset;
      right: 0;

      canvas {
        position: absolute;
        top: 0;
        right: 0;
        width: 100dvh;
        height: 100dvw;
      }

      .buttons {
        position: absolute;
        left: calc(50dvh - 100px);
        top: calc(50dvw - 40px);
      }

      .loading {
        height: 100vw;
      }
    }
  }*/

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100vh;

    &.ready {
      opacity: .2;
    }
  }

  .u-swing {
    animation: swing 3000ms infinite;
  }

  @keyframes swing {
    20% {
      -webkit-transform: rotate(15deg);
      transform: rotate(15deg)
    }

    40% {
      -webkit-transform: rotate(-10deg);
      transform: rotate(-10deg)
    }

    60% {
      -webkit-transform: rotate(5deg);
      transform: rotate(5deg)
    }

    80% {
      -webkit-transform: rotate(-5deg);
      transform: rotate(-5deg)
    }

    to {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg)
    }
  }

  $size: 120px;

  .o-pokeball {
    width: $size;
    height: $size;
    border-radius: $size;
    border: solid calc($size / 25) black;
    position: relative;
    background: linear-gradient(to bottom, #EEEEEE 0%, #FFFFFF 100%);;
    margin: 10px auto;

    &:before,
    &:after {
      content: "";
      display: block;
    }

    &,
    &:before,
    &:after {
      transition: all 600ms cubic-bezier(.67, .4, .36, .75);
    }

    &:before {
      width: $size;
      height: calc($size / 2) - calc($size / 25 / 2);
      border-bottom: solid calc($size / 25) black;
      border-radius: calc($size / 2) calc($size / 2) 0 0;
      background: linear-gradient(to bottom, #d10000 0%, #ff0000 50%);
    }

    &:after {
      content: "";
      width: calc($size / 5);
      height: calc($size / 5);
      background: linear-gradient(to bottom, #fff 0%, #ccc 100%);
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      box-shadow: 0 0 0 calc($size / 50) black,
      0 0 0 calc($size / 25) #ddd,
      0 0 0 calc($size / 14) black,
      0 0 calc($size / 10) calc($size / 17) rgba(0, 0, 0, 0.4);
    }
  }

  .buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 120px;
    position: absolute;
    left: calc(50dvw - 100px);
    top: calc(50dvh - 40px);

    .letsgo {
      position: relative;

      .pika {
        width: 200px;
        height: 200px;
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 1;
      }

      .start-btn {
        width: 200px;
        height: 80px;
        border-radius: 16px;
        position: relative;
        z-index: 2;
        font-family: pokemon, serif;
        font-size: 36px;

        box-shadow: inset #009688 0 0 0 5px,
        inset #059c8e 0 0 0 1px,
        inset #0cab9c 0 0 0 10px,
        inset #1fbdae 0 0 0 11px,
        inset #8ce9ff 0 0 0 16px,
        inset #48e4d6 0 0 0 17px,
        inset #e5f9f7 0 0 0 21px,
        inset #bfecf7 0 0 0 22px;
        text-shadow: 3px 3px 1px #bfecf7;

        cursor: pointer;

        &:hover {

          color: #fff;
          box-shadow: inset #009688 0 0 0 5px;
          text-shadow: none;
          font-weight: bold;
          background: #009688;

          + .pika {
            animation: bounce 1s infinite;
          }
        }
      }

      @keyframes bounce {
        0%, 20%, 53%, 80%, to {
          -webkit-animation-timing-function: cubic-bezier(.215, .61, .355, 1);
          animation-timing-function: cubic-bezier(.215, .61, .355, 1);
          -webkit-transform: translateZ(0);
          transform: translateZ(0)
        }

        40%, 43% {
          -webkit-transform: translate3d(0, -30px, 0);
          transform: translate3d(0, -30px, 0)
        }

        40%, 43%, 70% {
          -webkit-animation-timing-function: cubic-bezier(.755, .05, .855, .06);
          animation-timing-function: cubic-bezier(.755, .05, .855, .06)
        }

        70% {
          -webkit-transform: translate3d(0, -15px, 0);
          transform: translate3d(0, -15px, 0)
        }

        90% {
          -webkit-transform: translate3d(0, -4px, 0);
          transform: translate3d(0, -4px, 0)
        }
      }

    }
  }

  #preview {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }


</style>
