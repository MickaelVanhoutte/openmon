<div bind:this={gifsWrapper} class="wrapper">

</div>

<script lang="ts">

    import {SelectedSave} from "../js/saves/saves";
    import {BATTLE_STATE, BattleState} from "../js/battle/battle";
    import {Pokedex} from "../js/pokemons/pokedex";
    import {BattlefieldsDrawer, PokemonSpriteDrawer, Position} from "../js/sprites/drawers";
    import {onMount} from "svelte";

    export let context: SelectedSave;
    //export let battleContext: BattleState | undefined;
    export let canvas: HTMLCanvasElement;
    export let pokedex: Pokedex;

    export let gifsWrapper: HTMLDivElement;

    let battleState: BattleState | undefined;

    BATTLE_STATE.subscribe(value => {
        battleState = value.state;
    });

    let ctx = canvas.getContext('2d');
    ctx.font = "12px Arial";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let drawer = new BattlefieldsDrawer(battleState?.player);
    let opponentDrawer = new PokemonSpriteDrawer();
    let allyDrawer = new PokemonSpriteDrawer();

    if (battleState) {
        battleState.onClose = (win: boolean) => {
            if (!win) {
                // tp back to the start
                this.context.map.playerMovedOffset = new Position(0, 0);
                this.context.pla
            }
            setTimeout(() => {
                // animate the battle closing
                battleState = undefined;
                BATTLE_STATE.set({state: undefined});
                //window.cancelAnimationFrame(battleLoopContext.id);
            }, 2000);
        }
    }

    let battleLoopContext = {
        then: Date.now(),
        fpsInterval: 1000 / 18,
        goDown: true,
        frameElapsed: 0,
        id: 0,
        debug: false,
        allydrawn: false,
        opponentdrawn: false,
        bgDrawn: false
    }

    function battle() {

        setInterval(() => {
            if (!battleLoopContext.bgDrawn) {
                let bg = document.createElement('img') as HTMLImageElement;
                bg.src = 'src/assets/battle/battle-grass.png';
                bg.onload = () => {
                    bg.style.zIndex = '0';
                    bg.style.width = '100%';
                    bg.style.height = '75%';
                    bg.style.position = 'absolute';
                    bg.style.top = '0';
                    bg.style.left = '0';

                    gifsWrapper.appendChild(bg);
                    battleLoopContext.bgDrawn = true;
                }
            }


            if (!battleState?.pokemonsAppearing) {
                //opponentDrawer.draw(ctx, battleState.opponentCurrentMonster, 'front', true, 0, true);
                //allyDrawer.draw(ctx, battleState.playerCurrentMonster, 'back', true, 0);

                // animated gifs, handle them outside the canvas
                if (!battleLoopContext.opponentdrawn) {

                    let opponent = document.createElement('img') as HTMLImageElement;
                    opponent.classList.add('opponent-sprite');
                    opponent.src = battleState?.opponentCurrentMonster.sprites?.male?.front.frame1 || 'src/assets/monsters/bw/0.png';
                    opponent.onload = () => {

                        opponent.style.setProperty('--width', opponent.naturalWidth + 'px');
                        opponent.style.setProperty('--height', opponent.naturalHeight + 'px');
                        gifsWrapper.appendChild(opponent);
                        battleLoopContext.opponentdrawn = true;
                    }
                }
                if (!battleLoopContext.allydrawn) {
                    let ally = document.createElement('img') as HTMLImageElement;
                    ally.src = battleState?.playerCurrentMonster.sprites?.male?.back.frame1 || 'src/assets/monsters/bw/0.png';
                    ally.classList.add('ally-sprite');
                    ally.onload = () => {
                        console.log(ally.naturalWidth, ally.width);

                        ally.style.setProperty('--width', ally.naturalWidth + 'px');
                        ally.style.setProperty('--height', ally.naturalHeight + 'px');
                        gifsWrapper.appendChild(ally);
                        battleLoopContext.allydrawn = true;
                    }
                }

            }
        }, 200);
    }

    //deprecate

    onMount(() => {
        battle();
        window.addEventListener('keydown', (e) => {
            if (e.key === 'x') {
                battleLoopContext.debug = !battleLoopContext.debug;
            }
        });
    });
</script>

<style lang="scss">
  .wrapper {
    font-size: 23px;
  }

  .wrapper :global(.ally-sprite) {
    position: absolute;
    bottom: 25%;
    left: calc(25% - var(--width) / 2);
    z-index: 8;
  }

  .wrapper :global(.opponent-sprite) {
    position: absolute;
    bottom: calc(64% - var(--height) / 2);
    right: calc(25% - var(--width) / 2);
    z-index: 8;
  }
</style>
