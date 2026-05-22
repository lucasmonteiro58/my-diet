# My Diet

Mobile-first app that turns nutrition PDF meal plans into a clean, modern interface. Built with React, TypeScript, Tailwind CSS, and Firebase.

## Features

- Import meal plans via AI (copy prompt → Gemini/ChatGPT with PDF → paste JSON)
- Pre-loaded demo plan (Lucas Monteiro — 22/05/2026)
- Google sign-in via Firebase Authentication
- Save plans to Firestore (per user) with local fallback
- Three menu tabs (weekday / weekend), expandable meal cards, macro grid

## Quick start

```bash
npm install
cp .env.example .env
# Fill in Firebase config (see below)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Firebase setup

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Add a **Web app** and copy config into `.env`.
3. **Authentication** → Sign-in method → enable **Google**.
4. **Firestore** → Create database.
5. Deploy rules from `firestore.rules` or paste them in the Rules tab.
6. Create a composite index if prompted: collection `dietPlans`, fields `userId` (Ascending) + `updatedAt` (Descending).

### Authorized domains

Add `localhost` and your production domain under Authentication → Settings → Authorized domains.

## Scripts

| Command        | Description          |
|----------------|----------------------|
| `npm run dev`  | Development server   |
| `npm run build`| Production build     |
| `npm run preview` | Preview build     |

## Importing a plan (AI workflow)

1. In the app, tap **Importar plano** → **Copiar prompt para IA**
2. Open [Gemini](https://gemini.google.com), attach your nutrition PDF, paste the prompt
3. Copy the JSON response → app tab **2. Colar JSON** → **Usar este plano**
4. Save locally or to Firebase

The prompt and JSON schema live in `src/lib/ai-prompt.ts` and `src/lib/import-plan.ts`.

## Tech stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- Firebase Auth + Firestore
- React Router, Lucide icons
