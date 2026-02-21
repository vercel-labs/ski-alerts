import { streamText, tool, stepCountIs } from 'ai';
import { valibotSchema } from '@ai-sdk/valibot';
import { resorts } from '$lib/data/resorts';
import { CreateAlertToolInputSchema } from '$lib/schemas/alert';
import { getModel } from '$lib/ai/provider';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { message } = await request.json();

	const resortList = resorts.map((r) => `- ${r.name} (id: ${r.id})`).join('\n');

	const result = streamText({
		model: getModel(),
		system: `You are a helpful ski conditions assistant. Users want to create alerts for ski resort conditions.

Available resorts:
${resortList}

When a user asks you to create an alert, use the create_alert tool with the appropriate parameters.
Parse natural language like "notify me when Mammoth gets fresh powder" into structured alert conditions.

For "fresh powder" or "new snow", use the conditions type with match: "powder".
For specific snow amounts like "more than 6 inches", use snowfall type with the appropriate operator.
For temperature conditions, use the temperature type.

Always confirm the alert was created and explain what conditions will trigger it.`,
		messages: [{ role: 'user', content: message }],
		tools: {
			create_alert: tool({
				description: 'Create a new alert for ski resort conditions',
				inputSchema: valibotSchema(CreateAlertToolInputSchema),
				execute: async ({ resortId, condition }) => {
					const resort = resorts.find((r) => r.id === resortId);
					if (!resort) {
						return { success: false, error: `Resort "${resortId}" not found` };
					}

					return {
						success: true,
						alert: {
							resortId,
							resortName: resort.name,
							condition,
							message: `Alert created for ${resort.name}`
						}
					};
				}
			})
		},
		stopWhen: stepCountIs(3)
	});

	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			for await (const part of result.fullStream) {
				if (part.type === 'text-delta') {
					controller.enqueue(
						encoder.encode(`data: ${JSON.stringify({ type: 'text', content: part.text })}\n\n`)
					);
				} else if (part.type === 'tool-result') {
					const toolResult = part.output as { success: boolean; alert?: unknown };
					if (toolResult.success && toolResult.alert) {
						controller.enqueue(
							encoder.encode(
								`data: ${JSON.stringify({ type: 'alert_created', alert: toolResult.alert })}\n\n`
							)
						);
					}
				}
			}
			controller.enqueue(encoder.encode('data: [DONE]\n\n'));
			controller.close();
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
