# Fuelio

A mobile-first Progressive Web App for tracking motorcycle fuel efficiency and
cost with the "full-tank method". Single `index.html` file — inline CSS/JS,
zero external dependencies, no build step, no backend, no account.

> **Naming note:** this project shares the name "Fuelio" with an existing,
> unrelated navigation/traffic app by Sygic. See **Known issues** below.

## Features

- **Rupiah-first entry.** Log a fill-up by cost, price-per-litre, or litres —
  enter any two of the three and the app computes the rest. Fuel-type presets
  remember the price you last corrected.
- **Two entry modes.** Trip-meter distance, or odometer readings with the
  distance derived automatically from your last reading. Partial fills are
  tracked separately and folded into the next full tank's ratio.
- **Money dashboard.** Cost per kilometre, spend this month, a per-month
  breakdown with trend deltas, and a canvas trend chart (km/L or Rp/km) with
  touch scrubbing.
- **Passive nudges, not nagging.** A refill reminder based on your own
  history, and a backup reminder once you have enough data at risk — both
  dismissible, neither blocking.
- **Real offline support.** A same-origin service worker (`sw.js`) precaches
  the app shell and serves it network-first-with-timeout, so the app opens
  even with no connection. Update available → an in-app prompt, never a
  silent reload.
- **Installable.** Manifest + icons generated at load; an in-app "install"
  nudge on Android/desktop, a one-time Share-sheet hint on iOS (which doesn't
  expose the browser install prompt).
- **Full backup control.** CSV export (Excel-friendly, formula-injection
  safe), full JSON backup/restore with a dry-run preview before merge or
  replace, and a quarantine lane for rows that fail validation instead of
  silently dropping them.
- **Accessible by default.** Keyboard-operable history cards, focus returned
  to whatever opened a dialog, live-announced form errors, and a full
  reduced-motion mode.
- **Dark mode** follows the system by default, with a manual override.

## Privacy

**Your data never leaves your phone.** Everything lives in the browser's
`localStorage` on the device you're using — there is no server, no account,
no analytics, no network request the app makes on its own besides serving its
own cached files. Uninstalling the app or clearing site data deletes it
permanently, which is exactly why the app nudges you to export a JSON backup
periodically. Nothing is ever synced or shared unless you manually export a
file and send it somewhere yourself.

## Running it

Because of the service worker, **this app must be served over `https://` or
`http://localhost`** — browsers refuse to register a service worker from a
`file://` URL, so opening `index.html` directly will lose offline support
(everything else still works). For local development:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

Any static file host works in production (GitHub Pages, Netlify, a plain
nginx/Apache directory, etc.) — there's nothing to build or configure.

## Usage

1. Tap **+** (or "Catat pengisian pertama" on first run) to log a fill-up.
2. Enter distance (trip or odometer) and litres; cost/price-per-litre are
   optional and auto-fill each other.
3. Save — history, stats, and the trend chart update immediately.
4. Tap a card to edit, or use its **⋯** button for edit/delete. Deleting is
   optimistic with a 5-second undo toast.
5. Open the gear icon for Settings: default fuel prices, entry mode, CSV/JSON
   export, backup restore, and sample data.

## Data model (localStorage, key `fuelTrackerData`)

The stored shape is versioned (`schemaVersion`) and migrated automatically —
old data written by earlier versions of this app loads without any manual
steps.

```json
{
  "schemaVersion": 2,
  "entries": [
    {
      "id": "1732195200000_a3f2",
      "date": "2024-11-21",
      "distance": 31,
      "fuel": 2.4,
      "notes": "full throttle test",
      "timestamp": 1732195200000,
      "fuelType": "Pertamax",
      "fuelCost": 30000,
      "pricePerLiter": 12500,
      "odometer": null,
      "isPartialFill": false
    }
  ],
  "settings": { "darkMode": "auto", "entryMode": "trip", "fuelPrices": {} },
  "quarantine": []
}
```

`ratio` (km/L) is always derived at render time, never stored — it's a
function of distance/fuel, so keeping a persisted copy would just invite the
two values to drift apart.

## Dev notes

- No build step; edit `index.html` directly (inline CSS/JS).
- `sw.js` is the one permitted sibling file — a service worker cannot be
  registered from a Blob or inline URL, only from a real script URL.
- The manifest and app icons are generated at load time (canvas → PNG data
  URIs, injected as a `data:` URI `<link rel="manifest">`) rather than shipped
  as separate files.
- To reset local data, remove the `fuelTrackerData` key in DevTools →
  Application/Storage. A raw JSON backup can be restored from Settings.

## Known issues

- **Naming conflict:** "Fuelio" is also the name of an established,
  unaffiliated car navigation/speed-camera app by Sygic. This project is not
  related to it in any way. If this app is ever published to an app store or
  given real distribution, it should be renamed first to avoid confusion —
  tracked in `ROADMAP.md`, not addressed in this release.
- Distance can only be pasted in from Google Maps manually (copy the number,
  paste into the field, or use the in-form clipboard helper) — there's no
  route-fetching API integration, by design (see `ROADMAP.md`).
- Offline support and install prompts require HTTPS or `localhost`; opening
  the file directly (`file://`) disables the service worker only.
