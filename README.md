# Canberra Turf Club - Multiplayer Horse Racing Card Game

A real-time, browser-based multiplayer horse racing card game built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Real-time Multiplayer**: Up to 4 players per session using Supabase Realtime
- **Dynamic Race Simulation**: Pre-computed race sequences with animated horse movements
- **Card-based Betting**: Players select suits and bet points each round
- **Live Chat**: In-game messaging system with floating messages
- **Settlement System**: Automatic calculation of payouts and transfers
- **Retro Pixel Art**: Custom pixel horse graphics and 8-bit styled UI

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (server-side game logic)
- **Database**: Supabase (PostgreSQL + Realtime)
- **Styling**: Tailwind CSS + Custom CSS animations
- **Hosting**: Vercel + Supabase

## Project Structure

```
canberra-turf-club/
├── app/
│   ├── api/
│   │   ├── session/      # Session management routes
│   │   ├── player/       # Player actions (select horse, ready)
│   │   ├── game/         # Game logic (start race, back to lobby)
│   │   └── chat/         # Chat messages
│   ├── layout.tsx        # Root layout with metadata
│   ├── page.tsx          # Home page
│   ├── create/           # Create session page
│   ├── join/             # Join session page
│   ├── lobby/[code]/     # Lobby with horse selection
│   ├── race/[code]/      # Live race viewer
│   ├── victory/[code]/   # Victory screen & payouts
│   ├── settlement/       # Final settlement screen
│   └── globals.css       # Global styles & animations
├── components/
│   ├── PlayerSetup.tsx      # Player name/PIN input
│   ├── SuitIcon.tsx         # Suit symbol renderer
│   ├── PixelHorse.tsx       # Pixel art horse display
│   ├── CardDisplay.tsx      # Card flip animation
│   ├── HorseTrack.tsx       # Race track visualization
│   ├── GateCardsDisplay.tsx # Gate card display
│   └── ChatOverlay.tsx      # Chat system
├── lib/
│   ├── types.ts             # TypeScript types
│   ├── gameLogic.ts         # Core game algorithms
│   ├── settlement.ts        # Payout calculation
│   ├── supabase.ts          # Client initialization
│   └── supabaseAdmin.ts     # Server initialization
├── supabase/
│   └── schema.sql           # Database schema
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.js
├── DEPLOY.md                # Deployment instructions
└── README.md                # This file
```

## Game Flow

1. **Home Page**: Choose to create or join a session
2. **Player Setup**: Enter name and 4-6 digit PIN
3. **Lobby**:
   - Pick a horse (Spades, Hearts, Diamonds, Clubs)
   - Click "Ready Up"
   - Wait for all players (2+ required)
   - Host clicks "Start Race"
4. **Race Page**:
   - Watch cards drawn from deck
   - Horses move forward based on suit matches
   - 5 gate cards trigger when all horses reach thresholds
   - Gates move horses backward
   - Race ends when a horse reaches track length or deck exhausted
5. **Victory Page**:
   - View round payouts
   - Session net points for all players
   - Host can return to lobby for another round or end session
6. **Settlement**:
   - Final net points for each player
   - Calculated transfers to settle all debts

## Race Mechanics

- **Setup**: Shuffle N decks (1-3), draw 5 gate cards
- **Gate Thresholds**: Calculated as `ceil(trackLength * (1-5) / 5)`
- **Card Draw**: Each card moves its suit's horse forward by 1
- **Gate Reveal**: When all horses reach a threshold, that gate card pulls its suit back by 1
- **Win Condition**: First horse to reach track length (8-24 steps)
- **Payout**: Equal split of pool among winners; if no winners, refund equally

## API Routes

### Sessions
- `POST /api/session/create` - Create new session with master player
- `POST /api/session/join` - Join existing session
- `POST /api/session/end` - End session and calculate final settlement

### Players
- `POST /api/player/select-horse` - Select a suit/horse
- `POST /api/player/ready` - Toggle ready status

### Game
- `POST /api/game/start` - Master starts race (all must be ready)
- `POST /api/game/back-to-lobby` - Master returns to lobby after victory

### Chat
- `POST /api/chat` - Send chat message (rate-limited)

## Database Schema

Key tables:
- `sessions`: Game sessions with codes and states
- `players`: Players with net points and ready status
- `rounds`: Race results and events
- `chat_messages`: In-game messages
- `session_events`: Event stream (reserved for future use)

All tables support Realtime subscriptions for live updates.

## Deployment

See `DEPLOY.md` for detailed setup instructions.

Quick summary:
1. Set up Supabase project and run `supabase/schema.sql`
2. Create `.env.local` with Supabase credentials
3. Push to GitHub
4. Deploy via Vercel with environment variables

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## Configuration

Edit settings in create session screen:
- **Bet Amount**: Points per round (1-999,999)
- **Number of Decks**: 1-3 decks (more cards = longer races)
- **Track Length**: 8-24 steps to win

## Notes

- PIN hashing is simplified for casual use (not production-grade)
- Rate limiting applied to chat and game events
- Realtime updates via Postgres logical replication
- All game logic computed server-side for fairness
- Race events pre-computed and timestamped for client animation
