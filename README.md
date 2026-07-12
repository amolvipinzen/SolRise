<div align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase" />
  <img src="https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel" />
</div>

# Solrise 🌞

A family chore & routine tracking app with gamification. Built with React, Vite, Firebase Auth, and Firestore.

## Features

- 🔐 Firebase Authentication (email/password)
- 🏡 Family Circle — create or join a circle with an invite code
- ✅ Task management — chores, routines, exercises, goals
- 🏆 XP & leveling system to gamify family chores
- 📋 Activity feed / audit log for completions

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Hosting | Vercel |

## Local Development

**Prerequisites:** Node.js 18+

1. Clone the repo:
   ```bash
   git clone https://github.com/amolvipinzen/solrise.git
   cd solrise
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy env template and fill in your Firebase values:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set your Firebase project config values (from Firebase Console → Project Settings → Your Apps).

4. Start the dev server:
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:3000`

## Deployment (Vercel)

1. Import the GitHub repo in [Vercel Dashboard](https://vercel.com/new)
2. Set the following **Environment Variables** in Vercel → Project Settings → Environment Variables:

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | e.g. `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | e.g. `solrise-f96b5` |
| `VITE_FIREBASE_STORAGE_BUCKET` | e.g. `your-project.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID from Firebase Console |
| `VITE_FIREBASE_APP_ID` | App ID from Firebase Console |
| `VITE_FIREBASE_MEASUREMENT_ID` | Analytics measurement ID (optional) |

3. Deploy — Vercel auto-detects Vite and sets `npm run build` + `dist` as the output.

## Firebase Setup

- Firestore security rules are in [`firestore.rules`](./firestore.rules)
- To deploy rules: `firebase deploy --only firestore:rules`

## License

MIT
