import {useState,useEffect,type ReactNode} from 'react';
import {Compass} from 'lucide-react';
import {useMobileRouter} from './mobile/useMobileRouter';
import {parseRoute,routeTab,type MobileRoute} from './mobile/navigation';
import {interestCategories} from './components/InterestCategories';
import './mobile/journeys.css';
import './mobile/discovery-deck.css';
import {FlowStateProvider} from './mobile/FlowState';
import { useDeviceState, defaultIdentity, writeDeviceValue } from './mobile/state';
import { AnimatePresence } from 'motion/react';
import { EnhancedHome } from './components/EnhancedHome';
import { Chat } from './components/Chat';
import { ProfileSettings } from './components/ProfileSettings';
import { Discover } from './components/Discover';
import { Challenges } from './components/Challenges';
import { BottomNav } from './components/BottomNav';
import { AvatarCustomization } from './components/AvatarCustomization';
import { EventDetails } from './components/EventDetails';
import { QuizDetails } from './components/QuizDetails';
import { FactCheckDetail } from './components/FactCheckDetail';
import { AccessCodeShare } from './components/AccessCodeShare';
import { DiscoveryPanel } from './components/DiscoveryPanel';
import { InterestPicker } from './components/InterestPicker';
import { PersonalityQuiz, PersonalityResult } from './components/PersonalityQuiz';
import { MatchingResults } from './components/MatchingResults';
import { LiveStreaming } from './components/LiveStreaming';
import { CounselorDashboard } from './components/CounselorDashboard';
import { GuildTavern } from './components/GuildTavern';
import { ScenarioDeck } from './components/ScenarioDeck';
import { AffinityDashboard } from './components/AffinityDashboard';
import { XPEconomy } from './components/XPEconomy';
import { TrustProfile } from './components/TrustProfile';
import { FracturedRoot } from './components/FracturedRoot';
import { ArbitrationChamber } from './components/ArbitrationChamber';
import { AnonUserProfile, type AnonUser } from './components/AnonUserProfile';
import { SearchOverlay } from './components/SearchOverlay';
import { Authentication } from './components/Authentication';
import { GrowFeaturePage } from './components/GrowFeaturePage';
import { HealFeaturePage } from './components/HealFeaturePage';
import { ChatGamesPage } from './components/ChatGamesPage';
import {SelfConversationProfile} from './components/SelfConversationProfile';
import {type SelfProfileSection} from './mobile/selfProfile';
import {ChallengeActivity} from './components/ChallengeActivity';
import {type ChallengeId} from './mobile/challengeCatalog';
import {AnonymousCounselling} from './components/AnonymousCounselling';
import {BotChat} from './components/BotChat';
import {aiBot} from './mobile/aiBots';

type Screen = 'home' | 'discover' | 'challenges' | 'live' | 'profile';
type DetailScreen = 'avatar' | 'event' | 'quiz' | 'factcheck' | 'accesscode' | 'counselor' | 'guild' | 'scenarios' | 'affinity' | 'xpeconomy' | 'trustprofile' | 'arbitration' | 'anonprofile' | 'growfeature' | 'healfeature' | 'chatgames' | null;

