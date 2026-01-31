<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		showModal: boolean;
		header?: Snippet;
		children?: Snippet;
	}

	let { showModal = $bindable(), header, children }: Props = $props();

	let dialog: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (dialog && showModal) {
			dialog.showModal();
		}
	});

	$effect(() => {
		if (dialog && !showModal) {
			dialog.close();
		}
	});

	function handleClose() {
		showModal = false;
	}

	function handleBackdropClick() {
		dialog?.close();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<dialog
	class="modal"
	bind:this={dialog}
	onclose={handleClose}
	onclick={(e) => e.target === dialog && handleBackdropClick()}
	role="dialog"
	aria-modal="true"
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div onclick={(e) => e.stopPropagation()}>
		<!-- svelte-ignore a11y_autofocus -->
		{#if header}
			<div class="modal-header">
				{@render header()}
				<button class="close" autofocus onclick={() => dialog?.close()} aria-label="Close dialog">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
						><path
							d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
						></path></svg
					></button
				>
			</div>
		{:else}
			<button class="close" autofocus onclick={() => dialog?.close()} aria-label="Close dialog">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
					><path
						d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
					></path></svg
				></button
			>
		{/if}

		{#if children}
			{@render children()}
		{/if}
	</div>
</dialog>

<style lang="scss">
	dialog {
		max-width: 80dvw;
		border-radius: 0;
		border: 2px solid var(--pixel-border-color);
		padding: 0;
		background: var(--pixel-bg-panel);
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		color: var(--pixel-text-white);

		.close {
			float: right;
			background: var(--pixel-bg-button);
			border: 2px solid var(--pixel-border-color);
			min-height: 44px;
			min-width: 44px;
			color: var(--pixel-text-white);
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;

			&:hover {
				filter: brightness(1.1);
			}

			svg {
				width: 1.5em;
				height: 1.5em;
			}
		}
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.7);
	}
	dialog > div {
		padding: 16px;
	}
	.modal-header {
		background: var(--pixel-bg-header);
		border: 2px solid var(--pixel-border-color);
		padding: 8px 16px;
		margin: -16px -16px 16px -16px;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.close {
			float: none;
			margin: 0;
		}
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	:global(.modal-button) {
		background: #334455;
		border: 2px solid #000;
		min-height: 44px;
		color: #ffffff;
		cursor: pointer;
		padding: 0 16px;
	}
	:global(.modal-button:hover) {
		filter: brightness(1.1);
	}
</style>
