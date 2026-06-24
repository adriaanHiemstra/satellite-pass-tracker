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
