<div bind:this={gifsWrapper}>

</div>

<script lang="ts">

    import {SelectedSave} from "../js/saves/saves";
    import {BATTLE_STATE, BattleState} from "../js/battle/battle";
    import {Pokedex} from "../js/pokemons/pokedex";
    import {BattlefieldsDrawer, PokemonSpriteDrawer} from "../js/sprites/drawers";
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
        battleState.onClose = () => {

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
                    bg.style.position = 'absolute';
                    bg.style.bottom = '25%';
                    bg.style.left = '0';
                    bg.style.zIndex = '0';
                    bg.style.width = window.innerWidth + 'px';
                    bg.style.height = window.innerHeight * 0.75 + 'px';
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
                    opponent.src = battleState?.opponentCurrentMonster.sprites?.male?.front.frame1 || 'src/assets/monsters/bw/0.png';
                    opponent.onload = () => {
                        opponent.style.position = 'absolute';
                        opponent.style.bottom = '50%';
                        opponent.style.right = '15%';
                        opponent.style.zIndex = '8';
                        opponent.style.width = opponent.naturalWidth * 1.5 + 'px';
                        opponent.style.height = opponent.naturalHeight * 1.5 + 'px';
                        gifsWrapper.appendChild(opponent);
                        battleLoopContext.opponentdrawn = true;
                    }
                }
                if (!battleLoopContext.allydrawn) {
                    let ally = document.createElement('img') as HTMLImageElement;
                    ally.src = battleState?.playerCurrentMonster.sprites?.male?.back.frame1 || 'src/assets/monsters/bw/0.png';
                    ally.onload = () => {
                        ally.style.position = 'absolute';
                        ally.style.bottom = '25%';
                        ally.style.left = '0';
                        ally.style.zIndex = '8';
                        ally.style.width = ally.naturalWidth + 'px';
                        ally.style.height = ally.naturalHeight + 'px';
                        gifsWrapper.appendChild(ally);
                        battleLoopContext.allydrawn = true;
                    }
                }

            }
        }, 200);
}
    //deprecate
    function battleLoop() {
        battleLoopContext.id = window.requestAnimationFrame(battleLoop);
        let now = Date.now();
        let elapsed = now - battleLoopContext.then;

        if (!battleState) {
            return;
        }

        if (elapsed > battleLoopContext.fpsInterval) {


            battleLoopContext.then = now - (elapsed % battleLoopContext.fpsInterval);
            battleLoopContext.frameElapsed++;

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            //drawer.draw(ctx, battleState.pokemonsAppearing, 'grass');

            if(!battleLoopContext.bgDrawn) {
                let bg = document.createElement('img') as HTMLImageElement;
                bg.src = 'src/assets/battle/battle-grass.png';
                bg.onload = () => {
                    bg.style.position = 'absolute';
                    bg.style.bottom = '25%';
                    bg.style.left = '0';
                    bg.style.zIndex = '0';
                    bg.style.width = window.innerWidth + 'px';
                    bg.style.height = window.innerHeight * 0.75 + 'px';
                    gifsWrapper.appendChild(bg);
                    battleLoopContext.bgDrawn = true;
                }
            }


            if (!battleState.pokemonsAppearing) {
                //opponentDrawer.draw(ctx, battleState.opponentCurrentMonster, 'front', true, 0, true);
                //allyDrawer.draw(ctx, battleState.playerCurrentMonster, 'back', true, 0);

                // animated gifs, handle them outside the canvas
                if (!battleLoopContext.opponentdrawn) {

                    let opponent = document.createElement('img') as HTMLImageElement;
                    opponent.src = battleState.opponentCurrentMonster.sprites?.male?.front.frame1 || 'src/assets/monsters/bw/0.png';
                    opponent.onload = () => {
                        opponent.style.position = 'absolute';
                        opponent.style.bottom = '50%';
                        opponent.style.right = '15%';
                        opponent.style.zIndex = '8';
                        opponent.style.width = opponent.naturalWidth * 1.5 + 'px';
                        opponent.style.height = opponent.naturalHeight * 1.5 + 'px';
                        gifsWrapper.appendChild(opponent);
                        battleLoopContext.opponentdrawn = true;
                    }
                }
                if (!battleLoopContext.allydrawn) {
                    let ally = document.createElement('img') as HTMLImageElement;
                    ally.src = battleState.playerCurrentMonster.sprites?.male?.back.frame1 || 'src/assets/monsters/bw/0.png';
                    ally.onload = () => {
                        ally.style.position = 'absolute';
                        ally.style.bottom = '25%';
                        ally.style.left = '0';
                        ally.style.zIndex = '8';
                        ally.style.width = ally.naturalWidth  + 'px';
                        ally.style.height = ally.naturalHeight  + 'px';
                        gifsWrapper.appendChild(ally);
                        battleLoopContext.allydrawn = true;
                    }
                }

            }

            if (battleLoopContext.debug) {
                ctx.fillStyle = 'black';
                ctx.fillRect(canvas.width / 3 + 100, 40, 160, 60);

                ctx.fillStyle = 'white';
                ctx.fillText('attack: ' + battleState.opponentCurrentMonster.currentStats.attack, canvas.width / 3 + 100 + 10, 60);
                ctx.fillText('speed: ' + battleState.opponentCurrentMonster.currentStats.speed, canvas.width / 3 + 100 + 10, 80);

                ctx.fillStyle = 'black';
                ctx.fillRect(40, canvas.height / 4 * 3 - 120, 160, 60);

                ctx.fillStyle = 'white';
                ctx.fillText('attack: ' + battleState.playerCurrentMonster.currentStats.attack, 50, canvas.height / 4 * 3 - 100);
                ctx.fillText('speed: ' + battleState.playerCurrentMonster.currentStats.speed, 50, canvas.height / 4 * 3 - 80);

            }

        }
    }

    onMount(() => {
        //battleLoop();
battle();
        window.addEventListener('keydown', (e) => {
            if (e.key === 'x') {
                battleLoopContext.debug = !battleLoopContext.debug;
            }
        });
    });
</script>

<style lang="scss">

</style>
