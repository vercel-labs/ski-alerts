# Ski Alerts

A SvelteKit app that tracks ski resort conditions and creates personalized alerts using AI. This is the starter project for the [Svelte on Vercel](https://vercel.com/academy) course.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fski-alerts&env=AI_GATEWAY_API_KEY&envDescription=API%20key%20for%20the%20AI%20Gateway&project-name=ski-alerts)

## Getting Started

```bash
npm install
cp .env.example .env  # Add your AI_GATEWAY_API_KEY
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the app.

## What's Already Built

The UI, data layer, and routing are ready to go:

- **Conditions dashboard** showing live weather for 5 ski resorts
- **Alerts page** with localStorage persistence
- **Chat interface** wired up and waiting for a streaming endpoint
- **Resort data** for Mammoth, Palisades Tahoe, Grand Targhee, Steamboat, and Mt. Bachelor
- **Weather service** pulling from Open-Meteo (free, no API key needed)
- **Alert schemas** validated with Valibot

## What You'll Build

Look for `// TODO:` comments in the codebase. Throughout the course, you'll implement:

1. **AI chat endpoint** (`src/routes/api/chat/+server.ts`): Streaming responses with tool calling
2. **Structured output** (`src/routes/api/parse-alert/+server.ts`): Natural language to structured alert data
3. **Background workflow** (`src/routes/api/workflow/+server.ts`): Durable execution with error handling
4. **ISR caching** (`src/routes/+page.server.ts`): Incremental Static Regeneration for the dashboard
5. **AI provider** (`src/lib/ai/provider.ts`): Centralized model config with usage tracking

## Project Structure

```
src/
├── lib/
│   ├── ai/              # AI provider config (TODO)
│   ├── components/      # ResortCard, AlertCard, Chat
│   ├── data/            # Resort metadata
│   ├── schemas/         # Alert Valibot schemas
│   └── services/        # Weather API, alert evaluation
├── routes/
│   ├── +page.svelte     # Conditions dashboard
│   ├── alerts/          # My Alerts page
│   └── api/
│       ├── chat/        # AI streaming endpoint (TODO)
│       ├── evaluate/    # Alert evaluation
│       ├── parse-alert/ # Structured output (TODO)
│       └── workflow/    # Background workflow (TODO)
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AI_GATEWAY_API_KEY` | API key for the AI Gateway (required for AI features) |

## Complete Reference

Switch to the `complete` branch to see the finished implementation:

```bash
git checkout complete
```

## Tech Stack

- [SvelteKit](https://svelte.dev/) with [adapter-vercel](https://github.com/sveltejs/kit/tree/main/packages/adapter-vercel)
- [AI SDK v6](https://sdk.vercel.ai/) for streaming chat and tool calling
- [Valibot](https://valibot.dev/) for schema validation
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Open-Meteo](https://open-meteo.com/) for weather data
