export type GameCategory = 'steady' | 'perspective' | 'connection';
export interface GameStep { id: string; title: string; prompt: string; hint: string; example?: string; kind?: 'choice' | 'read'; choices?: string[]; sample?: string; optional?: boolean; }
export interface GameDefinition { id: string; name: string; category: GameCategory; color: string; secondColor: string; minutes: string; mode: 'Solo' | 'Sample partner'; purpose: string; outcome: string; instructions: string[]; steps: GameStep[]; note?: string; }
export interface GameSession { version: 2; status: 'intro' | 'playing' | 'complete'; step: number; answers: Record<string, string>; editing?: boolean; legacy?: {complete:boolean;entries:{label:string;text:string}[]}; }
export const newGameSession = (): GameSession => ({version:2, status:'intro', step:0, answers:{}});
export const gameCategories = [{id:'steady', label:'Feel steady', description:'Small supports. A next step.'}, {id:'perspective', label:'See differently', description:'Explore another way to look at it.'}, {id:'connection', label:'Connect & play', description:'Make something. Share a little.'}] as const;

export const GAME_CATALOG: GameDefinition[] = [
  {id:'storm-shelter', name:'Storm Shelter', category:'steady', color:'#9dc9ff', secondColor:'#7163dd', minutes:'2–3', mode:'Sample partner', purpose:'Build a shelter from three things that support you.', outcome:'Your three-part shelter', instructions:['Name a comforting habit.','Add a person or place.','Choose one support for today.'], steps:[
    {id:'habit',title:'A little comfort',prompt:'What small habit helps when a day feels noisy?',hint:'One sentence is enough. You can invent a character’s answer.',example:'Making tea and putting my phone away for ten minutes.',sample:'Sample partner: A familiar playlist helps me slow down.'},
    {id:'place',title:'Somewhere to land',prompt:'Name a person, place, or object that feels comforting.',hint:'It can be real or imaginary.',example:'A window seat where I can watch the rain.',optional:true},
    {id:'today',title:'Take one thing with you',prompt:'Which of these supports could you use today?',hint:'Keep it small and doable.',example:'I’ll play one song before starting work.'}
  ]},
  {id:'base-camp',name:'Base Camp',category:'steady',color:'#a5dbb9',secondColor:'#508fc9',minutes:'3',mode:'Solo',purpose:'Turn one setback into one manageable next step.',outcome:'Your next-step plan',instructions:['Choose one challenge.','Find what is in your control.','Plan one small action.'],steps:[
    {id:'challenge',title:'Choose your mountain',prompt:'What is one challenge you want to work through?',hint:'Choose something manageable, or use a fictional character.',example:'I keep putting off my portfolio update.'},
    {id:'control',title:'Find your foothold',prompt:'What is one part of this you can influence?',hint:'You don’t need to solve the whole challenge.',example:'I can choose one project to start with.'},
    {id:'step',title:'Take the next step',prompt:'What small action will you try, and when?',hint:'An action you can begin is better than a perfect plan.',example:'After lunch, I’ll write three lines about that project.'}
  ]},
  {id:'phoenix-workshop',name:'Phoenix Workshop',category:'steady',color:'#ffb08c',secondColor:'#ce639d',minutes:'3–4',mode:'Solo',purpose:'Repair an imaginary object and discover a small fresh start.',outcome:'Your repair story',instructions:['Imagine an object that needs care.','Choose how to repair it.','Connect it to a fresh start.'],steps:[
    {id:'object',title:'Meet the object',prompt:'What imaginary object are you repairing?',hint:'A chipped cup, a torn kite, a quiet robot—anything goes.',example:'A robot whose little garden light stopped working.'},
    {id:'repair',title:'Give it a little care',prompt:'What is the first gentle repair you would make?',hint:'Tell the story in a sentence or two.',example:'I would replace one wire and test the light before changing anything else.'},
    {id:'life',title:'Bring the idea home',prompt:'What small fresh start does this story remind you of?',hint:'You can stay in the fictional world if you prefer.',example:'Starting with one small change instead of rebuilding everything.',optional:true}
  ]},
  {id:'bridge-builders',name:'Bridge Builders',category:'steady',color:'#ffd383',secondColor:'#55bfc3',minutes:'2–3',mode:'Sample partner',purpose:'Build a bridge with three everyday sources of support.',outcome:'Your support bridge',instructions:['Add a person or community.','Add a habit or resource.','Choose a support to reach for.'],steps:[
    {id:'person',title:'The first plank',prompt:'Who or what community makes you feel supported?',hint:'A fictional community works too.',example:'The group that swaps sketches with me each Friday.',sample:'Sample partner: My book club makes space for quiet days.',optional:true},
    {id:'habit',title:'The second plank',prompt:'What habit, tool, or resource helps you keep going?',hint:'Ordinary things count.',example:'A short walk before I open my inbox.'},
    {id:'reach',title:'Cross the bridge',prompt:'Which support would you like to reach for next?',hint:'Choose one of your planks or add another.',example:'I’ll message my sketch group this weekend.'}
  ]},
  {id:'anchor-points',name:'Anchor Points',category:'steady',color:'#83e0db',secondColor:'#528dcb',minutes:'2',mode:'Solo',purpose:'Notice five small things that help you feel present.',outcome:'Your five anchors',instructions:['Notice your surroundings.','Name one thing at a time.','Keep your anchors to revisit.'],steps:[
    {id:'see',title:'Something you can see',prompt:'Name one thing you can see around you.',hint:'There is no right answer.',example:'The soft green of a plant by my desk.'},
    {id:'feel',title:'Something you can feel',prompt:'What physical sensation can you notice?',hint:'A texture, warmth, or the chair beneath you.',example:'The cool surface of my mug.',optional:true},
    {id:'hear',title:'Something you can hear',prompt:'Name a sound you notice—or a sound you enjoy.',hint:'A remembered sound is fine.',example:'Rain on a window.',optional:true},
    {id:'comfort',title:'A small comfort',prompt:'What small thing feels comforting today?',hint:'Choose whatever comes to mind.',example:'A favourite hoodie.'},
    {id:'next',title:'A gentle next moment',prompt:'What would you like to do after this?',hint:'It can be as small as stretching your hands.',example:'Get a glass of water and stretch.'}
  ]},
  {id:'the-long-road',name:'The Long Road',category:'steady',color:'#c4bcff',secondColor:'#f0a4a1',minutes:'3',mode:'Solo',purpose:'Look back at one challenge and what helped you through it.',outcome:'A milestone worth remembering',instructions:['Choose one manageable memory.','Notice what helped.','Keep one lesson for later.'],steps:[
    {id:'challenge',title:'A mile behind you',prompt:'Name a challenge you have already worked through.',hint:'A small everyday challenge is enough. Fiction is welcome.',example:'Learning to speak up in a team meeting.'},
    {id:'support',title:'What helped you move',prompt:'What helped you through that moment?',hint:'It might be a person, habit, or something you tried.',example:'Practising one sentence before the meeting.'},
    {id:'lesson',title:'A note for the next mile',prompt:'What would you like to remember next time?',hint:'Write a short reminder to yourself or your character.',example:'I can begin with one sentence.'}
  ]},
  {id:'thought-courtroom',name:'Thought Courtroom',category:'perspective',color:'#bda8ff',secondColor:'#648fd0',minutes:'3–4',mode:'Solo',purpose:'Weigh a thought against the facts, then write a fair view.',outcome:'Your balanced verdict',instructions:['Name the thought.','Look at facts on both sides.','Write a fair conclusion.'],steps:[
    {id:'thought',title:'Name the thought',prompt:'What thought would you like to examine?',hint:'Choose an everyday situation or invent one.',example:'One mistake means I’m bad at my job.'},
    {id:'for',title:'What supports it?',prompt:'What facts seem to support the thought?',hint:'Separate something you observed from something you assumed.',example:'I missed one detail in yesterday’s presentation.',optional:true},
    {id:'against',title:'What else is true?',prompt:'What facts suggest a different view?',hint:'You don’t need to force a positive answer.',example:'I’ve handled several projects well and can correct this detail.',optional:true},
    {id:'verdict',title:'Your fair verdict',prompt:'What is a balanced way to describe the situation?',hint:'Let the facts on both sides guide your answer.',example:'I made a fixable mistake. It doesn’t describe all of my work.'}
  ]},
  {id:'reframe-radio',name:'Reframe Radio',category:'perspective',color:'#ff9bc8',secondColor:'#8c70dd',minutes:'2',mode:'Solo',purpose:'Turn a harsh thought into a kinder, still honest message.',outcome:'Your new broadcast',instructions:['Write the original thought.','Try a kinder voice.','Keep the version that feels fair.'],steps:[
    {id:'original',title:'The original signal',prompt:'What harsh thought is on repeat?',hint:'Use a small example or a fictional one.',example:'I’m terrible at learning new things.'},
    {id:'balanced',title:'Tune a kinder signal',prompt:'How would you say this to a friend, honestly and kindly?',hint:'Kind doesn’t have to mean positive.',example:'This is new to me. I can learn it a little at a time.'}
  ]},
  {id:'worry-parking-lot',name:'Worry Parking Lot',category:'perspective',color:'#e7c180',secondColor:'#9978d8',minutes:'2',mode:'Solo',purpose:'Save one worry with a revisit time you choose.',outcome:'Your parking ticket',instructions:['Name one worry.','Choose when to revisit it.','Leave yourself one next step.'],note:'This saves a note on your device. It does not send a reminder.',steps:[
    {id:'worry',title:'Choose one worry',prompt:'What would you like to put aside for a little while?',hint:'Start with one everyday worry.',example:'I’m worried about what to include in my portfolio.'},
    {id:'when',title:'Choose your revisit time',prompt:'When would you like to look at it again?',hint:'You choose the time. Nothing is assigned automatically.',kind:'choice',choices:['Later today','Tomorrow morning','This weekend','When I have more space']},
    {id:'action',title:'Leave a small next step',prompt:'What is one thing you could try when you return?',hint:'A question to explore is fine too.',example:'Pick one project and list its strongest moments.'}
  ]},
  {id:'two-lenses',name:'Two Lenses',category:'perspective',color:'#8bdcd7',secondColor:'#b777c8',minutes:'3',mode:'Solo',purpose:'See the difference between an assumption and a fair view.',outcome:'Two views, one situation',instructions:['Describe what happened.','Notice your first interpretation.','Explore another possibility.'],steps:[
    {id:'situation',title:'Start with the scene',prompt:'What happened? Describe just the facts.',hint:'Keep it to one situation.',example:'A friend hasn’t replied to my message yet.'},
    {id:'first',title:'Your first lens',prompt:'What did you first assume it meant?',hint:'Notice the thought without making it harsher.',example:'They might be annoyed with me.'},
    {id:'fair',title:'Try a wider lens',prompt:'What is another reasonable explanation?',hint:'It can be uncertain rather than positive.',example:'They could be busy. I don’t know the reason yet.'}
  ]},
  {id:'whatif-mapmaker',name:'What-If Mapmaker',category:'perspective',color:'#b6d396',secondColor:'#659ca9',minutes:'3',mode:'Solo',purpose:'Map a realistic possibility and one way to handle it.',outcome:'Your fallback map',instructions:['Name one what-if.','Consider a realistic outcome.','Choose one way to respond.'],steps:[
    {id:'whatif',title:'Choose a what-if',prompt:'What everyday uncertainty is on your mind?',hint:'Choose something manageable or fictional.',example:'What if my presentation doesn’t go as planned?'},
    {id:'likely',title:'Map a likely outcome',prompt:'What might realistically happen?',hint:'Consider a possibility, rather than the worst imaginable one.',example:'I might lose my place briefly and need to check my notes.'},
    {id:'cope',title:'Find your fallback',prompt:'What could you do if that happened?',hint:'One specific action is enough.',example:'Pause, look at my notes, and continue from the next point.'}
  ]},
  {id:'two-truths-mask',name:'Two Truths & a Mask',category:'connection',color:'#ffb1d4',secondColor:'#856fe7',minutes:'3',mode:'Sample partner',purpose:'Write two true facts and a made-up one. Guess the sample mask.',outcome:'Your reveal',instructions:['Write two true facts and one fiction.','Read the sample partner’s facts.','Guess which one is made up.'],steps:[
    {id:'truth1',title:'Your first truth',prompt:'Write one light, true fact about yourself or your character.',hint:'Keep it fun and comfortable to share.',example:'I once grew a tomato plant on a windowsill.'},
    {id:'truth2',title:'Your second truth',prompt:'Write another true fact.',hint:'Something ordinary can be surprisingly interesting.',example:'I keep a playlist for rainy afternoons.'},
    {id:'mask',title:'Add the mask',prompt:'Now write one believable made-up fact.',hint:'This third statement is your mask.',example:'I can juggle five oranges.'},
    {id:'guess',title:'Spot the sample mask',prompt:'Which sample statement do you think is made up?',hint:'Choose one, then reveal the answer.',kind:'choice',choices:['I got lost in a foreign city for six hours.','I can whistle with two fingers.','I cried at a car commercial.']}
  ]},
  {id:'campfire-stories',name:'Campfire Stories',category:'connection',color:'#ffbb86',secondColor:'#b172b2',minutes:'3',mode:'Sample partner',purpose:'Build a tiny story together in three turns.',outcome:'Your campfire story',instructions:['Continue the opening line.','Follow the sample partner’s twist.','Give the story an ending.'],steps:[
    {id:'beginning',title:'Your first line',prompt:'A traveller finds a map that redraws itself at sunset. What happens next?',hint:'One or two sentences. Any direction is welcome.',example:'A new path appeared, leading to a door in the middle of a lake.'},
    {id:'middle',title:'Follow the twist',prompt:'How does your character respond to the new clue?',hint:'Build on your own line and the sample below.',sample:'Sample partner: A tiny lantern on the map lights up beside the traveller’s name.',example:'The traveller followed the lantern’s glow, laughing at how it flickered with every step.'},
    {id:'ending',title:'One final line',prompt:'How would you like this little story to end?',hint:'A quiet ending, a cliffhanger, or something surprising.',sample:'Sample partner: Beyond the path, someone had set a second cup beside a small campfire.',example:'For once, the map stopped changing. The traveller had found somewhere to stay.'}
  ]},
  {id:'starship-crew',name:'Starship Crew',category:'connection',color:'#9bbaff',secondColor:'#7c68dd',minutes:'3',mode:'Sample partner',purpose:'Choose a crew role and help a fictional ship get home.',outcome:'Your mission log',instructions:['Choose your role.','Pick a plan for your task.','Send a fictional crew message.'],steps:[
    {id:'role',title:'Choose your crew role',prompt:'The ship needs a hand. What would you like to do?',hint:'Your next task will match your role.',kind:'choice',choices:['Navigator · find a safe route','Engineer · restore the ship’s power','Communicator · coordinate the crew']},
    {id:'plan',title:'Make a plan',prompt:'Choose one plan for your role.',hint:'This is a story choice, not a scored test.',kind:'choice',choices:[]},
    {id:'message',title:'Bring the crew together',prompt:'What short message would you send to your crew?',hint:'Tell them your plan and one thing you need.',example:'I’ve found a quieter route. Please hold steady while I check the next waypoint.',sample:'Sample crew: We’re ready to follow your plan. What do you need from us?'}
  ]},
  {id:'village-builders',name:'Village Builders',category:'connection',color:'#c8e88b',secondColor:'#66b4b4',minutes:'3',mode:'Sample partner',purpose:'Create a small fictional village where everyone belongs.',outcome:'Your village blueprint',instructions:['Choose a shared place.','Add a welcoming rule.','Name your village.'],steps:[
    {id:'place',title:'Build a shared place',prompt:'What is the first shared place in your village?',hint:'Choose a place you would enjoy visiting.',kind:'choice',choices:['A garden anyone can grow in','A cosy library with quiet corners','A kitchen with one long shared table','A workshop for making things together']},
    {id:'rule',title:'Make room for everyone',prompt:'What small rule helps people feel welcome?',hint:'Be as playful or practical as you like.',example:'Everyone can join an activity or take a quiet break.',sample:'Sample neighbour: Let’s add a bench where people can sit without having to talk.'},
    {id:'name',title:'Give it a name',prompt:'What would you call this little village?',hint:'A name and a few words about its feeling are enough.',example:'Mosslight—room for quiet people and bright ideas.'}
  ]},
  {id:'time-capsule-swap',name:'Time Capsule Swap',category:'connection',color:'#ffb9ac',secondColor:'#ac80cf',minutes:'2–3',mode:'Sample partner',purpose:'Write a future note and open a sample message.',outcome:'Your future note',instructions:['Choose when you’d like to reread it.','Write a short note.','Open a sample message.'],note:'Your note stays on this device. Delivery and reminders are not connected.',steps:[
    {id:'when',title:'Choose a future moment',prompt:'When would you like to reread your note?',hint:'This is a label for your capsule, not a reminder.',kind:'choice',choices:['Tomorrow','In one week','In one month']},
    {id:'note',title:'Write your future note',prompt:'What would you like your future self or a fictional friend to remember?',hint:'A few words are enough. No minimum essay length.',example:'Keep making things just because they make you curious.'},
    {id:'open',title:'Open a sample message',prompt:'A little note for the road ahead.',hint:'Read the sample, then finish your capsule.',kind:'read',sample:'Sample message: I hope you leave a little room for the things you enjoy. One small step still counts.'}
  ]}
];
export const gameById = (id?: string) => GAME_CATALOG.find(game => game.id === id);
export const gameXP: Record<string, number> = {'storm-shelter':35,'base-camp':45,'phoenix-workshop':50,'bridge-builders':30,'anchor-points':25,'the-long-road':40,'thought-courtroom':55,'reframe-radio':40,'worry-parking-lot':30,'two-lenses':35,'whatif-mapmaker':50,'two-truths-mask':30,'campfire-stories':35,'starship-crew':50,'village-builders':40,'time-capsule-swap':45};

