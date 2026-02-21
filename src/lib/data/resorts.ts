export interface Resort {
	id: string;
	name: string;
	location: {
		lat: number;
		lon: number;
		state: string;
	};
	elevation: {
		base: number;
		summit: number;
	};
	trails: number;
	lifts: number;
}

export const resorts: Resort[] = [
	{
		id: 'mammoth',
		name: 'Mammoth Mountain',
		location: { lat: 37.6308, lon: -119.0326, state: 'CA' },
		elevation: { base: 7953, summit: 11053 },
		trails: 150,
		lifts: 28
	},
	{
		id: 'palisades',
		name: 'Palisades Tahoe',
		location: { lat: 39.1969, lon: -120.2358, state: 'CA' },
		elevation: { base: 6200, summit: 9050 },
		trails: 270,
		lifts: 37
	},
	{
		id: 'grand-targhee',
		name: 'Grand Targhee',
		location: { lat: 43.7583, lon: -110.9575, state: 'WY' },
		elevation: { base: 8000, summit: 10000 },
		trails: 79,
		lifts: 5
	},
	{
		id: 'steamboat',
		name: 'Steamboat',
		location: { lat: 40.4572, lon: -106.8045, state: 'CO' },
		elevation: { base: 6900, summit: 10568 },
		trails: 169,
		lifts: 18
	},
	{
		id: 'mt-bachelor',
		name: 'Mt. Bachelor',
		location: { lat: 43.9792, lon: -121.6886, state: 'OR' },
		elevation: { base: 5700, summit: 9065 },
		trails: 101,
		lifts: 12
	}
];

export function getResort(id: string): Resort | undefined {
	return resorts.find((r) => r.id === id);
}
