"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { error: string };

const MAX_LOCATIONS = 5;

/**
 * Save a city as the user's active observer location.
 *
 * Rules:
 * - A user can have up to 5 saved cities.
 * - Picking a city makes it the single "active" one (others are deactivated).
 * - Picking a city that's already saved just re-activates it (no duplicate).
 *
 * As always, we verify auth and scope everything by the session user; RLS
 * enforces the same at the DB.
 */
export async function saveLocation(loc: {
  cityName: string;
  latitude: number;
  longitude: number;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to save a location." };

  const { data: existing } = await supabase
    .from("saved_locations")
    .select("id, city_name")
    .eq("user_id", user.id);

  const match = existing?.find((l) => l.city_name === loc.cityName);

  // Enforce the cap BEFORE we change anything (so a rejected add doesn't leave
  // the user with no active city).
  if (!match && (existing?.length ?? 0) >= MAX_LOCATIONS) {
    return {
      error: `You can save up to ${MAX_LOCATIONS} locations. Remove one to add another.`,
    };
  }

  // Deactivate all of the user's locations first, so exactly one ends up active
  // (the partial unique index only allows a single active row per user).
  await supabase
    .from("saved_locations")
    .update({ is_active: false })
    .eq("user_id", user.id);

  if (match) {
    const { error } = await supabase
      .from("saved_locations")
      .update({ is_active: true })
      .eq("id", match.id)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("saved_locations").insert({
      user_id: user.id,
      city_name: loc.cityName,
      latitude: loc.latitude,
      longitude: loc.longitude,
      is_active: true,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

/**
 * Switch which saved city is active (the one passes are computed from).
 */
export async function setActiveLocation(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  // Clear all, then set the chosen one — order matters for the unique index.
  await supabase
    .from("saved_locations")
    .update({ is_active: false })
    .eq("user_id", user.id);

  const { error } = await supabase
    .from("saved_locations")
    .update({ is_active: true })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

/**
 * Remove a saved city. If it was the active one, the most recently added of the
 * remaining cities becomes active so there's always a sensible default.
 */
export async function removeLocation(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: row } = await supabase
    .from("saved_locations")
    .select("is_active")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("saved_locations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  // If we deleted the active city, promote the most recent remaining one.
  if (row?.is_active) {
    const { data: remaining } = await supabase
      .from("saved_locations")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (remaining && remaining.length > 0) {
      await supabase
        .from("saved_locations")
        .update({ is_active: true })
        .eq("id", remaining[0].id)
        .eq("user_id", user.id);
    }
  }

  revalidatePath("/");
  return { success: true };
}
