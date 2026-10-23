import { Search, Bell, Plus, MoreVertical, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';

interface AppHeaderProps {
  title: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showAdd?: boolean;
  showSettings?: boolean;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  onAddClick?: () => void;
  onSettingsClick?: () => void;
  notificationCount?: number;
}

export function AppHeader({ 
  title, 
  showSearch = true, 
  showNotifications = true,
  showAdd = false,
  showSettings = false,
  onSearchClick,
  onNotificationClick,
  onAddClick,
  onSettingsClick,
  notificationCount = 0
}: AppHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Status Bar */}
      <div className="px-6 pt-3 pb-2 flex items-center justify-between">
        <p className="text-[15px] tracking-[-0.3px]">9:41</p>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4">
            <svg viewBox="0 0 17 11" fill="none">
              <path d="M7.63661 2.27733C9.8525 2.27742 11.9837 3.12886 13.5896 4.65566C13.7105 4.77354 13.9038 4.77205 14.0229 4.65233L15.1789 3.48566C15.2392 3.42494 15.2729 3.34269 15.2724 3.25711C15.2719 3.17153 15.2373 3.08967 15.1763 3.02966C10.9612 -1.00989 4.31137 -1.00989 0.0962725 3.02966C0.0352139 3.08963 0.00057 3.17146 6.97078e-06 3.25704C-0.000556058 3.34262 0.0330082 3.42489 0.0932725 3.48566L1.24961 4.65233C1.36863 4.77223 1.56208 4.77372 1.68294 4.65566C3.28909 3.12876 5.4205 2.27732 7.63661 2.27733Z" fill="#060606"/>
            </svg>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
      </div>

      {/* Main Header */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-[28px] leading-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {showSearch && (
            <button 
              onClick={onSearchClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {showAdd && (
            <button 
              onClick={onAddClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}

          {showNotifications && (
            <button 
              onClick={onNotificationClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px]">{notificationCount > 9 ? '9+' : notificationCount}</span>
                </div>
              )}
            </button>
          )}

          {showSettings && (
            <button 
              onClick={onSettingsClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          )}

          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div className="absolute right-6 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2">
          <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
            <span className="text-lg">⚙️</span>
            <span>Settings</span>
          </button>
          <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
            <span className="text-lg">❓</span>
            <span>Help & Support</span>
          </button>
          <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
            <span className="text-lg">📊</span>
            <span>My Activity</span>
          </button>
          <div className="h-px bg-gray-100 my-2" />
          <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-red-500">
            <span className="text-lg">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
