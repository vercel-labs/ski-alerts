import { json } from '@sveltejs/kit';
import { resorts, getResort } from '$lib/data/resorts';
import { fetchWeather, fetchAllConditions } from '$lib/services/weather';
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

// Cacheable GET endpoint for current conditions
export const GET: RequestHandler = async () => {
	const conditions = await fetchAllConditions(resorts);

	return json(
		{
			resorts: conditions.map(({ resort, weather }) => ({
				id: resort.id,
				name: resort.name,
				conditions: weather.conditions,
				temperature: weather.temperature,
				snowfall: weather.snowfall24h
			})),
			fetchedAt: new Date().toISOString()
		},
		{
			headers: {
				'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
			}
		}
	);
};

// POST handler for evaluating specific alerts (not cached)
export const POST: RequestHandler = async ({ request }) => {
	const requestId = crypto.randomUUID().slice(0, 8);
	const startTime = Date.now();
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

	console.log(`[Evaluate] Started`, {
		requestId,
		alertCount: alerts.length,
		resorts: [...alertsByResort.keys()]
	});

	// Fetch weather for each resort and evaluate alerts
	for (const [resortId, resortAlerts] of alertsByResort) {
		const resort = getResort(resortId);
		if (!resort) {
			console.warn(`[Evaluate] Resort not found: ${resortId}`, { requestId });
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
			console.error(`[Evaluate] Weather fetch failed for ${resort.name}:`, {
				requestId,
				error: String(error)
			});
		}
	}

	console.log(`[Evaluate] Completed`, {
		requestId,
		duration: Date.now() - startTime,
		evaluated: results.length,
		triggered: results.filter((r) => r.triggered).length
	});

	return json({
		evaluated: results.length,
		triggered: results.filter((r) => r.triggered).length,
		results
	});
};
