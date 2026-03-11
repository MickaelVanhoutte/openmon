<script lang="ts">
	import type { GameContext } from '../../../js/context/gameContext';
	import { getTrainerClass } from '../../../js/characters/trainer-class';
	import { Mastery, MasteryType, MasteryGroup } from '../../../js/characters/mastery-model';
	import Modal from '../../common/Modal.svelte';

	interface Props {
		context: GameContext;
	}

	const { context }: Props = $props();
	let showModal = $state(false);
	let currentNode: Mastery | undefined = $state(undefined);
	let animatingNodeKey: string | null = $state(null);
	let tick = $state(0);

	const pMasteries = $derived((tick, context.player.playerMasteries));
	const masteryPoints = $derived(pMasteries.points);
	const classData = $derived(getTrainerClass(context.player.trainerClass));
	const rankLabel = $derived(pMasteries.getRankLabel());
	const expertUnlocked = $derived(pMasteries.isExpertUnlocked());
	const capstoneUnlocked = $derived(pMasteries.isCapstoneUnlocked());

	const initiateTiles = $derived(pMasteries.novice);
	const expertTiles = $derived(pMasteries.expert);

	interface MergedRow {
		label: string;
		colIdx: number;
		noviceNodes: Mastery[];
		expertNodes: Mastery[];
	}

	function buildMergedRows(novice: Mastery[], expert: Mastery[]): MergedRow[] {
		const rowMap = new Map<number, MergedRow>();

		for (const tile of novice) {
			if (tile.first) continue;
			if (!rowMap.has(tile.q)) {
				rowMap.set(tile.q, { label: tile.column || `Row ${tile.q}`, colIdx: tile.q, noviceNodes: [], expertNodes: [] });
			}
			rowMap.get(tile.q)!.noviceNodes.push(tile);
		}

		for (const tile of expert) {
			if (tile.first) continue;
			if (!rowMap.has(tile.q)) {
				rowMap.set(tile.q, { label: tile.column || `Row ${tile.q}`, colIdx: tile.q, noviceNodes: [], expertNodes: [] });
			}
			rowMap.get(tile.q)!.expertNodes.push(tile);
		}

		const rows = Array.from(rowMap.values()).sort((a, b) => a.colIdx - b.colIdx);
		for (const row of rows) {
			row.noviceNodes.sort((a, b) => a.r - b.r);
			row.expertNodes.sort((a, b) => a.r - b.r);
		}
		return rows;
	}

	const mergedRows = $derived(buildMergedRows(initiateTiles, expertTiles));

	function isPerkNode(tile: any): boolean {
		return tile?.type === MasteryType.PERK;
	}

	function isCapstoneNode(tile: any): boolean {
		return tile?.perkId?.endsWith('-capstone') ||
			tile?.perkId === 'brs-unstoppable' ||
			tile?.perkId === 'med-miracle' ||
			tile?.perkId === 'grd-unbreakable' ||
			tile?.perkId === 'wtm-cataclysm' ||
			tile?.perkId === 'str-mastermind' ||
			tile?.perkId === 'brd-masterbreeder' ||
			tile?.perkId === 'ace-grandmaster' ||
			tile?.perkId === 'exp-fortune' ||
			tile?.cost === 5;
	}

	function hasSetNeighbor(node: Mastery, tiles: Mastery[]): boolean {
		return tiles.some(t =>
			t.q === node.q &&
			(t.r === node.r - 1 || t.r === node.r + 1) &&
			t.set
		);
	}

	function isNodeSettable(node: Mastery): boolean {
		if (node.set || node.first) return false;
		const sameGroupTiles = node.group === MasteryGroup.NOVICE ? initiateTiles : expertTiles;
		if (hasSetNeighbor(node, sameGroupTiles)) return true;
		if (node.group === MasteryGroup.EXPERT && node.r === 0) {
			const noviceInCol = initiateTiles.filter(t => t.q === node.q);
			const lastNovice = noviceInCol[noviceInCol.length - 1];
			if (lastNovice?.set) return true;
		}
		return false;
	}

	function canActivateNode(node: Mastery | undefined): boolean {
		if (!node) return false;
		if (node.set || node.first) return false;
		if (!isNodeSettable(node)) return false;
		if (masteryPoints < node.cost) return false;
		if (node.group === MasteryGroup.EXPERT && !initiateTiles.every((tile) => tile.set || tile.first)) return false;
		if (node.group === MasteryGroup.EXPERT && !expertUnlocked) return false;
		if (isCapstoneNode(node) && !capstoneUnlocked) return false;
		return true;
	}

	function handleNodeClick(node: Mastery) {
		if (node.first) return;
		currentNode = node;
		showModal = true;
	}

	function setNode(tile: Mastery) {
		showModal = false;
		context.player.setMastery(tile);

		if (tile.group === MasteryGroup.NOVICE) {
			const freshNovice = context.player.playerMasteries.novice;
			if (freshNovice.every((t) => t.set || t.first)) {
				const firstExp = context.player.playerMasteries.expert.find((t) => t.first);
				if (firstExp && !firstExp.set) {
					context.player.setMastery(firstExp);
				}
			}
		}

		tick++;
		animatingNodeKey = `${tile.q}-${tile.r}-${tile.group}`;
		setTimeout(() => { animatingNodeKey = null; }, 600);
	}
