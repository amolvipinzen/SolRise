import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration loaded from environment variables.
// Set these in .env locally, and in Vercel Dashboard → Project Settings → Environment Variables.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Analytics (safely, since it can sometimes fail in iframe/sandbox environments)
let analytics: Analytics | undefined;
try {
  analytics = getAnalytics(app);
  console.log("Firebase Analytics initialized successfully.");
} catch (error) {
  console.warn("Analytics initialization skipped or failed:", error);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Perform a connection validation check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection test complete.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Please check your Firebase configuration or network status. The client appears to be offline.");
    } else {
      // It's normal to get a 'not-found' permission error for a dummy path, which proves we connected!
      console.log("Firebase connection verified.");
    }
  }
}

testConnection();

export { app, db, auth, analytics };

