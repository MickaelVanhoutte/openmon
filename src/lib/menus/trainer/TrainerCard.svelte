<script lang="ts">
	import type { GameContext } from "../../../js/context/gameContext";

	export let context: GameContext;

    let playingTime = new Date(new Date().getTime() - context.created);
</script>

<div class="trainer-card">
	<div class="row">
        <div class="col-8">
            <ul>
                <li>Playing time : {playingTime.getHours()}h{playingTime.getMinutes()}</li>
                <li>Badges : 0</li>
                <li>Captured Pokemons : {context.POKEDEX.getCaught()?.length}</li>
                <li>Viewed Pokemons : {context.POKEDEX.getViewed()?.length}</li>
                <li>Money : {context.player.bag.money}$</li>
            </ul>
        </div>
		<div class="col-4 trainer-img">
			<img src="{context.player.sprite.full.source}" alt="trainer" />
		</div>
	</div>
</div>

<style lang="scss">
	.trainer-card {
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		position: relative;
		display: flex;
		flex-direction: row;
		background: rgb(0, 29, 43);
		background: -moz-linear-gradient(
			140deg,
			rgba(0, 29, 43, 1) 0%,
			rgba(3, 84, 142, 1) 42%,
			rgba(0, 195, 230, 1) 100%
		);
		background: -webkit-linear-gradient(
			140deg,
			rgba(0, 29, 43, 1) 0%,
			rgba(3, 84, 142, 1) 42%,
			rgba(0, 195, 230, 1) 100%
		);
		background: linear-gradient(
			140deg,
			rgba(0, 29, 43, 1) 0%,
			rgba(3, 84, 142, 1) 42%,
			rgba(0, 195, 230, 1) 100%
		);
		color: #fff;
		text-shadow: 1px 1px 1px black;
		z-index: var(--zIndex, 11);

        .row {
            height: 100%;
            width: 100%;

            .trainer-img {
                height: 90%;
                width: 100%;

                img {
                    height: 100%;
                    width: auto;
					position: absolute;
					bottom: 0;
					right: 0;
                }
            }

            ul {
                list-style: none;
                display: flex;
                flex-direction: column;
                justify-content: center;
                margin: 0;
                height: 100%;
                width: 100%;
                gap: 2%;
            }
        }
	}
</style>
