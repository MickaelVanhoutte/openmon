<script lang="ts">
	import { Background, SvelteFlow, type Node } from '@xyflow/svelte';
	import { writable, type Writable } from 'svelte/store';
	import type { GameContext } from '../../../js/context/gameContext';
	import TurboNode from './flow/TurboNode.svelte';
	import TurboEdge from './flow/TurboEdge.svelte';

	export let context: GameContext;

	const nodeTypes = {
		turbo: TurboNode
	};

	const edgeTypes = {
		turbo: TurboEdge
	};

	const defaultEdgeOptions = {
		type: 'turbo',
		markerEnd: 'edge-circle'
	};

	const nodes: Writable<Node[]> = writable([
		{
			id: '1',
			position: { x: 0, y: 0 },
			data: { title: 'Moves' },
			type: 'turbo',
		},
		{
			id: '2',
			position: { x: 225, y: 0 },
			data: { title: 'Cut' },
			type: 'turbo',
		},
		{
			id: '3',
			position: { x: 450, y: 0 },
			data: { title: 'Surf' },
			type: 'turbo',
		},
		{
			id: '4',
			position: { x: 675, y: 0 },
			data: { title: 'Strengh' },
			type: 'turbo',
		},
		{
			id: '5',
			position: { x: 890, y: 0 },
			data: { title: 'Rock smash' },
			type: 'turbo',
		},

		{
			id: '10',
			position: { x: 0, y: 150 },
			data: { title: 'Stats' },
			type: 'turbo',
		},
		{
			id: '11',
			position: { x: 150, y: 150 },
			data: { title: 'HP', subline: 'Base +10'},
			type: 'turbo',
		},
		{
			id: '12',
			position: { x: 300, y: 150 },
			data: { title: 'ATK', subline: 'Base +10' },
			type: 'turbo',
		},
		{
			id: '13',
			position: { x: 450, y: 150 },
			data: { title: 'DEF', subline: 'Base +10' },
			type: 'turbo',
		},
		{
			id: '14',
			position: { x: 600, y: 150 },
			data: { title: 'SP.DEF', subline: 'Base +10' },
			type: 'turbo',
		},
		{
			id: '15',
			position: { x: 750, y: 150 },
			data: { title: 'SP.ATK', subline: 'Base +10' },
			type: 'turbo',
		},
		{
			id: '16',
			position: { x: 900, y: 150 },
			type: 'turbo',
			data: { title: 'SPEED', subline: 'Base +10' },
		},
		{
			id: '20',
			position: { x: 0, y: 300 },
			data: { title: 'Others' },
			type: 'turbo',
		},
		{
			id: '21',
			position: { x: 300, y: 300 },
			data: { title: 'Catch rate', subline: '+10%' },
			type: 'turbo',
		},
		{
			id: '22',
			position: { x: 600, y: 300 },
			data: { title: 'Better IVs', subline: '+10%' },
			type: 'turbo',
		},
		{
			id: '23',
			position: { x: 890, y: 300 },
			data: { title: 'Shiny rate', subline: '+10%'},
			type: 'turbo',
		}
	]);
	const edges = writable([
		{ id: '1-2', source: '1', target: '2' },
		{ id: '1-3', source: '2', target: '3' },
		{ id: '1-4', source: '3', target: '4' },
		{ id: '1-5', source: '4', target: '5' },
		{ id: '10-11', source: '10', target: '11' },
		{ id: '10-12', source: '11', target: '12' },
		{ id: '10-13', source: '12', target: '13' },
		{ id: '10-14', source: '13', target: '14' },
		{ id: '10-15', source: '14', target: '15' },
		{ id: '10-16', source: '15', target: '16' },
		{ id: '20-21', source: '20', target: '21' },
		{ id: '20-22', source: '21', target: '22' },
		{ id: '20-23', source: '22', target: '23' }
	]);
</script>

<div class="tree">
	<SvelteFlow
		{nodes}
		{nodeTypes}
		{edges}
		{edgeTypes}
		{defaultEdgeOptions}
		minZoom={.7}
		maxZoom={.7}
		panOnScroll={false}
		panOnDrag={false}
		zoomOnDoubleClick={false}
		zoomOnPinch={false}
		zoomOnScroll={false}
		nodesDraggable={false}
		nodesConnectable={false}
		fitView
		translateExtent={[
			[0, 0],
			[600, 300]
		]}
		preventScrolling
		colorMode={'dark'}
	>
	<svg>
		<defs>
		  <linearGradient id="edge-gradient">
			<stop offset="0%" stop-color="#ae53ba" />
			<stop offset="100%" stop-color="#2a8af6" />
		  </linearGradient>
		  <marker
			id="edge-circle"
			viewBox="-5 -5 10 10"
			refX="0"
			refY="0"
			markerUnits="strokeWidth"
			markerWidth="10"
			markerHeight="10"
			orient="auto"
		  >
			<circle stroke="#2a8af6" stroke-opacity="0.75" r="2" cx="0" cy="0" />
		  </marker>
		</defs>
	  </svg>
		<!-- <Background class="bg" /> -->
		<!-- 
		<Controls /> -->
	</SvelteFlow>
</div>

<style lang="scss">
	:global(.pk-node) {
		color: white;
		font-size: 22px;
		padding: 8px;
		width: 90px;
	}

	:global(.pk-node.smaller) {
		width: 120px;
	}

	:global(.svelte-flow__attribution) {
		display: none;
	}

	:global(.bg) {
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
	}

	.tree {
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		position: relative;
		display: flex;
		flex-direction: row;
		//background-color: #0e2742f0;
		//background-image: url('src/assets/menus/p-sum.jpg');
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
	}
</style>
