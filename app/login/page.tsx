import { login, signup } from "./actions";

interface LoginPageProps {
  searchParams: Promise<{ message?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Soft colour accents over the global starfield background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-3 tracking-cosmic">
            Satellite Pass Tracker
          </h1>
          <p className="text-slate-400 text-sm">
            Track satellite passes above your location
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg shadow-2xl p-8">
          {/* Error Message */}
          {message && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-500/50 rounded-md">
              <p className="text-red-200 text-sm font-medium">{message}</p>
            </div>
          )}

          {/* Login Form */}
          <form action={login} className="space-y-4 mb-6">
            <div>
              <label htmlFor="email-login" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <input
                id="email-login"
                name="email"
                type="email"
                required
                autoComplete="username"
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label htmlFor="password-login" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                id="password-login"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition mt-6"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-slate-400">or</span>
            </div>
          </div>

          {/* Signup Form */}
          <form action={signup} className="space-y-4">
            <div>
              <label htmlFor="email-signup" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <input
                id="email-signup"
                name="email"
                type="email"
                required
                autoComplete="off"
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label htmlFor="password-signup" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                id="password-signup"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-md transition mt-6"
            >
              Create Account
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Test account: test@example.com / Password123!
        </p>
      </div>
    </div>
  );
}
