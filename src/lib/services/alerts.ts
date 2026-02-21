import { browser } from '$app/environment';
import type { Alert, AlertCondition, CreateAlert } from '$lib/schemas/alert';
import type { WeatherData } from './weather';

const STORAGE_KEY = 'ski-alerts';

function generateId(): string {
	return crypto.randomUUID();
}

export function getAlerts(): Alert[] {
	if (!browser) return [];
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored ? JSON.parse(stored) : [];
}

export function saveAlerts(alerts: Alert[]): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

export function createAlert(data: CreateAlert): Alert {
	const alert: Alert = {
		id: generateId(),
		resortId: data.resortId,
		condition: data.condition,
		originalQuery: data.originalQuery,
		createdAt: new Date().toISOString(),
		triggered: false
	};

	const alerts = getAlerts();
	alerts.push(alert);
	saveAlerts(alerts);

	return alert;
}

export function deleteAlert(id: string): void {
	const alerts = getAlerts().filter((a) => a.id !== id);
	saveAlerts(alerts);
}

export function resetAlert(id: string): void {
	const alerts = getAlerts().map((a) =>
		a.id === id ? { ...a, triggered: false, triggeredAt: undefined } : a
	);
	saveAlerts(alerts);
}

export function evaluateCondition(condition: AlertCondition, weather: WeatherData): boolean {
	switch (condition.type) {
		case 'snowfall': {
			const value = weather.snowfall24h;
			switch (condition.operator) {
				case 'gt':
					return value > condition.value;
				case 'gte':
					return value >= condition.value;
				case 'lt':
					return value < condition.value;
				case 'lte':
					return value <= condition.value;
			}
			break;
		}
		case 'temperature': {
			let value = weather.temperature;
			if (condition.unit === 'celsius') {
				value = ((value - 32) * 5) / 9;
			}
			switch (condition.operator) {
				case 'gt':
					return value > condition.value;
				case 'gte':
					return value >= condition.value;
				case 'lt':
					return value < condition.value;
				case 'lte':
					return value <= condition.value;
			}
			break;
		}
		case 'conditions': {
			if (condition.match === 'powder') {
				return weather.snowfall24h > 0 || weather.conditions === 'snowing';
			}
			return weather.conditions === condition.match;
		}
	}
	return false;
}

export function markAlertTriggered(id: string): void {
	const alerts = getAlerts().map((a) =>
		a.id === id ? { ...a, triggered: true, triggeredAt: new Date().toISOString() } : a
	);
	saveAlerts(alerts);
}
