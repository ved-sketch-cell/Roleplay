import { MessageCircle, Shield, AlertCircle, Clock } from 'lucide-react';
import { AppHeader } from './AppHeader';

interface HomeProps {
  onChatSelect: (chatId: string) => void;
}

const anonymousChats = [
  {
    id: '1',
    avatar: '🦊',
    color: '#FF6B6B',
    username: 'FoxWhisperer',
    userCode: '4523',
    lastMessage: 'The project insights you shared were invaluable...',
    timestamp: '2m ago',
    unread: 3,
    verified: true,
    status: 'Mental'
  },
  {
    id: '2',
    avatar: '🌙',
    color: '#4ECDC4',
    username: 'MoonlightSage',
    userCode: '8921',
    lastMessage: 'Have you tried the meditation technique I mentioned?',
    timestamp: '15m ago',
    unread: 1,
    verified: true,
    status: 'Spiritual'
  },
  {
    id: '3',
    avatar: '⚡',
    color: '#FFE66D',
    username: 'ThunderMind',
    userCode: '3456',
    lastMessage: 'The workout plan is showing great results!',
    timestamp: '1h ago',
    unread: 0,
    verified: false,
    status: 'Physical'
  },
  {
    id: '4',
    avatar: '🌸',
    color: '#FF6BCB',
    username: 'BlossomPath',
    userCode: '7812',
    lastMessage: 'Thank you for the career advice, it really helped',
    timestamp: '3h ago',
    unread: 0,
    verified: true,
    status: 'Mental'
  },
  {
    id: '5',
    avatar: '🔮',
    color: '#9B59B6',
    username: 'CrystalMind',
    userCode: '2341',
    lastMessage: 'The book recommendation was perfect!',
    timestamp: '5h ago',
    unread: 0,
    verified: false,
    status: 'Spiritual'
  }
];

const limitedTimeEvents = [
  { title: '24h Wellness Challenge', timeLeft: '18h left', color: '#FF6B6B' },
  { title: 'Expert Q&A Session', timeLeft: '6h left', color: '#4ECDC4' }
];

export function Home({ onChatSelect }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <AppHeader 
        title="RolePlay" 
        showSearch={true}
        showNotifications={true}
        showAdd={true}
        notificationCount={5}
      />

      {/* Subtitle */}
      <div className="px-6 pb-4 bg-white">
        <p className="text-gray-500">Anonymous knowledge sharing platform</p>
        <div className="flex items-center gap-2 mt-2">
          <Shield className="w-4 h-4 text-green-500" />
          <p className="text-xs text-gray-500">Simulated in this prototype</p>
        </div>
      </div>

      {/* Limited Time Events */}
      <div className="px-6 py-4 bg-white mt-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[18px]">⚡ Limited Time</h2>
          <Clock className="w-5 h-5 text-orange-500" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {limitedTimeEvents.map((event, index) => (
            <div
              key={index}
              className="min-w-[260px] rounded-2xl p-4"
              style={{ background: `linear-gradient(135deg, ${event.color}15 0%, ${event.color}30 100%)` }}
            >
              <p className="mb-1">{event.title}</p>
              <p className="text-sm text-gray-600">{event.timeLeft}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Notice */}
      <div className="px-6 py-4 mx-6 my-4 bg-blue-50 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm mb-1">Community Moderation Active</p>
          <p className="text-xs text-gray-600">AI-powered content monitoring and user verification ensure safe interactions</p>
        </div>
      </div>

      {/* Chats */}
      <div className="px-6 py-4">
        <h2 className="text-[18px] mb-4">Anonymous Conversations</h2>
        <div className="space-y-3">
          {anonymousChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-shadow"
            >
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: chat.color + '20' }}
              >
                {chat.avatar}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <p className="truncate">{chat.username}</p>
                  {chat.verified && (
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px]">✓</span>
                    </div>
                  )}
                  <span className="text-xs text-gray-400 ml-auto flex-shrink-0">{chat.timestamp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">{chat.unread}</span>
                    </div>
                  )}
                </div>
                <div className="mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {chat.status}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Padding */}
      <div className="h-24" />
    </div>
  );
}