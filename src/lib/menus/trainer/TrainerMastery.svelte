<script lang="ts">
	import type { GameContext } from '../../../js/context/gameContext';
	import { defineHex, Direction, Grid, rectangle, ring, spiral } from 'honeycomb-grid';
	import { Svg, SVG } from '@svgdotjs/svg.js';
	import { onMount } from 'svelte';
	import initiateMasteries from '../../../assets/data/final/beta/masteries-initiate.json';
	import expertMasteries from '../../../assets/data/final/beta/masteries-expert.json';
	import Modal from '../../common/Modal.svelte';

	export let context: GameContext;
	let masteries;
	let expert;
	let showModal = false;
	let currentNode: any | undefined;
	let currentTiles: any[];
	$: masteryPoints = context.player.masteryPoints;

	const initiateTiles = initiateMasteries;
	let initiateSvg: Svg;
	let initiateGrid: Grid;
	const expertTiles = expertMasteries;
	let expertSvg: Svg;
	let expertGrid: Grid;

	$: initiateFinished = initiateTiles.every((tile) => tile.set);

	let count = 0;

	function hexToRGB(hex, alpha) {
		var r = parseInt(hex.slice(1, 3), 16),
			g = parseInt(hex.slice(3, 5), 16),
			b = parseInt(hex.slice(5, 7), 16);

		if (alpha) {
			return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
		} else {
			return 'rgb(' + r + ', ' + g + ', ' + b + ')';
		}
	}

	function renderSVG(hex: HexExpert, draw: SVG.Doc, tiles: any[], grid: Grid) {
		function isCurrentNeighborOfSetTile(hex: HexExpert, grid: Grid, tiles: any[]) {
			return [
				grid.neighborOf({ q: hex.q, r: hex.r }, Direction.NE, { allowOutside: false }),
				grid.neighborOf({ q: hex.q, r: hex.r }, Direction.NW, { allowOutside: false }),
				grid.neighborOf({ q: hex.q, r: hex.r }, Direction.E, { allowOutside: false }),
				grid.neighborOf({ q: hex.q, r: hex.r }, Direction.W, { allowOutside: false }),
				grid.neighborOf({ q: hex.q, r: hex.r }, Direction.SE, { allowOutside: false }),
				grid.neighborOf({ q: hex.q, r: hex.r }, Direction.SW, { allowOutside: false })
			]
				.filter((neighbor) => !!neighbor)
				.some((neighbor) => {
					let neighborTile = tiles.find((t) => t.q === neighbor.q && t.r === neighbor.r);
					if (neighborTile?.set) {
						console.log('neighborTile: ', neighborTile);
						return true;
					}
				});
		}

		let tile = tiles.find((tile) => tile.q === hex.q && tile.r === hex.r);

		// get highest y value
		let highestY = Math.min(
			hex.corners[0].y,
			hex.corners[1].y,
			hex.corners[2].y,
			hex.corners[3].y,
			hex.corners[4].y,
			hex.corners[5].y
		);
		let lowestY = Math.max(
			hex.corners[0].y,
			hex.corners[1].y,
			hex.corners[2].y,
			hex.corners[3].y,
			hex.corners[4].y,
			hex.corners[5].y
		);

		let highestX = Math.min(
			hex.corners[0].x,
			hex.corners[1].x,
			hex.corners[2].x,
			hex.corners[3].x,
			hex.corners[4].x,
			hex.corners[5].x
		);
		let lowestX = Math.max(
			hex.corners[0].x,
			hex.corners[1].x,
			hex.corners[2].x,
			hex.corners[3].x,
			hex.corners[4].x,
			hex.corners[5].x
		);

		let width = Math.abs(lowestX - highestX);
		let height = Math.abs(lowestY - highestY);

		if (tile) {
			let hasSetNeighbor = isCurrentNeighborOfSetTile(hex, grid, tiles);
			const polygon = draw
				// create a polygon from a hex's corner points
				.polygon(hex.corners.map(({ x, y }) => `${x},${y}`))
				.fill('white')
				.css('cursor', 'pointer')
				.css('text-align', 'center')
				.stroke({ width: 2, color: 'white' });

			count += tile.cost;

			polygon.fill(tile.color);
			if (tile.first) {
				draw
					.text('First')
					.move(hex.corners[0].x - width / 2, hex.corners[0].y - 14)
					.css('pointer-events', 'none')
					.css('text-anchor', 'middle')
					.font({
						family: 'pokemon',
						fill: 'black',
						size: 20,
						weight: 'bold',
						leading: 1
					});
			} else if (!tile.set && !hasSetNeighbor && !tile.first) {
				polygon.fill(hexToRGB(tile.color, 0.3));
			} else if (!tile.set && hasSetNeighbor && !tile.first) {
				polygon.fill(hexToRGB(tile.color, 0.6));
				tile.settable = true;
			}

			draw.group().add(polygon);

			if (tile?.title) {
				tile.title.split(' ').forEach((word, i) => {
					draw
						.text(word)
						.move(hex.corners[0].x - width / 2, hex.corners[0].y - 14 + i * (height / 4))
						.css('pointer-events', 'none')
						.css('text-anchor', 'middle')
						.css('transform', 'translate(100)')
						.font({
							family: 'pokemon',
							fill: !tile.set && hasSetNeighbor ? 'gold' : tile.set ? '#444' : '#EEE',
							size: width / 4,
							weight: 'bold',
							leading: 1
						});
				});
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

	function openModal(tile?: any, tiles: any[]): any {
		if (tile && !tile.first) {
			currentNode = tile;
			currentTiles = tiles;
			showModal = true;
		}
	}

	function drawGrid(draw: Svg, grid: Grid, tiles: any[]) {
		grid.forEach((hex) => renderSVG(hex, draw, tiles, grid));
	}

	function setNode(tile: any, tiles: any[]) {
		tile.set = true;
		tile.settable = false;
		masteryPoints -= tile.cost;
		tiles === initiateTiles
			? drawGrid(initiateSvg, initiateGrid, initiateTiles)
			: drawGrid(expertSvg, expertGrid, expertTiles);
		showModal = false;
	}

	onMount(() => {
		// INITIATE
		initiateSvg = SVG().addTo(masteries).size('100%', '100%');
		const Hex = defineHex({
			dimensions: masteries.getBoundingClientRect().width / 28.4,
			origin: 'topLeft'
		});
		initiateGrid = new Grid(Hex, rectangle({ width: 16, height: 1 }));

		drawGrid(initiateSvg, initiateGrid, initiateTiles);

		masteries.addEventListener('click', ({ offsetX, offsetY }) => {
			const hex = initiateGrid.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			openModal(
				initiateTiles.find((tile) => tile.q === hex.q && tile.r === hex.r),
				initiateTiles
			);
		});
		masteries.addEventListener('touch', ({ offsetX, offsetY }) => {
			const hex = initiateGrid.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			openModal(
				initiateTiles.find((tile) => tile.q === hex.q && tile.r === hex.r),
				initiateTiles
			);
		});

		// EXPERT
		expertSvg = SVG().addTo(expert).size('100%', '100%');
		const Hex2 = defineHex({
			dimensions: expert.getBoundingClientRect().width / 26.5,
			origin: 'topLeft'
		});
		expertGrid = new Grid(Hex2, rectangle({ width: 15, height: 4 }));
		drawGrid(expertSvg, expertGrid, expertTiles);
		-expert.addEventListener('click', ({ offsetX, offsetY }) => {
			const hex = expertGrid.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			openModal(
				expertTiles.find((tile) => tile.q === hex.q && tile.r === hex.r),
				expertTiles
			);
		});
		expert.addEventListener('touch', ({ offsetX, offsetY }) => {
			const hex = expertGrid.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			openModal(
				expertTiles.find((tile) => tile.q === hex.q && tile.r === hex.r),
				expertTiles
			);
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
	<hr />
	<button
		class="button primary"
		disabled={!currentNode?.settable}
		on:click={() => {
			setNode(currentNode, currentTiles);
		}}>Activate</button
	>
</Modal>

<style lang="scss">
	.offset {
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
