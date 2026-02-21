<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head>
	<title>Ski Alerts</title>
	<meta name="description" content="Track ski conditions and get personalized alerts" />
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<nav class="border-b border-slate-200 bg-white">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
			<a href={resolve("/")} class="text-xl font-bold text-slate-900">
				⛷️ Ski Alerts
			</a>
			<div class="flex gap-6">
				<a
					href={resolve("/")}
					class="text-sm font-medium {page.url.pathname === '/'
						? 'text-blue-600'
						: 'text-slate-600 hover:text-slate-900'}"
				>
					Conditions
				</a>
				<a
					href={resolve("/alerts")}
					class="text-sm font-medium {page.url.pathname === '/alerts'
						? 'text-blue-600'
						: 'text-slate-600 hover:text-slate-900'}"
				>
					My Alerts
				</a>
			</div>
		</div>
	</nav>

	<main class="mx-auto max-w-6xl px-4 py-8">
		{@render children()}
	</main>
</div>