</script>

<div class="header-bar">
	<span class="class-name">{classData?.name ?? 'Trainer'}</span>
	<span class="rank-badge">{rankLabel}</span>
	<span class="level-info">Lv. {pMasteries.level}</span>
	<div class="xp-bar">
		<div class="xp-fill" style="width: {pMasteries.xpToNextLevel > 0 ? (pMasteries.exp / pMasteries.xpToNextLevel) * 100 : 0}%"></div>
	</div>
	<span class="points">{masteryPoints} pts</span>
</div>

<div class="tree-grid">
	{#each mergedRows as row (row.colIdx)}
		<div class="tree-row">
			<span class="row-label">{row.label}</span>

			<!-- Novice nodes -->
			<div class="row-nodes novice-side">
				{#each row.noviceNodes as node, nodeIdx (`n-${node.q}-${node.r}`)}
					{@const settable = isNodeSettable(node)}
					{@const isPerk = isPerkNode(node) && !isCapstoneNode(node)}
					{@const isCapstone = isCapstoneNode(node)}

					{#if nodeIdx > 0}
						<div class="connector-h" class:active={row.noviceNodes[nodeIdx - 1].set}></div>
					{/if}

					<button
						class="tree-node"
						class:active={node.set}
						class:settable={settable}
						class:locked={!node.set && !settable}
						class:perk={isPerk}
						class:capstone={isCapstone}
						class:animating={animatingNodeKey === `${node.q}-${node.r}-${node.group}`}
						style="--node-color: {node.color}"
						onclick={() => handleNodeClick(node)}
					>
						{#if isPerk || isCapstone}
							<span class="node-icon">{isCapstone ? '★' : '◆'}</span>
						{/if}
						<span class="node-title">{node.title}</span>
					</button>
				{/each}
			</div>

			<!-- Vertical divider -->
			<div class="tier-divider-v"></div>

			<!-- Expert nodes -->
			<div class="row-nodes expert-side" class:locked-side={!expertUnlocked}>
				{#each row.expertNodes as node, nodeIdx (`e-${node.q}-${node.r}`)}
					{@const settable = isNodeSettable(node)}
					{@const isExpertLocked = !expertUnlocked}
					{@const isCapstoneLocked = isCapstoneNode(node) && !capstoneUnlocked}
					{@const isLocked = isExpertLocked || isCapstoneLocked}
					{@const isPerk = isPerkNode(node) && !isCapstoneNode(node)}
					{@const isCapstone = isCapstoneNode(node)}

					{#if nodeIdx > 0}
						<div class="connector-h" class:active={row.expertNodes[nodeIdx - 1].set}></div>
					{/if}

					<button
						class="tree-node"
						class:active={node.set}
						class:settable={settable && !isLocked}
						class:locked={isLocked || (!node.set && !settable)}
						class:perk={isPerk}
						class:capstone={isCapstone}
						class:animating={animatingNodeKey === `${node.q}-${node.r}-${node.group}`}
						style="--node-color: {node.color}"
						onclick={() => handleNodeClick(node)}
					>
						{#if isPerk || isCapstone}
							<span class="node-icon">{isCapstone ? '★' : '◆'}</span>
						{/if}
						<span class="node-title">{node.title}</span>
					</button>
				{/each}
			</div>
		</div>
	{/each}

	<!-- Divider label -->
	<div class="divider-label">
		{#if !expertUnlocked}
			<span class="tier-lock">Adept rank</span>
		{/if}
	</div>
</div>

{#if pMasteries.activePerks.length > 0}
	<div class="active-perks">
		{#each pMasteries.activePerks as perk}
			<span class="perk-pip" title={perk.definition.name + ': ' + perk.definition.description}>
				{perk.definition.name}
			</span>
		{/each}
	</div>
{/if}

<Modal bind:showModal>
	{#snippet header()}
		<h3 style="margin: 2% 0">
			{currentNode?.title}
			{#if isPerkNode(currentNode)}
				<span class="perk-tag">{isCapstoneNode(currentNode) ? 'CAPSTONE' : 'PERK'}</span>
			{/if}
		</h3>
	{/snippet}

	<p style="margin: 0">
		cost : {currentNode?.cost}
	</p>

	<hr />
	<p style="margin: 0">
		{currentNode?.description}
	</p>

	{#if isCapstoneNode(currentNode) && !capstoneUnlocked}
		<p class="lock-msg">Requires Master rank (Lv. 40)</p>
	{/if}
	<hr />
	<button
		class="button primary"
		disabled={!canActivateNode(currentNode)}
		onclick={() => {
			if (currentNode) setNode(currentNode);
		}}>Activate</button
	>
</Modal>

<style lang="scss">
	.header-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 12px;
		font-size: 16px;

		.class-name {
			font-weight: bold;
			font-size: 20px;
		}

		.rank-badge {
			background: #E8A87C;
			color: #1a1a2e;
			padding: 1px 8px;
			border-radius: 4px;
			font-size: 13px;
			font-weight: bold;
		}

		.level-info {
			font-size: 14px;
			opacity: 0.8;
		}

		.xp-bar {
			flex: 1;
			height: 6px;
			background: rgba(255, 255, 255, 0.2);
			border-radius: 3px;
			overflow: hidden;
			max-width: 120px;

			.xp-fill {
				height: 100%;
				background: #68c0c8;
				border-radius: 3px;
				transition: width 0.3s;
			}
		}

		.points {
			margin-left: auto;
			font-size: 18px;
			font-weight: bold;
			color: #68c0c8;
		}
	}

	.tree-grid {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 8px 12px;
		gap: 6px;
		position: relative;
		overflow-x: auto;
	}

	.tree-row {
		display: flex;
		align-items: center;
		gap: 0;
		min-width: fit-content;
	}

	.row-label {
		font-size: 11px;
		color: #E8A87C;
		width: 56px;
		min-width: 56px;
		text-align: right;
		padding-right: 8px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: bold;
	}

	.row-nodes {
		display: flex;
		align-items: center;
		gap: 0;
		flex: 1;
		min-width: 0;
	}

	.tier-divider-v {
		width: 2px;
		align-self: stretch;
		background: #E8A87C;
		margin: 0 6px;
		opacity: 0.6;
	}

	.divider-label {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		pointer-events: none;

		.tier-lock {
			font-size: 10px;
			color: #E8A87C;
			background: #0e2742;
			padding: 0 6px;
		}
	}

	.locked-side {
		opacity: 0.45;
	}

	.tree-node {
		min-width: 52px;
		height: 34px;
		flex-shrink: 0;
		border-radius: 5px;
		border: 2px solid #04548f;
		background: rgba(255, 255, 255, 0.08);
		color: #fff;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: inherit;
		font-size: 9px;
		padding: 1px 4px;
		transition: transform 0.2s, background 0.3s, border-color 0.3s;
		position: relative;
		white-space: nowrap;

		&.active {
			background: var(--node-color);
			color: #333;
			border-color: var(--node-color);
		}

		&.settable {
			background: linear-gradient(135deg, rgba(0,0,0,0.5) 75%, rgba(255,255,255,1) 75%);
			cursor: pointer;
			&:hover {
				transform: scale(1.05);
			}
		}

		&.locked {
			opacity: 0.45;
			cursor: default;
		}

		&.perk {
			border-color: #E8A87C;
			border-width: 2px;
		}

		&.capstone {
			border-color: #FF6B6B;
			border-width: 2px;
		}

		&.animating {
			animation: node-activate 0.6s ease-out;
		}
	}

	.connector-h {
		width: 4px;
		height: 2px;
		background: #04548f;
		opacity: 0.4;
		flex-shrink: 0;

		&.active {
			background: #68c0c8;
			opacity: 1;
		}
	}

	.node-title {
		font-weight: bold;
		text-align: center;
		line-height: 1.1;
	}

	.node-icon {
		margin-right: 2px;
		font-size: 9px;
	}

	@keyframes node-activate {
		0% { transform: scale(1); }
		50% { transform: scale(1.15); }
		100% { transform: scale(1); }
	}

	.active-perks {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
		padding: 2px 8px;
		justify-content: flex-end;

		.perk-pip {
			background: rgba(232, 168, 124, 0.3);
			border: 1px solid #E8A87C;
			color: #E8A87C;
			padding: 1px 6px;
			border-radius: 3px;
			font-size: 10px;
			cursor: help;
		}
	}

	.perk-tag {
		font-size: 12px;
		background: #E8A87C;
		color: #1a1a2e;
		padding: 1px 6px;
		border-radius: 3px;
		vertical-align: middle;
		margin-left: 6px;
	}

	.lock-msg {
		color: #FF6B6B;
		font-size: 14px;
		font-style: italic;
	}

	:global(.modal) {
		min-width: 60%;
	}

	@media (max-width: 768px) {
		.header-bar {
			font-size: 14px;
			gap: 6px;
			.class-name { font-size: 16px; }
			.rank-badge { font-size: 11px; }
			.points { font-size: 14px; }
		}

		.row-label {
			width: 40px;
			min-width: 40px;
			font-size: 8px;
		}

		.tree-node {
			min-width: 36px;
			height: 28px;
			font-size: 7px;
		}
	}
</style>
