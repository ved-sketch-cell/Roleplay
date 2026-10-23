# Preference recommendations

## Scope

The engine finds consenting users with overlapping declared preferences. A displayed percentage is a similarity score, not a prediction of relationship success, mood, personality, trust, or mental health. No private-chat analysis or inferred psychographic attributes are used.

Eligibility is checked before ranking: both people must have active accounts and discovery enabled; candidates must share at least one interest, language, and contact mode; the requester is excluded; a block or dismissal in either direction excludes the pair. Feedback requests re-check eligibility, including an opt-out since the result was shown.

## Scoring

| Declared dimension | Base weight | Comparison |
| --- | --- | --- |
| Interests | 55% | Set overlap divided by set union (Jaccard) |
| Conversation goals | 20% | Jaccard |
| Languages | 10% | Jaccard |
| Communication style | 10% | Same declared style or candidate's flexible preference |
| Group preference | 5% | Same declared group preference or candidate's flexible preference |

Missing goals and the caller's flexible style/group dimensions are removed and the remaining weights are renormalized. Scores may be directional when people declare different constraints. PostgreSQL computes the score and ranks the eligible set before applying the result limit (1–20). Ties use UUID order; display scores are rounded to one decimal place. Tags are Unicode-normalized, case-normalized, trimmed, and deduplicated. Synonyms such as “AI” and “artificial intelligence” currently remain distinct.

`interested` feedback is saved for later evaluation; it does not send messages, notify a person, or influence the current ranking. A separate connection request needs the recipient’s acceptance before chat is permitted. `dismiss` suppresses the pair until that feedback is removed. These actions are distinct from consent to start a conversation.

## API flow

1. `POST /v1/auth/register` with email, password (12–128 characters), and display_name (alias). Send `X-Roleplay-CSRF: 1` for cookie-mutating requests. An allowed browser Origin is required when an Origin header is present.
2. Keep the returned access token in memory and send `Authorization: Bearer ACCESS_TOKEN`. The browser receives a rotating HttpOnly refresh cookie.
3. `PATCH /v1/me/profile` to save preferences and opt into discovery.
4. `GET /v1/recommendations?limit=10` for standard results, or call the tool below.
5. Refresh with `POST /v1/auth/refresh` (cookie and CSRF header); logout with `POST /v1/auth/logout` (bearer and CSRF header). The backend does not trust a caller-supplied account ID.

Example profile update:

```json
{
  "interests": ["design", "technology", "creative coding"],
  "goals": ["learn together", "exchange ideas"],
  "languages": ["english"],
  "contact_modes": ["text"],
  "communication_style": "casual",
  "interaction_preference": "one-on-one",
  "discoverable": true
}
```

## AI-callable function

`GET /v1/tools/recommend-users/schema` returns the exact strict function definition, execution endpoint, authorization requirement, and whether the optional AI adapter is configured. The same definition is included in `docs/recommend-users.tool.json`.

```http
POST /v1/tools/recommend-users
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json
```

```json
{"limit": 5, "min_score": 40, "interests": ["design"]}
```

All three fields are required in the strict AI schema. `interests` can be `null`; otherwise labels must be a subset of the caller's saved interests. The HTTP endpoint also accepts defaults for normal non-AI callers. It rejects unknown fields, account identifiers, arbitrary SQL, and unbounded limits. An external orchestrator must execute the tool under the requesting user's bearer session. Do not give the model credentials or a privileged service token.

The result includes each candidate's alias, public introduction/avatar, user ID, similarity score, shared interests/goals/languages/contact modes, and explanations. It excludes email addresses, session details, credential hashes, and unrelated personal attributes.

## Optional natural-language adapter

```http
POST /v1/ai/recommendations
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json
```

```json
{
  "prompt": "Find five people who share my interest in design",
  "share_preferences_with_ai": true
}
```

The adapter uses OpenAI Responses API strict function calling with a forced `recommend_users` tool, no parallel tool calls, a timeout, and one retry. It sends only the prompt and caller's declared interests/default filter values. `store=False` requests no stored response; it does not override the provider's applicable retention rules. The validated filter is executed by the local recommendation service. Results go directly to the user; candidate profiles are not sent to the model for a second interpretation.

Consent is required for this request. Missing configuration/provider failures return a clear error and the standard endpoint remains available. Unsupported/malformed arguments are rejected. The model cannot change identity, bypass a block, turn discovery on, invent a saved interest, or increase the result limit beyond 20. Provider billing and a model compatible with the strict schema must be configured by the operator.

## Data and improvements

PostgreSQL arrays and GIN indexes support the initial eligibility query. No embeddings or pgvector dependency are needed for this baseline. Add optional semantic topic matching only after collecting opt-in feedback and measuring its benefit. Keep explicit eligibility filters, privacy rules, and server scoring outside the LLM even if the ranking evolves.

Measure accepted connection rate, dismiss/block rate, cold-start coverage, diversity, repeat exposure, and ranking latency. Use versioned offline evaluation and staged experiments rather than assuming a higher similarity score produces a better conversation.

References: [OpenAI function calling](https://developers.openai.com/api/docs/guides/function-calling), [PostgreSQL array operators](https://www.postgresql.org/docs/17/functions-array.html), [SQLAlchemy PostgreSQL dialect](https://docs.sqlalchemy.org/en/20/dialects/postgresql.html).
