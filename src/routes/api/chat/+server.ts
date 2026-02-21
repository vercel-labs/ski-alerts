import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// TODO: Import AI SDK dependencies
// import { createGateway, streamText, tool, stepCountIs } from 'ai';
// import { valibotSchema } from '@ai-sdk/valibot';

// TODO: Import resort data for the system prompt
// import { resorts } from '$lib/data/resorts';

// TODO: Import the shared Valibot schema for tool input
// import { CreateAlertToolInputSchema } from '$lib/schemas/alert';

// TODO: Import environment variables
// import { env } from '$env/dynamic/private';

// TODO: Create the AI Gateway client
// const gateway = createGateway({
//   apiKey: env.AI_GATEWAY_API_KEY ?? ''
// });

// TODO: Define the tool using the Valibot schema
// Use tool() with:
// - inputSchema: valibotSchema(CreateAlertToolInputSchema)
// - execute: async function that validates the resort and returns alert data
// The schema accepts:
// - resortId: string (e.g., "mammoth", "grand-targhee")
// - condition: one of:
//   - { type: 'snowfall', operator: 'gt'|'gte'|'lt'|'lte', value: number, unit: 'inches' }
//   - { type: 'temperature', operator: 'gt'|'gte'|'lt'|'lte', value: number, unit: 'fahrenheit'|'celsius' }
//   - { type: 'conditions', match: 'powder'|'clear'|'snowing'|'windy' }

export const POST: RequestHandler = async ({ request }) => {
	const { message } = await request.json();

	// TODO: Implement streaming chat with AI SDK
	// 1. Create a system prompt that lists available resorts
	// 2. Use streamText() with the create_alert tool
	// 3. Use stopWhen: stepCountIs(3) to allow multi-step tool use
	// 4. Iterate result.fullStream — handle 'text-delta' and 'tool-result' events
	//    - part.type === 'text-delta' → part.text (the token content)
	//    - part.type === 'tool-result' → part.output (the tool result)
	// 5. Return a streaming response with SSE format

	// Placeholder response for now
	return json(
		{
			error:
				'Chat API not implemented yet. Complete the AI Gateway lesson to enable this feature.'
		},
		{ status: 501 }
	);
};
