import { json } from '@sveltejs/kit';

export const GET = () => {
    return json({ status: 'ok', message: 'Ski Alerts API is alive' });
};
