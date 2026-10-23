import type { CSSProperties } from 'react';
import { Activity, BookOpen, Castle, Coins, Compass, Dumbbell, Eye, Fingerprint, Flame, Flower2, Gamepad2, Gem, GitBranch, GraduationCap, HandHeart, Heart, KeyRound, Layers3, Lightbulb, MessageCircle, MessagesSquare, MoonStar, Palette, Puzzle, Radio, Scale, ScrollText, Settings2, ShieldCheck, Shuffle, Sparkles, Sprout, Telescope, TreePine, TrendingUp, Trophy, UserRound, Waves, Wind, type LucideIcon } from 'lucide-react';

export type Tone = 'purple' | 'pink' | 'lime' | 'cyan' | 'amber' | 'coral' | 'blue';
export const accents: Record<Tone, string> = { purple:'#b9a1ff', pink:'#ff9bc8', lime:'#d6fc8a', cyan:'#80e5df', amber:'#ffd383', coral:'#ffab97', blue:'#9dc9ff' };
export function accentStyle(tone: string = 'purple'): CSSProperties {
  const color = accents[tone as Tone] || accents.purple;
  return { '--ui-accent':color, '--ui-tint':`${color}16`, '--ui-border':`${color}36`, '--ui-glow':`${color}26` } as CSSProperties;
}
type Visual = { icon:LucideIcon; tone:Tone };
const visuals:Record<string,Visual> = {
  'A little support':{icon:HandHeart,tone:'cyan'}, 'Saved progress':{icon:Trophy,tone:'lime'}, 'Device data':{icon:Layers3,tone:'blue'}, 'Anonymous counselling':{icon:HandHeart,tone:'cyan'}, 'Your session requests':{icon:ScrollText,tone:'purple'},
  'Edit vibe':{icon:Radio,tone:'cyan'}, 'Edit mindset':{icon:Compass,tone:'purple'}, 'Edit boundaries':{icon:ShieldCheck,tone:'lime'}, 'Trust & safety':{icon:ShieldCheck,tone:'lime'}, 'Your conversation profile':{icon:UserRound,tone:'purple'}, 'A little braver. At your pace.':{icon:Compass,tone:'purple'}, 'Challenges.':{icon:Compass,tone:'purple'}, 'More ways to explore':{icon:BookOpen,tone:'blue'}, 'Choose your next step':{icon:Sparkles,tone:'lime'},
  'Daily Deck':{icon:Layers3,tone:'purple'}, 'Chat Games':{icon:Gamepad2,tone:'pink'}, 'Affinity':{icon:Compass,tone:'cyan'}, 'XP Economy':{icon:Coins,tone:'amber'},
  'Shadow Simulator':{icon:Puzzle,tone:'purple'}, 'Skill Tree Journal':{icon:TreePine,tone:'lime'}, 'Scenario Spinner':{icon:Shuffle,tone:'amber'}, 'Vulnerability Staircase':{icon:TrendingUp,tone:'pink'}, 'Text Escape Room':{icon:KeyRound,tone:'cyan'}, 'Blind Empathy Swap':{icon:HandHeart,tone:'coral'}, 'Mentorship Gauntlet':{icon:GraduationCap,tone:'blue'}, 'Crucible Debates':{icon:MessagesSquare,tone:'amber'}, 'Lore Bounties':{icon:ScrollText,tone:'lime'},
  'Pace Maker':{icon:Wind,tone:'cyan'}, 'Sanctuary':{icon:Heart,tone:'pink'}, 'Lantern Garden':{icon:Flame,tone:'amber'}, 'Reframing Loom':{icon:Shuffle,tone:'purple'}, 'Pulse Sync':{icon:Activity,tone:'coral'}, 'Kintsugi Canvas':{icon:Gem,tone:'amber'}, 'Boundary Sentinels':{icon:ShieldCheck,tone:'lime'}, 'Ebb & Flow':{icon:Waves,tone:'blue'}, 'Fractured Root':{icon:GitBranch,tone:'lime'},
  'Design & creativity':{icon:Palette,tone:'pink'}, 'Career & work':{icon:Lightbulb,tone:'amber'}, 'Mindful moments':{icon:Flower2,tone:'lime'}, 'Stories & imagination':{icon:Telescope,tone:'blue'},
  'Guild Tavern':{icon:Castle,tone:'amber'}, 'Trust & boundaries':{icon:ShieldCheck,tone:'lime'}, 'Arbitration Chamber':{icon:Scale,tone:'coral'}, 'Your interests':{icon:Compass,tone:'cyan'}, 'Access code':{icon:Fingerprint,tone:'purple'}, 'Knowledge quiz':{icon:BookOpen,tone:'blue'}, 'Fact-check practice':{icon:Eye,tone:'coral'},
  'Your next hello.':{icon:MessageCircle,tone:'purple'}, 'Find your people.':{icon:Sparkles,tone:'purple'}, 'Discover':{icon:Compass,tone:'cyan'}, 'Small steps. Good progress.':{icon:Trophy,tone:'amber'}, 'Your space.':{icon:UserRound,tone:'pink'}, 'Room for a conversation.':{icon:Radio,tone:'coral'}, 'Pick what sparks your curiosity.':{icon:Lightbulb,tone:'amber'}, 'Meet a new perspective.':{icon:MessagesSquare,tone:'cyan'},
  'Choose your space':{icon:Gamepad2,tone:'purple'}, 'Conversations':{icon:MessageCircle,tone:'cyan'}, 'How are you feeling?':{icon:Heart,tone:'pink'}, 'Your community':{icon:Castle,tone:'amber'}, 'Explore interests':{icon:Compass,tone:'cyan'}, 'Try something together':{icon:Sparkles,tone:'pink'}, 'Community event':{icon:MoonStar,tone:'purple'}, 'Daily steps':{icon:Trophy,tone:'amber'}, 'Today’s question':{icon:Lightbulb,tone:'pink'}, 'Keep your curiosity going':{icon:BookOpen,tone:'blue'}, 'Make it yours':{icon:Palette,tone:'pink'}, 'Your check-in':{icon:Heart,tone:'coral'}, 'App preferences':{icon:Settings2,tone:'blue'}, 'Privacy & community':{icon:ShieldCheck,tone:'lime'}, 'Explore rooms':{icon:Radio,tone:'coral'}, 'Sample connections':{icon:HandHeart,tone:'cyan'},
  'Sports':{icon:Trophy,tone:'lime'}, 'Raw':{icon:MoonStar,tone:'purple'}, 'Vibe':{icon:Radio,tone:'pink'}, 'Philosophy':{icon:Telescope,tone:'blue'}, 'Physical':{icon:Dumbbell,tone:'coral'}, 'Spiritual':{icon:Flower2,tone:'cyan'}, 'Career':{icon:Lightbulb,tone:'amber'}, 'Creative':{icon:Palette,tone:'purple'},
};
export function visualFor(title:string):Visual {
  const normalized = title.replace('Skill-Tree','Skill Tree').replace('Pace-Maker','Pace Maker').replace('Ebb & Flow UI','Ebb & Flow');
  return visuals[normalized] || {icon:Sprout,tone:'purple'};
}
