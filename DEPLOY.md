# 🏇 Canberra Turf Club — Deployment Guide

## Overview
Full-stack multiplayer horse racing card game.
- **Frontend + API**: Next.js 14 deployed on Vercel
- **Database + Realtime**: Supabase (PostgreSQL + Realtime)

---

## Step 1: Set Up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Wait for project to provision, then go to **SQL Editor**
3. Paste the entire contents of `supabase/schema.sql` and click **Run**
4. Go to **Database → Replication** and confirm these tables have Realtime enabled:
   - `sessions`, `players`, `rounds`, `chat_messages`
   - If not listed, run this in SQL Editor:
     ```sql
     alter publication supabase_realtime add table sessions;
     alter publication supabase_realtime add table players;
     alter publication supabase_realtime add table rounds;
     alter publication supabase_realtime add table chat_messages;
     ```
5. Go to **Project Settings → API** and copy:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon/public key** (safe for browser)
   - **service_role key** (SECRET — never expose client-side)

---

## Step 2: Push to GitHub

```bash
cd canberra-turf-club
git init
git add .
git commit -m "feat: Canberra Turf Club initial commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/canberra-turf-club.git
git push -u origin main
```

---

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. **Before deploying**, click **Environment Variables** and add:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |

4. Click **Deploy** — Vercel will install dependencies and build automatically
5. Your game is live at `https://your-project.vercel.app`

---

## How to Play

### Host (Create Session)
1. Open the app → **Create Session**
2. Enter your name + PIN (4–6 digits)
3. Set bet amount, number of decks, track length
4. Share the 6-character code with friends

### Players (Join Session)
1. Open the app → **Join Session**
2. Enter your name + PIN
3. Enter the 6-character code
4. Pick a horse (suit) and click **Ready**

### Race
- Host clicks **Start Race** once everyone is ready (minimum 2 players)
- Watch the animated race with real-time chat
- Gates can set horses back — it's not over until it's over!

### After Each Race
- View winner and payout breakdown on the Victory screen
- Host clicks **Back to Lobby** for another round (or **End Session** to settle)

### Settlement
- After ending the session, see who owes what
- Shows the minimum number of transfers to settle all debts

---

## Local Development

```bash
cd canberra-turf-club
cp .env.local.example .env.local
# Fill in your Supabase credentials in .env.local

npm install
npm run dev
# Open http://localhost:3000
```

---

## Game Rules Summary

- **4 horses**: ♠ Spades, ♥ Hearts, ♦ Diamonds, ♣ Clubs
- **Deck**: Standard 52-card deck(s) with all Aces removed
- **Movement**: Each drawn card moves that suit's horse 1 step forward
- **Track lengths**: 8, 12, 16, 20, or 24 steps to win
- **Gates**: 5 checkpoint cards — when ALL horses pass a gate, it flips and sends that suit's horse back 1 step
- **Betting**: Fixed points per round, winner(s) split the pool
- **No winners**: Pool is refunded equally (with earliest-ready players getting +1 for remainder)
- **Session ledger**: Running total across all rounds; settlement screen shows minimum transfers to settle debts

---

## Architecture Notes

- Game sequences are **pre-computed server-side** at race start
- All clients receive the full event timeline with timestamps and animate in sync
- Supabase Realtime (Postgres Changes) broadcasts state changes to all clients
- API routes use the **service_role key** (never exposed to browser) for all writes
- Chat rate-limited to 3 messages/second per player (enforced server-side)
