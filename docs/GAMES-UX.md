# ROLEPLAY games: concept and interaction redesign

The game library now helps someone choose a small experience by their goal: feel steady, see differently, or connect and play. Each card states its purpose, estimated time, and whether it is solo or uses a written sample partner. XP appears at completion rather than competing with the activity goal.

Every game starts with an explanation and an explicit Start action. The play screen presents one task, one response area, visible progress, and one primary next action. Examples and previous answers stay collapsed until needed. The action bar occupies a separate row above app navigation; the activity content scrolls independently. Short answers are accepted, and optional reflective steps can be skipped.

| Game | Main interaction | Useful ending |
| --- | --- | --- |
| Storm Shelter | Three small supports, with a labelled sample partner | A three-part shelter |
| Base Camp | One challenge, one controllable part, one next action | A next-step plan |
| Phoenix Workshop | Imagine an object, repair it, connect the story to a fresh start | A repair story |
| Bridge Builders | Three supports with a labelled sample contribution | A support bridge |
| Anchor Points | Five short observations | Five anchors to revisit |
| The Long Road | One manageable past challenge, its support, and a lesson | A milestone reminder |
| Thought Courtroom | Thought, observed facts on both sides, fair conclusion | A balanced verdict |
| Reframe Radio | Original thought and a kinder, honest rewrite | Two versions to compare |
| Worry Parking Lot | One worry, a user-selected revisit time, and next action | A parking ticket; no automatic reminder |
| Two Lenses | Facts, first interpretation, another reasonable explanation | Two views of one situation |
| What-If Mapmaker | Uncertainty, realistic outcome, concrete fallback | A fallback map |
| Two Truths & a Mask | Two true facts, one fiction, and a sample guessing round | Explicit mask reveal |
| Campfire Stories | Beginning, sample twist, and ending | A finished tiny story |
| Starship Crew | Choose a role, choose a matching plan, write a crew message | A mission log |
| Village Builders | Shared place, welcoming rule, village name | A village blueprint |
| Time Capsule Swap | Revisit label, future note, sample message | A saved future note; no delivery claim |

Drafts save as the user types. Pause returns to the library, where unfinished games are easy to resume. Previous steps remain editable. Completed answers can be revised without another XP award. Replay resets that game's current session. Notes and completion from the older implementations are retained in a clearly labelled section.

The 12 quick chat tools now have a searchable picker with full names and plain descriptions. Each tool explains its next action beside the card. Story Chain supports three actual writing turns and finishes. Honest answers save without a random compatibility score; playful predictions save without wagering XP or pretending to verify a future event. Opening a tool preserves an ordinary unsent message draft. The picker also connects to the full game library.

Distinct Lucide illustrations, gradient palettes, and background forms retain ROLEPLAY's dark purple and green visual language. Interactive targets are at least 44px; response text is 16px; keyboard focus, selected choices, disabled actions, and completion states are explicit. Reduced-motion preferences suppress hover movement.

The main games and quick chat tools remain device-local previews. No live partner, message delivery, or reminder service is introduced by this redesign. DOM tests cover completion, drafts, resume, editing, single-award rewards, selected parking times, each starship role, legacy notes, all quick tools, and the structure of the pinned action bars. Browser/device visual layout and keyboard testing remain a release check because browser QA is unavailable in this environment.
