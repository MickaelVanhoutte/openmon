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
                window.cancelAnimationFrame(battleLoopContext.id);
            }, 2000);
        }
    }

    let battleLoopContext = {
        then: Date.now(),
        fpsInterval: 1000 / 12,
        goDown: true,
        frameElapsed: 0,
        id: 0,
        debug: false
    }

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

            drawer.draw(ctx, battleState.pokemonsAppearing, 'grass');

            if (!battleState.pokemonsAppearing) {
                opponentDrawer.draw(ctx, battleState.opponentCurrentMonster, 'front', true, 0, true);
                allyDrawer.draw(ctx, battleState.playerCurrentMonster, 'back', true, 0);
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
        battleLoop();

        window.addEventListener('keydown', (e) => {
            if (e.key === 'x') {
                battleLoopContext.debug = !battleLoopContext.debug;
            }
        });
    });
</script>

<style lang="scss">

</style>
