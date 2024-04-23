<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	// import { FileIcon, CloudIcon } from 'svelte-feather-icons';

	import FunctionIcon from './FunctionIcon.svelte';

	type $$Props = NodeProps;
	export let data: $$Props['data'];
</script>

{#if data.wrap}
	<div class="cloud gradient">
		<div style="color: white; font-size:24px; text-align:center">
            {#if data.set}
			<svg style="height: 100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"></path></svg>
            {:else}
                {Number(data.cost) | 1}
            {/if}
        </div>
	</div>
{/if}

<div class="wrapper" class:gradient={data.wrap} class:title={!data.wrap}>
	<div class="inner">
		<div class="body">
			{#if data.icon}
				<div class="icon">
					<!-- {#if data.icon === 'function'}
              <FunctionIcon />
            {:else if data.icon === 'file'}
              <FileIcon size="16" />
            {/if} -->
				</div>
			{/if}
			<div>
				<div class="title">{data.title}</div>
				{#if data.subline}
					<div class="subline">{data.subline}</div>
				{/if}
			</div>
		</div>
		<Handle type="target" position={Position.Left} />
		<Handle type="source" position={Position.Right} />
	</div>
</div>
