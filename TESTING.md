# Application Testing Matrix

## 1. Authentication (Happy Paths)

| Test Case                 | Steps to Reproduce                                    | Expected Result                                        | Status |
| :------------------------ | :---------------------------------------------------- | :----------------------------------------------------- | :----- |
| **New User Sign Up**      | Enter a new, valid email and password > Click Sign Up | Account created, redirected to `/`, session cookie set | [ ]    |
| **Existing User Sign In** | Enter correct credentials > Click Sign In             | Redirected to `/`, dashboard loads correctly           | [ ]    |
| **User Sign Out**         | Click Sign Out button on dashboard                    | Session cleared, redirected to `/login`                | [ ]    |

## 2. Authentication (Edge Cases & Errors)

| Test Case             | Steps to Reproduce                                      | Expected Result                                   | Status |
| :-------------------- | :------------------------------------------------------ | :------------------------------------------------ | :----- |
| **Duplicate Sign Up** | Try to sign up with an email that is already registered | UI displays a clear "User already exists" error   | [ ]    |
| **Invalid Password**  | Sign in with correct email but wrong password           | UI displays "Invalid login credentials" error     | [ ]    |
| **Malformed Email**   | Try to sign in or sign up with `test@.com`              | UI rejects the input before submitting            | [ ]    |
| **Short Password**    | Try to sign up with a 3-character password              | UI displays a password length error from Supabase | [ ]    |

## 3. Middleware & Security

| Test Case                    | Steps to Reproduce                                                    | Expected Result                                           | Status |
| :--------------------------- | :-------------------------------------------------------------------- | :-------------------------------------------------------- | :----- |
| **Protected Route Bounce**   | Open Incognito window > Go directly to `http://localhost:3000/`       | Middleware intercepts, instantly redirects to `/login`    | [ ]    |
| **Login Route Bounce**       | Log in successfully > Manually type `/login` in URL bar               | Middleware intercepts, instantly redirects back to `/`    | [ ]    |
| **Session Expiry / Cleared** | Log in > Open Dev Tools > Application > Delete cookies > Refresh page | Middleware detects missing session, redirects to `/login` | [ ]    |

## Feature: Sign Out

| #   | Scenario                 | Steps                                    | Expected Result                                            |
| --- | ------------------------ | ---------------------------------------- | ---------------------------------------------------------- |
| 1   | Successful sign-out      | While logged in on `/`, click "Sign Out" | Session cookies cleared; redirected to `/login`            |
| 2   | Post-sign-out protection | After signing out, manually visit `/`    | Redirected back to `/login` (no dashboard shown)           |
| 3   | No stale cache           | Sign out, then press browser Back        | Should not show the logged-in dashboard; lands on `/login` |
| 4   | Works without JS         | Disable JavaScript, click "Sign Out"     | Form still submits; sign-out succeeds (server action)      |

## Feature: Secure Dashboard (`/`)

| #   | Scenario                    | Steps                                                     | Expected Result                                       |
| --- | --------------------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| 1   | Authenticated access        | Log in, land on `/`                                       | Dashboard renders with "Signed in as <your email>"    |
| 2   | Unauthenticated guard       | Clear session, visit `/` directly                         | Redirected to `/login`; no protected content rendered |
| 3   | Correct email shown         | Log in as user A                                          | Welcome line shows user A's exact email               |
| 4   | Tampered/expired token      | Manually corrupt the `sb-…-auth-token` cookie, reload `/` | `getUser()` rejects it; redirected to `/login`        |
| 5   | Location search visible     | Log in                                                    | "Find Your Location" search card is shown on dashboard |

## Feature: City Search — As-You-Type (Phase 3)

| #   | Scenario            | Steps                                    | Expected Result                                                                       |
| --- | ------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | Live dropdown       | Type "Paris" (do not press any button)   | Dropdown of up to 5 matches appears automatically                                     |
| 2   | Ambiguous matches   | Type "Springfield"                       | Multiple results, each labelled with region + country                                 |
| 3   | Select a city       | Click a result                           | Dropdown closes; input fills with full label; green "Location set" panel shows coords |
| 4   | Console coordinates | Click a result with DevTools open        | Console logs that city's exact latitude and longitude                                 |
| 5   | No match            | Type "asdfqwerzxcv"                       | Red "City not found. Please try again."; no dropdown                                  |
| 6   | Min length          | Type a single character                  | No request fired; no dropdown, no error                                               |
| 7   | Debounce            | Type quickly, watch Network tab          | One request after you pause, not one per keystroke                                    |
| 8   | Race safety         | Type fast then change the term           | Final results match the final term (no stale overwrite)                               |
| 9   | Edit after select   | Select a city, then edit the input       | Confirmation panel clears; live search resumes                                        |

