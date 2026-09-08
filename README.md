# Iritku

**Catat bensin, tahu Rp/km.**

Iritku is a mobile-first Progressive Web App for riders who want to know what
their motorcycle actually costs to run. You log a fill-up — how far you rode
and how much fuel it took to fill the tank back up — and Iritku turns that into
kilometres per litre and, more usefully, rupiah per kilometre. It is one
`index.html` file with inline CSS and JS, plus a service worker: no build step,
no backend, no account, no tracking. Everything you enter stays on your phone.

The interface is entirely in Bahasa Indonesia.

[**Live demo →**](https://fuelio.netlify.app)

## Screenshots

| Light | Dark |
| --- | --- |
| ![Iritku in light mode](docs/screenshots/light.png) | ![Iritku in dark mode](docs/screenshots/dark.png) |

## Features

### Money tracking

- **Rupiah-first entry.** Log a fill-up by total cost, price per litre, or
  litres — enter any two of the three and Iritku computes the rest.
- **Remembered fuel prices.** Each fuel type keeps the price you last
  corrected, so the next entry is mostly pre-filled.
- **Cost dashboard.** Rupiah per kilometre, spend this month, and a per-month
  breakdown with up/down trend deltas against the previous month.

### Efficiency

- **Full-tank method.** The classic approach: fill up, ride, fill up again,
  enter the distance and the litres it took.
- **Two distance modes.** Trip-meter distance, or odometer readings with the
  distance derived automatically from your last entry.
- **Partial fills handled properly.** A tank that wasn't filled all the way is
  tracked separately and folded into the next full tank's ratio instead of
  poisoning the average.
- **Trend chart.** A canvas chart of km/L or Rp/km with touch scrubbing, a
  moving average, and threshold colouring — drawn by hand, no chart library.
- **Colour-coded history.** Each fill-up card is marked green/amber/red by
  efficiency so a bad tank is visible at a glance.

### Data safety

- **JSON backup and restore.** Full export, and a restore flow with a dry-run
  preview that shows exactly what merging or replacing would do before you
  commit to it.
- **CSV export.** Excel-friendly (semicolon-delimited, comma decimals) and
  formula-injection safe.
- **Quarantine, not deletion.** Rows that fail validation are set aside and
  shown in Settings with a raw-JSON export, rather than being silently dropped.
- **Automatic schema migration.** Data written by older versions of the app
  loads without any manual step.
- **Transactional saves.** If a write fails, the app rolls back and re-renders
  instead of showing you a screen that no longer matches storage. A full
  storage quota triggers an immediate backup offer.
- **Backup reminder.** Once you have enough history to actually miss, Iritku
  nudges you to export — dismissible, never blocking.

### PWA

- **Real offline support.** A same-origin service worker precaches the app
  shell and serves it network-first with a timeout, so Iritku opens with no
  connection at all.
- **Installable.** Manifest and icons are generated at load time; there's an
  in-app install nudge on Android and desktop, and a one-time Share-sheet hint
  on iOS, which doesn't expose the browser install prompt.
- **Honest updates.** A new version shows an in-app prompt with an explicit
  reload — never a silent swap under an open tab.
- **Dark mode** follows the system by default, with a manual override.
- **Accessible by default.** Keyboard-operable history cards, focus returned to
  whatever opened a dialog, live-announced form errors, a full reduced-motion
  mode, and a crash screen that still lets you export your data.

## Quick start

Iritku needs to be served over **`https://` or `http://localhost`** — browsers
refuse to register a service worker from a `file://` URL, so opening
`index.html` directly costs you offline support and installability (everything
else still works). Locally:

```bash
git clone https://github.com/adenaufal/fuelio.git
cd fuelio
python3 -m http.server 8000
# then open http://localhost:8000/
```

For production, any static host works — Netlify, GitHub Pages, a plain
nginx/Apache directory. There is nothing to build or configure.

## Usage

1. Tap **+** (or "Catat pengisian pertama" on first run) to log a fill-up.
2. Enter distance (trip or odometer) and litres; cost and price per litre are
   optional and fill each other in.
3. Save — history, stats, and the trend chart update immediately.
4. Tap a card to edit, or use its **⋯** button for edit/delete. Deleting is
   optimistic, with a 5-second undo toast.
5. Open the gear icon for Settings: default fuel prices, entry mode, CSV/JSON
   export, backup restore, and sample data.

## Data model

Everything lives in `localStorage` under the key **`fuelTrackerData`**. That
key is a leftover from the app's original name and is kept deliberately: it is
what existing installs already hold, and renaming it would orphan their
history.

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

`ratio` (km/L) is always derived at render time, never stored — it's a function
of distance and fuel, so keeping a persisted copy would only invite the two to
drift apart.

**Backup and restore.** Settings → export writes a JSON file named
`iritku-backup-YYYY-MM-DD.json`. Restore reads the file, runs it through the
same migration ladder as stored data, and shows a preview of what merge or
replace would produce before anything is written. Import validates the payload's
`schemaVersion`, not its filename — backups exported under the app's old name
still restore cleanly. To reset local data, delete the `fuelTrackerData` key in
DevTools → Application/Storage.

## Privacy

**Your data never leaves your phone.** Everything lives in the browser's
`localStorage` on the device you're using. There is no server, no account, no
analytics, and no network request the app makes on its own beyond serving its
own cached files. Uninstalling or clearing site data deletes it permanently,
which is exactly why the app nudges you to export a backup. Nothing is ever
synced or shared unless you export a file and send it somewhere yourself.

## Roadmap

Shipped work and the deliberately deferred items (multi-vehicle garage,
shareable stats card, English localization) are listed in
[`docs/ROADMAP.md`](docs/ROADMAP.md).

## Rename status

The app was previously called **Fuelio**, which collides with an established,
unrelated car-navigation app by Sygic. It has been renamed to **Iritku**
("irit" + "-ku") across the whole product surface: title, header, manifest,
export filenames, and cache names. The `fuelTrackerData` storage key is the one
deliberate exception, for the compatibility reason above.

Two things remain outside what a code change can do:

- **Repository and Netlify subdomain still say `fuelio`.** Renaming the GitHub
  repo and the Netlify site is a manual step for the repo owner; the live demo
  link above will change when they do it.
- **No formal trademark search has been done.** Before any paid marketing or an
  app-store listing under the Iritku name, a PDKI search (Indonesia's trademark
  database, classes 9 and 42) is strongly recommended.

## Known issues

- Distance from Google Maps has to be entered by hand — copy the number and
  paste it into the field, or use the in-form clipboard helper. There is no
  route-fetching API integration, by design (see
  [`docs/ROADMAP.md`](docs/ROADMAP.md)).
- Offline support and the install prompt require HTTPS or `localhost`. Opening
  the file directly over `file://` disables the service worker only; the rest
  of the app works.

## Development notes

- No build step — edit `index.html` directly (CSS and JS are inline).
- `sw.js` is the one permitted sibling file; a service worker cannot be
  registered from a Blob or inline URL, only from a real script URL.
- The manifest and app icons are generated at load time (canvas → PNG data
  URIs) rather than shipped as separate files.
- Agent and contributor conventions, including the verification recipe, are in
  [`AGENTS.md`](AGENTS.md). The original v1 brief is kept for provenance at
  [`docs/SPEC.md`](docs/SPEC.md) and is no longer accurate.

## License

MIT — see [LICENSE](LICENSE).

Bahasa Indonesia version of this document: [`README-id.md`](README-id.md).
