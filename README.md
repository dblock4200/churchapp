# Anchor — Tuesday Night

A private app for one ~9-person Bible study group. Two halves: **The Week**
(the passage, the question, who's hosting, the memory verse) and **The Between**
(presence posts, prayer wall, verse finder). Nothing is scored — no streaks,
counts, or "who prayed" tallies.

Built with Expo (SDK 57) + expo-router. Runs on iOS, Android, and the web as an
installable PWA from one codebase. Currently runs on **sample data**; wiring
Supabase (below) makes it live.

## Run it
```bash
npm run web      # opens the PWA in a browser
npm run ios      # iOS simulator (needs Xcode)
npm run android  # Android emulator
```

## Project shape
```
app/                       expo-router routes
  (tabs)/_layout.tsx        the 3-tab bar (This Week · Between · You)
  (tabs)/index.tsx          This Week — passage, question, host, memory verse
  (tabs)/between.tsx        Between — Presence / Prayer / Verses segments
  (tabs)/you.tsx            You — profile + settings (first pass)
  question.tsx              the week's question + everyone's answers (push)
  post/[id].tsx             a presence post + its thread (push)
  compose.tsx               new presence post (modal, 3 prompt wordings)
src/theme/                  design tokens (light+dark) + ThemeProvider
src/ui/                     Text, Icon (SVG), Card/Button/Avatar/... primitives
src/data/                   types, sample content, repo, React Query hooks
src/lib/supabase.ts         Supabase client (null until env is set)
supabase/migrations/        0001 schema, 0002 row-level security
```

## Go live with Supabase
1. Create a project at supabase.com (free tier is plenty for one group).
2. In the SQL editor, run `supabase/migrations/0001_init.sql` then `0002_rls.sql`.
3. Copy `.env.example` to `.env` and fill `EXPO_PUBLIC_SUPABASE_URL` and
   `EXPO_PUBLIC_SUPABASE_ANON_KEY` from Settings → API. Restart the dev server.
   The app switches off sample data automatically once these are set.
4. Replace each function body in `src/data/repo.ts` with a Supabase query. The
   screens and hooks don't change — this file is the only seam.

## What's done vs. next
- [x] Design system (light+dark), all screens, navigation, sample data — runs today.
- [x] Data model + row-level security, including the **answer gate** (you can't
      read others' answers until you've written your own — enforced in the DB).
- [ ] **Auth**: invite-only magic link (Supabase). No public signup.
- [ ] **Writes**: submit an answer, post, reply, prayer request/update.
- [ ] **Verse finder data**: load the World English Bible (public domain) and a
      feeling→passage index. The app only ever *surfaces* real passages — it never
      generates or paraphrases Scripture.
- [ ] **Notifications**: expo-notifications for the two deep-links (reply on your
      post → the thread; prayer follow-up → the prayer wall) + a scheduled job
      that re-surfaces a prayer after a few weeks.
- [ ] **Photos**: Supabase Storage, only where a member posts one.
- [ ] Beta with the actual nine (Expo web install, or TestFlight for iOS).

## Notes
- Fonts fall back to the system face today. To match the mockup exactly, add the
  Google font packages (`Fredoka`, `Nunito`, `Literata`) and load them in
  `app/_layout.tsx`; the names are already listed in `src/theme/ThemeProvider.ts` (`fonts`).
- The **You** tab wasn't in the original mockup set — `app/(tabs)/you.tsx` is a
  first honest pass (identity, week-admin, quiet settings), open to redesign.
