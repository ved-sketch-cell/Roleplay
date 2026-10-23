# ROLEPLAY conversation bots

Conversations contains four clearly labelled bot previews: Muse (creativity), Orbit (ideas and questions), Pixel (product/design thinking), and Quest (playful starters). All / People / AI bots filters keep them distinct from the existing fictional people. Each bot has its own illustrated avatar, starters, message history and unsent draft. Search opens the exact bot. Clearing a bot removes only that conversation and its draft.

## Current deployment

The hosted app is static and has no configured AI provider or model backend. Preview replies are written examples selected locally; the UI marks them as samples. Preview messages remain in the browser. This update adds the bot UI and a tested live-reply client adapter, not an AI inference service.

## Live-reply contract

Before enabling live mode, implement and deploy a same-origin backend endpoint. Then set the non-secret build variable `VITE_ROLEPLAY_AI_ENDPOINT` to an `/api/` path such as `/api/ai-chat`. External URLs, protocol-relative URLs, fragments, and redirects are rejected. Never put an API key in a `VITE_` variable or browser source. Keep model credentials on the server.

The client sends `POST` JSON with these fields:

```json
{
  "botId": "pixel",
  "requestId": "client-message-uuid",
  "messages": [
    {"role": "user", "content": "Help me simplify a user flow."}
  ]
}
```

Only the last twelve messages from the selected bot conversation are included. People chats, profile settings, mood, boundaries, and identity fields are not added to this payload. The backend should authenticate the visitor, validate the bot allowlist and message size, enforce rate limits, and use `requestId` for idempotency. Select each bot's system instructions on the server; never accept browser-supplied system messages. Keep the bot's role explicit, replies concise, and model limitations visible.

Successful model responses must use this contract:

```json
{"source":"ai","reply":"A model-generated reply, at most 4,000 characters."}
```

The UI rejects missing, empty, oversized, malformed, or sample-labelled live responses. Errors preserve the user's message. Retry reuses its request ID and does not duplicate it. The thirty-second timeout, Stop control, route unmount, and clearing history abort pending requests; a late response cannot restore cleared data. Provider storage is separate from deleting local browser history and must be handled by the backend's data controls.

## Validation

The 44 journey groups cover 102 route renders, all four preview chats, filtering, starters, keyboard sending, drafts, refresh, search, modal cancellation, deletion, and isolation from people chats. Mocked endpoint tests cover payload minimisation, live reply validation, rate errors, retry without duplicates, Stop and late-response protection. They do not verify an actual model provider. TypeScript and the production build are checked separately. The four avatars were rendered and inspected; real-browser and phone layout checks remain outstanding in this environment.