const ANON_USERS: Record<string, AnonUser> = {
  '1': { id:'1', avatar:'🦊', color:'#FF6B6B', anonCode:'4523', mood:'Mentally Sharp', moodEmoji:'🧠', moodColor:'#f472b6', heat:78, verified:true, status:'Mental', level:42, xp:8240, revealedName:'Arjun Mehta', revealedPhone:'+91 98•••• ••72',
    badges:[{icon:'🔥',label:'Heat Rider',color:'#ef4444'},{icon:'🧠',label:'Deep Diver',color:'#818cf8'},{icon:'⚓',label:'Anchor',color:'#06b6d4'},{icon:'✓',label:'Verified',color:'#10b981'}],
    scenarioAxes:[{axis:'Roleplay',value:85},{axis:'Introspect',value:70},{axis:'Hot Takes',value:80},{axis:'Creativity',value:75},{axis:'Social',value:60},{axis:'Narrative',value:78}],
    footprint:[{label:'PII stored',value:'None'},{label:'Chat logs',value:'E2E'},{label:'Ad profile',value:'Off'},{label:'3rd party',value:'Never'}] },
  '2': { id:'2', avatar:'🌙', color:'#4ECDC4', anonCode:'8921', mood:'Calm & Grounded', moodEmoji:'😌', moodColor:'#06b6d4', heat:42, verified:true, status:'Spiritual', level:28, xp:5320, revealedName:'Priya Sharma', revealedPhone:'+91 80•••• ••15',
    badges:[{icon:'🌱',label:'Grounded',color:'#10b981'},{icon:'☮️',label:'Peacemaker',color:'#06b6d4'},{icon:'🏛️',label:'Keystone',color:'#8169ec'}],
    scenarioAxes:[{axis:'Roleplay',value:55},{axis:'Introspect',value:90},{axis:'Hot Takes',value:35},{axis:'Creativity',value:72},{axis:'Social',value:85},{axis:'Narrative',value:68}],
    footprint:[{label:'PII stored',value:'None'},{label:'Chat logs',value:'E2E'},{label:'Ad profile',value:'Off'},{label:'3rd party',value:'Never'}] },
  '3': { id:'3', avatar:'⚡', color:'#FFE66D', anonCode:'3456', mood:'Energized', moodEmoji:'💪', moodColor:'#fbbf24', heat:55, verified:false, status:'Physical', level:19, xp:3100, revealedName:'Rohan Verma', revealedPhone:'+91 77•••• ••88',
    badges:[{icon:'⚡',label:'Catalyst',color:'#f59e0b'},{icon:'🏆',label:'XP Champ',color:'#fbbf24'}],
    scenarioAxes:[{axis:'Roleplay',value:60},{axis:'Introspect',value:40},{axis:'Hot Takes',value:75},{axis:'Creativity',value:65},{axis:'Social',value:70},{axis:'Narrative',value:50}],
    footprint:[{label:'PII stored',value:'None'},{label:'Chat logs',value:'E2E'},{label:'Ad profile',value:'Off'},{label:'3rd party',value:'Never'}] },
  '4': { id:'4', avatar:'🌊', color:'#60a5fa', anonCode:'7812', mood:'Existential', moodEmoji:'🌀', moodColor:'#60a5fa', heat:91, verified:true, status:'Existential', level:55, xp:12800, revealedName:'Kavya Nair', revealedPhone:'+91 91•••• ••44',
    badges:[{icon:'🌊',label:'Wavelength',color:'#60a5fa'},{icon:'⚓',label:'Anchor',color:'#06b6d4'},{icon:'🎭',label:'Story Weaver',color:'#a78bfa'},{icon:'⚡',label:'Catalyst',color:'#f59e0b'}],
    scenarioAxes:[{axis:'Roleplay',value:92},{axis:'Introspect',value:88},{axis:'Hot Takes',value:70},{axis:'Creativity',value:95},{axis:'Social',value:65},{axis:'Narrative',value:90}],
    footprint:[{label:'PII stored',value:'None'},{label:'Chat logs',value:'E2E'},{label:'Ad profile',value:'Off'},{label:'3rd party',value:'Never'}] },
  '5': { id:'5', avatar:'🔮', color:'#a78bfa', anonCode:'2290', mood:'Focused', moodEmoji:'🎯', moodColor:'#a78bfa', heat:63, verified:true, status:'Career', level:34, xp:7450, revealedName:'Dev Anand', revealedPhone:'+91 63•••• ••29',
    badges:[{icon:'💡',label:'Visionary',color:'#a78bfa'},{icon:'🏆',label:'XP Champ',color:'#fbbf24'},{icon:'🔥',label:'Heat Rider',color:'#ef4444'}],
    scenarioAxes:[{axis:'Roleplay',value:70},{axis:'Introspect',value:75},{axis:'Hot Takes',value:85},{axis:'Creativity',value:80},{axis:'Social',value:55},{axis:'Narrative',value:72}],
    footprint:[{label:'PII stored',value:'None'},{label:'Chat logs',value:'E2E'},{label:'Ad profile',value:'Off'},{label:'3rd party',value:'Never'}] },
  '6': { id:'6', avatar:'🌺', color:'#f9a8d4', anonCode:'5517', mood:'Creative Flow', moodEmoji:'🎨', moodColor:'#f9a8d4', heat:38, verified:false, status:'Creative', level:22, xp:4200, revealedName:'Sana Khan', revealedPhone:'+91 72•••• ••60',
    badges:[{icon:'🎭',label:'Story Weaver',color:'#f9a8d4'},{icon:'💡',label:'Visionary',color:'#a78bfa'}],
    scenarioAxes:[{axis:'Roleplay',value:78},{axis:'Introspect',value:60},{axis:'Hot Takes',value:45},{axis:'Creativity',value:95},{axis:'Social',value:72},{axis:'Narrative',value:85}],
    footprint:[{label:'PII stored',value:'None'},{label:'Chat logs',value:'E2E'},{label:'Ad profile',value:'Off'},{label:'3rd party',value:'Never'}] },
  '7': { id:'7', avatar:'🌑', color:'#818cf8', anonCode:'9003', mood:'Raw & Unfiltered', moodEmoji:'🌑', moodColor:'#818cf8', heat:95, verified:true, status:'Mental Health', level:61, xp:15200, revealedName:'Aarav Singh', revealedPhone:'+91 99•••• ••03',
    badges:[{icon:'🔥',label:'Heat Rider',color:'#ef4444'},{icon:'⚓',label:'Anchor',color:'#06b6d4'},{icon:'🧠',label:'Deep Diver',color:'#818cf8'},{icon:'🏛️',label:'Keystone',color:'#8169ec'}],
    scenarioAxes:[{axis:'Roleplay',value:90},{axis:'Introspect',value:95},{axis:'Hot Takes',value:88},{axis:'Creativity',value:82},{axis:'Social',value:70},{axis:'Narrative',value:93}],
    footprint:[{label:'PII stored',value:'None'},{label:'Chat logs',value:'E2E'},{label:'Ad profile',value:'Off'},{label:'3rd party',value:'Never'}] },
  '8': { id:'8', avatar:'🧊', color:'#67e8f9', anonCode:'4411', mood:'Curious', moodEmoji:'🔍', moodColor:'#67e8f9', heat:72, verified:false, status:'Social', level:31, xp:6100, revealedName:'Meera Iyer', revealedPhone:'+91 87•••• ••11',
    badges:[{icon:'🌊',label:'Wavelength',color:'#67e8f9'},{icon:'🎭',label:'Story Weaver',color:'#a78bfa'}],
    scenarioAxes:[{axis:'Roleplay',value:65},{axis:'Introspect',value:80},{axis:'Hot Takes',value:60},{axis:'Creativity',value:70},{axis:'Social',value:90},{axis:'Narrative',value:75}],
    footprint:[{label:'PII stored',value:'None'},{label:'Chat logs',value:'E2E'},{label:'Ad profile',value:'Off'},{label:'3rd party',value:'Never'}] },
  '9': { id:'9', avatar:'🌿', color:'#86efac', anonCode:'6634', mood:'Open & Healing', moodEmoji:'💚', moodColor:'#86efac', heat:47, verified:true, status:'Relationship', level:25, xp:4800, revealedName:'Ishaan Roy', revealedPhone:'+91 94•••• ••34',
    badges:[{icon:'🌱',label:'Grounded',color:'#10b981'},{icon:'☮️',label:'Peacemaker',color:'#06b6d4'},{icon:'✓',label:'Verified',color:'#10b981'}],
    scenarioAxes:[{axis:'Roleplay',value:50},{axis:'Introspect',value:85},{axis:'Hot Takes',value:30},{axis:'Creativity',value:65},{axis:'Social',value:88},{axis:'Narrative',value:60}],
    footprint:[{label:'PII stored',value:'None'},{label:'Chat logs',value:'E2E'},{label:'Ad profile',value:'Off'},{label:'3rd party',value:'Never'}] },
  '10':{ id:'10',avatar:'🔥', color:'#fb923c', anonCode:'1128', mood:'Restless', moodEmoji:'😤', moodColor:'#fb923c', heat:84, verified:false, status:'Identity', level:38, xp:9100, revealedName:'Zara Ahmed', revealedPhone:'+91 76•••• ••28',
    badges:[{icon:'🔥',label:'Heat Rider',color:'#ef4444'},{icon:'⚡',label:'Catalyst',color:'#f59e0b'},{icon:'💡',label:'Visionary',color:'#a78bfa'}],
    scenarioAxes:[{axis:'Roleplay',value:80},{axis:'Introspect',value:65},{axis:'Hot Takes',value:90},{axis:'Creativity',value:78},{axis:'Social',value:60},{axis:'Narrative',value:70}],
    footprint:[{label:'PII stored',value:'None'},{label:'Chat logs',value:'E2E'},{label:'Ad profile',value:'Off'},{label:'3rd party',value:'Never'}] },
};
type DiscoveryFlow = 'panel' | 'interests' | 'personality' | 'matches' | null;

