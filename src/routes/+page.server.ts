import { resorts } from '$lib/data/resorts';
import { fetchAllConditions } from '$lib/services/weather';
import type { PageServerLoad } from './$types';

// TODO: Add ISR configuration for caching
// export const config = {
//   isr: {
//     expiration: 300 // Revalidate every 5 minutes
//   }
// };

export const load: PageServerLoad = async () => {
	const conditions = await fetchAllConditions(resorts);

	return {
		conditions,
		fetchedAt: new Date().toISOString()
	};
};
