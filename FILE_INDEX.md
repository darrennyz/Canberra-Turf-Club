# Canberra Turf Club - Complete File Index

## Quick Navigation

### Start Here
- `README.md` - Full project documentation
- `DEPLOY.md` - How to deploy to Vercel + Supabase
- `BUILD_STATUS.md` - Build completion report

### Configuration Files
- `package.json` - Dependencies & scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS setup
- `postcss.config.js` - PostCSS plugins
- `.eslintrc.json` - ESLint rules
- `.env.local.example` - Environment variables template
- `.gitignore` - Git ignore patterns

### Application Pages (7 pages + layout)
- `app/layout.tsx` - Root layout & metadata
- `app/page.tsx` - Home page (create/join buttons)
- `app/globals.css` - Global styles & animations
- `app/create/page.tsx` - Create session page
- `app/join/page.tsx` - Join session page
- `app/lobby/[code]/page.tsx` - Lobby (horse selection, ready button)
- `app/race/[code]/page.tsx` - Race viewer (animated race)
- `app/victory/[code]/page.tsx` - Victory screen (payouts)
- `app/settlement/page.tsx` - Final settlement screen

### API Routes (8 endpoints)

**Session Management**
- `app/api/session/create/route.ts` - Create new session
- `app/api/session/join/route.ts` - Join existing session
- `app/api/session/end/route.ts` - End session & calculate settlement

**Player Actions**
- `app/api/player/select-horse/route.ts` - Select a horse (suit)
- `app/api/player/ready/route.ts` - Toggle ready status

**Game Control**
- `app/api/game/start/route.ts` - Start race (master only)
- `app/api/game/back-to-lobby/route.ts` - Return to lobby (master only)

**Chat**
- `app/api/chat/route.ts` - Send chat message (rate-limited)

### React Components (7 components)
- `components/PlayerSetup.tsx` - Name/PIN input form
- `components/SuitIcon.tsx` - Suit symbol renderer
- `components/PixelHorse.tsx` - Pixel art horse display
- `components/CardDisplay.tsx` - Card flip animation
- `components/HorseTrack.tsx` - Race track visualization
- `components/GateCardsDisplay.tsx` - Gate cards display
- `components/ChatOverlay.tsx` - Chat system overlay

### Library Modules (5 modules)
- `lib/types.ts` - TypeScript type definitions
- `lib/gameLogic.ts` - Game algorithms & utilities
- `lib/settlement.ts` - Payout calculation logic
- `lib/supabase.ts` - Client-side Supabase
- `lib/supabaseAdmin.ts` - Server-side Supabase

### Database
- `supabase/schema.sql` - PostgreSQL schema (5 tables)

## File Organization by Feature

### Authentication & Players
- Create: `app/api/session/create/route.ts`, `app/create/page.tsx`
- Join: `app/api/session/join/route.ts`, `app/join/page.tsx`
- Setup: `components/PlayerSetup.tsx`

### Lobby Management
- Lobby Page: `app/lobby/[code]/page.tsx`
- Select Horse: `app/api/player/select-horse/route.ts`
- Ready Status: `app/api/player/ready/route.ts`

### Game Racing
- Race Logic: `lib/gameLogic.ts`, `app/api/game/start/route.ts`
- Race Display: `app/race/[code]/page.tsx`
- Horse Graphics: `components/PixelHorse.tsx`
- Track Display: `components/HorseTrack.tsx`
- Cards: `components/CardDisplay.tsx`, `components/GateCardsDisplay.tsx`

### Payouts & Settlement
- Victory Page: `app/victory/[code]/page.tsx`
- Settlement Logic: `lib/settlement.ts`, `app/api/session/end/route.ts`
- Settlement Page: `app/settlement/page.tsx`

### Real-time Communication
- Chat: `components/ChatOverlay.tsx`, `app/api/chat/route.ts`
- Database: `supabase/schema.sql` (chat_messages table)

### Styling & Animations
- Global Styles: `app/globals.css`
- Tailwind Config: `tailwind.config.ts`
- Component-specific: Inline styles in React components

## Code Statistics by File

### Largest Files
1. `app/lobby/[code]/page.tsx` - ~180 lines (lobby logic)
2. `app/race/[code]/page.tsx` - ~170 lines (race viewer)
3. `components/HorseTrack.tsx` - ~150 lines (race visualization)
4. `lib/gameLogic.ts` - ~140 lines (game algorithms)
5. `app/api/game/start/route.ts` - ~130 lines (race computation)

### Configuration Files Size
- `package.json` - ~30 lines
- `tsconfig.json` - ~20 lines
- `tailwind.config.ts` - ~10 lines
- `next.config.mjs` - ~3 lines
- `postcss.config.js` - ~4 lines

### Documentation Size
- `README.md` - ~250 lines
- `DEPLOY.md` - ~40 lines
- `BUILD_STATUS.md` - ~200 lines
- `FILE_INDEX.md` - ~160 lines (this file)

## Import Dependencies

### External Packages Used
- `next` - Framework
- `react` - UI library
- `@supabase/supabase-js` - Database client

### Internal Module Imports
- `@/lib/types` - Type definitions
- `@/lib/gameLogic` - Game logic
- `@/lib/settlement` - Settlement logic
- `@/lib/supabase` - Supabase client
- `@/lib/supabaseAdmin` - Supabase admin
- `@/components/*` - React components

## Configuration Details

### Next.js Routes
- Dynamic routes: `[code]` for session codes
- API routes: All under `app/api/`
- App Router: All pages use Next.js 14 App Router

### TypeScript
- Strict mode enabled in `tsconfig.json`
- Path alias: `@/*` for project root

### Tailwind CSS
- Dark mode enabled
- Custom colors configured
- Responsive breakpoints enabled

### Environment Variables
Required for deployment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Testing the Project

### 1. Local Development
```bash
npm install
npm run dev
# Visit http://localhost:3000
```

### 2. Production Build
```bash
npm run build
npm start
```

### 3. Linting
```bash
npm run lint
```

## Deployment Checklist

- [ ] Create Supabase project
- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Fill in Supabase credentials
- [ ] Run `npm install`
- [ ] Test locally with `npm run dev`
- [ ] Push to GitHub
- [ ] Deploy via Vercel
- [ ] Add env vars to Vercel project
- [ ] Verify deployment works

## File Relationships

```
Home Page (page.tsx)
├── → Create Session Page (create/page.tsx)
│   └── → Lobby Page (lobby/[code]/page.tsx)
│       ├── → Race Page (race/[code]/page.tsx)
│       │   └── → Victory Page (victory/[code]/page.tsx)
│       │       └── → Settlement Page (settlement/page.tsx)
│       └── → Back to Lobby → Victory Page → Settlement Page
│
└── → Join Session Page (join/page.tsx)
    └── → Lobby Page (lobby/[code]/page.tsx)
        └── [same flow as create...]
```

## Database Tables

1. **sessions** - Game sessions with state
2. **players** - Players with net points
3. **rounds** - Race results and events
4. **chat_messages** - In-game messages
5. **session_events** - Event stream (reserved)

All tables include proper indexes and realtime subscriptions.

---

**Total Files**: 40 source files
**Total Lines**: 2,874 total lines of code
**Project Size**: ~304 KB
**Status**: COMPLETE & DEPLOYMENT READY