## Feature: Save Satellites + RLS (Core 4)

| #   | Scenario           | Steps                                                  | Expected Result                                       |
| --- | ------------------ | ------------------------------------------------------ | ----------------------------------------------------- |
| 1   | Browse catalog     | Log in → dashboard                                     | Satellite list renders with category chips            |
| 2   | Search by name     | Type "hubble"                                          | List filters to matching satellites                   |
| 3   | Search by NORAD id | Type "25544"                                           | ISS appears                                           |
| 4   | Filter by category | Click "Weather" chip                                   | Only weather satellites shown                         |
| 5   | Save               | Click Save on a satellite                              | Instantly shows "✓ Saved" + appears in saved chips    |
| 6   | Persistence        | Save one, reload page                                  | Still saved (loaded from DB)                          |
| 7   | Unsave             | Click a saved ✕ chip, reload                           | Gone, and stays gone after reload                     |
| 8   | No duplicates      | Save the same satellite twice quickly                 | Saved once; no error                                  |
| 9   | RLS isolation      | User B signs in after user A saved items              | User B sees none of user A's saved satellites         |
| 10  | RLS enabled (DB)   | Run the `rowsecurity` query in Supabase SQL Editor    | Both tables show `rowsecurity = true`                 |

## Feature: Passes View (Core 5)

| #  | Scenario             | Steps                                  | Expected Result                                           |
| -- | -------------------- | -------------------------------------- | --------------------------------------------------------- |
| 1  | Empty: no location   | Log in fresh, no city saved            | "Search for your city above…"                            |
| 2  | Empty: no satellites | Save a city but no satellites          | "Save some satellites above…"                            |
| 3  | Loading state        | With city + satellites, load dashboard | Skeleton placeholders, then results                       |
| 4  | Passes shown         | Save a city + ISS                      | Upcoming passes: rise/peak/set times + duration           |
| 5  | Local time           | Compare times to your timezone         | Times match your local clock                              |
| 6  | Per-satellite empty  | Satellite that doesn't pass over       | "No upcoming passes…" for just that one                   |
| 7  | Auto-refresh         | Save another satellite                 | Passes section updates to include it                      |
| 8  | Refresh button       | Click ↻ Refresh                        | Re-fetches and re-renders                                 |
| 9  | Location persists    | Save a city, reload                    | "tracking from {city}" still shown                        |

## Feature: Multiple Locations (Core 5+)

| #  | Scenario          | Steps                                    | Expected Result                                       |
| -- | ----------------- | ---------------------------------------- | ----------------------------------------------------- |
| 1  | Add cities        | Select 3 different cities                | 3 chips appear; newest is active                      |
| 2  | Switch active     | Click a non-active city chip             | It becomes active; passes re-fetch for it             |
| 3  | Shared satellites | Switch cities                            | Same saved satellites; only the passes change         |
| 4  | Remove a city     | Click ✕ on a city                        | Removed; if it was active, another becomes active     |
| 5  | 5-city cap        | Try to add a 6th city                    | Error: "You can save up to 5 locations…"; not added   |
| 6  | Re-select saved   | Select a city that's already saved       | No duplicate; it just becomes active                  |
| 7  | Replace location  | Save city A, then select city B          | Switches to B; no RLS error; one row per city         |
| 8  | RLS isolation     | Second account                           | Sees none of the first account's cities               |

## Feature: Pass Sky-Arc (Stretch A)

| #  | Scenario           | Steps                          | Expected Result                                   |
| -- | ------------------ | ------------------------------ | ------------------------------------------------- |
| 1  | Arc renders        | View a satellite with passes   | Each pass shows a sky-arc above its rise/set row  |
| 2  | Height = elevation | Compare a high vs low pass     | Higher peak elevation → taller arc                |
| 3  | No passes          | Satellite with no passes       | No arc; "No upcoming passes…" shown instead       |
| 4  | Responsive         | Narrow the window              | Arc scales to width; line stays crisp             |
