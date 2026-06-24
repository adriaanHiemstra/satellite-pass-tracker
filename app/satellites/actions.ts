"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Result shape returned to the client so it can react to success/failure.
type ActionResult = { success: true } | { error: string };

/**
 * Save a satellite to the logged-in user's personal list.
 *
 * Security: we re-check auth INSIDE the action (server actions are reachable by
 * direct POST, not just our UI), and we set user_id from the verified session —
 * never from client input. RLS on the table enforces the same rule at the DB.
 */
export async function saveSatellite(
  noradId: number,
  name: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to save satellites." };

  const { error } = await supabase.from("saved_satellites").insert({
    user_id: user.id,
    satellite_id: noradId,
    satellite_name: name,
  });

  // 23505 = unique_violation: the satellite is already saved. Treat as success
  // so the UI stays correct instead of flashing an error on a double-click.
  if (error && error.code !== "23505") {
    return { error: error.message };
  }

  // Refresh the dashboard so the server-rendered saved list reflects the change.
  revalidatePath("/");
  return { success: true };
}

/**
 * Remove a satellite from the logged-in user's list.
 * The user_id filter is belt-and-braces alongside the RLS delete policy.
 */
export async function unsaveSatellite(noradId: number): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to manage satellites." };

  const { error } = await supabase
    .from("saved_satellites")
    .delete()
    .eq("user_id", user.id)
    .eq("satellite_id", noradId);

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}
