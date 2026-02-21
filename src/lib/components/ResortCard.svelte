<script lang="ts">
	import type { Resort } from '$lib/data/resorts';
	import type { WeatherData } from '$lib/services/weather';

	interface Props {
		resort: Resort;
		weather?: WeatherData;
	}

	let { resort, weather }: Props = $props();

	function getConditionEmoji(conditions: WeatherData['conditions']): string {
		switch (conditions) {
			case 'snowing':
				return '🌨️';
			case 'clear':
				return '☀️';
			case 'windy':
				return '💨';
			case 'cloudy':
				return '☁️';
		}
	}
</script>

<div class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
	<div class="mb-4 flex items-start justify-between">
		<div>
			<h3 class="text-lg font-semibold text-slate-900">{resort.name}</h3>
			<p class="text-sm text-slate-500">{resort.location.state}</p>
		</div>
		{#if weather}
			<span class="text-3xl">{getConditionEmoji(weather.conditions)}</span>
		{/if}
	</div>

	{#if weather}
		<div class="mb-4 grid grid-cols-2 gap-4">
			<div>
				<p class="text-2xl font-bold text-slate-900">{weather.temperature}°F</p>
				<p class="text-xs text-slate-500">Summit Temp</p>
			</div>
			<div>
				<p class="text-2xl font-bold text-blue-600">{weather.snowfall24h}"</p>
				<p class="text-xs text-slate-500">24h Snowfall</p>
			</div>
		</div>
		<div class="flex flex-wrap gap-4 text-sm text-slate-600">
			<span>🏔️ {weather.snowDepth}" base</span>
			<span>💨 {weather.windSpeed} mph</span>
			<span>💧 {weather.humidity}%</span>
		</div>
	{:else}
		<div class="py-4 text-center text-slate-400">Loading conditions...</div>
	{/if}

	<div class="mt-4 border-t border-slate-100 pt-4">
		<div class="flex justify-between text-xs text-slate-500">
			<span>⛷️ {resort.trails} trails</span>
			<span>🚡 {resort.lifts} lifts</span>
			<span>⛰️ {resort.elevation.summit.toLocaleString()}ft</span>
		</div>
	</div>
</div>
