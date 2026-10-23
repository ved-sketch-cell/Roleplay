import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Clock3, Flag, Flame, Gamepad2, Heart, HelpCircle, House, Layers3, Mail, Map, Mountain, ParkingCircle, Pause, Radio, RotateCcw, Scale, Search, Shield, Sparkles, Telescope, Tent, Users, Waves, X, Rocket, type LucideIcon } from 'lucide-react';
import { completeActivity, readDeviceValue } from '../mobile/state';
import { useFlowState, useActivityScope } from '../mobile/FlowState';
import { GAME_CATALOG, gameById, gameCategories, gameXP, newGameSession, normalizeGameSession, resolvedGameStep, type GameDefinition, type GameSession, type GameCategory } from '../mobile/gameCatalog';
import { existingGameSession } from '../mobile/gameMigration';
import '../mobile/games.css';

const gameIcons: Record<string, LucideIcon> = {'storm-shelter':Tent,'base-camp':Mountain,'phoenix-workshop':Flame,'bridge-builders':Waves,'anchor-points':Shield,'the-long-road':Flag,'thought-courtroom':Scale,'reframe-radio':Radio,'worry-parking-lot':ParkingCircle,'two-lenses':Telescope,'whatif-mapmaker':Map,'two-truths-mask':Layers3,'campfire-stories':BookOpen,'starship-crew':Rocket,'village-builders':House,'time-capsule-swap':Mail};
const artStyle = (game:GameDefinition) => ({'--game-color':game.color,'--game-secondary':game.secondColor} as CSSProperties);
function GameArt({game, compact=false, progress=0}:{game:GameDefinition;compact?:boolean;progress?:number}) {
  const Icon=gameIcons[game.id]||Gamepad2;
  const index=GAME_CATALOG.indexOf(game);
  return <div className={'games-art'+(compact?' games-art-small':'')} data-game={game.id} style={artStyle(game)} aria-hidden="true"><span className={'games-art-shape shape-'+index%4}/><span className="games-art-orbit"/><Icon strokeWidth={1.3}/><span className="games-art-spark">✦</span>{!compact&&<div className="games-art-dots">{game.steps.map((step,i)=><span key={step.id} data-done={i<progress}/>)}</div>}</div>;
}

export interface ChatGamesPageProps {onBack:()=>void;activeGameId?:string;onSelectGame?:(id:string)=>void;}
export function ChatGamesPage({onBack,activeGameId,onSelectGame}:ChatGamesPageProps) {
  const [localGame,setLocalGame]=useState<string>();
  const [filter,setFilter]=useFlowState<GameCategory|'All'>('games-filter','All');
  const [query,setQuery]=useFlowState('games-search','');
  const game=gameById(onSelectGame?activeGameId:localGame);
  const choose=(id:string)=>onSelectGame?onSelectGame(id):setLocalGame(id);
  if(game)return <GameExperience key={game.id} game={game} onBack={()=>onSelectGame?onBack():setLocalGame(undefined)}/>;
  const visible=GAME_CATALOG.filter(item=>(filter==='All'||item.category===filter)&&(item.name+' '+item.purpose).toLowerCase().includes(query.trim().toLowerCase()));
  const resume=GAME_CATALOG.filter(item=>readDeviceValue<GameSession|null>('flow:chatgames:'+item.id+':GameSession.v2',null)?.status==='playing');
  return <section className="games-library mobile-page">
    <div className="games-library-top"><button className="mobile-icon-button" aria-label="Back" onClick={onBack}><ArrowLeft size={20}/></button><span className="mobile-eyebrow">ROLEPLAY · PLAY</span><Gamepad2 size={21}/></div>
    <h1>A little play.<br/><span>A little possibility.</span></h1><p className="games-library-description">Small games with a clear beginning and ending. Pick what feels good today.</p>
    <div className="games-preview-note"><Sparkles size={15}/><span>Solo or sample partner · Progress saves on this device</span></div>
    {resume.length>0&&<section className="games-resume"><h2>Pick up where you left off</h2>{resume.map(item=><button key={item.id} onClick={()=>choose(item.id)}><GameArt game={item} compact/><span><strong>{item.name}</strong><small>Resume your saved game</small></span><ArrowRight size={18}/></button>)}</section>}
    {!query&&filter==='All'&&resume.length===0&&<button className="games-starter" onClick={()=>choose('two-truths-mask')}><GameArt game={gameById('two-truths-mask')!} compact/><span><small>EASY FIRST PLAY</small><strong>Two Truths & a Mask</strong><span>Two facts. One fiction. A little surprise.</span></span><ArrowRight size={19}/></button>}
    <label className="mobile-search games-search"><Search size={18}/><input type="search" aria-label="Search games" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Find a game"/>{query&&<button className="mobile-icon-button" onClick={()=>setQuery('')} aria-label="Clear game search"><X size={17}/></button>}</label>
    <div className="games-filters" aria-label="Game goals"><button aria-pressed={filter==='All'} onClick={()=>setFilter('All')}>All games</button>{gameCategories.map(category=><button key={category.id} aria-pressed={filter===category.id} onClick={()=>setFilter(category.id)}>{category.label}</button>)}</div>
    <div className="games-catalog-count" role="status">{visible.length} {visible.length===1?'game':'games'} to explore</div>
    {gameCategories.map(category=>{
      const games=visible.filter(item=>item.category===category.id);
      if(!games.length)return null;
      return <section className="games-category" key={category.id}><h2>{category.label}</h2><p>{category.description}</p><div className="games-card-grid">{games.map(item=><button key={item.id} className="games-card" style={artStyle(item)} onClick={()=>choose(item.id)} aria-label={'Explore '+item.name}><GameArt game={item}/><div className="games-card-copy"><h3>{item.name}</h3><p>{item.purpose}</p><div className="games-card-meta"><span><Clock3 size={13}/>{item.minutes} min</span><span>{item.mode==='Solo'?<Heart size={13}/>:<Users size={13}/>} {item.mode}</span></div><span className="games-card-link">Explore game<ArrowRight size={15}/></span></div></button>)}</div></section>;
    })}
    {!visible.length&&<div className="mobile-empty"><Search size={27}/><strong>No games found</strong><p>Try another word or explore all games.</p><button className="mobile-secondary-button" onClick={()=>{setFilter('All');setQuery('');}}>Show all games</button></div>}
  </section>;
}

