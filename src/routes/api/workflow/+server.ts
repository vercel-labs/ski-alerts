import { json } from '@sveltejs/kit';
import { waitUntil } from '@vercel/functions';
import { getResort } from '$lib/data/resorts';
import { fetchWeather } from '$lib/services/weather';
import { evaluateCondition } from '$lib/services/alerts';
import type { Alert } from '$lib/schemas/alert';
import type { RequestHandler } from './$types';

class RetryableError extends Error {
	constructor(
		message: string,
		public retryAfterMs: number = 5000
	) {
		super(message);
		this.name = 'RetryableError';
	}
}

class FatalError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'FatalError';
	}
}

interface WorkflowResult {
	step: string;
	resortId: string;
	alertsEvaluated: number;
	alertsTriggered: string[];
}

async function evaluateResortAlerts(
	resortId: string,
	alerts: Alert[]
): Promise<WorkflowResult> {
	const resort = getResort(resortId);

	if (!resort) {
		throw new FatalError(`Resort not found: ${resortId}`);
	}

	let weather;
	try {
		weather = await fetchWeather(resort);
	} catch (error) {
		// Weather API failures are retryable
		throw new RetryableError(
			`Failed to fetch weather for ${resort.name}: ${error}`,
			10000
		);
	}

	const triggeredIds: string[] = [];

	for (const alert of alerts) {
		const triggered = evaluateCondition(alert.condition, weather);
		if (triggered && !alert.triggered) {
			triggeredIds.push(alert.id);
		}
	}

	return {
		step: `evaluate-${resortId}`,
		resortId,
		alertsEvaluated: alerts.length,
		alertsTriggered: triggeredIds
	};
}

export const POST: RequestHandler = async ({ request }) => {
	const startTime = Date.now();
	const requestId = crypto.randomUUID().slice(0, 8);
	const { alerts } = (await request.json()) as { alerts: Alert[] };

	if (!alerts || !Array.isArray(alerts)) {
		return json({ error: 'alerts array required' }, { status: 400 });
	}

	// Group alerts by resort
	const alertsByResort = new Map<string, Alert[]>();
	for (const alert of alerts) {
		const existing = alertsByResort.get(alert.resortId) || [];
		existing.push(alert);
		alertsByResort.set(alert.resortId, existing);
	}

	console.log(`[Workflow] Started`, {
		requestId,
		alertCount: alerts.length,
		resorts: [...alertsByResort.keys()]
	});

	const results: WorkflowResult[] = [];
	const errors: Array<{ resortId: string; error: string; retryable: boolean }> = [];

	// Process all resorts in parallel
	const entries = [...alertsByResort.entries()];
	const workflowPromise = (async () => {
		const settled = await Promise.allSettled(
			entries.map(([resortId, resortAlerts]) =>
				evaluateResortAlerts(resortId, resortAlerts)
			)
		);

		for (let i = 0; i < settled.length; i++) {
			const outcome = settled[i];
			const [resortId] = entries[i];

			if (outcome.status === 'fulfilled') {
				results.push(outcome.value);
				console.log(`[Workflow] Step completed: ${outcome.value.step}`, {
					requestId,
					evaluated: outcome.value.alertsEvaluated,
					triggered: outcome.value.alertsTriggered.length
				});
			} else {
				const error = outcome.reason;
				if (error instanceof RetryableError) {
					errors.push({
						resortId,
						error: error.message,
						retryable: true
					});
					console.warn(`[Workflow] Retryable error for ${resortId}:`, {
						requestId,
						message: error.message
					});
				} else if (error instanceof FatalError) {
					errors.push({
						resortId,
						error: error.message,
						retryable: false
					});
					console.error(`[Workflow] Fatal error for ${resortId}:`, {
						requestId,
						message: error.message
					});
				} else {
					errors.push({
						resortId,
						error: String(error),
						retryable: false
					});
				}
			}
		}
	})();

	// Use waitUntil to ensure the workflow completes even if the response is sent
	waitUntil(workflowPromise);

	// Wait for completion before responding
	await workflowPromise;

	const allTriggered = results.flatMap((r) => r.alertsTriggered);

	console.log(`[Workflow] Completed`, {
		requestId,
		duration: Date.now() - startTime,
		resortsProcessed: results.length,
		alertsTriggered: allTriggered.length,
		errors: errors.length
	});

	return json({
		success: true,
		duration: Date.now() - startTime,
		summary: {
			resortsProcessed: results.length,
			alertsEvaluated: results.reduce((sum, r) => sum + r.alertsEvaluated, 0),
			alertsTriggered: allTriggered.length,
			errors: errors.length
		},
		triggeredAlertIds: allTriggered,
		results,
		errors: errors.length > 0 ? errors : undefined
	});
};
