# Satellite Pass Tracker

A web application that helps a signed-in user find out when satellites are
visible or contactable from their location. Built on Next.js (App Router),
Supabase, and Vercel.

## Live URL

https://satellite-pass-tracker.vercel.app/

## Test Account

- **Email:** test@example.com
- **Password:** Password123!

## Tech Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** for styling (dark theme)
- **Supabase** for Auth & Database (via `@supabase/ssr`, cookie-based sessions)
- **Vercel** for hosting

## APIs Used

- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) — turns
  a city name into coordinates. **In use** (Core 3). No API key required.
- [N2YO API](https://www.n2yo.com/api/) — satellite positions and predicted
  passes. **Planned** for Cores 4–5 (not yet integrated).

## Running Locally

```bash
npm install
npm run dev
```

Create a `.env.local` file in the project root with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

> `NEXT_PUBLIC_SUPABASE_URL` must be the project root only (no `/rest/v1` or other
> path) — the Supabase client appends its own service paths.

## Project Status

This project is being built in phases. To be transparent about what a reviewer
will actually find working today:

**Done**

- **Core 1 — Setup & deploy:** Next.js app connected to Supabase, deployed to
  Vercel with a live URL, secrets kept out of the repo.
- **Core 2 — Auth & accounts:** email/password sign up, sign in, and sign out via
  Supabase Auth; protected routes (middleware + a server-side `getUser` guard on
  the dashboard).
- **Core 3 — Location search:** type a city, geocode it with Open-Meteo, handle
  the no-match and ambiguous-result cases.

**Planned**

- **Core 4 — Save satellites:** browse/search satellites and save them to a
  personal list, persisted per user. Saved data will be isolated per user using
  Supabase **Row Level Security** (not yet implemented — no user-data tables
  exist in the repo yet).
- **Core 5 — Passes view:** upcoming passes (rise, peak, set, duration) per saved
  satellite, shown in local time, with loading and empty states.

## Assumptions

Decisions made where the brief was silent, reflecting the work done so far:

- **Email confirmation is disabled** in Supabase, so a new account is usable
  immediately. This keeps the test account easy to use without a real inbox.
- **Sessions use secure server cookies** (`@supabase/ssr`) rather than browser
  local storage, so auth works correctly with server-rendered pages.
- **Route protection is layered:** the middleware refreshes the session and
  redirects, and each protected page independently re-validates the user with
  `getUser()`. Neither is relied on alone.
- **City search is debounced as-you-type** (350ms, minimum 2 characters) rather
  than button-triggered, and requests are race-safe — an in-flight lookup is
  aborted when the query changes so the latest input always wins.
- **Open-Meteo omits the `results` key entirely on no match** (it does not return
  an empty array); the "city not found" handling depends on this.
- **A selected city is currently held in component state** and printed to the
  browser console (a Core 3 deliverable). Persisting the chosen location is part
  of the later phases.
