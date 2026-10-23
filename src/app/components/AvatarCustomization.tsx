import { ChevronLeft, Check } from 'lucide-react';
import { useState } from 'react';
import { useDeviceState,defaultIdentity, type MobileIdentity } from '../mobile/state';

interface AvatarCustomizationProps {
  onBack: () => void;
  onSave: (avatar: string, color: string, username: string,style?:string) => void;
  initialIdentity?: MobileIdentity;
}

const avatarOptions = [
  '🦊', '🌙', '⚡', '🌸', '🔮', '🦉', '🌟', '🧭', '🎭', '🦋',
  '🌊', '🔥', '🌈', '💎', '🎨', '🎯', '🌺', '🦅', '🐺', '🦁',
  '🐉', '🦄', '🌵', '🍃', '🌻', '🦚', '🐢', '🦈', '🐙', '🦑'
];

const colorOptions = [
  { name: 'Coral', value: '#FF6B6B' },
  { name: 'Turquoise', value: '#4ECDC4' },
  { name: 'Lemon', value: '#FFE66D' },
  { name: 'Pink', value: '#FF6BCB' },
  { name: 'Purple', value: '#9B59B6' },
  { name: 'Blue', value: '#3498DB' },
  { name: 'Green', value: '#2ECC71' },
  { name: 'Orange', value: '#E67E22' },
  { name: 'Indigo', value: '#6C5CE7' },
  { name: 'Teal', value: '#16A085' }
];

const usernameStyles = [
  { name: 'Bold', class: 'font-bold' },
  { name: 'Italic', class: 'italic' },
  { name: 'Underline', class: 'underline' },
  { name: 'Normal', class: '' }
];

export function AvatarCustomization({ onBack, onSave, initialIdentity=defaultIdentity }: AvatarCustomizationProps) {
  const [selectedAvatar, setSelectedAvatar] = useDeviceState('avatar-draft',initialIdentity.avatar);
  const [selectedColor, setSelectedColor] = useDeviceState('avatar-color-draft',initialIdentity.color);
  const [username, setUsername] = useDeviceState('avatar-name-draft',initialIdentity.username);
  const [selectedStyle, setSelectedStyle] = useDeviceState('avatar-style-draft',initialIdentity.style||'');

  return (
    <div className="mobile-identity-editor min-h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} aria-label="Back to profile" className="mobile-icon-button">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-[24px]">Customize Identity</h1>
          <p className="text-sm text-gray-500">Create your anonymous persona</p>
        </div>
        <button
          disabled={!username.trim()}
          onClick={() => onSave(selectedAvatar, selectedColor, username,selectedStyle)}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl"
        >
          Save
        </button>
      </div>

      {/* Preview */}
      <div className="px-6 py-8 bg-white mt-1">
        <p className="text-sm text-gray-600 mb-4">Preview</p>
        <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
            style={{ backgroundColor: selectedColor + '20' }}
          >
            {selectedAvatar}
          </div>
          <div className="text-center">
            <p className={`text-[24px] ${selectedStyle}`} style={{ color: selectedColor }}>
              {username}
            </p>
            <p className="text-sm text-gray-500 mt-1">User Code: 7865984</p>
          </div>
        </div>
      </div>

      {/* Avatar Selection */}
      <div className="px-6 py-6 bg-white mt-1">
        <h2 className="text-[20px] mb-4">Choose Avatar</h2>
        <div className="mobile-avatar-grid">
          {avatarOptions.map((avatar) => (
            <button
              key={avatar}
              aria-label={`Choose avatar ${avatar}`}
              aria-pressed={selectedAvatar===avatar}
              onClick={() => setSelectedAvatar(avatar)}
              className={`aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all ${
                selectedAvatar === avatar
                  ? 'bg-blue-100 ring-2 ring-blue-500 scale-110'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="px-6 py-6 bg-white mt-1">
        <h2 className="text-[20px] mb-4">Choose Color Theme</h2>
        <div className="grid grid-cols-5 gap-4">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              aria-label={`Choose ${color.name} color`}
              aria-pressed={selectedColor===color.value}
              onClick={() => setSelectedColor(color.value)}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`w-14 h-14 rounded-full transition-all ${
                  selectedColor === color.value ? 'ring-4 ring-offset-2' : ''
                }`}
                style={{ 
                  backgroundColor: color.value,
                  outlineColor: color.value
                }}
              >
                {selectedColor === color.value && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-600">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Username */}
      <div className="px-6 py-6 bg-white mt-1">
        <h2 className="text-[20px] mb-4">Customize Username</h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={20}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 outline-none border-2 border-transparent focus:border-blue-500 transition-colors"
          placeholder="Enter username"
          aria-label="Alias"
        />
        <p className="text-xs text-gray-500 mt-2">{username.length}/20 characters</p>

        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-3">Text Style</p>
          <div className="grid grid-cols-4 gap-2">
            {usernameStyles.map((style) => (
              <button
                key={style.name}
                onClick={() => setSelectedStyle(style.class)}
                className={`px-3 py-2 rounded-xl ${
                  selectedStyle === style.class
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className={style.class}>{style.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alternative Identifiers */}
      <div className="px-6 py-6 bg-white mt-1 mb-24">
        <h2 className="text-[20px] mb-4">Alternative Visual Identifiers</h2>
        <p className="text-sm text-gray-600 mb-4">
          You can also use abstract patterns or geometric shapes instead of emojis
        </p>
        
        <div className="grid grid-cols-4 gap-3">
          {['◆', '●', '■', '▲', '★', '◉', '◈', '◐'].map((shape, index) => (
            <button
              key={index}
              onClick={()=>setSelectedAvatar(shape)}
              aria-label={`Choose shape ${shape}`}
              aria-pressed={selectedAvatar===shape}
              className="aspect-square rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-4xl hover:scale-105 transition-transform"
            >
              {shape}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
