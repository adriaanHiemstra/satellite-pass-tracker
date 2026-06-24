// Curated catalog of well-known satellites that users can browse and save.
//
// Why a curated list (not a live API)? The N2YO API — which we use later for
// pass predictions — is keyed by NORAD id and has no "search by name" endpoint.
// A hand-picked catalog gives a fast, reliable, searchable browse experience,
// and every entry already carries the NORAD id that Core 5 needs.
//
// NORAD ids for ISS (25544) and Hubble (20580) are the guaranteed-good demo
// entries. The rest are a seed list; ids can be verified against CelesTrak
// (https://celestrak.org) if needed.

export interface Satellite {
  noradId: number; // NORAD catalog number — the id N2YO uses for passes
  name: string;
  category: SatelliteCategory;
}

export type SatelliteCategory =
  | "Space Station"
  | "Astronomy"
  | "Weather"
  | "Earth Observation"
  | "Amateur Radio";

export const SATELLITES: Satellite[] = [
  // Crewed space stations
  { noradId: 25544, name: "ISS (ZARYA)", category: "Space Station" },
  { noradId: 48274, name: "CSS (Tianhe)", category: "Space Station" },

  // Space telescopes / astronomy
  { noradId: 20580, name: "Hubble Space Telescope", category: "Astronomy" },
  { noradId: 43435, name: "TESS", category: "Astronomy" },
  { noradId: 28485, name: "Swift", category: "Astronomy" },
  { noradId: 33053, name: "Fermi (GLAST)", category: "Astronomy" },
  { noradId: 25867, name: "Chandra X-ray Observatory", category: "Astronomy" },

  // Weather
  { noradId: 25338, name: "NOAA 15", category: "Weather" },
  { noradId: 28654, name: "NOAA 18", category: "Weather" },
  { noradId: 33591, name: "NOAA 19", category: "Weather" },
  { noradId: 40069, name: "METEOR-M 2", category: "Weather" },
  { noradId: 41866, name: "GOES 16", category: "Weather" },

  // Earth observation
  { noradId: 25994, name: "Terra", category: "Earth Observation" },
  { noradId: 27424, name: "Aqua", category: "Earth Observation" },
  { noradId: 28376, name: "Aura", category: "Earth Observation" },
  { noradId: 39084, name: "Landsat 8", category: "Earth Observation" },
  { noradId: 49260, name: "Landsat 9", category: "Earth Observation" },
  { noradId: 37849, name: "Suomi NPP", category: "Earth Observation" },

  // Amateur radio (popular with hobbyists tracking passes)
  { noradId: 27607, name: "SO-50 (SaudiSat 1C)", category: "Amateur Radio" },
  { noradId: 40967, name: "AO-85 (Fox-1A)", category: "Amateur Radio" },
];

// The distinct categories, in display order, for filter chips in the UI.
export const SATELLITE_CATEGORIES: SatelliteCategory[] = [
  "Space Station",
  "Astronomy",
  "Weather",
  "Earth Observation",
  "Amateur Radio",
];
