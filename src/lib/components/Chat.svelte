<script lang="ts">
	import { resorts } from '$lib/data/resorts';
	import { createAlert } from '$lib/services/alerts';
	import type { AlertCondition } from '$lib/schemas/alert';

	interface Props {
		onAlertCreated: () => void;
	}

	let { onAlertCreated }: Props = $props();

	let input = $state('');
	let messages = $state<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
	let isLoading = $state(false);
	let lastUserMessage = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		const userMessage = input.trim();
		lastUserMessage = userMessage;
		input = '';
		messages = [...messages, { role: 'user', content: userMessage }];
		isLoading = true;

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: userMessage })
			});

			if (!response.ok) {
				throw new Error('Failed to get response');
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			let assistantMessage = '';

			messages = [...messages, { role: 'assistant', content: '' }];

			while (reader) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n');

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const data = line.slice(6);
						if (data === '[DONE]') continue;

						try {
							const parsed = JSON.parse(data);
							if (parsed.type === 'text') {
								assistantMessage += parsed.content;
								messages = [
									...messages.slice(0, -1),
									{ role: 'assistant', content: assistantMessage }
								];
							} else if (parsed.type === 'alert_created' && parsed.alert) {
								// Save the alert to localStorage
								createAlert({
									resortId: parsed.alert.resortId,
									condition: parsed.alert.condition as AlertCondition,
									originalQuery: lastUserMessage
								});
								onAlertCreated();
							}
						} catch {
							// Skip non-JSON lines
						}
					}
				}
			}
		} catch (error) {
			messages = [
				...messages,
				{
					role: 'assistant',
					content: 'Sorry, something went wrong. Please try again.'
				}
			];
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex h-full flex-col rounded-lg border border-slate-200 bg-white">
	<div class="border-b border-slate-200 p-4">
		<h2 class="font-semibold text-slate-900">Create Alert</h2>
		<p class="text-sm text-slate-500">
			Tell me what conditions you want to track, like "alert me when Mammoth gets fresh powder"
		</p>
	</div>

	<div class="flex-1 overflow-y-auto p-4">
		{#if messages.length === 0}
			<div class="space-y-2 text-sm text-slate-500">
				<p>Try something like:</p>
				<ul class="list-inside list-disc space-y-1">
					<li>"Notify me when Grand Targhee gets more than 6 inches of snow"</li>
					<li>"Alert me when it's snowing at Steamboat"</li>
					<li>"Let me know when Mammoth drops below 20°F"</li>
				</ul>
				<p class="mt-4">Available resorts:</p>
				<ul class="list-inside list-disc">
					{#each resorts as resort (resort.id)}
						<li>{resort.name}</li>
					{/each}
				</ul>
			</div>
		{:else}
			<div class="space-y-4">
				{#each messages as message, i (i)}
					<div
						class="rounded-lg p-3 {message.role === 'user'
							? 'ml-8 bg-blue-50 text-blue-900'
							: 'mr-8 bg-slate-50 text-slate-900'}"
					>
						<p class="whitespace-pre-wrap text-sm">{message.content}</p>
					</div>
				{/each}
				{#if isLoading && messages[messages.length - 1]?.role === 'user'}
					<div class="mr-8 rounded-lg bg-slate-50 p-3">
						<div class="flex items-center gap-2 text-sm text-slate-500">
							<span class="inline-block h-2 w-2 animate-pulse rounded-full bg-slate-400"></span>
							Thinking...
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<form onsubmit={handleSubmit} class="border-t border-slate-200 p-4">
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={input}
				placeholder="Describe the alert you want to create..."
				disabled={isLoading}
				class="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-slate-50"
			/>
			<button
				type="submit"
				disabled={isLoading || !input.trim()}
				class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
			>
				Send
			</button>
		</div>
	</form>
</div>
