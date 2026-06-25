"use client";

import { useState, useTransition } from "react";
import { removeLocation, setActiveLocation } from "@/app/locations/actions";

export interface SavedLocation {
  id: string;
  city_name: string;
  is_active: boolean;
}

interface Props {
  locations: SavedLocation[];
}

export default function LocationsBar({ locations }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Nothing to show until the user has saved at least one city.
  if (locations.length === 0) return null;

  function switchTo(id: string) {
    setError("");
    startTransition(async () => {
      const result = await setActiveLocation(id);
      if ("error" in result) setError(result.error);
    });
  }

  function remove(id: string) {
    setError("");
    startTransition(async () => {
      const result = await removeLocation(id);
      if ("error" in result) setError(result.error);
    });
  }

  return (
    <div>
      <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-2">
        Your locations ({locations.length}/5)
      </h3>
      <div className="flex flex-wrap gap-2">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className={`group flex items-center rounded-full border text-sm transition ${
              loc.is_active
                ? "bg-emerald-600/20 border-emerald-500/60 text-emerald-200"
                : "bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            {/* Click the name to make this city the active one. */}
            <button
              onClick={() => switchTo(loc.id)}
              disabled={isPending || loc.is_active}
              className="pl-3 pr-2 py-1.5 disabled:cursor-default"
              title={loc.is_active ? "Active location" : "Switch to this location"}
            >
              {loc.is_active && <span className="mr-1 text-emerald-400">●</span>}
              {loc.city_name}
            </button>
            {/* Remove this city. */}
            <button
              onClick={() => remove(loc.id)}
              disabled={isPending}
              title="Remove location"
              className="pr-3 pl-1 py-1.5 text-slate-500 hover:text-red-300 transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      {error && <p className="mt-2 text-red-300 text-sm">{error}</p>}
    </div>
  );
}
