# Roadmap

Status as of the current release. Everything under "Shipped" landed across
three implementation waves (data/core, UX overhaul, PWA/accessibility/perf);
see git history for detail.

## Shipped

**Stability & data**
- [x] Schema versioning + automatic migration ladder; unreadable rows are
  quarantined (with raw-JSON export) instead of silently dropped.
- [x] Transactional saves — a failed write rolls memory back to match disk
  and re-renders, instead of leaving the screen out of sync.
- [x] Quota-exceeded detection with an immediate backup offer.
- [x] Custom delete confirmation with a 5-second undo toast — no `confirm()`
  anywhere in the app.
- [x] Fixed: blank-form-opens-with-errors, UTC-date-before-7am, comma-decimal
  fuel input, and backdrop-drag-discards-entry bugs.

**Money & data & export**
- [x] Rupiah-first entry (cost / price-per-litre / litres, three-way
  binding) with per-fuel-type remembered prices.
- [x] Odometer entry mode with derived distance and partial-fill tracking.
- [x] Cost-per-km dashboard, monthly spend breakdown with trend deltas.
- [x] CSV export (semicolon-delimited, comma decimals, formula-injection
  safe) and full JSON backup/restore with a merge/replace dry-run preview.

**Visuals & motion**
- [x] Canvas consumption trend chart (km/L or Rp/km) with scrubbing, moving
  average, and threshold coloring — no charting library.
- [x] Full design-token pass: fluid type scale, spacing/radius/elevation
  ramps, a single motion vocabulary honoring `prefers-reduced-motion`.
- [x] Redesigned history cards, sticky-compact stats header, bottom-sheet
  entry form, onboarding flow with a sample-data option.

**PWA & devices**
- [x] Real service worker (`sw.js`) — the previous Blob-URL registration
  never actually worked. Network-first-with-timeout navigations, stale-cache
  cleanup, and an update-available toast with an explicit reload (no silent
  version swaps under an open tab).
- [x] Manifest + icons generated at load, `start_url`/`scope` derived from
  the page's own location so it works from any sub-path.
- [x] iOS home-screen polish: real 180×180 apple-touch-icon, safe-area-aware
  layout, status bar meta.
- [x] In-app install nudge (`beforeinstallprompt`) plus a one-time iOS
  Share-sheet hint.
- [x] Accessibility pass: keyboard-operable history cards, dialog focus
  restored to the invoking element on close, live-announced form errors,
  crash screen with an export escape hatch.

## Deferred

Recorded here on purpose, not forgotten:

- **Multi-vehicle garage.** Track more than one motorcycle/car with separate
  histories and stats. Meaningfully changes the data model (every entry
  needs a vehicle reference) and the stats/chart aggregation, so it's a
  release of its own rather than a bolt-on.
- **Shareable stats card.** Render a shareable summary image (Canvas →
  PNG/share sheet) for social posting — "my bike did X km/L this month".
  Pure addition, no data model impact; good candidate for a future pass once
  there's a design for it.
- **English localization.** All copy is currently Indonesian by design for
  this release; the codebase already keeps user-facing strings reasonably
  separated to make an i18n layer straightforward later, but no language
  switcher exists yet.

## Resolved since

- **Naming conflict with Sygic's "Fuelio" — resolved by rename.** The app is
  now **Iritku** ("irit" + "-ku"), applied across the title, header, manifest,
  export filenames, and cache names. The `fuelTrackerData` localStorage key was
  deliberately left alone so existing installs keep their history.

## Owner follow-ups (not code)

- Rename the GitHub repository and the Netlify site — both still read `fuelio`,
  so the demo URL will change once that's done.
- Run a formal PDKI trademark search (classes 9 and 42) before any paid
  marketing or app-store listing under the Iritku name.