function GameExperience({game,onBack}:{game:GameDefinition;onBack:()=>void}) {
  const scope=useActivityScope();
  const [stored,setSession]=useFlowState<GameSession>('GameSession.v2',()=>existingGameSession(game.id,scope));
  const session=normalizeGameSession(stored,game);
  const [showExample,setShowExample]=useState(false);
  const [showHelp,setShowHelp]=useState(false);
  const bodyRef=useRef<HTMLDivElement>(null);
  const headingRef=useRef<HTMLHeadingElement>(null);
  const current=resolvedGameStep(game,session);
  const answer=session.answers[current.id]||'';
  const done=session.status==='complete';
  useEffect(()=>{if(done)completeActivity('game:'+scope,game.name+' completed',gameXP[game.id]);},[done,scope,game.id,game.name]);
  useEffect(()=>{setShowExample(false);bodyRef.current?.scrollTo({top:0});headingRef.current?.focus({preventScroll:true});},[session.step,session.status]);
  const updateAnswer=(value:string)=>{
    const answers={...session.answers,[current.id]:value.slice(0,600)};
    if(game.id==='starship-crew'&&current.id==='role'&&value!==answer)delete answers.plan;
    setSession({...session,answers});
  };
  const advance=(skip=false)=>{
    if(!skip&&current.kind!=='read'&&!answer.trim())return;
    const answers={...session.answers,[current.id]:skip?'Skipped':current.kind==='read'?'Read sample message':answer.trim()};
    if(session.editing){
      const missing=game.steps.findIndex(step=>step.kind!=='read'&&!answers[step.id]?.trim());
      setSession({...session,answers,status:missing<0?'complete':'playing',step:missing<0?session.step:missing,editing:missing>=0});
    }else setSession({...session,answers,status:session.step===game.steps.length-1?'complete':'playing',step:Math.min(session.step+1,game.steps.length-1)});
  };
  const edit=(index:number)=>setSession({...session,status:'playing',step:index,editing:true});
  const primaryText=session.status==='intro'?'Start game':session.editing?'Save change':session.step===game.steps.length-1?(current.kind==='read'?'Read & finish':'Finish game'):'Continue';
  const completedCount=done?game.steps.length:session.step;
  return <section className="games-experience" style={artStyle(game)} data-game-id={game.id}>
    <header className="games-session-header"><button className="mobile-icon-button" onClick={onBack} aria-label="Back to Games"><ArrowLeft size={19}/></button><div><span className="mobile-eyebrow">{game.mode==='Solo'?'SOLO GAME':'SAMPLE PARTNER'}</span><h1>{game.name}</h1></div>{session.status==='playing'&&<button className="mobile-text-button games-pause" onClick={onBack}><Pause size={15}/>Pause</button>}</header>
    {session.status!=='intro'&&<div className="games-progress"><span role="status">{done?'Complete':session.editing?'Editing your result':`Step ${session.step+1} of ${game.steps.length}`}</span><progress max={game.steps.length} value={completedCount} aria-label="Game progress"/><button className="mobile-icon-button" onClick={()=>setShowHelp(previous=>!previous)} aria-label="How to play" aria-expanded={showHelp}><HelpCircle size={18}/></button></div>}
    <div className="games-session-body" ref={bodyRef}>
      {showHelp&&<aside className="games-help"><h2>How to play</h2><ol>{game.instructions.map(line=><li key={line}>{line}</li>)}</ol><p>{game.mode==='Sample partner'?'Partner lines are written samples. No live player is connected.':'Play at your own pace. You can pause and return anytime.'}</p></aside>}
      {session.status==='intro'?<>
        <GameArt game={game}/><h2 ref={headingRef} tabIndex={-1}>{game.purpose}</h2><div className="games-intro-meta"><span><Clock3 size={15}/>{game.minutes} min</span><span>{game.steps.length} steps</span><span>{game.mode}</span></div><section className="games-instructions"><h3>How it works</h3><ol>{game.instructions.map(line=><li key={line}>{line}</li>)}</ol></section><div className="games-outcome"><Sparkles size={20}/><div><small>YOU’LL LEAVE WITH</small><strong>{game.outcome}</strong></div></div><p className="games-device-note">{game.mode==='Sample partner'?'Play with written sample responses. No live partner is connected.':'Short answers are welcome. You can use an imaginary character.'}</p>{game.note&&<p className="games-device-note">{game.note}</p>}
      </>:done?<>
        <div className="games-complete-hero"><GameArt game={game} progress={game.steps.length}/><span className="games-complete-check"><Check size={24}/></span><h2 ref={headingRef} tabIndex={-1}>Game complete</h2><p>{game.outcome}</p><small>Completion saved · {gameXP[game.id]} XP awarded once</small></div>
        {game.id==='two-truths-mask'&&session.answers.guess&&<div className="games-reveal"><strong>{session.answers.guess===game.steps[3].choices![1]?'You found the mask!':'A little surprise!'}</strong><p>The sample mask was “I can whistle with two fingers.”</p><small>Your third statement is your own mask.</small></div>}
        <div className="games-results">{game.steps.filter(step=>session.answers[step.id]&&step.kind!=='read').map(step=><article key={step.id}><div><h3>{step.title}</h3><button className="mobile-text-button" onClick={()=>edit(game.steps.indexOf(step))} aria-label={'Edit '+step.title}>Edit</button></div><p>{session.answers[step.id]}</p></article>)}</div>{game.note&&<p className="games-device-note">{game.note}</p>}
      </>:<>
        <div className="games-step-caption"><span>{current.kind==='choice'?'CHOOSE ONE':current.kind==='read'?'SAMPLE MESSAGE':'YOUR TURN'}</span><small>{session.editing?'Make it feel right.':`${game.steps.length-session.step} ${game.steps.length-session.step===1?'step':'steps'} to your result`}</small></div>
        <h2 ref={headingRef} tabIndex={-1}>{current.title}</h2><p className="games-current-prompt">{current.prompt}</p><p className="games-field-hint" id={'game-hint-'+game.id}>{current.hint}</p>
        {current.sample&&<div className="games-sample-response"><span aria-hidden="true">✦</span><p>{current.sample}</p></div>}
        {current.kind==='choice'?<div className="games-choice-list" role="group" aria-label={current.title}>{current.choices?.map((choice,index)=><button key={choice} aria-label={choice} aria-pressed={answer===choice} onClick={()=>updateAnswer(choice)}><span className="games-choice-number">{index+1}</span><span>{choice}</span><span className="games-choice-check">{answer===choice&&<Check size={17}/>}</span></button>)}</div>:current.kind==='read'?null:<>
          <label className="games-response-label" htmlFor={'game-response-'+game.id}>Your response</label><textarea id={'game-response-'+game.id} aria-label="Game response" aria-describedby={'game-hint-'+game.id} value={answer} maxLength={600} onChange={event=>updateAnswer(event.target.value)} rows={4} placeholder="A few words is a good start…"/><div className="games-input-meta"><span>Saved as you type</span><span>{answer.length}/600</span></div>
          {current.example&&<div className="games-example"><button className="mobile-text-button" onClick={()=>setShowExample(previous=>!previous)} aria-expanded={showExample}><Sparkles size={15}/>Need a starting point?<ChevronDown size={15}/></button>{showExample&&<p>{current.example}</p>}</div>}
        </>}
        {session.step>0&&<details className="games-previous"><summary>Your earlier answers</summary>{game.steps.slice(0,session.step).filter(step=>session.answers[step.id]).map(step=><div key={step.id}><strong>{step.title}</strong><p>{session.answers[step.id]}</p></div>)}</details>}
      </>}
      {session.legacy?.entries.length&&<details className="games-previous games-legacy"><summary>Your previously saved notes</summary>{session.legacy.entries.map((entry,index)=><div key={index}><strong>{entry.label}</strong><p>{entry.text}</p></div>)}</details>}
    </div>
    <footer className="games-session-footer">
      {done?<><button className="mobile-primary-button" onClick={onBack}>Back to Games<ArrowRight size={18}/></button><button className="mobile-text-button" onClick={()=>setSession(newGameSession())}><RotateCcw size={15}/>Play again</button></>:<>
        <button className="mobile-primary-button" disabled={session.status==='playing'&&current.kind!=='read'&&!answer.trim()} onClick={()=>session.status==='intro'?setSession({...session,status:'playing'}):advance()}>{primaryText}<ArrowRight size={18}/></button>
        <div className="games-footer-secondary">{session.status==='playing'&&session.step>0&&!session.editing?<button className="mobile-text-button" onClick={()=>setSession({...session,step:session.step-1})}><ArrowLeft size={15}/>Previous step</button>:<span>On your device</span>}{session.status==='playing'&&current.optional&&<button className="mobile-text-button" onClick={()=>advance(true)}>Skip this step</button>}</div>
      </>}
    </footer>
  </section>;
}
