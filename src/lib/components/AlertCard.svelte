<script lang="ts">
	import type { Alert } from '$lib/schemas/alert';
	import { describeCondition } from '$lib/schemas/alert';
	import { getResort } from '$lib/data/resorts';

	interface Props {
		alert: Alert;
		onDelete: (id: string) => void;
		onReset: (id: string) => void;
	}

	let { alert, onDelete, onReset }: Props = $props();

	const resort = $derived(getResort(alert.resortId));
</script>

<div
	class="rounded-lg border p-4 {alert.triggered
		? 'border-green-200 bg-green-50'
		: 'border-slate-200 bg-white'}"
>
	<div class="mb-2 flex items-start justify-between">
		<div>
			<h4 class="font-medium text-slate-900">
				{resort?.name ?? alert.resortId}
			</h4>
			<p class="text-sm text-slate-600">{describeCondition(alert.condition)}</p>
		</div>
		{#if alert.triggered}
			<span class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
				Triggered
			</span>
		{:else}
			<span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
				Watching
			</span>
		{/if}
	</div>

	<p class="mb-3 text-xs text-slate-500 italic">"{alert.originalQuery}"</p>

	{#if alert.triggered && alert.triggeredAt}
		<p class="mb-3 text-xs text-green-600">
			Triggered {new Date(alert.triggeredAt).toLocaleString()}
		</p>
	{/if}

	<div class="flex gap-2">
		{#if alert.triggered}
			<button
				onclick={() => onReset(alert.id)}
				class="rounded bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
			>
				Reset
			</button>
		{/if}
		<button
			onclick={() => onDelete(alert.id)}
			class="rounded bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100"
		>
			Delete
		</button>
	</div>
</div>
