# Ski Alerts (Complete)

This is the `complete` branch with the finished implementation for the [Svelte on Vercel](https://vercel.com/academy) course. Switch to `main` for the starter code.

## Getting Started

```bash
npm install
cp .env.example .env  # Add your AI_GATEWAY_API_KEY
npm run dev
```

## What's Implemented

- **Streaming AI chat** with tool calling for natural language alert creation
- **Structured output** parsing natural language into validated alert data
- **Background workflows** with `waitUntil()`, `Promise.allSettled`, and error classification
- **ISR caching** on the conditions dashboard
- **Centralized AI provider** with usage tracking middleware
- **Observability** with structured logging and request IDs
- **Performance** with Cache-Control headers on API routes

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Streaming AI chat with alert creation tools |
| `/api/parse-alert` | POST | Structured output from natural language |
| `/api/evaluate` | GET, POST | Alert evaluation against live weather |
| `/api/workflow` | POST | Durable background workflow |
| `/api/health` | GET | Edge runtime health check |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AI_GATEWAY_API_KEY` | API key for the AI Gateway |
