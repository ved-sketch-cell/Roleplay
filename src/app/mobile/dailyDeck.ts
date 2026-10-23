export interface ScenarioCard {
  id: string;
  level: 'chill' | 'deep' | 'chaotic';
  category: string;
  emoji: string;
  color: string;
  secondColor: string;
  prompt: string;
  drive: string;
  driveEmoji: string;
  expiresHours: number;
  xpBounty: number | null;
  author: string | null;
  heat: number;
  room: string;
  roomMembers: number;
}

export const ALL_CARDS: ScenarioCard[] = [
  {
    id: '1', level: 'chaotic',
    category: 'Cricket', emoji: '🏏',
    color: '#16a34a', secondColor: '#065f46',
    prompt: "You are the captain in the locker room after a historic batting collapse. Give the 60-second speech that saves your team's morale — or doesn't.",
    drive: 'Roleplay · Empowerment', driveEmoji: '💪',
    expiresHours: 14.5,
    xpBounty: null, author: null,
    heat: 78, room: '🏏 Cricket Pavilion', roomMembers: 34,
  },
  {
    id: '2', level: 'deep',
    category: 'Astrology', emoji: '♄',
    color: '#8169ec', secondColor: '#4c1d95',
    prompt: "Saturn just entered your 7th house. Tell the Tavern why your character's latest relationship is entirely doomed — with receipts.",
    drive: 'Narrative · Unpredictability', driveEmoji: '🔮',
    expiresHours: 8.2,
    xpBounty: 340, author: 'AstroMaven',
    heat: 45, room: '🌙 Cosmos Lounge', roomMembers: 18,
  },
  {
    id: '3', level: 'chill',
    category: 'Bollywood', emoji: '🎬',
    color: '#ea580c', secondColor: '#9a3412',
    prompt: "Recast a classic 90s Bollywood blockbuster using only cyberpunk characters. Who plays the villain, and why is it terrifyingly perfect?",
    drive: 'Creativity · Social Debate', driveEmoji: '🎭',
    expiresHours: 21.8,
    xpBounty: null, author: null,
    heat: 52, room: '🌶️ Creative Lab', roomMembers: 23,
  },
  {
    id: '4', level: 'deep',
    category: 'Deep Chat', emoji: '🧠',
    color: '#0891b2', secondColor: '#164e63',
    prompt: "Name a 'safe' coping mechanism your character relies on that is secretly sabotaging their potential. State it without justifying it.",
    drive: 'Vulnerability · Introspection', driveEmoji: '🕯️',
    expiresHours: 6.4,
    xpBounty: 580, author: 'NightOwl_7',
    heat: 28, room: '🫧 Sanctuary', roomMembers: 7,
  },
  {
    id: '5', level: 'chaotic',
    category: 'Tech Debates', emoji: '⚡',
    color: '#8169ec', secondColor: '#1e1b4b',
    prompt: "Foldable phones are an overpriced design crime. Argue the opposite with more passion than the salesperson who sold you yours.",
    drive: 'Hot Take · Provocation', driveEmoji: '🔥',
    expiresHours: 18.1,
    xpBounty: 125, author: 'DragonMask_K',
    heat: 82, room: '⚡ Circuit Guild', roomMembers: 41,
  },
];


export const dailyDeckCard = (id?: string) => ALL_CARDS.find(card => card.id === id);
export const suggestedDeckChat: Record<string, string> = {'1':'3','2':'2','3':'6','4':'9','5':'5'};
