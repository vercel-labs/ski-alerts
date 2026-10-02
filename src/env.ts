import { defineEnvVars } from '@sveltejs/kit/env';
import * as v from 'valibot';

export const variables = defineEnvVars({
	AI_GATEWAY_API_KEY: { schema: v.optional(v.string(), '') }
});
