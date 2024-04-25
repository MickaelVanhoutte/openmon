<script lang="ts">
	import type { GameContext } from '../../../js/context/gameContext';
	import { defineHex, Grid, rectangle, ring, spiral } from 'honeycomb-grid';
	import { SVG } from '@svgdotjs/svg.js';
	import { onMount } from 'svelte';
	import initiateMasteries from '../../../assets/data/final/beta/masteries-initiate.json';
	import expertMasteries from '../../../assets/data/final/beta/masteries-expert.json';

	export let context: GameContext;
	let masteries;
	$: masteryPoints = context.player.masteryPoints;
	const initiateTiles = initiateMasteries;
	const expertTiles = expertMasteries;

	// const tiles = [
	// 	{
	// 		q: 3,
	// 		r: 2,
	//         cost: 1,
	// 		title: 'CUT',
	//         color: '#EDC531',
	// 		set: false
	// 	},
	//     {
	// 		q: 4,
	// 		r: 2,
	//         cost: 2,
	// 		title: 'SURF',
	//         color: '#EDC531',
	// 		set: false
	// 	},
	//     {
	// 		q: 4,
	// 		r: 3,
	//         cost: 1,
	// 		title: 'ROCK SMASH',
	//         color: '#EDC531',
	// 		set: false
	// 	},
	//     {
	// 		q: 3,
	// 		r: 4,
	//         cost: 1,
	// 		title: 'STRENGH',
	//         color: '#EDC531',
	// 		set: false
	// 	},
	//     {
	// 		q: 2,
	// 		r: 4,
	// 		cost: 3,
	// 		title: 'FLY',
	//         color: '#EDC531',
	// 		set: false
	// 	},
	//     {
	// 		q: 2,
	// 		r: 3,
	//         cost: 2,
	// 		title: 'ROCK CLIMB',
	//         color: '#EDC531',
	// 		set: false
	// 	},
	//     {
	// 		q: 3,
	// 		r: 1,
	//         cost: 2,
	// 		title: 'Shiny +10%',
	// 		subTitle: '+10%',
	//         color: '#F7F6CF',
	// 		set: false
	// 	},
	//     {
	// 		q: 3,
	// 		r: 0,
	//         cost: 3,
	// 		title: 'Shiny +20%',
	// 		subTitle: '+20%',
	//         color: '#F7F6CF',
	// 		set: false
	// 	},
	//     {
	// 		q: 5,
	// 		r: 1,
	//         cost: 1,
	// 		title: 'Catch +10%',
	// 		subTitle: '+10%',
	//         color: '#F7F6CF',
	// 		set: false
	// 	},
	//     {
	// 		q: 6,
	// 		r: 0,
	//         cost: 1,
	// 		title: 'Catch +20%',
	// 		subTitle: '+20%',
	//         color: '#F7F6CF',
	// 		set: false
	// 	},
	//     {
	// 		q: 5,
	// 		r: 3,
	//         cost: 1,
	// 		title: 'XP +10%',
	// 		subTitle: '',
	//         color: '#F7F6CF',
	// 		set: false
	// 	},
	//     {
	// 		q: 6,
	// 		r: 3,
	//         cost: 1,
	// 		title: 'XP +20%',
	// 		subTitle: '+20%',
	//         color: '#F7F6CF',
	// 		set: false
	// 	},
	//     {
	// 		q: 3,
	// 		r: 5,
	//         cost: 2,
	// 		title: 'IVs +5',
	// 		subTitle: '+5',
	//         color: '#F7F6CF',
	// 		set: false
	// 	},
	//     {
	// 		q: 3,
	// 		r: 6,
	//         cost: 3,
	// 		title: 'IVs +5',
	// 		subTitle: '+5',
	//         color: '#F7F6CF',
	// 		set: false
	// 	},
	//     {
	// 		q: 1,
	// 		r: 5,
	//         cost: 1,
	// 		title: 'EVs +1',
	// 		subTitle: '+1',
	//         color: '#F7F6CF',
	// 		set: false
	// 	},
	//     {
	// 		q: 0,
	// 		r: 6,
	//         cost: 1,
	// 		title: 'EVs +2',
	// 		subTitle: '+2',
	//         color: '#F7F6CF',
	// 		set: false
	// 	},
	//     {
	// 		q: 1,
	// 		r: 3,
	//         cost: 2,
	// 		title: 'Combo +5%',
	// 		subTitle: '+5%',
	//         color: '#F7F6CF',
	// 		set: false
	// 	},
	//     {
	// 		q: 0,
	// 		r: 3,
	//         cost: 2,
	// 		title: 'Combo +5%',
	// 		subTitle: '+5%',
	//         color: '#F7F6CF',
	// 		set: false
	// 	},
	//     {
	// 		q: 2,
	// 		r: 2,
	//         cost: 1,
	// 		title: 'Stab +5%',
	// 		subTitle: '+5%',
	//         color: '#baffc9',
	// 		set: false
	// 	},
	//     {
	// 		q: 1,
	// 		r: 2,
	//         cost: 1,
	// 		title: 'Stab +5%',
	// 		subTitle: '+5%',
	//         color: '#baffc9',
	// 		set: false
	// 	},
	//     {
	// 		q: 2,
	// 		r: 1,
	//         cost: 1,
	// 		title: 'Stab +5%',
	// 		subTitle: '+5%',
	//         color: '#baffc9',
	// 		set: false
	// 	},
	//     {
	// 		q: 1,
	// 		r: 4,
	//         cost: 1,
	// 		title: 'non-STAB +5%',
	// 		subTitle: '+5%',
	//         color: '#FFD5BA',
	// 		set: false
	// 	},
	//     {
	// 		q: 0,
	// 		r: 4,
	//         cost: 1,
	// 		title: 'non-STAB +5%',
	// 		subTitle: '+5%',
	//         color: '#FFD5BA',
	// 		set: false
	// 	},
	//     {
	// 		q: 0,
	// 		r: 5,
	//         cost: 1,
	// 		title: 'non-STAB +5%',
	// 		subTitle: '+5%',
	//         color: '#FFD5BA',
	// 		set: false
	// 	},
	//     {
	// 		q: 2,
	// 		r: 5,
	//         cost: 1,
	// 		title: 'Resistance +4%',
	// 		subTitle: '+4%',
	//         color: '#ECD5E3',
	// 		set: false
	// 	},
	//     {
	// 		q: 1,
	// 		r: 6,
	//         cost: 1,
	// 		title: 'Resistance +3%',
	// 		subTitle: '+3%',
	//         color: '#ECD5E3',
	// 		set: false
	// 	},
	//     {
	// 		q: 2,
	// 		r: 6,
	//         cost: 1,
	// 		title: 'Resistance +3%',
	// 		subTitle: '+3%',
	//         color: '#ECD5E3',
	// 		set: false
	// 	},
	//     {
	// 		q: 4,
	// 		r: 4,
	//         cost: 1,
	// 		title: 'Effect +4%',
	// 		subTitle: '+4%',
	//         color: '#FFA07A',
	// 		set: false
	// 	},
	//     {
	// 		q: 4,
	// 		r: 5,
	//         cost: 1,
	// 		title: 'Effect +3%',
	// 		subTitle: '+3%',
	//         color: '#FFA07A',
	// 		set: false
	// 	},
	//     {
	// 		q: 5,
	// 		r: 4,
	//         cost: 1,
	// 		title: 'Effect +3%',
	// 		subTitle: '+3%',
	//         color: '#FFA07A',
	// 		set: false
	// 	},
	//     {
	// 		q: 4,
	// 		r: 1,
	//         cost: 1,
	// 		title: 'Weather dmg+10%',
	// 		subTitle: '+10%',
	//         color: '#ABDEE6',
	// 		set: false
	// 	},
	//     {
	// 		q: 4,
	// 		r: 0,
	//         cost: 2,
	// 		title: 'weather Own+1turn',
	// 		subTitle: '+1 turn',
	//         color: '#ABDEE6',
	// 		set: false
	// 	},
	//     {
	// 		q: 5,
	// 		r: 0,
	//         cost: 2,
	// 		title: 'Weather Opp-1turn',
	// 		subTitle: '-1 turn',
	//         color: '#ABDEE6',
	// 		set: false
	// 	},
	//     {
	// 		q: 5,
	// 		r: 2,
	//         cost: 1,
	// 		title: 'Accuracy +4%',
	// 		subTitle: '+4%',
	//         color: '#40E0D0',
	// 		set: false
	// 	},
	//     {
	// 		q: 6,
	// 		r: 1,
	//         cost: 1,
	// 		title: 'Accuracy +3%',
	// 		subTitle: '+3%',
	//         color: '#40E0D0',
	// 		set: false
	// 	},
	//     {
	// 		q: 6,
	// 		r: 2,
	//         cost: 1,
	// 		title: 'Accuracy +3%',
	// 		subTitle: '+3%',
	//         color: '#40E0D0',
	// 		set: false
	// 	},
	// ];

	let count = 0;

	// const HexExpert = defineHex({ dimensions: 30, origin: 'topLeft' });
	// const gridExpert = new Grid(HexExpert, spiral({ radius: 3, start: [3, 3] }));

	function renderSVG(hex: HexExpert, draw: SVG.Doc, tiles: any[]) {
		console.log(hex.q, hex.r);
		let tile = tiles.find((tile) => tile.q === hex.q && tile.r === hex.r);

		const polygon = draw
			// create a polygon from a hex's corner points
			.polygon(hex.corners.map(({ x, y }) => `${x},${y}`))
			.fill('white')
			.stroke({ width: 1, color: '#999' });

		if (tile) {
			count += tile.cost;
			if (tile?.color) {
				polygon.fill(tile.color);
			} else {
				polygon.fill('white');
			}
			let width = hex.corners[0].x - hex.corners[3].x;

			draw.group().add(polygon);

			// if (tile.cost) {
			// 	draw
			// 		.text(tile.cost + ' pts')
			// 		.move(hex.corners[0].x - width / 2, hex.corners[0].y - 18)
			// 		.font({ fill: 'black', size: 12, anchor: 'middle', leading: 1 });
			// }
			if (tile.title) {
				tile.title.split(' ').forEach((word, i) => {
					draw
						.text(word)
						.move(hex.corners[0].x - width / 2, hex.corners[0].y - 14 + i * 12)
						.font({ fill: 'black', size: 12, anchor: 'middle', leading: 1 });
				});
			}
		}
		console.log(count);
		return;
	}

	onMount(() => {
		const draw = SVG().addTo(masteries).size('100%', '14dvh');
		const Hex = defineHex({
			dimensions: masteries.getBoundingClientRect().width / 28.8,
			origin: 'topLeft'
		});
		const grid = new Grid(Hex, rectangle({ width: 16, height: 1 }));
		grid.forEach((hex) => renderSVG(hex, draw, initiateTiles));
		masteries.addEventListener('click', ({ offsetX, offsetY }) => {
			const hex = grid.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			console.log(hex);
		});
	});
</script>

<div class="masteries" bind:this={masteries}></div>

<!-- <span class="points">
    {masteryPoints} points
</span> -->

<style lang="scss">
	.masteries {
		width: 100dvw;
        padding: 2%;
	}
	.points {
		position: absolute;
		top: 56px;
		right: 0;
		padding: 8px;
		font-size: 32px;
		color: white;
		text-shadow: 1px 1px 1px black;
	}
</style>
