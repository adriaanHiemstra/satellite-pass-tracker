"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import type { Satellite, SatelliteCategory } from "@/lib/satellites";
import { SATELLITE_CATEGORIES } from "@/lib/satellites";
import { saveSatellite, unsaveSatellite } from "@/app/satellites/actions";

interface Props {
  catalog: Satellite[];
  savedIds: number[];
}

export default function SatelliteBrowser({ catalog, savedIds }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SatelliteCategory | "All">(
    "All",
  );
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  // Optimistic saved-set: flips instantly on click for snappy UX, then
  // reconciles with the server's real data once the action + revalidation land.
  const [savedSet, setSavedSet] = useOptimistic<
    Set<number>,
    { id: number; save: boolean }
  >(new Set(savedIds), (prev, { id, save }) => {
    const next = new Set(prev);
    if (save) next.add(id);
    else next.delete(id);
    return next;
  });

  function toggle(sat: Satellite, currentlySaved: boolean) {
    setError("");
    startTransition(async () => {
      // Optimistically update the UI first...
      setSavedSet({ id: sat.noradId, save: !currentlySaved });
      // ...then run the real server action.
      const result = currentlySaved
        ? await unsaveSatellite(sat.noradId)
        : await saveSatellite(sat.noradId, sat.name);
      if ("error" in result) setError(result.error);
    });
  }

  // Filter the catalog by search text (name or NORAD id) and active category.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((s) => {
      const matchesCategory =
        activeCategory === "All" || s.category === activeCategory;
      const matchesQuery =
        q === "" ||
        s.name.toLowerCase().includes(q) ||
        String(s.noradId).includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [catalog, query, activeCategory]);

  const savedSatellites = catalog.filter((s) => savedSet.has(s.noradId));

  return (
    <section className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-xl shadow-2xl p-6">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-xl font-semibold text-emerald-400">Satellites</h2>
        <span className="text-xs text-slate-500">
          {savedSatellites.length} saved
        </span>
      </div>
      <p className="text-slate-400 text-sm mb-5">
        Browse the catalog and save the satellites you want to track.
      </p>

      {/* Saved list — the user's personal collection */}
      <div className="mb-6">
        <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-2">
          Your saved satellites
        </h3>
        {savedSatellites.length === 0 ? (
          <p className="text-slate-500 text-sm italic">
            Nothing saved yet — pick some from the list below.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {savedSatellites.map((sat) => (
              <button
                key={sat.noradId}
                onClick={() => toggle(sat, true)}
                title="Click to remove"
                className="group flex items-center gap-2 pl-3 pr-2 py-1.5 bg-emerald-950/40 border border-emerald-500/40 rounded-full text-sm text-emerald-200 hover:bg-red-950/40 hover:border-red-500/40 hover:text-red-200 transition"
              >
                <span>{sat.name}</span>
                <span className="text-emerald-400/70 group-hover:text-red-300 transition">
                  ✕
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search box */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or NORAD id..."
        className="w-full px-4 py-2.5 mb-3 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
      />

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["All", ...SATELLITE_CATEGORIES] as const).map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                active
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-950/40 border border-red-500/50 rounded-md">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Browse list */}
      {filtered.length === 0 ? (
        <p className="text-slate-500 text-sm py-6 text-center">
          No satellites match your search.
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((sat) => {
            const isSaved = savedSet.has(sat.noradId);
            return (
              <li
                key={sat.noradId}
                className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-800/40 border border-slate-700/60 rounded-lg hover:border-emerald-500/30 hover:bg-slate-800/70 transition"
              >
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{sat.name}</p>
                  <p className="text-slate-500 text-xs">
                    {sat.category} · NORAD {sat.noradId}
                  </p>
                </div>
                <button
                  onClick={() => toggle(sat, isSaved)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition active:scale-95 ${
                    isSaved
                      ? "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700"
                      : "bg-transparent border-slate-600 text-slate-300 hover:border-emerald-500 hover:text-emerald-300"
                  }`}
                >
                  {isSaved ? (
                    <>
                      <span aria-hidden>✓</span> Saved
                    </>
                  ) : (
                    <>
                      <span aria-hidden>＋</span> Save
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
