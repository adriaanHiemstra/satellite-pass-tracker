# Satellite Pass Tracker

A web application that helps a signed-in user find out when satellites are visible or contactable from their location. Built on Next.js (App Router), Supabase, and Vercel.

## Live URL

https://satellite-pass-tracker.vercel.app/

## Test Account

- **Email:** test@example.com
- **Password:** Password123!

## Tech Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** for styling (dark theme)
- **Supabase** for Auth & Database (via `@supabase/ssr` cookie-based sessions)
- **Vercel** for hosting

## APIs Used

- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) — turns a city name into coordinates. **In use** No API key required.
- [N2YO API](https://www.n2yo.com/api/) — predicted satellite passes (rise, peak, set). **In use** A free API key is required; it is used server-side only and never exposed to the browser.

## Running Locally

```bash
npm install
npm run dev
```

Create a `.env.local` file in the project root with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
N2YO_API_KEY=<your-n2yo-key>
```

> `NEXT_PUBLIC_SUPABASE_URL` must be the project root only (no `/rest/v1` or other
> path) — the Supabase client appends its own service paths. `N2YO_API_KEY` has no
> `NEXT_PUBLIC_` prefix on purpose: it is a server-side secret.

The database schema and Row Level Security policies live in
[`supabase/schema.sql`](supabase/schema.sql) — run it in the Supabase SQL Editor.

## Project Status

All five core tasks and both stretch tasks are complete:

- **Core 1 — Setup & deploy:** Next.js + Supabase, deployed to Vercel and kept secrets out of the repo.
- **Core 2 — Auth & accounts:** Added email/password sign up, sign in, sign out; protected routes (proxy + a per-page `getUser` guard).
- **Core 3 — Location search:** Added the feature to type a city, geocode functionality with Open-Meteo, handle no-match and ambiguous results.
- **Core 4 — Save satellites:** Added browse/search a catalogue, save/unsave to a personal list, persisted per user with RLS
- **Core 5 — Passes view:** Added upcoming passes (rise, peak, set, duration) per saved satellite, in local time, with loading and empty states.
- **Stretch A — Visualise a pass:** Added a per-pass timeline
- **Stretch B — Polish:** added responsive layout, loading skeletons, sorted/dimmed empty states.

I tested the project manually and documented the tests and results in TESTING.md and TEST-RUN.md.

## Assumptions

1. Email confirmation is off so that accounts and the test login work instantly without a real inbox
2. Each user only sees their own data due to row level security in the DB.
3. Satellites are a built in catalogue rather than a live API. This is because N2YO has no search by name function and the key thing that matters for passes is the NORAD ID which can be obtained from the catalogue.
4. A user can save up to 5 cites that are switchable and the satellite list is shared across all cities. Switching the city will just recompute the passes section for that city
5. Passes use N2YO radio passes - anything rising above 10°, next 5 days. This is because strictly-"visible" passes are often empty. Duration is calculated from the rise→set times.
6. All times are shown in the viewers timezone.
7. I went for a starfield type look to make the UI better looking and astronomy focused
8. I created the files TESTING.md and TEST-RUN.md to continually test the application and document the results.

My Database schema is as follows:

## Table `saved_satellites`

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `user_id`        | `uuid`        |             |
| `satellite_id`   | `int4`        |             |
| `satellite_name` | `text`        |             |
| `created_at`     | `timestamptz` |             |

## Table `saved_locations`

### Columns

| Name         | Type          | Constraints |
| ------------ | ------------- | ----------- |
| `id`         | `uuid`        | Primary     |
| `user_id`    | `uuid`        |             |
| `city_name`  | `text`        |             |
| `latitude`   | `numeric`     |             |
| `longitude`  | `numeric`     |             |
| `created_at` | `timestamptz` |             |
| `is_active`  | `bool`        |             |
