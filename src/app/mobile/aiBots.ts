export type AIBot={id:string;name:string;role:string;tone:string;secondary:string;intro:string;starters:string[];examples:{match:RegExp;reply:string}[];fallback:string};
export const aiBots:AIBot[]=[
  {id:'muse',name:'Muse',role:'Creative spark',tone:'#ff9bc8',secondary:'#9c79e8',intro:'Try a tiny story, a fresh concept, or a playful writing prompt.',starters:['Give me a story prompt','Help me brainstorm an idea','Turn an ordinary object into something surprising'],examples:[
    {match:/story|writing|character/i,reply:'A sample story spark: a library lends memories instead of books. Your character borrows a memory that hasn’t happened yet. What do they find in it?'},
    {match:/brainstorm|idea|concept/i,reply:'Try this sample idea exercise: choose one everyday frustration, then imagine three versions of the solution—tiny, playful, and deliberately strange. Which direction would you explore first?'},
    {match:/object|ordinary|surpris/i,reply:'A sample twist: imagine a lamp that changes shape to mark the chapters of your day. What would its morning, work, and quiet-evening forms look like?'}],fallback:'Here’s a sample creative exercise: combine an everyday place with one impossible rule. A café where time runs backwards, perhaps. Choose one detail and build from there.'},
  {id:'orbit',name:'Orbit',role:'Big-question explorer',tone:'#9dc9ff',secondary:'#9275dd',intro:'Explore an idea through questions and different perspectives.',starters:['Ask me a big question','Explore both sides of an idea','Give me a thought experiment'],examples:[
    {match:/big|question/i,reply:'A sample question: if everyone could learn one skill instantly, which skill would change everyday life the most—and what might we lose by skipping the learning?'},
    {match:/both|side|perspective/i,reply:'A sample two-sided idea: should every public space encourage conversation? One view values connection; another values quiet and choice. What would a space that supports both look like?'},
    {match:/experiment|thought/i,reply:'A sample thought experiment: a city lets residents vote on one small rule each week. What would improve, what could go wrong, and how would you include people who prefer not to vote?'}],fallback:'Try this sample lens: name what you know, what you’re assuming, and one question that could change your view. You don’t need a final answer to explore an idea.'},
  {id:'pixel',name:'Pixel',role:'Design thinking buddy',tone:'#80e5df',secondary:'#738dd8',intro:'Practise product thinking, simplify a flow, or try a design exercise.',starters:['Help me simplify a user flow','Give me a design challenge','How do I test a product idea?'],examples:[
    {match:/flow|simplif|journey/i,reply:'A sample flow exercise: write the user’s goal in one sentence, list the steps, then ask what each step helps them decide. Try removing a step that doesn’t help them move forward.'},
    {match:/challenge|design/i,reply:'A sample design challenge: create a bus-stop experience for someone using it for the first time. Show where they are, which bus they need, and what to do if it’s delayed. Start with one screen or sign.'},
    {match:/test|product|idea/i,reply:'A sample test plan: choose one assumption, make the smallest prototype that can test it, and give someone a realistic task. Watch where they hesitate before deciding what to change.'}],fallback:'For a sample product-thinking exercise, choose one user, one situation, and one desired outcome. Sketch a simple before-and-after journey, then find the moment that needs the most clarity.'},
  {id:'quest',name:'Quest',role:'Playful conversation starter',tone:'#ffd383',secondary:'#e8959f',intro:'Try a tiny riddle, an imaginative choice, or a story game.',starters:['Give me a quick riddle','Start a tiny adventure','Ask a playful would-you-rather'],examples:[
    {match:/riddle|answer/i,reply:'A sample riddle: what has keys but opens no locks? A piano. Try making your own riddle about something nearby.'},
    {match:/adventure|story/i,reply:'A sample adventure begins: three doors appear on a quiet train—a greenhouse, a room of floating maps, and a workshop full of tiny robots. Which door would your character open?'},
    {match:/rather|playful|choice/i,reply:'A sample would-you-rather: explore a city that changes colour with the weather, or a forest where every tree tells one story? Choose one and invent its first rule.'}],fallback:'Try a sample mini-game: name three things you’d pack for a trip to an imaginary island. Give one of them a surprising use.'}
];
export const aiBot=(id?:string)=>aiBots.find(bot=>bot.id===id);
export type BotMessage={id:string;role:'user'|'assistant';text:string;created:string;source:'user'|'sample'|'ai';replyTo?:string;status?:'pending'|'failed'|'sent'};
export function normalizeBotMessages(value:unknown):BotMessage[]{
  if(!Array.isArray(value))return [];
  const seen=new Set<string>();
  return value.flatMap(item=>{if(!item||typeof item!=='object'||typeof item.id!=='string'||seen.has(item.id)||!['user','assistant'].includes(item.role)||typeof item.text!=='string')return [];seen.add(item.id);const role=item.role as BotMessage['role'];return [{id:item.id,role,text:item.text.slice(0,4000),created:typeof item.created==='string'&&!Number.isNaN(Date.parse(item.created))?item.created:new Date(0).toISOString(),source:role==='user'?'user' as const:item.source==='ai'?'ai' as const:'sample' as const,...(typeof item.replyTo==='string'?{replyTo:item.replyTo}:{}),...(role==='user'&&['pending','failed','sent'].includes(item.status)?{status:item.status as BotMessage['status']}:{})}];});
}
export function sampleBotReply(bot:AIBot,message:string){return bot.examples.find(example=>example.match.test(message))?.reply||bot.fallback;}
export function botAPIEndpoint(value?:string):string|null{
  if(!value||!value.startsWith('/')||value.startsWith('//')||value.includes('\\'))return null;
  try{const url=new URL(value,'https://roleplay.invalid');return url.origin==='https://roleplay.invalid'&&url.pathname.startsWith('/api/')&&!url.hash?url.pathname+url.search:null;}catch{return null;}
}
const environment=(import.meta as ImportMeta&{env?:Record<string,string|undefined>}).env;
export const configuredBotEndpoint=botAPIEndpoint(environment?.VITE_ROLEPLAY_AI_ENDPOINT);
export async function requestBotReply(botId:string,messages:BotMessage[],requestId:string,signal:AbortSignal,endpoint:string):Promise<string>{
  const path=botAPIEndpoint(endpoint);if(!path||!aiBot(botId))throw new Error('An AI service is not configured.');
  let response:Response;
  try{response=await fetch(path,{method:'POST',credentials:'same-origin',redirect:'error',headers:{'Content-Type':'application/json'},signal,body:JSON.stringify({botId,requestId,messages:messages.slice(-12).map(message=>({role:message.role,content:message.text}))})});}catch(error){if(signal.aborted)throw error;throw new Error('The AI service could not be reached. Your message is saved; you can retry.');}
  if(!response.ok)throw new Error(response.status===429?'Too many requests. Give it a moment, then retry.':'The AI service could not reply. Your message is saved; you can retry.');
  let result;try{result=await response.json();}catch{throw new Error('The AI service returned an invalid reply. Your message is saved.');}
  if(!result||result.source!=='ai'||typeof result.reply!=='string'||!result.reply.trim()||result.reply.length>4000)throw new Error('The AI service returned an invalid reply. Your message is saved.');
  return result.reply.trim();
}
