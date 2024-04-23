<script lang="ts">
	import { SvelteFlow, type Node } from '@xyflow/svelte';
	import { writable, type Writable } from 'svelte/store';
	import type { GameContext } from '../../../js/context/gameContext';
	import TurboNode from './flow/TurboNode.svelte';
	import TurboEdge from './flow/TurboEdge.svelte';

	export let context: GameContext;
	console.log(context.player);
	$: masteryPoints = context.player.masteryPoints;

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

	let hmNodes = [
		{
			id: '1',
			position: { x: 0, y: 0 },
			data: { title: 'HM', wrap: false, set: false },
			class: 'title',
			type: 'turbo'
		},
		{
			id: '2',
			position: { x: 225, y: 0 },
			data: { title: 'Cut', wrap: true, cost: 2, set: false },
			type: 'turbo'
		},
		{
			id: '3',
			position: { x: 450, y: 0 },
			data: { title: 'Surf', wrap: true, cost: 2, set: false },
			type: 'turbo'
		},
		{
			id: '4',
			position: { x: 675, y: 0 },
			data: { title: 'Rock smash', wrap: true, cost: 2, set: false },
			type: 'turbo'
		},
		{
			id: '5',
			position: { x: 900, y: 0 },
			data: { title: 'Fly', wrap: true, cost: 3, set: false },
			type: 'turbo'
		}
	];

	let battleNodes = [
		{
			id: '10',
			position: { x: 0, y: 120 },
			data: { title: 'BATTLE', wrap: false, set: false },
			class: 'title',
			type: 'turbo'
		},
		{
			id: '11',
			position: { x: 225, y: 120 },
			data: { title: 'Stab dmg', subline: '+10%', wrap: true, cost: 2, set: false },
			type: 'turbo'
		},
		{
			id: '12',
			position: { x: 450, y: 120 },
			data: { title: 'Effect chance', subline: '+5%', wrap: true, cost: 2, set: false },
			type: 'turbo'
		},
		{
			id: '13',
			position: { x: 675, y: 120 },
			data: { title: 'Effect res.', subline: '+10%', wrap: true, cost: 2, set: false },
			type: 'turbo'
		},
		{
			id: '14',
			position: { x: 900, y: 120 },
			type: 'turbo',
			data: { title: 'Weather', subline: '+1 turn', wrap: true, cost: 2, set: false }
		}
	];

	let trainerNode = [
		{
			id: '20',
			position: { x: 0, y: 240 },
			data: { title: 'TRAINER', wrap: false, set: false },
			class: 'title',
			type: 'turbo'
		},
		{
			id: '21',
			position: { x: 225, y: 240 },
			data: { title: 'XP rate', subline: '+10%', wrap: true, cost: 2, set: false },
			type: 'turbo'
		},
		{
			id: '22',
			position: { x: 450, y: 240 },
			data: { title: 'Catch rate', subline: '+10%', wrap: true, cost: 2, set: false },
			type: 'turbo'
		},
		{
			id: '23',
			position: { x: 675, y: 240 },
			data: { title: 'IVs', subline: 'Min +5', wrap: true, cost: 3, set: false },
			type: 'turbo'
		},
		{
			id: '24',
			position: { x: 890, y: 240 },
			data: { title: 'Shiny rate', subline: '+10%', wrap: true, cost: 5, set: false },
			type: 'turbo'
		}
	];

	const nodes: Writable<Node[]> = writable([...hmNodes, ...battleNodes, ...trainerNode]);
	const edges = writable([
		{ id: '1-2', source: '1', target: '2' },
		{ id: '1-3', source: '2', target: '3' },
		{ id: '1-4', source: '3', target: '4' },
		{ id: '1-5', source: '4', target: '5' },
		{ id: '10-11', source: '10', target: '11' },
		{ id: '10-12', source: '11', target: '12' },
		{ id: '10-13', source: '12', target: '13' },
		{ id: '10-14', source: '13', target: '14' },
		{ id: '20-21', source: '20', target: '21' },
		{ id: '20-22', source: '21', target: '22' },
		{ id: '20-23', source: '22', target: '23' },
		{ id: '20-24', source: '23', target: '24' }
	]);
</script>

<div class="tree">
	<div class="row">
		<div class="col-12 sub-head">
			<span>Points : {masteryPoints}</span>
		</div>
	</div>

	<div class="row">
		<div class="col-12 abilities">
			<SvelteFlow
				class="bg"
				{nodes}
				{nodeTypes}
				{edges}
				{edgeTypes}
				{defaultEdgeOptions}
				minZoom={0.7}
				maxZoom={0.7}
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
				on:nodeclick={(e) => {
					let node = e.detail.node;
					if (!node.data.set && node.data.cost && masteryPoints >= node.data.cost) {
						if (Number(node.id) < 10) {
							let currentNode = hmNodes.find((n) => n.id === node.id);
							let previousNode = hmNodes.find(
								(n) => n.id === (parseInt(node.id) - 1).toString()
							);
							console.log(currentNode, previousNode);
							if (currentNode && previousNode && (previousNode.data.set || !previousNode.data.wrap)) {
								context.player.masteryPoints -= node.data.cost;
								currentNode.data = { ...node.data, set: true };
								currentNode.class = 'set';
								masteryPoints -= node.data.cost;
								$nodes = [...hmNodes, ...battleNodes, ...trainerNode];
							}
						} else if (Number(node.id) < 20) {
							let currentNode = battleNodes.find((n) => n.id === node.id);
							let previousNode = battleNodes.find(
								(n) => n.id === (parseInt(node.id) - 1).toString()
							);
							console.log(currentNode, previousNode);
							if (currentNode && previousNode && (previousNode.data.set || !previousNode.data.wrap)) {
								context.player.masteryPoints -= node.data.cost;
								currentNode.data = { ...node.data, set: true };
								currentNode.class = 'set';
								masteryPoints -= node.data.cost;
								$nodes = [...hmNodes, ...battleNodes, ...trainerNode];
							}
						} else if (Number(node.id) < 30) {
							let currentNode = trainerNode.find((n) => n.id === node.id);
							let previousNode = trainerNode.find(
								(n) => n.id === (parseInt(node.id) - 1).toString()
							);
							console.log(currentNode, previousNode);
							if (currentNode && previousNode && (previousNode.data.set || !previousNode.data.wrap)) {
								context.player.masteryPoints -= node.data.cost;
								currentNode.data = { ...node.data, set: true };
								currentNode.class = 'set';
								masteryPoints -= node.data.cost;
								$nodes = [...hmNodes, ...battleNodes, ...trainerNode];
							}
						}

						//context.player.mastery[node.data.title] = (context.player.mastery[node.data.title] || 0) + 1;
					}
				}}
			></SvelteFlow>
		</div>
	</div>
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
			#00c3e6 100%
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

		.row {
			width: 100%;

			.col-12 {
				&.sub-head {
					height: 32px;
					display: flex;
					justify-content: end;
				}

				&.abilities {
					height: calc(100dvh - 46px - 32px);
				}
			}
		}
	}
</style>
