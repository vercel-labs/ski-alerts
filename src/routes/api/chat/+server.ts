import { createGateway, streamText } from "ai";
import { resorts } from "$lib/data/resorts";
import { AI_GATEWAY_API_KEY } from "$env/static/private";
import type { RequestHandler } from "./$types";

const gateway = createGateway({
  apiKey: AI_GATEWAY_API_KEY,
});

export const POST: RequestHandler = async ({ request }) => {
  const { message } = await request.json();

  const resortList = resorts.map((r) => `- ${r.name} (id: ${r.id})`).join("\n");

  const result = streamText({
    model: gateway("anthropic/claude-sonnet-4"),
    system: `You are a helpful ski conditions assistant. Users want to learn about ski resort conditions and alerts.
    Here is a list of available resorts:
    ${resortList}
    Provide helpful information about the resorts and current conditions.
    `,
    messages: [{ role: "user", content: message }],
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const part of result.fullStream) {
        if (part.type === "text-delta") {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "text", content: part.text })}\n\n`,
            ),
          );
        }
      }
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
