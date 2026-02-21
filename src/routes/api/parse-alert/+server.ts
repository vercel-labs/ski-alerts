import { json } from '@sveltejs/kit';
import { generateText, Output } from 'ai';
import { valibotSchema } from '@ai-sdk/valibot';
import * as v from 'valibot';
import { resorts } from '$lib/data/resorts';
import { CreateAlertToolInputSchema, AlertConditionSchema } from '$lib/schemas/alert';
import { getModel } from '$lib/ai/provider';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { query } = await request.json();

	if (!query || typeof query !== 'string') {
		return json({ error: 'query string required' }, { status: 400 });
	}

	const resortList = resorts.map((r) => `- ${r.name} (id: ${r.id})`).join('\n');

	const { output } = await generateText({
		model: getModel(),
		output: Output.object({ schema: valibotSchema(CreateAlertToolInputSchema) }),
		prompt: `Parse this natural language alert request into structured data.

Available resorts:
${resortList}

Map common phrases:
- "fresh powder", "pow", "new snow" → conditions type with match: "powder"
- "snowing", "snowfall" with no amount → conditions type with match: "snowing"
- Specific amounts like "6 inches" → snowfall type with operator
- Temperature references → temperature type with operator

User request: "${query}"`
	});

	if (!output) {
		return json({ error: 'AI returned no structured output' }, { status: 422 });
	}

	// Validate the condition with Valibot for runtime type safety
	try {
		v.parse(AlertConditionSchema, output.condition);
	} catch {
		return json({ error: 'AI returned invalid condition structure' }, { status: 422 });
	}

	const resort = resorts.find((r) => r.id === output.resortId);

	return json({
		resortId: output.resortId,
		resortName: resort?.name ?? output.resortId,
		condition: output.condition,
		originalQuery: query
	});
};
