// Server-only helper for the N2YO satellite API.
//
// IMPORTANT: this reads N2YO_API_KEY from the server environment. It must only
// ever be called from server code (server actions / server components) so the
// key is never shipped to the browser. The env var is intentionally NOT
// prefixed with NEXT_PUBLIC_.

const N2YO_BASE = "https://api.n2yo.com/rest/v1/satellite";

// A single predicted pass, as we use it. Times are UNIX seconds (UTC).
export interface N2YOPass {
  startUTC: number; // rise time
  maxUTC: number; // peak (highest point) time
  endUTC: number; // set time
  duration: number; // seconds the pass lasts
  maxEl: number; // peak elevation in degrees
  startAzCompass: string; // compass direction it rises (e.g. "NW")
  endAzCompass: string; // compass direction it sets
}

/**
 * Fetch upcoming "radio" passes (i.e. passes above a minimum elevation,
 * regardless of daylight) for one satellite over the next `days` days.
 *
 * We use radio passes rather than visual passes because they reliably return
 * results — visual passes only count when the satellite is sunlit and the
 * observer is in darkness, which is often empty. The brief allows either
 * ("visible or contactable").
 */
export async function fetchRadioPasses(
  noradId: number,
  lat: number,
  lng: number,
  { alt = 0, days = 5, minElevation = 10 } = {},
): Promise<N2YOPass[]> {
  const key = process.env.N2YO_API_KEY;
  if (!key) throw new Error("N2YO_API_KEY is not configured");

  const url = `${N2YO_BASE}/radiopasses/${noradId}/${lat}/${lng}/${alt}/${days}/${minElevation}?apiKey=${key}`;

  // Cache for 15 minutes: pass predictions don't change meaningfully within
  // that window, and it protects the free-tier rate limit.
  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) {
    throw new Error(`N2YO request failed (${res.status})`);
  }

  const data = await res.json();

  // N2YO omits the "passes" array when there are none, so default to empty.
  const raw = (data.passes ?? []) as Array<Record<string, number | string>>;

  // NOTE: the radiopasses endpoint does NOT return a `duration` field (only
  // visualpasses does), so we derive it from the rise/set times. This is exact
  // and never depends on the field being present.
  return raw.map((p) => ({
    startUTC: Number(p.startUTC),
    maxUTC: Number(p.maxUTC),
    endUTC: Number(p.endUTC),
    duration: Number(p.endUTC) - Number(p.startUTC),
    maxEl: Number(p.maxEl),
    startAzCompass: String(p.startAzCompass),
    endAzCompass: String(p.endAzCompass),
  }));
}
