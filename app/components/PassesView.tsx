"use client";

import { useEffect, useState } from "react";
import { getAllPasses, type PassesResult } from "@/app/passes/actions";

interface Props {
  hasLocation: boolean;
  hasSatellites: boolean;
}

// Format a UNIX-seconds UTC timestamp in the viewer's LOCAL time. Passing
// `undefined` as the locale makes the browser use the user's own locale.
function fmtDateTime(utcSeconds: number): string {
  return new Date(utcSeconds * 1000).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtClock(utcSeconds: number): string {
  return new Date(utcSeconds * 1000).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m} min` : `${m}m ${s}s`;
}

export default function PassesView({ hasLocation, hasSatellites }: Props) {
  // We only fetch when there's both a location and at least one saved satellite.
  const shouldFetch = hasLocation && hasSatellites;

  // Start in the loading state if we're going to fetch, so we never flash an
  // empty frame first. Setting the initial value here (not via setState in an
  // effect) keeps the render clean.
  const [loading, setLoading] = useState(shouldFetch);
  const [result, setResult] = useState<PassesResult | null>(null);

  // Fetch on mount. The parent remounts this component (via a `key`) whenever
  // the location or saved-satellite set changes, so this re-runs then too.
  // All state updates happen inside the async callback, not synchronously here.
  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;
    getAllPasses().then((res) => {
      if (cancelled) return;
      setResult(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [shouldFetch]);

  // Manual refresh (event handler — setState here is fine).
  function refresh() {
    setLoading(true);
    getAllPasses().then((res) => {
      setResult(res);
      setLoading(false);
    });
  }

  return (
    <section className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-xl shadow-2xl p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold text-emerald-400">
          Upcoming Passes
        </h2>
        {result?.ok && (
          <button
            onClick={refresh}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-white disabled:opacity-50 transition"
          >
            ↻ Refresh
          </button>
        )}
      </div>
      <p className="text-slate-400 text-sm mb-5">
        When your saved satellites next fly over{" "}
        {result?.ok ? (
          <span className="text-slate-300">{result.locationName}</span>
        ) : (
          "your location"
        )}
        , in your local time.
      </p>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-3 text-slate-400 py-8 justify-center">
          <span className="h-4 w-4 rounded-full border-2 border-slate-600 border-t-emerald-400 animate-spin" />
          Calculating upcoming passes…
        </div>
      )}

      {/* Empty states (derived from props — no API call needed) */}
      {!shouldFetch && (
        <div className="py-8 text-center text-slate-400 text-sm">
          {!hasLocation ? (
            <p>
              Search for your city above to set your location, then your
              satellites&apos; passes will appear here.
            </p>
          ) : (
            <p>Save some satellites above to see when they pass overhead.</p>
          )}
        </div>
      )}

      {/* Error state from a failed lookup */}
      {shouldFetch && !loading && result && !result.ok && (
        <div className="py-8 text-center text-sm text-red-300">
          <p>{result.message ?? "Something went wrong loading passes."}</p>
          <button
            onClick={refresh}
            className="mt-3 px-3 py-1.5 text-sm border border-slate-600 rounded-md hover:border-emerald-500 hover:text-emerald-300 transition"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results */}
      {!loading && result?.ok && (
        <div className="space-y-5">
          {result.satellites.map((sat) => (
            <div key={sat.noradId}>
              <h3 className="text-white font-medium mb-2">{sat.name}</h3>

              {sat.error ? (
                <p className="text-red-300/80 text-sm">{sat.error}</p>
              ) : sat.passes.length === 0 ? (
                <p className="text-slate-500 text-sm italic">
                  No upcoming passes in the next 5 days.
                </p>
              ) : (
                <ul className="space-y-2">
                  {sat.passes.slice(0, 5).map((p, i) => (
                    <li
                      key={i}
                      className="px-4 py-3 bg-slate-800/40 border border-slate-700/60 rounded-lg"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white font-medium">
                          {fmtDateTime(p.startUTC)}
                        </span>
                        <span className="text-emerald-400 text-xs">
                          {fmtDuration(p.duration)} · peak{" "}
                          {Math.round(p.maxEl)}°
                        </span>
                      </div>
                      {/* Rise → peak → set timeline in local time */}
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-400">
                        <span>
                          <span className="text-slate-500">Rise</span>{" "}
                          {fmtClock(p.startUTC)} · {p.startAzCompass}
                        </span>
                        <span className="text-center">
                          <span className="text-slate-500">Peak</span>{" "}
                          {fmtClock(p.maxUTC)}
                        </span>
                        <span className="text-right">
                          <span className="text-slate-500">Set</span>{" "}
                          {fmtClock(p.endUTC)} · {p.endAzCompass}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
