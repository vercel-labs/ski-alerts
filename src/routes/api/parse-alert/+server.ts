import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// TODO: Import AI SDK dependencies
// import { createGateway, generateText, Output } from 'ai';
// import { valibotSchema } from '@ai-sdk/valibot';
// import * as v from 'valibot';

// TODO: Import resort data and schemas
// import { resorts } from '$lib/data/resorts';
// import { CreateAlertToolInputSchema, AlertConditionSchema } from '$lib/schemas/alert';
// import { env } from '$env/dynamic/private';

// TODO: Create the AI Gateway client

// TODO: Use generateText() with Output.object() for structured output
// AI SDK v6 uses generateText() with an output option:
//   const { output } = await generateText({
//     model: gateway('anthropic/claude-sonnet-4'),
//     output: Output.object({ schema: valibotSchema(CreateAlertToolInputSchema) }),
//     prompt: `...`
//   });

export const POST: RequestHandler = async ({ request }) => {
	const { query } = await request.json();

	if (!query || typeof query !== 'string') {
		return json({ error: 'query string required' }, { status: 400 });
	}

	// TODO: Implement structured output with generateText() + Output.object()
	// 1. Use generateText() with output: Output.object({ schema: valibotSchema(...) })
	// 2. Include available resorts in the prompt
	// 3. Destructure { output } from the result
	// 4. Validate the result with Valibot's parse()
	// 5. Return the parsed alert data

	return json(
		{
			error:
				'Parse alert API not implemented yet. Complete the Structured Output lesson to enable this feature.'
		},
		{ status: 501 }
	);
};
