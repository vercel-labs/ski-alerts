<script lang="ts">
	import { onMount } from 'svelte';
	import AlertCard from '$lib/components/AlertCard.svelte';
	import Chat from '$lib/components/Chat.svelte';
	import { getAlerts, deleteAlert, resetAlert } from '$lib/services/alerts';
	import type { Alert } from '$lib/schemas/alert';

	let alerts = $state<Alert[]>([]);

	onMount(() => {
		loadAlerts();
	});

	function loadAlerts() {
		alerts = getAlerts();
	}

	function handleDelete(id: string) {
		deleteAlert(id);
		loadAlerts();
	}

	function handleReset(id: string) {
		resetAlert(id);
		loadAlerts();
	}

	function handleAlertCreated() {
		loadAlerts();
	}

	const triggeredAlerts = $derived(alerts.filter((a) => a.triggered));
	const watchingAlerts = $derived(alerts.filter((a) => !a.triggered));
</script>

<div class="grid gap-8 lg:grid-cols-3">
	<div class="lg:col-span-2">
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-slate-900">My Alerts</h1>
			<p class="text-slate-600">Your personalized condition alerts</p>
		</div>

		{#if alerts.length === 0}
			<div class="rounded-lg border border-dashed border-slate-300 p-8 text-center">
				<p class="text-slate-500">No alerts yet. Use the chat to create one!</p>
			</div>
		{:else}
			{#if triggeredAlerts.length > 0}
				<div class="mb-6">
					<h2 class="mb-3 text-lg font-semibold text-green-700">
						🎉 Triggered ({triggeredAlerts.length})
					</h2>
					<div class="grid gap-3 sm:grid-cols-2">
						{#each triggeredAlerts as alert (alert.id)}
							<AlertCard {alert} onDelete={handleDelete} onReset={handleReset} />
						{/each}
					</div>
				</div>
			{/if}

			{#if watchingAlerts.length > 0}
				<div>
					<h2 class="mb-3 text-lg font-semibold text-slate-700">
						👀 Watching ({watchingAlerts.length})
					</h2>
					<div class="grid gap-3 sm:grid-cols-2">
						{#each watchingAlerts as alert (alert.id)}
							<AlertCard {alert} onDelete={handleDelete} onReset={handleReset} />
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>

	<div class="lg:col-span-1">
		<div class="sticky top-8 h-[600px]">
			<Chat onAlertCreated={handleAlertCreated} />
		</div>
	</div>
</div>
