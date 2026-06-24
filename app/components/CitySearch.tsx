"use client";

import { useEffect, useRef, useState } from "react";

// Shape of a single city result from the Open-Meteo geocoding API.
// We only type the fields we actually use.
interface GeoResult {
  id: number;
  name: string; // City name, e.g. "Springfield"
  latitude: number;
  longitude: number;
  country?: string; // e.g. "United States"
  admin1?: string; // Region / state, e.g. "Illinois"
}

// Builds a human-readable label like "Springfield, Illinois, United States".
// Region (admin1) and country are optional, so we only add them when present.
function formatCity(city: GeoResult): string {
  return [city.name, city.admin1, city.country].filter(Boolean).join(", ");
}

export default function CitySearch() {
  // The text in the search box.
  const [query, setQuery] = useState("");
  // The list of matching cities shown in the dropdown.
  const [results, setResults] = useState<GeoResult[]>([]);
  // A user-facing error message ("" means no error).
  const [error, setError] = useState("");
  // True while a request is in flight (shows a subtle "Searching..." hint).
  const [loading, setLoading] = useState(false);
  // The city the user has confirmed by clicking it.
  const [selected, setSelected] = useState<GeoResult | null>(null);

  // When we auto-fill the input after a selection, we set this flag so the
  // search effect skips that one change (otherwise picking a city would
  // immediately re-open the dropdown).
  const skipSearchRef = useRef(false);

  // As-you-type search. This effect re-runs every time `query` changes.
  useEffect(() => {
    const term = query.trim();

    // Skip the change that came from auto-filling the box on selection.
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    // Require at least 2 characters before hitting the API.
    if (term.length < 2) {
      setResults([]);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    // AbortController cancels an in-flight request if the user keeps typing,
    // so a slow old response can never overwrite a newer one (race safety).
    const controller = new AbortController();

    // Debounce: wait 350ms after the last keystroke before calling the API,
    // so we don't fire a request on every single character.
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            term,
          )}&count=5`,
          { signal: controller.signal },
        );

        if (!res.ok) throw new Error("Search request failed");

        const data = await res.json();

        // Open-Meteo OMITS the "results" key entirely when nothing matches
        // (it does not return an empty array), so we check for both.
        if (!data.results || data.results.length === 0) {
          setResults([]);
          setError("City not found. Please try again.");
        } else {
          setResults(data.results);
          setError("");
        }
      } catch (err) {
        // Ignore aborts (expected when the user keeps typing); surface the rest.
        if ((err as Error).name !== "AbortError") {
          setResults([]);
          setError("Something went wrong. Please try again.");
        }
      } finally {
        // Don't flip loading off for a request we deliberately aborted —
        // the newer request that replaced it will manage the loading state.
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);

    // Cleanup runs before the next effect (or on unmount): cancel both the
    // pending timer and any request already in flight.
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Runs when the user clicks a city in the dropdown.
  function handleSelect(city: GeoResult) {
    setSelected(city);
    skipSearchRef.current = true; // don't re-search the value we're about to set
    setQuery(formatCity(city)); // fill the box with the chosen city
    setResults([]); // close the dropdown
    setError("");

    // NOTE: Intentional, not leftover debug output. Logging the exact
    // coordinates is the Phase 3 (Core 3) deliverable. This will be removed in
    // Core 5, when the selected location is passed to the satellite passes view.
    console.log(
      `Selected ${city.name}: latitude ${city.latitude}, longitude ${city.longitude}`,
    );
    console.log({
      name: city.name,
      region: city.admin1,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
    });
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg shadow-2xl p-6">
      <h2 className="text-xl font-semibold mb-1 text-emerald-400">
        Find Your Location
      </h2>
      <p className="text-slate-400 text-sm mb-4">
        Start typing a city name and pick it from the list.
      </p>

      {/* `relative` so the dropdown can be absolutely positioned under the input. */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // Editing the box after a selection clears the confirmed choice.
            if (selected) setSelected(null);
          }}
          placeholder="Search for a city..."
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
        />

        {/* Subtle in-progress hint while a request is running. */}
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            Searching...
          </span>
        )}

        {/* Results dropdown: only shown when we have matches. Region + country
            are included so near-identical cities are distinguishable
            (e.g. Springfield, Illinois vs Springfield, Missouri). */}
        {results.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-md shadow-xl overflow-hidden">
            {results.map((city) => (
              <li key={city.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(city)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-700 transition"
                >
                  <span className="text-white font-medium">{city.name}</span>
                  <span className="text-slate-400 text-sm">
                    {city.admin1 ? `, ${city.admin1}` : ""}
                    {city.country ? `, ${city.country}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Error message: only shown when `error` is non-empty. */}
      {error && (
        <div className="mt-4 p-3 bg-red-950/40 border border-red-500/50 rounded-md">
          <p className="text-red-200 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Confirmation panel: shows the chosen city and its coordinates so the
          selection is visible in the UI, not just in the console. */}
      {selected && (
        <div className="mt-4 p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-md">
          <p className="text-emerald-300 text-sm font-medium">
            Location set: {formatCity(selected)}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Latitude {selected.latitude}, Longitude {selected.longitude}
          </p>
        </div>
      )}
    </div>
  );
}
