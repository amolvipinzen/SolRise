import React, { useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';
import { Sparkles, HelpCircle } from 'lucide-react';
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
          avatarEmoji: '🦊', // Default starting avatar
          role: 'Parent', // Default starting role
          circleId: null, // Initially no family circle
          xp: 0,
          level: 1,
          pushToken: generateMockPushToken(),
          createdAt: new Date().toISOString()
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-md paper-card p-8 bg-white border border-purple-200 custom-shadow rounded-2xl relative overflow-hidden">
        
        {/* Subtle decorative top sun glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-200/20 blur-3xl rounded-full"></div>

        {/* Handwriting Styled Logo */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-full border border-amber-200 text-amber-500 mb-4 shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="font-caveat text-5xl font-bold text-purple-950 tracking-tight">
            SolRise
          </h1>
          <p className="font-sans text-base text-purple-700 font-semibold mt-1">
            A new beginning
          </p>
          <p className="font-sans text-xs text-purple-500/80 mt-3 italic px-6 leading-relaxed border-t border-purple-100/60 pt-3">
            Rise to a better day with everything your home needs.
          </p>
        </div>

        {isIframe && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold leading-relaxed relative z-10 shadow-sm">
            <div className="flex items-start gap-2.5">
              <span className="text-base shrink-0 mt-0.5">⚠️</span>
              <div>
                <p className="font-bold text-amber-950 mb-1">Running in AI Studio Preview Frame</p>
                <p className="text-amber-800/90 font-normal mb-3">
                  Google Sign-In popups are often blocked or open in the background when running inside an iframe.
                </p>
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all cursor-pointer shadow-sm text-[11px] gap-1.5"
                >
                  Open App in New Tab ↗
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50/80 border border-red-200 text-red-700 rounded-xl text-xs font-semibold leading-relaxed whitespace-pre-wrap">
            ⚠️ {error}
          </div>
        )}

        {/* Google Authentication Only Button */}
        <div className="space-y-4 relative z-10">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center py-3.5 px-4 bg-white hover:bg-purple-50/40 border border-purple-200 active:translate-y-0.5 text-purple-950 font-bold rounded-xl transition-all cursor-pointer font-sans shadow-sm hover:shadow-md"
          >
            {loading ? (
              <span className="flex items-center gap-2 text-purple-600">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting with Google...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M23.49 12.275c0-.825-.075-1.62-.21-2.385H12v4.515h6.45c-.27 1.455-1.095 2.685-2.325 3.51v2.91h3.765c2.205-2.025 3.48-5.01 3.48-8.55z"
                  />
                  <path
                    fill="#4285F4"
                    d="M12 24c3.24 0 5.955-1.08 7.935-2.91l-3.765-2.91c-1.05.69-2.385 1.11-4.17 1.11-3.21 0-5.925-2.16-6.885-5.07H1.365v3.015C3.345 21.18 7.395 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.115 14.22c-.24-.72-.375-1.485-.375-2.22s.135-1.5.375-2.22V6.765H1.365C.54 8.415 0 10.155 0 12s.54 3.585 1.365 5.235l3.75-3.015z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 4.755c1.77 0 3.345.615 4.59 1.8l3.435-3.435C17.94 1.185 15.225 0 12 0 7.395 0 3.345 2.82 1.365 6.765l3.75 3.015c.96-2.91 3.675-5.025 6.885-5.025z"
                  />
                </svg>
                Sign In with Google
              </>
            )}
          </button>
        </div>

        {/* Info notice about Google Authentication alone */}
        <div className="mt-8 pt-6 border-t-2 border-dashed border-purple-100 flex items-start gap-2.5 text-[11px] text-purple-500/75 leading-relaxed">
          <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p>
            SolRise uses secure Google Authentication to connect you with your family. No password setup is required.
          </p>
        </div>

      </div>
    </div>
  );
}
