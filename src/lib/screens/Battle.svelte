
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

    let drawer = new BattlefieldsDrawer();
    let opponentDrawer = new PokemonSpriteDrawer();
    let allyDrawer = new PokemonSpriteDrawer();

    if(battleState){
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
        fps: 12,
        then: Date.now(),
        fpsInterval: 1000 / 12,
        goDown: true,
        frameElapsed: 0,
        id: 0,
    }

    function battleLoop() {
        battleLoopContext.id = window.requestAnimationFrame(battleLoop);
        let now = Date.now();
        let elapsed = now - battleLoopContext.then;

        if(!battleState) {
            return;
        }

        if (elapsed > battleLoopContext.fpsInterval) {


            battleLoopContext.then = now - (elapsed % battleLoopContext.fpsInterval);
            battleLoopContext.frameElapsed++;

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawer.draw(ctx, battleState.pokemonsAppearing, 'grass');

            opponentDrawer.draw(ctx, battleState.opponentCurrentMonster, 'front', true, 30 );
            allyDrawer.draw(ctx, battleState.playerCurrentMonster, 'back', true, 0 );


            // animate monsters
            /*if (!!battleContext?.opponentCurrentMonster?.position) {
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
            }*/
        }
    }

    onMount(() => {
        battleLoop();
    });
</script>

<style lang="scss">

</style>