export default function App() {
  const {route,navigate,back,finish,scrollRef}=useMobileRouter();
  const [selectedInterests,setSelectedInterests]=useDeviceState<string[]>('interests',[]);
  const [category,setCategory]=useDeviceState('discovery-category','art');
  const [personality,setPersonality]=useDeviceState<PersonalityResult|null>('discovery-preferences',null);
  const [identity,setIdentity]=useDeviceState('identity',defaultIdentity);
  const [storageError,setStorageError]=useState(false);
  useEffect(()=>{
    const preferences=()=>{try{document.documentElement.classList.toggle('mobile-reduced-motion',!!JSON.parse(localStorage.getItem('roleplay-mobile:preferences')||'{}').reducedMotion);}catch{}};
    const onStorageError=()=>setStorageError(true);
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&['search','categories','fractured'].includes(route.page))back();};
    preferences();window.addEventListener('roleplay-preferences',preferences);window.addEventListener('roleplay-storage-error',onStorageError);window.addEventListener('keydown',escape);
    return()=>{window.removeEventListener('roleplay-preferences',preferences);window.removeEventListener('roleplay-storage-error',onStorageError);window.removeEventListener('keydown',escape);};
  },[route.page,back]);
  const go=(page:MobileRoute['page'],id?:string)=>navigate({page,...(id?{id}:{})});
  const openChat=(id:string)=>go('chat',id);
  const openCategories=()=>go('categories');
  const detail=(page:MobileRoute['page'])=>()=>go(page);
  const rooms=(room?:string)=>{
    const id=room?.includes('Cricket')?'cricket-pavilion':room?.includes('Creative')?'roleplay-theatre':room?.includes('Sanctuary')?'stillwater':room?.includes('Cosmos')?'frequency-room':room?.includes('Circuit')?'deep-dive':undefined;
    go('live',id);
  };
  let screen:ReactNode;
  switch(route.page){
    case 'home':screen=<EnhancedHome onFindPeople={openCategories} onBotSelect={id=>go('bot',id)} onChatSelect={openChat} onOpenSearch={detail('search')} onNavigateToLiveStream={detail('live')} onNavigateToScenarios={detail('scenarios')} onNavigateToAffinity={detail('affinity')} onNavigateToXPEconomy={detail('xpeconomy')} onNavigateToCounselor={detail('counselor')} onNavigateToGuild={detail('guild')} onNavigateToTrustProfile={detail('trustprofile')} onNavigateToArbitration={detail('arbitration')} onFracturedRoot={detail('fractured')} onNavigateToGrowFeature={id=>go('growfeature',id)} onNavigateToHealFeature={id=>go('healfeature',id)} onNavigateToChatGames={detail('chatgames')}/>;break;
    case 'discover':screen=<Discover onNavigateToEventDetails={detail('event')} onOpenDiscoveryPanel={openCategories} onSelectInterest={id=>{setCategory(id);go('interests',id);}} onNavigateToGuild={detail('guild')} onNavigateToScenarios={detail('scenarios')}/>;break;
    case 'challenges':screen=<Challenges onNavigateToQuizDetails={detail('quiz')} onNavigateToFactCheck={detail('factcheck')} onNavigateToScenarios={detail('scenarios')} onOpenChallenge={id=>go('challenge',id)} onEditBoundaries={()=>go('selfprofile','boundaries')} onOpenCounselling={detail('counselling')}/>;break;
    case 'counselling':screen=<AnonymousCounselling onBack={back} identity={identity}/>;break;
    case 'challenge':screen=<ChallengeActivity key={route.id} id={route.id as ChallengeId} onBack={back} onEditBoundaries={()=>go('selfprofile','boundaries')}/>;break;
    case 'profile':screen=<ProfileSettings onExploreChallenges={detail('challenges')} onNavigateToAvatarCustomization={detail('avatar')} onNavigateToAccessCode={detail('accesscode')} onEditInterests={()=>navigate({page:'categories',mode:'edit'})} onNavigateToTrustProfile={detail('trustprofile')} onEditChatProfile={id=>go('selfprofile',id)} identity={identity}/>;break;
    case 'selfprofile':screen=<SelfConversationProfile key={route.id} section={route.id as SelfProfileSection} identity={identity} onSection={id=>navigate({page:'selfprofile',id},true)} onBack={back}/>;break;
    case 'live':screen=<LiveStreaming onBack={back} roomId={route.id} createStep={route.step as 'setup'|'preview'|'live'|undefined} onSelectRoom={id=>go('live',id)} onCreateStep={step=>navigate({page:'live',step})} onCloseCreation={()=>finish({page:'live'})}/>;break;
    case 'avatar':screen=<AvatarCustomization initialIdentity={identity} onBack={back} onSave={(avatar,color,username,style)=>{setIdentity({avatar,color,username:username.trim()||defaultIdentity.username,style});back();}}/>;break;
    case 'event':screen=<EventDetails onBack={back} onConnect={openChat} onJoinDiscussion={()=>go('guild')}/>;break;
    case 'quiz':screen=<QuizDetails onBack={back}/>;break;
    case 'factcheck':screen=<FactCheckDetail onBack={back}/>;break;
    case 'accesscode':screen=<AccessCodeShare onBack={back} onConnect={openChat}/>;break;
    case 'counselor':screen=<CounselorDashboard onBack={back}/>;break;
    case 'guild':screen=<GuildTavern onBack={back}/>;break;
    case 'scenarios':screen=<ScenarioDeck onBack={back} onExploreRooms={rooms} onStartChat={(deck,id)=>navigate({page:'chat',id,deck})} onManageBlocked={()=>{writeDeviceValue('profile-tab','Settings');go('profile');}}/>;break;
    case 'affinity':screen=<AffinityDashboard onBack={back} onFindPeople={openCategories} onOpenGuild={()=>go('guild')} onConnect={openChat}/>;break;
    case 'xpeconomy':screen=<XPEconomy onBack={back} onEditIdentity={detail('avatar')} onExploreRooms={detail('live')}/>;break;
    case 'trustprofile':screen=<TrustProfile onBack={back}/>;break;
    case 'arbitration':screen=<ArbitrationChamber onBack={back}/>;break;
    case 'growfeature':screen=<GrowFeaturePage key={route.id} featureId={route.id!} onBack={back}/>;break;
    case 'healfeature':screen=<HealFeaturePage key={route.id} featureId={route.id!} onBack={back}/>;break;
    case 'chatgames':screen=<ChatGamesPage activeGameId={route.id} onSelectGame={id=>go('chatgames',id)} onBack={back}/>;break;
    case 'categories':screen=<DiscoveryPanel onClose={back} onCategorySelect={id=>{setCategory(id);navigate({page:'interests',id,...(route.mode?{mode:route.mode}:{})});}}/>;break;
    case 'interests':screen=interestCategories.some(c=>c.id===route.id)?<InterestPicker key={route.id} categoryId={route.id!} initialInterests={selectedInterests} editing={route.mode==='edit'} onChangeCategory={interests=>{setSelectedInterests(interests);finish({page:'categories',...(route.mode?{mode:route.mode}:{})});}} onComplete={interests=>{setSelectedInterests(interests);if(route.mode==='edit')finish({page:'profile'});else go('preferences');}}/>:<JourneyRecovery onHome={detail('discover')}/>;break;
    case 'preferences':screen=<PersonalityQuiz onBack={back} onComplete={value=>{setPersonality(value);go('matches');}}/>;break;
    case 'matches':screen=personality&&selectedInterests.length?<MatchingResults personality={personality} interests={selectedInterests} onBack={back} onConnect={openChat} onRefine={()=>go('interests',category)}/>:<JourneyRecovery onHome={openCategories} title="Choose your interests first." button="Find my people"/>;break;
    case 'chat':screen=<Chat key={route.id} chatId={route.id!} onOpenGames={()=>go('chatgames')} deckId={route.deck} onReturnToDeck={()=>finish({page:'scenarios'})} onBack={back} onViewProfile={()=>navigate({page:'person',id:route.id,...(route.deck?{deck:route.deck}:{})})}/>;break;
    case 'bot':screen=<BotChat key={route.id} bot={aiBot(route.id)!} onBack={back}/>;break;
    case 'person':screen=<AnonUserProfile onEditYours={id=>go('selfprofile',id)} user={{...ANON_USERS[route.id!],footprint:[{label:'Profile',value:'Sample alias'},{label:'Messages',value:'Device only'},{label:'Mood',value:'Sample data'},{label:'Verification',value:'Simulated'}]}} onBack={back} onStarter={value=>{try{localStorage.setItem(`roleplay-chat-draft:${route.id}`,value);}catch{}if(window.history.state?.stack?.at(-2)?.page==='chat')back();else navigate({page:'chat',id:route.id,...(route.deck?{deck:route.deck}:{})},true);}}/>;break;
    case 'fractured':screen=<FracturedRoot onAcknowledge={back}/>;break;
    case 'search':screen=<SearchOverlay onClose={back} onNavigateToChat={id=>navigate({page:'chat',id},true)} onNavigateToDetail={page=>{if(page==='livestream')page='live';navigate(parseRoute('/'+page),true);}} onNavigateToTab={page=>navigate({page:page as MobileRoute['page']},true)}/>;break;
    default:screen=<JourneyRecovery onHome={detail('home')}/>;
  }
  const discovery=['categories','interests','preferences','matches'].includes(route.page)&&route.mode!=='edit';
  return <div className="mobile-journey" data-route={route.page}>
    {storageError&&<div className="journey-error" role="alert">Device storage is unavailable. Keep this tab open to retain your current work.<button onClick={()=>setStorageError(false)}>Dismiss</button></div>}
    {discovery&&<nav className="journey-stepper" aria-label="Discovery progress">{['categories','interests','preferences','matches'].map((page,i)=>route.page===page?<b key={page} aria-current="step">{i+1}. {page==='preferences'?'Conversation preferences':page}</b>:<span key={page}>{i+1}. {page==='preferences'?'Preferences':page}</span>)}</nav>}
    <div className="journey-stage" ref={scrollRef}><FlowStateProvider scope={`${route.page}:${route.id||((route.step&&'create')||'')}`}>{screen}</FlowStateProvider></div>
    <BottomNav currentScreen={routeTab(route)} onNavigate={page=>go(page)}/>
  </div>;
}
function JourneyRecovery({onHome,title='Let’s get you back on track.',button='Return to app home'}:{onHome:()=>void;title?:string;button?:string}){
  return <section className="mobile-page"><h1>{title}</h1><p className="mobile-description">This screen is unavailable. Your saved profile and activity progress are still on this device.</p><button className="mobile-primary-button" onClick={onHome}><Compass size={18}/>{button}</button></section>;
}
