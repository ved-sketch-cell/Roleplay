import { Shield, Lock, Eye, Bell, HelpCircle, UserCircle, Palette, Code } from 'lucide-react';
import { useState } from 'react';

interface SettingsProps {
  onNavigateToAvatarCustomization?: () => void;
  onNavigateToAccessCode?: () => void;
}

export function Settings({ onNavigateToAvatarCustomization, onNavigateToAccessCode }: SettingsProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [aiAnonymization, setAiAnonymization] = useState(true);
  const [voiceModulation, setVoiceModulation] = useState(true);
  const [videoBlurring, setVideoBlurring] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-24">
      {/* Header */}
      <div className="px-6 py-6 bg-white">
        <h1 className="text-[28px] mb-2">Settings</h1>
        <p className="text-gray-500">Privacy & security controls</p>
      </div>

      {/* Privacy Section */}
      <div className="px-6 py-6 bg-white mt-1">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-green-500" />
          <h2 className="text-[20px]">Privacy Protection</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="mb-1">AI Text Anonymization</p>
              <p className="text-sm text-gray-500">
                Automatically modify your text style to prevent identification
              </p>
            </div>
            <button
              onClick={() => setAiAnonymization(!aiAnonymization)}
              className={`ml-4 w-12 h-7 rounded-full transition-colors ${
                aiAnonymization ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  aiAnonymization ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-gray-200" />

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="mb-1">Voice Tone Modulation</p>
              <p className="text-sm text-gray-500">
                Adjust voice during calls to maintain anonymity
              </p>
            </div>
            <button
              onClick={() => setVoiceModulation(!voiceModulation)}
              className={`ml-4 w-12 h-7 rounded-full transition-colors ${
                voiceModulation ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  voiceModulation ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-gray-200" />

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="mb-1">Video Face Blurring</p>
              <p className="text-sm text-gray-500">
                Obscure facial features during video calls
              </p>
            </div>
            <button
              onClick={() => setVideoBlurring(!videoBlurring)}
              className={`ml-4 w-12 h-7 rounded-full transition-colors ${
                videoBlurring ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  videoBlurring ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="px-6 py-6 bg-white mt-1">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-6 h-6 text-purple-500" />
          <h2 className="text-[20px]">Security</h2>
        </div>

        <div className="space-y-3">
          <button className="w-full bg-gray-50 rounded-xl p-4 flex items-center gap-3 hover:bg-gray-100">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <p>End-to-End Encryption</p>
              <p className="text-sm text-gray-500">Blockchain-based messaging</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs">
              Active
            </div>
          </button>

          <button className="w-full bg-gray-50 rounded-xl p-4 flex items-center gap-3 hover:bg-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p>IP Address Protection</p>
              <p className="text-sm text-gray-500">Cryptography enabled</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs">
              Active
            </div>
          </button>

          <button
            onClick={onNavigateToAccessCode}
            className="w-full bg-gray-50 rounded-xl p-4 flex items-center gap-3 hover:bg-gray-100"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Code className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 text-left">
              <p>Your Access Code</p>
              <p className="text-sm text-gray-500">Share to connect anonymously</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs">
              7865984
            </div>
          </button>
        </div>
      </div>

      {/* Personalization */}
      <div className="px-6 py-6 bg-white mt-1">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-6 h-6 text-pink-500" />
          <h2 className="text-[20px]">Personalization</h2>
        </div>

        <div className="space-y-3">
          <button
            onClick={onNavigateToAvatarCustomization}
            className="w-full bg-gray-50 rounded-xl p-4 flex items-center gap-3 hover:bg-gray-100"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-xl">
              🦊
            </div>
            <div className="flex-1 text-left">
              <p>Change Avatar</p>
              <p className="text-sm text-gray-500">Choose unique visual identifier</p>
            </div>
          </button>

          <button className="w-full bg-gray-50 rounded-xl p-4 flex items-center gap-3 hover:bg-gray-100">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1 text-left">
              <p>Customize Username</p>
              <p className="text-sm text-gray-500">Update display name & color</p>
            </div>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="px-6 py-6 bg-white mt-1">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-6 h-6 text-blue-500" />
          <h2 className="text-[20px]">Notifications</h2>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="mb-1">Push Notifications</p>
            <p className="text-sm text-gray-500">
              Get notified about messages and events
            </p>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`ml-4 w-12 h-7 rounded-full transition-colors ${
              notificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* About */}
      <div className="px-6 py-6 bg-white mt-1">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-6 h-6 text-gray-500" />
          <h2 className="text-[20px]">About</h2>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <p className="text-sm mb-3">
            RolePlay is a secure platform for anonymous knowledge sharing. We prioritize your privacy 
            with AI-driven anonymization and blockchain encryption.
          </p>
          <p className="text-xs text-gray-600 mb-2">
            <strong>Note:</strong> This platform is not designed for collecting PII or securing highly sensitive data. 
            Please use responsibly and consult professionals for critical matters.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Version 1.0.0</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>
    </div>
  );
}