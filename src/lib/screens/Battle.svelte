<div bind:this={gifsWrapper} class="wrapper">

</div>

<!-- UI -->
<EnemyInfo/>
<AllyInfo/>
<ActionBar/>

<script lang="ts">

    import {BattleState} from "../js/battle/battle";
    import {Position} from "../js/sprites/drawers";
    import {onMount} from "svelte";
    import ActionBar from "../ui/battle/ActionBar.svelte";
    import EnemyInfo from "../ui/battle/EnemyInfo.svelte";
    import AllyInfo from "../ui/battle/AllyInfo.svelte";
    import type {SelectedSave} from "../js/saves/saves";
    import {BATTLE_STATE} from "../js/const";

    export let gifsWrapper: HTMLDivElement;
    export let save: SelectedSave;

    let battleState: BattleState | undefined;

    BATTLE_STATE.subscribe(value => {
        battleState = value.state;
    });

    if (battleState) {
        battleState.onClose = (win: boolean) => {
            if (!win) {
                // tp back to the start
                this.save.map.playerMovedOffset = new Position(0, 0);
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
                bg.classList.add('battle-bg');
                bg.onload = () => {
                    gifsWrapper.appendChild(bg);
                    battleLoopContext.bgDrawn = true;
                }
            }


            if (!battleState?.pokemonsAppearing) {

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
                        ally.style.setProperty('--width', ally.naturalWidth + 'px');
                        ally.style.setProperty('--height', ally.naturalHeight + 'px');
                        gifsWrapper.appendChild(ally);
                        battleLoopContext.allydrawn = true;
                    }
                }

            }
        }, 200);
    }

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
    bottom: 44%;
    right: calc(25% - var(--width) / 2);
    z-index: 8;
  }

  .wrapper :global(.battle-bg) {
    z-index : 0;
    width : 100%;
    height : 100%;
    position : absolute;
    top : 0;
    left : 0;
    //border-radius: 0 0 5% 20% ;
  }

/*  @media screen and (max-width: 1100px) {
    .wrapper :global(.ally-sprite) {
      width: calc(var(--width) * .75);
      height: calc(var(--height) * .75);
      bottom: 30%;
    }

    .wrapper :global(.opponent-sprite) {
      width: var(--width);
      height: var(--height);
      bottom: 57%;
    }

    .wrapper :global(.battle-bg) {
      height: 70%;
    }
  }*/
</style>
