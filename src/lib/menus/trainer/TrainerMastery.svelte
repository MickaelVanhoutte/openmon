<script lang="ts">
	import type { GameContext } from '../../../js/context/gameContext';
	import { defineHex, Grid, rectangle, ring, spiral } from 'honeycomb-grid';
	import { SVG } from '@svgdotjs/svg.js';
	import { onMount } from 'svelte';
	import initiateMasteries from '../../../assets/data/final/beta/masteries-initiate.json';
	import expertMasteries from '../../../assets/data/final/beta/masteries-expert.json';
	import Modal from '../../common/Modal.svelte';

	export let context: GameContext;
	let masteries;
	let expert;
	let showModal = false;
	let currentNode: any | undefined;
	$: masteryPoints = context.player.masteryPoints;
	const initiateTiles = initiateMasteries;
	const expertTiles = expertMasteries;

	let count = 0;

	function renderSVG(hex: HexExpert, draw: SVG.Doc, tiles: any[]) {
		//console.log(hex.q, hex.r);
		let tile = tiles.find((tile) => tile.q === hex.q && tile.r === hex.r);

		if (tile) {
			const polygon = draw
				// create a polygon from a hex's corner points
				.polygon(hex.corners.map(({ x, y }) => `${x},${y}`))
				.fill('white')
				.css('cursor', 'pointer')
				.stroke({ width: 1, color: '#999' });

			count += tile.cost;
			if (tile?.color) {
				polygon.fill(tile.color);
			} else {
				polygon.fill('white');
			}

			// if(tile?.first){
			//     draw.stroke({ width: 1, color: 'black' });
			// }

			let width = hex.corners[0].x - hex.corners[3].x;

			draw.group().add(polygon);

			if (tile.title) {
				tile.title.split(' ').forEach((word, i) => {
					draw
						.text(word)
						.move(hex.corners[0].x - width / 2, hex.corners[0].y - 14 + i * 12)
						.css('pointer-events', 'none')
						.font({ fill: 'black', size: 12, anchor: 'middle', leading: 1 });
				});
			}
		} else {
			const polygon = draw;
			// create a polygon from a hex's corner points
			// .polygon(hex.corners.map(({ x, y }) => `${x},${y}`))
			// .fill('white')
			// .stroke({ width: 1, color: '#999' });
		}
		//console.log(count);
		return;
	}

	function openModal(tile?: any): any {
		if (tile && !tile.first) {
			currentNode = tile;
			showModal = true;
		}
	}

	onMount(() => {
		// INITIATE
		const draw = SVG().addTo(masteries).size('100%', '100%');
		const Hex = defineHex({
			dimensions: masteries.getBoundingClientRect().width / 28.25,
			origin: 'topLeft'
		});
		const grid = new Grid(Hex, rectangle({ width: 16, height: 1 }));
		grid.forEach((hex) => renderSVG(hex, draw, initiateTiles));
		masteries.addEventListener('click', ({ offsetX, offsetY }) => {
			const hex = grid.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			console.log(hex);
			openModal(initiateTiles.find((tile) => tile.q === hex.q && tile.r === hex.r));
		});
		masteries.addEventListener('touch', ({ offsetX, offsetY }) => {
			const hex = grid.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			console.log(hex);
			openModal(initiateTiles.find((tile) => tile.q === hex.q && tile.r === hex.r));
		});
		// let svg1 = document.querySelector('.masteries');
		// console.log(svg1);
		// if (svg1) {
		// 	svg1.addEventListener('click', ({ offsetX, offsetY }) => {
		// 		console.log(offsetX, offsetY);
		// 		const hex = grid.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
		// 		openModal(initiateTiles.find((tile) => tile.q === hex.q && tile.r === hex.r));
		// 	});
		// }

		// EXPERT
		const draw2 = SVG().addTo(expert).size('100%', '100%');
		const Hex2 = defineHex({
			dimensions: expert.getBoundingClientRect().width / 26.5,
			origin: 'topLeft'
		});
		const grid2 = new Grid(Hex2, rectangle({ width: 15, height: 4 }));
		grid2.forEach((hex) => renderSVG(hex, draw2, expertTiles));
		expert.addEventListener('click', ({ offsetX, offsetY }) => {
			const hex = grid2.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			console.log(hex);
			openModal(expertTiles.find((tile) => tile.q === hex.q && tile.r === hex.r));
		});
		expert.addEventListener('touch', ({ offsetX, offsetY }) => {
			const hex = grid2.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			console.log(hex);
			openModal(expertTiles.find((tile) => tile.q === hex.q && tile.r === hex.r));
		});
		console.log(count);
	});
</script>

<div class="masteries" bind:this={masteries}></div>
<div class="expert" bind:this={expert}></div>

<span class="points">
	{masteryPoints} points
</span>

<Modal bind:showModal>
	<h3 slot="header" style="margin: 2% 0">
		{currentNode?.title}
	</h3>

	<p>
		cost : {currentNode?.cost}
	</p>

	<hr />
	<h5>Detail</h5>
	<p>
		{currentNode?.description}
	</p>
</Modal>

<style lang="scss">
	.masteries {
		width: 100dvw;
		height: calc(100dvw / 10);
		padding: 1%;
	}
	.expert {
		width: 100dvw;
		height: calc(100dvh - 15dvh - 46px);
		padding: 1%;
	}
	.points {
		position: absolute;
		bottom: 0;
		right: 0;
		padding: 8px;
		font-size: 32px;
		color: white;
		text-shadow: 1px 1px 1px black;
	}
	:global(.modal) {
		min-width: 60%;
	}
</style>
