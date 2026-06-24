import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "./login/actions";
import CitySearch from "./components/CitySearch";
import SatelliteBrowser from "./components/SatelliteBrowser";
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
            </p>
          </div>

          {/* City search — look up a location to get its coordinates. */}
          <CitySearch />

          {/* Browse / search satellites and save them to a personal list.
              savedIds comes from the per-user, RLS-protected query above. */}
          <SatelliteBrowser catalog={SATELLITES} savedIds={savedIds} />
        </main>
      </div>
    </div>
  );
}
