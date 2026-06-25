# Test Run Log

A record of a manual test execution against a known build. The reusable test
**plan** lives in `TESTING.md`; this file records the **results** of one run.

## Run details

- **Date:** 2026-06-25
- **Commit:** 9002412
- **Environment:** Production — https://satelite-pass-tracker.vercel.app/
- **Tester:** Adriaan Hiemstra
- **Preconditions:** Database cleared (all users deleted); `N2YO_API_KEY` set on
  Vercel; latest `schema.sql` applied.

**Result legend:** Pass · Fail · Partial · – Not run

## Summary

- Passed: 63 / 65
- Failed: 2/65
- Known issues: see "Issues found" below

---

## 1. Authentication — Happy Paths

| #   | Scenario              | Result | Notes |
| --- | --------------------- | ------ | ----- |
| 1   | New User Sign Up      | – Pass |       |
| 2   | Existing User Sign In | – Pass |       |
| 3   | User Sign Out         | – Pass |       |

## 2. Authentication — Edge Cases & Errors

| #   | Scenario          | Result | Notes |
| --- | ----------------- | ------ | ----- |
| 1   | Duplicate Sign Up | – Pass |       |
| 2   | Invalid Password  | – Pass |       |
| 3   | Malformed Email   | – Pass |       |
| 4   | Short Password    | – Pass |       |

## 3. Middleware & Security

| #   | Scenario                 | Result | Notes |
| --- | ------------------------ | ------ | ----- |
| 1   | Protected Route Bounce   | – Pass |       |
| 2   | Login Route Bounce       | – Pass |       |
| 3   | Session Expiry / Cleared | – Pass |       |
| 4   | Tampered Auth Token      | – Pass |       |

## 4. Sign Out

| #   | Scenario                 | Result | Notes |
| --- | ------------------------ | ------ | ----- |
| 1   | Successful sign-out      | – Pass |       |
| 2   | Post-sign-out protection | – Pass |       |
| 3   | No stale cache           | – Pass |       |
| 4   | Works without JS         | – Pass |       |

## 5. Secure Dashboard

| #   | Scenario                | Result | Notes |
| --- | ----------------------- | ------ | ----- |
| 1   | Authenticated access    | – Pass |       |
| 2   | Unauthenticated guard   | – Pass |       |
| 3   | Correct email shown     | – Pass |       |
| 4   | Tampered/expired token  | – Pass |       |
| 5   | Location search visible | – Pass |       |

## 6. City Search — As-You-Type

| #   | Scenario            | Result    | Notes                                                                                                                              |
| --- | ------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Live dropdown       | – Pass    |                                                                                                                                    |
| 2   | Ambiguous matches   | – Partial | The dropdown showing multiple cities is being blocked by the satelite catalog. This is a UI problem not a logic issue              |
| 3   | Select a city       | – Pass    |                                                                                                                                    |
| 4   | Console coordinates | – Fail    | No console log is being shown when a city is selected - this is normal though it was part of core 3 testing which is redundant now |
| 5   | No match            | – Pass    |                                                                                                                                    |
| 6   | Min length          | – Pass    |                                                                                                                                    |
| 7   | Debounce            | – Pass    |                                                                                                                                    |
| 8   | Race safety         | – Pass    |                                                                                                                                    |
| 9   | Edit after select   | – Pass    |                                                                                                                                    |

## 7. Save Satellites + RLS

| #   | Scenario           | Result | Notes |
| --- | ------------------ | ------ | ----- |
| 1   | Browse catalog     | – Pass |       |
| 2   | Search by name     | – Pass |       |
| 3   | Search by NORAD id | – Pass |       |
| 4   | Filter by category | – Pass |       |
| 5   | Save               | – Pass |       |
| 6   | Persistence        | – Pass |       |
| 7   | Unsave             | – Pass |       |
| 8   | No duplicates      | – Pass |       |
| 9   | RLS isolation      | – Pass |       |
| 10  | RLS enabled (DB)   | – Pass |       |

## 8. Passes View

| #   | Scenario             | Result | Notes |
| --- | -------------------- | ------ | ----- |
| 1   | Empty: no location   | – Pass |       |
| 2   | Empty: no satellites | – Pass |       |
| 3   | Loading state        | – Pass |       |
| 4   | Passes shown         | – Pass |       |
| 5   | Local time           | – Pass |       |
| 6   | Per-satellite empty  | – Pass |       |
| 7   | Auto-refresh         | – Pass |       |
| 8   | Refresh button       | – Pass |       |
| 9   | Location persists    | – Pass |       |

## 9. Multiple Locations

| #   | Scenario          | Result | Notes |
| --- | ----------------- | ------ | ----- |
| 1   | Add cities        | – Pass |       |
| 2   | Switch active     | – Pass |       |
| 3   | Shared satellites | – Pass |       |
| 4   | Remove a city     | – Pass |       |
| 5   | 5-city cap        | – Pass |       |
| 6   | Re-select saved   | – Pass |       |
| 7   | Replace location  | – Pass |       |
| 8   | RLS isolation     | – Pass |       |

## 10. Pass Timeline

| #   | Scenario                | Result | Notes |
| --- | ----------------------- | ------ | ----- |
| 1   | Timeline renders        | – Pass |       |
| 2   | Peak positioned by time | – Pass |       |
| 3   | Height = elevation      | – Pass |       |
| 4   | Local times on axis     | – Pass |       |
| 5   | No passes               | – Pass |       |
| 6   | Responsive              | – Pass |       |

## 11. Polish

| #   | Scenario          | Result | Notes |
| --- | ----------------- | ------ | ----- |
| 1   | Sort by passes    | – Pass |       |
| 2   | Loading skeleton  | – Pass |       |
| 3   | Responsive layout | – Pass |       |

---

## Issues found

_Log any failure here: severity (blocker / major / minor), repro steps, and the
fix commit once resolved._

1. The list of cities was blocked by the satellite catalog.