export function resolvedGameStep(game: GameDefinition, session: GameSession): GameStep {
  const step = game.steps[session.step];
  if (game.id !== 'starship-crew' || step.id !== 'plan') return step;
  const role = session.answers.role || '';
  if (role.startsWith('Engineer')) return {...step,title:'Engineer: restore the power',prompt:'The main power line is down. Which plan will you try?',choices:['Reroute power from unused cabins','Start the backup generator','Ask the crew to reduce power use']};
  if (role.startsWith('Communicator')) return {...step,title:'Communicator: coordinate the crew',prompt:'The crew needs a clear plan. What will you do?',choices:['Ask each station for a short update','Set a shared countdown for the manoeuvre','Confirm everyone understands their task']};
  return {...step,title:'Navigator: choose a route',prompt:'A debris field is ahead. Which route will you plot?',choices:['Take a longer route around the debris','Pause and scan for a clear passage','Follow the beacon to a nearby safe station']};
}

export function normalizeGameSession(value: GameSession, game: GameDefinition): GameSession {
  if (!value || value.version !== 2 || !['intro','playing','complete'].includes(value.status) || !Number.isInteger(value.step) || typeof value.answers !== 'object' || !value.answers) return newGameSession();
  const answers = Object.fromEntries(game.steps.filter(step => typeof value.answers[step.id] === 'string').map(step => [step.id, value.answers[step.id].slice(0,600)]));
  const step = Math.min(Math.max(value.step,0),game.steps.length-1);
  const entries = Array.isArray(value.legacy?.entries) ? value.legacy.entries.filter(entry => entry && typeof entry.label === 'string' && typeof entry.text === 'string') : [];
  const legacy = entries.length ? {complete:value.legacy?.complete===true,entries} : undefined;
  if (value.status === 'complete' && !legacy?.complete && game.steps.some(item => item.kind !== 'read' && !answers[item.id]?.trim())) return {...newGameSession(),status:'playing',answers,legacy};
  return {...value,step,answers,legacy};
}
