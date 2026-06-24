import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "./login/actions";
import CitySearch from "./components/CitySearch";

export default async function Home() {
  const supabase = await createClient();

  // Fetch the currently authenticated user from the session cookie
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If there is no logged-in user, send them to the login page.
  // This is a server-side guard so protected content is never rendered.
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Background accent elements for the astronomy theme */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none" />

      <div className="relative">
        {/* Top navigation bar with the sign-out control */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 backdrop-blur">
          <span className="text-lg font-semibold tracking-tight">
            Satellite Pass Tracker
          </span>

          {/* The sign-out button is wrapped in a form that calls the
              signOut server action on submit. */}
          <form action={signOut}>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition"
            >
              Sign Out
            </button>
          </form>
        </header>

        {/* Main dashboard content */}
        <main className="max-w-4xl mx-auto px-6 py-16">
          {/* Personalized welcome message including the user's email */}
          <h1 className="text-4xl font-bold mb-2">Welcome back</h1>
          <p className="text-slate-400 mb-10">
            Signed in as{" "}
            <span className="text-emerald-400 font-medium">{user.email}</span>
          </p>

          {/* City search — look up a location to get its coordinates.
              This is a Client Component rendered inside this Server Component. */}
          <CitySearch />
        </main>
      </div>
    </div>
  );
}
