import { useState } from 'react';
import { UserProfile } from '../types';
import { Bell, Key, Sparkles, Send, Play } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface PushSimulatorProps {
  userProfile: UserProfile;
  onSimulateNotification: (message: string) => void;
}

export default function PushSimulator({ userProfile, onSimulateNotification }: PushSimulatorProps) {
  const [customMsg, setCustomMsg] = useState('');

  const triggerSimulatedPush = (msg: string) => {
    if (!msg.trim()) return;
    soundEffects.playAlert();
    onSimulateNotification(msg.trim());
    setCustomMsg('');
  };

  const getSampleMessages = () => {
    return [
      `⏰ Chore Deadline: Clean the living room is due in 15 minutes!`,
      `🏆 Level Up! Mom Sarah just reached Level 4 in the Smiths family circle!`,
      `🔔 Family Challenge: Daily exercises goals completed by 3 family members!`
    ];
  };

  return (
    <div className="paper-card bg-[#faf8ff] p-6 border-2 border-purple-200">
      
      <div className="mb-4">
        <h3 className="font-caveat text-3xl font-bold text-purple-900 flex items-center gap-2">
          🔔 Firebase Push Simulator
        </h3>
        <p className="text-xs text-purple-500 font-medium font-sans">
          This simulates push notifications sent via Firebase Cloud Messaging (FCM) using your unique ID.
        </p>
      </div>

      <div className="space-y-4">
        
        {/* Firebase Device Token Panel */}
        <div className="bg-purple-100/50 border-2 border-dashed border-purple-300 p-3.5 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800">
            <Key className="w-4 h-4 text-purple-600" />
            <span>Your Generated Firebase ID (FCM Device Token)</span>
          </div>
          
          <div className="bg-white p-2 rounded-lg border border-purple-200 font-mono text-[10px] text-purple-600 break-all select-all text-center">
            {userProfile.pushToken}
          </div>
          <p className="text-[10px] text-purple-400 font-medium leading-relaxed">
            * This unique device ID is registered in Firestore upon login, allowing specific members to be targeted with push alerts.
          </p>
        </div>

        {/* Send Simulated Alert */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider">
            Trigger Immediate Simulated Push Notification
          </label>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type notification message..."
              className="flex-1 px-3 py-1.5 bg-white border-2 border-purple-100 rounded-xl text-xs font-medium text-purple-900 focus:border-purple-300 focus:outline-none"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && triggerSimulatedPush(customMsg)}
            />
            <button
              onClick={() => triggerSimulatedPush(customMsg)}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </div>
        </div>

        {/* Preset Notification templates */}
        <div className="space-y-1.5">
          <span className="block text-[10px] font-bold text-purple-400 uppercase tracking-wider">
            Quick Simulation Presets:
          </span>
          <div className="space-y-1.5">
            {getSampleMessages().map((msg, idx) => (
              <button
                key={idx}
                onClick={() => triggerSimulatedPush(msg)}
                className="w-full text-left p-2 bg-white hover:bg-purple-50 border border-purple-100 hover:border-purple-200 rounded-lg text-[11px] font-medium text-purple-700 transition-all flex items-center justify-between cursor-pointer"
              >
                <span>{msg}</span>
                <Play className="w-3 h-3 text-purple-400 shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
