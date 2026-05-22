# My Diet

Mobile-first app that turns nutrition PDF meal plans into a clean, modern interface. Built with React, TypeScript, Tailwind CSS, and Firebase.

## Features

- Import meal plans via AI (copy prompt → Gemini/ChatGPT with PDF → paste JSON)
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

## Importing a plan

### Automatic (default)

1. Add `VITE_GEMINI_API_KEY` to `.env` ([get a key](https://aistudio.google.com/apikey)). The app tries several models automatically (see [rate limits](https://aistudio.google.com/rate-limit))
2. **Importar plano** → **Enviar PDF** → select your nutrition PDF
3. Save locally or to Firebase

### Manual (copy/paste)

1. **Importar plano** → **Manual** → copy prompt → use [Gemini web](https://gemini.google.com) with the PDF
2. Copy the JSON from the ` ```json ` code block in Gemini’s reply (or upload `plano-alimentar.json`) in **Colar JSON**

The prompt and JSON schema live in `src/lib/ai-prompt.ts` and `src/lib/import-plan.ts`.

## Tech stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- Firebase Auth + Firestore
- React Router, Lucide icons
