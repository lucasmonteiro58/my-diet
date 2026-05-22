# My Diet

Mobile-first app that turns nutrition PDF meal plans into a clean, modern interface. Built with React, TypeScript, Tailwind CSS, and Firebase.

## Features

- Import diet PDFs and parse macros, menus, meals, supplements, and recommendations
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

## PDF parsing

Parsing is best-effort for plans structured like the sample (Gabriel Paes format). Complex layouts may need manual review after import; the demo plan is always available as a fallback.

## Tech stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- Firebase Auth + Firestore
- pdf.js for PDF text extraction
- React Router, Lucide icons
