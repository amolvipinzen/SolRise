import { useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { soundEffects } from '../utils/audio';

interface LoginScreenProps {
  onLoginSuccess: (userProfile: UserProfile) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate a random push notification token for simulation
  const generateMockPushToken = () => {
    return 'FCM-TOKEN-' + Math.random().toString(36).substring(2, 11).toUpperCase() + '-' + Date.now().toString().slice(-4);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const userCredential = await signInWithPopup(auth, provider);
      const { uid, email, displayName } = userCredential.user;

      // 1. Fetch user profile from Firestore
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      let profileData: UserProfile;

      if (userDocSnap.exists()) {
        profileData = userDocSnap.data() as UserProfile;
      } else {
        // Create new user profile document in Firestore
        profileData = {
          uid,
          displayName: displayName || email?.split('@')[0] || 'SolRise Member',
          email: email || '',
          avatarEmoji: '🌞', // Default starting avatar
          role: 'Parent', // Default starting role
          circleId: null, // Initially no family circle
          xp: 0,
          level: 1,
          pushToken: generateMockPushToken(),
          createdAt: new Date().toISOString(),
          dayStreak: 0,
          bestStreak: 0,
          tasksCompleted: 0,
          activeDays: []
        };
        await setDoc(userDocRef, profileData);
      }

      soundEffects.playLevelUp();
      onLoginSuccess(profileData);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/configuration-not-found') {
        setError('Firebase Configuration Not Found: Google Sign-In is not enabled for this Firebase project. To fix this:\n\n' +
          '1. Go to your Firebase Console (https://console.firebase.google.com/)\n' +
          '2. Open project "solrise-f96b5"\n' +
          '3. Navigate to "Authentication" -> "Sign-in method"\n' +
          '4. Click "Add new provider", select "Google", toggle it to "Enable", specify a project support email, and click "Save".');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Unauthorized Domain: This website\'s domain is not authorized in your Firebase project yet.\n\n' +
          'To fix this:\n' +
          '1. Go to your Firebase Console (https://console.firebase.google.com/)\n' +
          '2. Select project "solrise-f96b5"\n' +
          '3. Go to "Authentication" -> "Settings" -> "Authorized domains"\n' +
          '4. Add this app\'s URL domain: ' + window.location.hostname);
      } else if (
        (err.message && (err.message.toLowerCase().includes('offline') || err.message.toLowerCase().includes('failed to get document'))) || 
        err.code === 'unavailable' || 
        err.code === 'permission-denied'
      ) {
        setError('Firestore Database Connection Failed:\n\n' +
          'Google authenticated successfully, but the app cannot connect to your Firestore database. This usually means you haven\'t created or enabled the "Firestore Database" in your Firebase console yet.\n\n' +
          'To fix this:\n' +
          '1. Go to your Firebase Console (https://console.firebase.google.com/)\n' +
          '2. Open project "solrise-f96b5"\n' +
          '3. In the left navigation bar, click on "Firestore Database" (under Build)\n' +
          '4. Click the "Create database" button\n' +
          '5. Select your database location/region and click "Next"\n' +
          '6. Select "Start in test mode" (recommended for development so the app can read/write data) and click "Create"\n' +
          '7. Once the database is initialized, return here, refresh the page, and try signing in again!');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Google Sign-In popup was closed. Please try again. If the popup opened behind the window, please use the "Open App in New Tab" option below.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Sign-In request was cancelled. Please try again. If the popup opened behind the window, please use the "Open App in New Tab" option below.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site, or click "Open App in New Tab" below.');
      } else {
        setError(err.message || 'Google Sign-In failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Detect if running inside an iframe (e.g. AI Studio Preview)
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="min-h-screen sky-dawn text-white flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden">
      {/* Rising sun */}
      <div className="absolute inset-x-0 bottom-0 h-[45vh] pointer-events-none" aria-hidden="true">
        <motion.div
          initial={{ y: 220 }}
          animate={{ y: 40 }}
          transition={{ duration: 2.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-gradient-to-b from-[#FFF1A8] to-[#FFB648] opacity-90 shadow-[0_0_120px_40px_rgba(255,200,110,0.55)]"
        />
        <div className="absolute bottom-0 inset-x-0 h-[22vh] bg-gradient-to-t from-[#5E3A8C]/70 to-transparent" />
      </div>

      <div className="relative w-full max-w-sm">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
          <div className="text-6xl" aria-hidden="true">🌅</div>
          <h1 className="font-display text-5xl font-semibold mt-4 drop-shadow-sm">SolRise</h1>
          <p className="text-lg text-white/90 mt-2">Rise a little every day.</p>
        </motion.div>

        <motion.ul
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.4 } } }}
          className="mt-8 space-y-2.5"
        >
          {[
            ['☀️', 'A fresh, focused list every morning'],
            ['🎉', 'Small wins, celebrated every time'],
            ['👨‍👩‍👧', 'Share routines and chores with family'],
          ].map(([emoji, text]) => (
            <motion.li
              key={text}
              variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
              className="flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-sm font-semibold"
            >
              <span className="text-xl">{emoji}</span>
              {text}
            </motion.li>
          ))}
        </motion.ul>

        {isIframe && (
          <div className="mt-6 p-4 bg-white/90 text-[#5a3a12] rounded-2xl text-xs leading-relaxed">
            <p className="font-bold mb-1">Running inside a preview frame</p>
            <p className="mb-3">Google sign-in popups are often blocked inside iframes.</p>
            <button type="button" onClick={handleOpenInNewTab} className="w-full px-4 py-2 bg-[#E2803A] text-white font-bold rounded-xl cursor-pointer">
              Open app in a new tab ↗
            </button>
          </div>
        )}

        {error && (
          <div role="alert" className="mt-6 p-4 bg-white text-[#9B2C2C] rounded-2xl text-xs font-medium leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
            {error}
          </div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-8 w-full flex items-center justify-center gap-3 py-4 px-4 bg-white text-[#2A1A12] font-bold rounded-2xl shadow-xl press cursor-pointer disabled:opacity-80"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Connecting…
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M23.49 12.275c0-.825-.075-1.62-.21-2.385H12v4.515h6.45c-.27 1.455-1.095 2.685-2.325 3.51v2.91h3.765c2.205-2.025 3.48-5.01 3.48-8.55z" />
                <path fill="#4285F4" d="M12 24c3.24 0 5.955-1.08 7.935-2.91l-3.765-2.91c-1.05.69-2.385 1.11-4.17 1.11-3.21 0-5.925-2.16-6.885-5.07H1.365v3.015C3.345 21.18 7.395 24 12 24z" />
                <path fill="#FBBC05" d="M5.115 14.22c-.24-.72-.375-1.485-.375-2.22s.135-1.5.375-2.22V6.765H1.365C.54 8.415 0 10.155 0 12s.54 3.585 1.365 5.235l3.75-3.015z" />
                <path fill="#34A853" d="M12 4.755c1.77 0 3.345.615 4.59 1.8l3.435-3.435C17.94 1.185 15.225 0 12 0 7.395 0 3.345 2.82 1.365 6.765l3.75 3.015c.96-2.91 3.675-5.025 6.885-5.025z" />
              </svg>
              Continue with Google
            </>
          )}
        </motion.button>
        <p className="text-center text-xs text-white/75 mt-4">Free, private, no passwords to remember.</p>
      </div>
    </div>
  );
}
