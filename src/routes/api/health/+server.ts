import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const config = {
	runtime: 'edge'
};

export const GET: RequestHandler = async () => {
	return json({
		status: 'ok',
		runtime: 'edge',
		timestamp: new Date().toISOString()
	});
};
