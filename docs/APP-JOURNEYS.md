# ROLEPLAY app journeys

The original mobile app now uses a single validated hash router in `src/app/mobile`. A screen change writes one history entry; Back and browser history restore the prior screen. Reload opens the same route. Invalid links show a recovery action. The five primary destinations remain available throughout the app.

## Completed journeys

| Journey | Outcome and return path |
| --- | --- |
| Discover → category → interests → conversation preferences → sample matches | Interest search and category changes retain choices; Continue stays above bottom navigation; preferences save; skipped preferences work; chat opens the chosen person; refining retains selection |
| Daily Deck → selected conversation → Deck | Prompt is inserted once in the chosen chat; reply context, unsent drafts, profile navigation, filters and saved prompts survive return |
| Profile → interests | Existing interests in other categories survive editing; completion returns to Profile |
| Profile → Vibe / Mindset / Boundaries | Own profile has explicit edit, save and cancel; optional fields, scales, values and mutually exclusive topic preferences persist on device; Escape discards edits |
| Other-person profile → edit your preferences → conversation | Editing applies only to your own profile; returning preserves the other person’s sample data and your chat draft |
| Discover questionnaire | Purple answer selection and Next action; footer remains separate from scrolling questions; radio keyboard navigation, single-question skipping, saved answers, backward revision and later-answer retention |
| Challenges | Six activities across Boundaries, Connection and Reset; light or stretch pace, draft → review → saved plan → self-reported tried; pause/resume, edit, optional reflection, category filters and boundary settings return path |
| Chat → conversation profile → starter → Chat | Correct person, unsent draft and message history survive navigation; starter populates the message field |
| Conversation bots | Four labelled previews; All / People / AI bots filters; exact search routes; starters, sample replies, per-bot history and drafts, confirmed clearing; live endpoint adapter with retry/abort handling |
| Chat actions | Reactions, device reports with references, confirmed block/unblock, saved mood; simulated calls are labeled |
| Search → feature | Exact Grow/Heal screen opens without a competing history Back |
| Access codes | Numeric validation, own/unknown-code recovery, sample lookup, real QR link, clipboard/share fallbacks |
| Quiz | Answer validation, next question, result, review, retry and saved completion; reward is awarded once |
| Media literacy | Assessment, evidence expansion, saved perspectives, likes, sharing and device report |
| Event | Saved RSVP/reminder preference, agenda, sample participant chats and saved discussion |
| Live rooms | Correct room, room chat/poll/likes, creation → preview → sample session → rooms; saved draft and edit path |
| Chat games | Clear introductions, one step at a time, goal filters, saved drafts, pause/resume, editable results and replay; all sixteen complete and rewards do not duplicate |
| Quick chat games | Searchable picker; all twelve tools reach a saved outcome; Story Chain completes three writing turns, predictions have no stakes and honest answers have no fabricated score |
| Grow | Saved drafts and progression; staircase continues through all five levels; journal node unlocks; empathy scoring resumes after leaving; writing finishes locally |
| Heal | Saved check-ins and controls; Kintsugi fills every remaining crack and completes; reflective submissions have immediate device outcomes |
| Affinity and XP | Sample connections and guild actions navigate; purchases charge once and open a destination; insufficient XP disables purchase |
| Settings | Persistent preferences, completed activities, blocked conversation management, saved report references and device data export |

| Anonymous counselling | Challenges entry and search destination; topic, text/voice, duration, language, flexible/preferred timing; local draft resume; preview request review, edit, cancellation and deletion |

## Data and service boundaries

Anonymous counselling is a user-facing session planning preview. No provider, appointment system, payment, voice service, or professional chat is connected. Alias and optional notes stay in the browser; drafts and requests can be deleted. No real-name field, mood inference, imported chat history, or XP reward is used. Text/voice and language are preferences only.

Bot previews use written sample replies on the device. No live AI provider or inference backend is configured. The optional client adapter sends only selected bot messages to a configured same-origin server endpoint; actual model integration still needs a backend and server-held provider credentials.

The Home mood check-in has been removed. Per-conversation mood sharing remains available.

Original mobile app progress uses `localStorage` with namespaced keys and Set serialization. The UI explains device-only data, simulated rooms/calls, fictional people, and local reports. It does not claim these actions reach a server. The separately supplied full-stack export keeps its real backend-connected account, recommendations, WebSocket chat, recovery, moderation and notification screens.

## Validation

`pnpm run test:journeys` runs 44 DOM journey groups, opens 102 routes, and completes all 16 chat games and all 6 challenges. It checks history, refresh/remount persistence, exact destinations, invalid links, single-award rewards, lookup validation, saved discussions, reports, block/unblock, wizard transitions, journal/staircase/Kintsugi progression, identity styling, explicit profile saves and cancellations, questionnaire skipping and answer revision, challenge plans versus attempts, counselling request validation, draft resume, editing without duplicates, cancellation, deletion, modal focus, sharing fallbacks, and bot conversation flows with mocked endpoint failure/retry/abort checks. `pnpm run typecheck` and the production build are required too.

These checks use jsdom; no browser engine or real device visual layout is exercised. Small-screen layout changes keep activity inputs and Continue buttons inside the content region so they do not cover the primary navigation. The tests verify that Interest, game, challenge, counselling, bot-chat and questionnaire footers are separate from their scrolling bodies. Real-device viewport, keyboard and assistive-technology testing remain a release check. No new backend integration or live voice/video broadcasting is introduced by this UI repair.
