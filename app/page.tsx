import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "./login/actions";
import CitySearch from "./components/CitySearch";
import LocationsBar from "./components/LocationsBar";
import SatelliteBrowser from "./components/SatelliteBrowser";
import PassesView from "./components/PassesView";
import { SATELLITES } from "@/lib/satellites";

export default async function Home() {
  const supabase = await createClient();

  // Fetch the currently authenticated user from the session cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Server-side guard: never render protected content for a logged-out user.
  if (!user) {
    redirect("/login");
  }

  // Load this user's saved satellites. RLS guarantees we only ever get back
  // rows belonging to the logged-in user, so no extra filtering is needed here.
  const { data: savedRows } = await supabase
    .from("saved_satellites")
    .select("satellite_id")
    .order("created_at", { ascending: false });

  const savedIds = (savedRows ?? []).map((row) => row.satellite_id as number);

  // Load the user's saved cities (up to 5). RLS scopes these to the user.
  const { data: locationRows } = await supabase
    .from("saved_locations")
    .select("id, city_name, is_active")
    .order("created_at", { ascending: true });

  const locations = locationRows ?? [];
  // The active city is the observer location passes are computed from.
  const activeLocation = locations.find((l) => l.is_active) ?? null;

  // A key that changes whenever the active city or saved-satellite set changes,
  // so the passes view remounts and re-fetches when either input changes.
  const passesKey = `${activeLocation?.id ?? "none"}|${[...savedIds]
    .sort()
    .join(",")}`;

  return (
    <div className="min-h-screen text-white">
      {/* Soft colour accents over the global starfield background. */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 pointer-events-none" />

      <div className="relative">
        {/* Top navigation bar with the sign-out control */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 backdrop-blur">
          <span className="text-sm font-semibold tracking-cosmic text-slate-200">
            Satellite Pass Tracker
          </span>

          {/* Sign-out button wrapped in a form that calls the signOut action. */}
          <form action={signOut}>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-slate-800/70 hover:bg-slate-700 border border-slate-700 rounded-md transition"
            >
              Sign Out
            </button>
          </form>
        </header>

        {/* Main dashboard content */}
        <main className="max-w-3xl mx-auto px-6 py-14 space-y-8">
          {/* Personalized welcome message including the user's email */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back</h1>
            <p className="text-slate-400">
              Signed in as{" "}
              <span className="text-emerald-400 font-medium">{user.email}</span>
              {activeLocation && (
                <>
                  {" · tracking from "}
                  <span className="text-slate-300">
                    {activeLocation.city_name}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* City search — selecting a city saves it to the user's locations. */}
          <CitySearch />

          {/* Saved cities (up to 5): switch the active one or remove. */}
          <LocationsBar locations={locations} />

          {/* Browse / search satellites and save them to a personal list.
              savedIds comes from the per-user, RLS-protected query above. */}
          <SatelliteBrowser catalog={SATELLITES} savedIds={savedIds} />

          {/* Upcoming passes for each saved satellite, from the saved location.
              Remounts (via key) whenever the location or saved set changes. */}
          <PassesView
            key={passesKey}
            hasLocation={!!activeLocation}
            hasSatellites={savedIds.length > 0}
          />
        </main>
      </div>
    </div>
  );
}
