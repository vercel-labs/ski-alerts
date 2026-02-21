import type { Resort } from '$lib/data/resorts';

export interface WeatherData {
	temperature: number;
	snowfall: number;
	snowfall24h: number;
	snowDepth: number;
	conditions: 'clear' | 'snowing' | 'cloudy' | 'windy';
	windSpeed: number;
	humidity: number;
	fetchedAt: string;
}

export interface ResortConditions {
	resort: Resort;
	weather: WeatherData;
}

interface OpenMeteoResponse {
	current: {
		temperature_2m: number;
		snowfall: number;
		weather_code: number;
		wind_speed_10m: number;
		relative_humidity_2m: number;
		snow_depth: number;
	};
	daily: {
		snowfall_sum: number[];
	};
}

function weatherCodeToConditions(code: number, windSpeed: number): WeatherData['conditions'] {
	if (windSpeed > 30) return 'windy';
	if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snowing';
	if ([0, 1].includes(code)) return 'clear';
	return 'cloudy';
}

export async function fetchWeather(resort: Resort): Promise<WeatherData> {
	const { lat, lon } = resort.location;

	const url = new URL('https://api.open-meteo.com/v1/forecast');
	url.searchParams.set('latitude', lat.toString());
	url.searchParams.set('longitude', lon.toString());
	url.searchParams.set('elevation', resort.elevation.summit.toString());
	url.searchParams.set(
		'current',
		'temperature_2m,snowfall,weather_code,wind_speed_10m,relative_humidity_2m,snow_depth'
	);
	url.searchParams.set('daily', 'snowfall_sum');
	url.searchParams.set('forecast_days', '1');
	url.searchParams.set('temperature_unit', 'fahrenheit');
	url.searchParams.set('wind_speed_unit', 'mph');
	url.searchParams.set('precipitation_unit', 'inch');

	const response = await fetch(url.toString());

	if (!response.ok) {
		throw new Error(`Weather API error: ${response.status}`);
	}

	const data: OpenMeteoResponse = await response.json();
	const snowfall24h = data.daily?.snowfall_sum?.[0] ?? 0;

	return {
		temperature: Math.round(data.current.temperature_2m),
		snowfall: data.current.snowfall,
		snowfall24h: Math.round(snowfall24h * 10) / 10,
		snowDepth: Math.round(data.current.snow_depth * 10) / 10,
		conditions: weatherCodeToConditions(data.current.weather_code, data.current.wind_speed_10m),
		windSpeed: Math.round(data.current.wind_speed_10m),
		humidity: data.current.relative_humidity_2m,
		fetchedAt: new Date().toISOString()
	};
}

export async function fetchAllConditions(resorts: Resort[]): Promise<ResortConditions[]> {
	const results = await Promise.all(
		resorts.map(async (resort) => {
			const weather = await fetchWeather(resort);
			return { resort, weather };
		})
	);
	return results;
}
