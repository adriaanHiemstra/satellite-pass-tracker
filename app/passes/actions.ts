"use server";

import { createClient } from "@/utils/supabase/server";
import { fetchRadioPasses, type N2YOPass } from "@/lib/n2yo";

// Passes for one saved satellite (or an error if its lookup failed).
export interface SatellitePasses {
  noradId: number;
  name: string;
  passes: N2YOPass[];
  error?: string;
}

// The overall result. When `ok` is false, `reason` tells the UI which empty /
// error state to show.
export type PassesResult =
  | { ok: true; locationName: string; satellites: SatellitePasses[] }
  | { ok: false; reason: "no-location" | "no-satellites" | "error"; message?: string };

/**
 * Compute upcoming passes for ALL of the user's saved satellites, from their
 * saved location. Everything is read server-side from the authenticated session
 * (RLS-protected), so the client can't ask for anyone else's data.
 */
export async function getAllPasses(): Promise<PassesResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "error", message: "Not signed in." };

  // The user's ACTIVE observer location (the city currently selected).
  const { data: location } = await supabase
    .from("saved_locations")
    .select("city_name, latitude, longitude")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (!location) return { ok: false, reason: "no-location" };

  // The user's saved satellites.
  const { data: sats } = await supabase
    .from("saved_satellites")
    .select("satellite_id, satellite_name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (!sats || sats.length === 0) return { ok: false, reason: "no-satellites" };

  // Fetch every satellite's passes in parallel. allSettled means one failed
  // lookup (e.g. a rate-limit hit) doesn't wipe out the others.
  const lat = Number(location.latitude);
  const lng = Number(location.longitude);

  const results = await Promise.allSettled(
    sats.map(async (s) => {
      const passes = await fetchRadioPasses(s.satellite_id as number, lat, lng);
      return {
        noradId: s.satellite_id as number,
        name: s.satellite_name as string,
        passes,
      };
    }),
  );

  const satellites: SatellitePasses[] = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          noradId: sats[i].satellite_id as number,
          name: sats[i].satellite_name as string,
          passes: [],
          error: "Couldn't load passes for this satellite.",
        },
  );

  return { ok: true, locationName: location.city_name as string, satellites };
}
