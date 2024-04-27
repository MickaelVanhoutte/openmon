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
		let tile = tiles.find((tile) => tile.q === hex.q && tile.r === hex.r);

		if (tile) {
			const polygon = draw
				// create a polygon from a hex's corner points
				.polygon(hex.corners.map(({ x, y }) => `${x},${y}`))
				.fill('white')
				.css('cursor', 'pointer')
				.css('text-align', 'center')
				.stroke({ width: 2, color: tile?.color || '#999' });

			count += tile.cost;
			if (tile?.color) {
				polygon.fill(tile.color);
				if (tile.set) {
				} else {
					//polygon.fill('#EEE');
					polygon.css('opacity', '0.7');
					polygon.stroke({ width: 2, color: tile.color });
				}
			} else {
				polygon.fill('white');
			}

			

			// get highest y value 
			let highestY = Math.min(hex.corners[0].y, hex.corners[1].y, hex.corners[2].y, hex.corners[3].y, hex.corners[4].y, hex.corners[5].y);
			let lowestY = Math.max(hex.corners[0].y, hex.corners[1].y, hex.corners[2].y, hex.corners[3].y, hex.corners[4].y, hex.corners[5].y);

			let highestX = Math.min(hex.corners[0].x, hex.corners[1].x, hex.corners[2].x, hex.corners[3].x, hex.corners[4].x, hex.corners[5].x);
			let lowestX = Math.max(hex.corners[0].x, hex.corners[1].x, hex.corners[2].x, hex.corners[3].x, hex.corners[4].x, hex.corners[5].x);

			let width = Math.abs(lowestX - highestX);
			let height = Math.abs(lowestY - highestY);
			

			draw.group().add(polygon);
			//console.log(polygon, hex.corners);
			if (tile?.title) {
				if (tile.title?.split(' ')?.length > 1) {
					tile.title.split(' ').forEach((word, i) => {
						draw
							.text(word)
							// .move(
							// 	hex.corners[0].x - width / 2,
							// 	highestY  + ((i) * (height / 4)) //- (hex.corners[2].y - hex.corners[1].y) + (i * width) / 4
							// )
							.move(hex.corners[0].x - width / 2, hex.corners[0].y - 14 + i * (height/4))
							.css('pointer-events', 'none')
							.css('text-anchor', 'middle')
							.css('transform', 'translate(100)')
							.font({
								family: 'pokemon',
								fill: '#444',
								size: height / 4,
								weight: 'bold',
								leading: 1
							});
					});
				} else {
					draw
						.text(tile.title)
						// .move(
						// 	hex.corners[0].x - width / 2,
						// 	highestY  //+ height / 2, //- (hex.corners[2].y - hex.corners[1].y)
						// )
						.move(hex.corners[0].x - width / 2, hex.corners[0].y - 14 )
						.css('pointer-events', 'none')
						.font({
							family: 'pokemon',
							fill: '#444',
							size: height / 4,
							anchor: 'middle',
							weight: 'bold',
							leading: 1
						});
				}
			}
		} else {
			const polygon = draw;
			// create a polygon from a hex's corner points
			// .polygon(hex.corners.map(({ x, y }) => `${x},${y}`))
			// .fill('white')
			// .stroke({ width: 1, color: '#999' });
		}
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
			dimensions: masteries.getBoundingClientRect().width / 28.4,
			origin: 'topLeft'
		});
		const grid = new Grid(Hex, rectangle({ width: 16, height: 1 }));
		console.log(grid.toArray()[0].corners);
		grid.forEach((hex) => renderSVG(hex, draw, initiateTiles));
		masteries.addEventListener('click', ({ offsetX, offsetY }) => {
			const hex = grid.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			openModal(initiateTiles.find((tile) => tile.q === hex.q && tile.r === hex.r));
		});
		masteries.addEventListener('touch', ({ offsetX, offsetY }) => {
			const hex = grid.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			openModal(initiateTiles.find((tile) => tile.q === hex.q && tile.r === hex.r));
		});

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
			openModal(expertTiles.find((tile) => tile.q === hex.q && tile.r === hex.r));
		});
		expert.addEventListener('touch', ({ offsetX, offsetY }) => {
			const hex = grid2.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			openModal(expertTiles.find((tile) => tile.q === hex.q && tile.r === hex.r));
		});
		console.log(count);
	});
</script>
<div class="offset"></div>
<div class="masteries" bind:this={masteries}></div>
<div class="expert" bind:this={expert}></div>

<span class="points">
	{masteryPoints} points
</span>

<Modal bind:showModal>
	<h3 slot="header" style="margin: 2% 0">
		{currentNode?.title}
	</h3>

	<p style="margin: 0">
		cost : {currentNode?.cost}
	</p>

	<hr />
	<p style="margin: 0">
		{currentNode?.description}
	</p>
</Modal>

<style lang="scss">
	.offset{
		//height: 2dvh;
		width: 100%;
	}
	.masteries {
		width: 100dvw;
		height: calc(100dvw / 10);
		//padding: 1%;
		//margin-top: 1%;
		margin-left: 1%;
	}
	.expert {
		width: 100dvw;
		height: calc(100dvh - 15dvh - 46px);
		//padding: 1%;
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
