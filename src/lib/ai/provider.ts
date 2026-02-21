import { createGateway, wrapLanguageModel } from 'ai';
import { env } from '$env/dynamic/private';

const gateway = createGateway({
	apiKey: env.AI_GATEWAY_API_KEY ?? ''
});

const PRIMARY_MODEL = 'anthropic/claude-sonnet-4';
const FALLBACK_MODEL = 'anthropic/claude-haiku-4.5';

function withUsageTracking(model: ReturnType<typeof gateway>) {
	return wrapLanguageModel({
		model,
		middleware: {
			specificationVersion: 'v3',
			wrapGenerate: async ({ doGenerate }) => {
				const result = await doGenerate();
				if (result.usage) {
					const input = result.usage.inputTokens.total ?? 0;
					const output = result.usage.outputTokens.total ?? 0;
					console.log(`[AI Usage] Input tokens: ${input}`);
					console.log(`[AI Usage] Output tokens: ${output}`);
					console.log(`[AI Usage] Total tokens: ${input + output}`);
				}
				return result;
			}
		}
	});
}

export function getModel() {
	return withUsageTracking(gateway(PRIMARY_MODEL));
}

export function getFallbackModel() {
	return withUsageTracking(gateway(FALLBACK_MODEL));
}

export { PRIMARY_MODEL, FALLBACK_MODEL };
