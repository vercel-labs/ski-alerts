import type { RequestHandler } from './$types';

export const config = {
	runtime: 'nodejs24.x'
};

export const GET: RequestHandler = async () => {
	return Response.json({
		status: 'ok',
		runtime: 'nodejs24.x',
		timestamp: new Date().toISOString()
	});
};
