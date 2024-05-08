<script lang="ts">
	import { Svg, SVG } from '@svgdotjs/svg.js';
	import { gsap } from 'gsap';
	import { defineHex, Direction, Grid, rectangle } from 'honeycomb-grid';
	import { onMount } from 'svelte';
	import type { GameContext } from '../../../js/context/gameContext';
	import Modal from '../../common/Modal.svelte';

	export let context: GameContext;
	let masteries: HTMLDivElement;
	let expert: HTMLDivElement;
	let showModal = false;
	let targetElement: any;
	let currentNode: any | undefined;
	let currentTiles: any[];
	let currentHex: any;
	let currentGrid: Grid;

	$: pMasteries = context.player.playerMasteries;
	$: masteryPoints = pMasteries.points;

	$: initiateTiles = pMasteries.novice;
	let initiateSvg: Svg;
	let initiateGrid: Grid;
	$: expertTiles = pMasteries.expert;
	let expertSvg: Svg;
	let expertGrid: Grid;

	let animating: boolean = false;

	let count = 0;

	function renderSVG(hex: HexExpert, draw: SVG.Doc, tiles: any[], grid: Grid, expert = false) {
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
				.fill({ color: 'white', opacity: 0.8 })
				.css('cursor', 'pointer')
				.css('text-align', 'center')
				.id(`hex-${hex.q}-${hex.r}`)
				.stroke({ width: 2, color: '#04548f', opacity: 0.5 });

			count += tile.cost;

			if (!tile.set && !hasSetNeighbor && !tile.first) {
				polygon.fill({ color: '#000', opacity: 0.5 });
			} else if (!tile.set && hasSetNeighbor && !tile.first) {
				if (expert && !initiateTiles.every((tile) => tile.set || tile.first)) {
					polygon.fill({ color: '#000', opacity: 0.5 });
				} else {
					var gradient = draw
						.gradient('linear', function (add) {
							// add.stop({ offset: 0, color: '#000', opacity: 1 })   // -> first
							add.stop({ offset: 0.75, color: '#000', opacity: 0.5 }); // -> second
							add.stop({ offset: 0.75, color: '#FFF', opacity: 1 }); // -> third
						})
						.from(0, 0)
						.to(1.2, 0.8);

					polygon.fill(gradient);
					//polygon.fill({color: '#000', opacity: 0.5});
					tile.settable = true;
				}
			} else if (!tile.first) {
				polygon.fill({ color: tile.color, opacity: 1 });
			}

			draw.group().add(polygon);

			if (tile?.title) {
				tile.title.split(' ').forEach((word, i) => {
					draw
						.text(word)
						.id(`text-${hex.q}-${hex.r}-${i}`)
						.move(hex.corners[0].x - width / 2, hex.corners[0].y - 14 + i * (height / 4))
						.css('pointer-events', 'none')
						.css('text-anchor', 'middle')
						.css('transform', 'translate(100)')
						//.css ('mix-blend-mode', 'difference')
						.font({
							family: 'pokemon',
							fill: tile.set ? '#444' : tile.color,
							size: width / 4,
							weight: 'bold',
							leading: 1
						});
				});
			}
		}
		return;
	}

	function openModal(tile?: any, tiles: any[], target: any, hex: any, grid: Grid): any {
		if (tile && !tile.first && !animating) {
			currentNode = tile;
			currentTiles = tiles;
			showModal = true;
			targetElement = target;
			currentHex = hex;
			currentGrid = grid;
		}
	}

	function drawGrid(draw: Svg, grid: Grid, tiles: any[], expert: boolean = false, lastHex?: any) {
		draw.clear();
		grid
			.filter((hex) => !lastHex || !(lastHex.q === hex.q && lastHex.r === hex.r))
			.forEach((hex) => renderSVG(hex, draw, tiles, grid, expert));
		if (lastHex) {
			renderSVG(lastHex, draw, tiles, grid, expert);
		}
	}

	function setNode(tile: any, tiles: any[]) {
		animating = true;
		let svgId = initiateTiles === tiles ? 'initiate' : 'expert';
		tiles === initiateTiles
			? drawGrid(initiateSvg, initiateGrid, initiateTiles, false, currentHex)
			: drawGrid(expertSvg, expertGrid, expertTiles, true, currentHex);
		showModal = false;
		context.player.setMastery(tile);

		let neighbors = [
			currentGrid.neighborOf({ q: currentHex.q, r: currentHex.r }, Direction.NE, {
				allowOutside: false
			}),
			currentGrid.neighborOf({ q: currentHex.q, r: currentHex.r }, Direction.NW, {
				allowOutside: false
			}),
			currentGrid.neighborOf({ q: currentHex.q, r: currentHex.r }, Direction.E, {
				allowOutside: false
			}),
			currentGrid.neighborOf({ q: currentHex.q, r: currentHex.r }, Direction.W, {
				allowOutside: false
			}),
			currentGrid.neighborOf({ q: currentHex.q, r: currentHex.r }, Direction.SE, {
				allowOutside: false
			}),
			currentGrid.neighborOf({ q: currentHex.q, r: currentHex.r }, Direction.SW, {
				allowOutside: false
			})
		]
			.filter((neighbor) => !!neighbor)
			.filter((neighbor) => {
				let neighborTile = tiles.find((t) => t.q === neighbor.q && t.r === neighbor.r);
				return !neighborTile?.set && !neighborTile.settable;
			})
			.map((ng) => '#' + svgId + ' #hex-' + ng.q + '-' + ng.r);

		let tl = gsap.timeline();
		console.log(neighbors);

		tl.to(
			'#' + svgId + ' #hex-' + currentHex.q + '-' + currentHex.r,
			{
				scale: 1.3,
				duration: 1,
				repeat: 1,
				transformOrigin: '50% 50%',
				position: 'relative',
				rotate: 180,
				//fill: tile.color,
				//fillOpacity: 1,
				yoyo: true
			},
			'fx'
		)
			.to(
				'#' + svgId + ' #hex-' + currentHex.q + '-' + currentHex.r,
				{
					//rotate: 360,
					fill: tile.color,
					fillOpacity: 1
				},
				'fx'
			)
			.to(
				'#' + svgId + ' #text-' + currentHex.q + '-' + currentHex.r + '-0',
				{
					fill: '#444'
				},
				'fx'
			)
			.to(
				'#' + svgId + ' #text-' + currentHex.q + '-' + currentHex.r + '-1',
				{
					fill: '#444'
				},
				'fx'
			);
		neighbors.forEach((ng) => {
			tl.to(
				ng,
				{
					duration: 0.5,
					transformOrigin: '50% 50%',
					scale: 0.85
				},
				'fx+1'
			).to(
				ng,
				{
					duration: 0.5,
					transformOrigin: '50% 50%',
					scale: 1
				},
				'fx+1.5'
			);
		});

		neighbors.forEach((ng) => {});
		tl.play().then(() => {
			if (tile.group == 'novice') {
				console.log('redraw initiate');
				drawGrid(initiateSvg, initiateGrid, initiateTiles, false);
				animating = false;

				if (initiateTiles.every((tile) => tile.set || tile.first)) {
					console.log('init expert');
					let firstExp = expertTiles.find((tile) => tile.first);
					currentGrid = expertGrid;
					currentHex = expertGrid.getHex({ q: firstExp?.q, r: firstExp?.r });
					console.log(firstExp, currentHex);
					setNode(firstExp, expertTiles);
				}
			} else {
				console.log('redraw expert');
				drawGrid(expertSvg, expertGrid, expertTiles, true);
				animating = false;
			}
		});
	}

	onMount(() => {
		// INITIATE
		initiateSvg = SVG().addTo(masteries).size('100%', '100%').id('initiate').css('zIndex', '-1');
		const Hex = defineHex({
			dimensions: masteries.getBoundingClientRect().width / 28.4,
			origin: 'topLeft'
		});
		initiateGrid = new Grid(Hex, rectangle({ width: 16, height: 1 }));

		drawGrid(initiateSvg, initiateGrid, initiateTiles, false);

		masteries.addEventListener('click', ({ target, offsetX, offsetY }) => {
			const hex = initiateGrid.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			openModal(
				initiateTiles.find((tile) => tile.q === hex.q && tile.r === hex.r),
				initiateTiles,
				target,
				hex,
				initiateGrid
			);
		});
		masteries.addEventListener('touch', ({ target, offsetX, offsetY }) => {
			const hex = initiateGrid.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			openModal(
				initiateTiles.find((tile) => tile.q === hex.q && tile.r === hex.r),
				initiateTiles,
				target,
				hex,
				initiateGrid
			);
		});

		// EXPERT
		expertSvg = SVG().addTo(expert).id('expert').size('100%', '100%');
		const Hex2 = defineHex({
			dimensions: expert.getBoundingClientRect().width / 26.5,
			origin: 'topLeft'
		});
		expertGrid = new Grid(Hex2, rectangle({ width: 15, height: 4 }));
		drawGrid(expertSvg, expertGrid, expertTiles, true);
		expert.addEventListener('click', ({ target, offsetX, offsetY }) => {
			console.log(target);
			const hex = expertGrid.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			openModal(
				expertTiles.find((tile) => tile.q === hex.q && tile.r === hex.r),
				expertTiles,
				target,
				hex,
				expertGrid
			);
		});
		expert.addEventListener('touch', ({ target, offsetX, offsetY }) => {
			const hex = expertGrid.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			openModal(
				expertTiles.find((tile) => tile.q === hex.q && tile.r === hex.r),
				expertTiles,
				target,
				hex,
				expertGrid
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
		disabled={!currentNode?.settable ||
			masteryPoints < currentNode?.cost ||
			(currentGrid === expertGrid && !initiateTiles.every((tile) => tile.set || tile.first))}
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
		overflow: visible;
	}

	:global(.masteries svg) {
		overflow: visible;
		z-index: -1;
	}
	.expert {
		width: 100dvw;
		height: calc(100dvh - 15dvh - 46px);
		overflow: visible;
	}
	:global(.expert svg) {
		overflow: visible;
		z-index: -1;
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
