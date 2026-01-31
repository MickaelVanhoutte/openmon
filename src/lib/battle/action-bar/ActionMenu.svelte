<script lang="ts">
	interface Props {
		disabled: boolean;
		selectedOptionIdx?: number;
		show: boolean;
		onFight: () => void;
		onBag: () => void;
		onSwitch: () => void;
		onRun: () => void;
		onHover: (idx: number) => void;
	}

	let { disabled, selectedOptionIdx, show, onFight, onBag, onSwitch, onRun, onHover }: Props =
		$props();
</script>

<div class="actions2" class:show role="menu" aria-label="Battle actions">
	<button
		class="action2-btn"
		style="--color:#dc5959; --color2:#431515; --offset: 0"
		{disabled}
		onclick={onFight}
		onmouseenter={() => onHover(0)}
		class:selected={!disabled && selectedOptionIdx === 0}
		role="menuitem"
		aria-label="Fight - select a move to attack"
	>
		FIGHT
	</button>

	<button
		class="action2-btn"
		style="--color:#eca859; --color2:#4f310d; --offset: 3%"
		{disabled}
		class:selected={!disabled && selectedOptionIdx === 1}
		onclick={onBag}
		onmouseenter={() => onHover(1)}
		role="menuitem"
		aria-label="Bag - use an item"
	>
		BAG
	</button>

	<button
		class="action2-btn"
		style="--color:#7EAF53; --color2:#11420a; --offset: 6%"
		{disabled}
		class:selected={!disabled && selectedOptionIdx === 2}
		onclick={onSwitch}
		onmouseenter={() => onHover(2)}
		role="menuitem"
		aria-label="Pokemon - switch your active Pokemon"
	>
		POKEMONS
	</button>

	<button
		class="action2-btn"
		style="--color:#599bdc; --color2:#092536; --offset: 9%"
		{disabled}
		class:selected={!disabled && selectedOptionIdx === 3}
		onclick={onRun}
		onmouseenter={() => onHover(3)}
		role="menuitem"
		aria-label="Run - flee from battle"
	>
		RUN
	</button>
</div>

<style lang="scss">
	@keyframes appear {
		from {
			bottom: -25%;
		}
		to {
			bottom: 2%;
		}
	}

	.actions2 {
		width: 30%;
		max-height: 220px;
		position: absolute;
		bottom: -25%;
		right: 5%;
		transition: bottom 0.5s ease-in-out;
		animation: appear 0.5s ease-in forwards;
		align-items: flex-end;
		gap: 6px;
		display: flex;
		flex-direction: column;
		z-index: 9;

		.action2-btn {
			width: 100%;
			height: 44px;
			background-color: var(--pixel-bg-header);
			border: 2px solid var(--pixel-border-color);
			color: var(--pixel-text-white);
			transform: translateX(20%);
			display: flex;
			justify-content: flex-start;
			align-items: center;
			padding: 0 20px;
			font-size: 36px;
			min-width: 44px;
			min-height: 44px;
			transition: transform 0.3s ease-in-out;

			&:hover,
			&.selected {
				filter: brightness(1.1);
				border: 3px solid var(--pixel-text-gold);
				color: var(--pixel-text-white);
			}
		}
	}
</style>
