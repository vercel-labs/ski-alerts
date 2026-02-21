import { json } from '@sveltejs/kit';
import { resorts, getResort } from '$lib/data/resorts';
import { fetchWeather } from '$lib/services/weather';
import { evaluateCondition } from '$lib/services/alerts';
import type { Alert } from '$lib/schemas/alert';
import type { RequestHandler } from './$types';

interface EvaluationResult {
	alertId: string;
	resortId: string;
	resortName: string;
	triggered: boolean;
	condition: Alert['condition'];
	weather: {
		temperature: number;
		snowfall: number;
		conditions: string;
	};
}

export const POST: RequestHandler = async ({ request }) => {
	const { alerts } = (await request.json()) as { alerts: Alert[] };

	if (!alerts || !Array.isArray(alerts)) {
		return json({ error: 'alerts array required' }, { status: 400 });
	}

	const results: EvaluationResult[] = [];

	// Group alerts by resort to minimize API calls
	const alertsByResort = new Map<string, Alert[]>();
	for (const alert of alerts) {
		const existing = alertsByResort.get(alert.resortId) || [];
		existing.push(alert);
		alertsByResort.set(alert.resortId, existing);
	}

	// Fetch weather for each resort and evaluate alerts
	for (const [resortId, resortAlerts] of alertsByResort) {
		const resort = getResort(resortId);
		if (!resort) {
			console.warn(`Resort not found: ${resortId}`);
			continue;
		}

		try {
			const weather = await fetchWeather(resort);

			for (const alert of resortAlerts) {
				const triggered = evaluateCondition(alert.condition, weather);

				results.push({
					alertId: alert.id,
					resortId: alert.resortId,
					resortName: resort.name,
					triggered,
					condition: alert.condition,
					weather: {
						temperature: weather.temperature,
						snowfall: weather.snowfall24h,
						conditions: weather.conditions
					}
				});
			}
		} catch (error) {
			console.error(`Failed to fetch weather for ${resort.name}:`, error);
			// Continue with other resorts
		}
	}

	return json({
		evaluated: results.length,
		triggered: results.filter((r) => r.triggered).length,
		results
	});
};
