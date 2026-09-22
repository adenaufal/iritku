# AGENTS.md

Working notes for AI coding agents (Claude Code, Gemini CLI, Cursor, Codex, …)
on **Iritku** — a mobile-first PWA for tracking motorcycle fuel cost and
efficiency with the full-tank method.

This file supersedes the older `AGENT.md` / `GEMINI.md` pair and is the single
place to look first. `docs/SPEC.md` is the **historical v1 brief** and is *not*
authoritative — several of its "Out of Scope" items (fuel cost, money
workflows) have shipped since. When the spec and the code disagree, the code
wins.

## Architecture (non-negotiable)

- **`index.html` is the entire app** — inline `<style>` and a single inline
  `<script>` (~line 1649 onward), no build step, no bundler, no npm, no
  external CSS/JS/font/image requests. Edit it directly.
- **`sw.js` is the one permitted sibling script.** A service worker cannot be
  registered from a Blob or `data:` URL — the spec requires a real same-origin
  script URL — so this one file has to exist on disk. Do not add a third
  script file; if you think you need one, you almost certainly don't.
- **`index.html` and `sw.js` must stay at the repository root.** The site is
  hosted on Cloudflare Pages (`iritku.pages.dev`), deployed from exactly these
  two files; moving them breaks the service-worker scope and the runtime-
  generated manifest/icon paths.
- The **web app manifest and all icons are generated at runtime** (canvas →
  PNG data URIs, injected as a `data:` URI `<link rel="manifest">`). There are
  no icon files to update. The app icon is a droplet/gauge mark, no lettering.
- `start_url` / `scope` are derived from the page's own location so the app
  works from any sub-path.

## Data & storage

- **`STORAGE_KEY = 'fuelTrackerData'`** — a legacy key from the app's original
  name. **Never rename it.** Existing installs would silently lose all their
  history. The product name changed; the key deliberately did not.
- `SCHEMA_VERSION = 2`. Stored shape:
  `{ schemaVersion, entries[], settings, quarantine[] }`.
- **Migration ladder:** `MIGRATIONS[n]` upgrades v*n* → v*n+1*; `hydrate()`
  walks the ladder from whatever `schemaVersion` it finds up to
  `SCHEMA_VERSION`, then normalizes. v1 → v2 drops the stored `ratio` (now
  always derived at render time) and adds `fuelType`, `fuelCost`,
  `pricePerLiter`, `odometer`, `isPartialFill`. Adding a v3? Add
  `MIGRATIONS[2]`, bump `SCHEMA_VERSION`, and leave every earlier rung intact.
- **Quarantine, not deletion.** Rows that fail validation (bad shape, duplicate
  id) go to `data.quarantine` and are surfaced in Settings with a raw-JSON
  export. Nothing is ever dropped silently — keep it that way.
- **JSON import validates `schemaVersion`, not the filename or app version.**
  Backups exported under the old name still import. Do not add filename or
  version gating.
- Saves are transactional: a failed write rolls the in-memory state back to
  match disk and re-renders rather than leaving the UI out of sync. Quota
  errors trigger an immediate backup offer.

## Product features to preserve

- **Rupiah-first entry.** Three-way binding between cost / price-per-litre /
  litres — enter any two, the third is computed. Per-fuel-type prices are
  remembered from the user's last correction.
- **Two distance modes.** Trip meter, or odometer with distance derived from
  the previous reading. Partial fills are tracked separately and folded into
  the next full tank's ratio.
- **Money dashboard:** cost per km, spend this month, per-month breakdown with
  trend deltas, and a hand-rolled canvas trend chart (km/L or Rp/km) with touch
  scrubbing. No charting library.
- **Exports:** CSV (semicolon-delimited, comma decimals, formula-injection
  safe) and full JSON backup/restore with a merge/replace dry-run preview.
  Export filenames are `iritku-*`.
- **PWA behaviour:** network-first-with-timeout navigations, stale-cache
  cleanup, and an explicit "new version available" prompt — never a silent
  reload under an open tab.
- **Accessibility:** keyboard-operable history cards, dialog focus returned to
  the invoking element, live-announced form errors, a skip link to `#main`,
  reduced-motion support that drops movement but keeps colour/opacity feedback,
  and a crash screen with a data-export escape hatch.

## Design system

Changes to the UI go through these; none of them is decorative.

- **No emoji in the interface.** Every icon comes from the `ICONS` map in the
  inline script (or the matching inline `<svg class="ico">` in the static
  markup): one 24px grid, `currentColor`, `stroke-width: 1.75` (`2` beside bold
  text via `.ico-bold`/`.ico-sm`). Emoji do not take `currentColor`, do not
  match a text weight, and render differently on every platform.
- **Depth is `--shadow-border`, structure is a border.** Cards, chips, buttons
  and popovers get the shadow token; dividers, field outlines and separators
  stay real borders.
- **Nested radii are concentric:** outer = inner + padding. The history badge is
  `--r-sm` (8px) because the card is `--r-lg` (20px) with 12px of padding.
- **One press value.** `--press` (0.96) for controls, `--press-lg` (0.985) for
  full-width surfaces. Animate `scale`, never `transform: scale()`, so presses
  compose with other transforms.
- **Motion budget.** UI transitions stay at or under `--dur-3` (320ms), animate
  only compositor properties, and always name the properties — never
  `transition: all`. High-frequency interactions get colour/opacity feedback at
  `--dur-1` or less, not a custom animation. Interactive state changes use
  transitions (interruptible); keyframes are for one-shot sequences only.
- **Motion is never the only channel.** Every state an animation communicates
  also has a static cue — a colour, an icon, or a label.
- **Hover is gated.** Hover styling lives inside
  `@media (hover: hover) and (pointer: fine)`; touch fires false hovers on tap.
- **Theme flips suppress transitions.** Route every theme change through
  `withoutTransitions()`, or the whole document crossfades at once.
- **The top hairline carries the trend.** `--trend` is set from the 30-day
  delta; it is not a decorative gradient. Do not repurpose it.
- **Fuel grades have fixed colours** in `FUEL_TONES`. Use them wherever a grade
  is named.

## Copy rules

- **All user-facing copy is Bahasa Indonesia.** Every string a user can read —
  labels, toasts, errors, empty states, onboarding, the crash screen — is
  Indonesian. Code identifiers, comments, and these docs are English.
- English localization is a deliberate *deferred* item (see
  `docs/ROADMAP.md`); do not half-introduce an i18n layer as a side effect of
  another change.
- The product is **Iritku** ("irit" + "-ku"). Tagline: *Catat bensin, tahu
  Rp/km.* The old names "Fuel Tracker" and "Fuelio" must not appear in
  user-facing copy.

## Deploy

- Hosting is **Cloudflare Pages**, project `iritku` → https://iritku.pages.dev.
  The old Netlify site (`fuelio.netlify.app`) is retired.
- **Production deploy** (after staging the site files):

  ```bash
  STAGE=$(mktemp -d) && cp index.html sw.js "$STAGE/"
  npx wrangler pages deploy "$STAGE" --project-name=iritku --branch=main
  ```

- Direct-upload deploys are not wired to Git; re-run the command above after
  meaningful changes, or ask the owner to add a deploy hook/Action if pushes
  should auto-deploy.

## Service worker

- Cache name is `iritku-<APP_VERSION>`; `index.html` registers
  `sw.js?v=<APP_VERSION>`, so a version bump gets a fresh cache without editing
  `sw.js`.
- Activation cleanup deletes both stale `iritku-*` caches **and** legacy
  `fuel-*` caches, so installs upgraded from the old name don't leak storage.
  Keep the legacy prefix in the cleanup list.

## Verification recipe

No test runner, no CI. Before declaring a change done:

1. **Syntax-check the inline script.** Extract the contents of the single
   `<script>` block in `index.html` to a temp file and run `node --check` on
   it, plus `node --check sw.js`. Example:

   ```bash
   python3 - <<'PY'
   import re
   html = open('index.html').read()
   body = re.search(r'<script>(.*)</script>', html, re.S).group(1)
   open('/tmp/app.js', 'w').write(body)
   PY
   node --check /tmp/app.js && node --check sw.js
   ```

2. **Serve it** — the service worker needs `https://` or `localhost`:

   ```bash
   python3 -m http.server 8000
   ```

3. **Drive it with Playwright** against the bundled browser:

   ```bash
   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node script.js
   # launch with executablePath: '/opt/pw-browsers/chromium'
   ```

   Check at minimum: no console errors, SW registers, offline reload works,
   legacy `fuelTrackerData` payloads still render, and a JSON backup downloads
   with an `iritku-backup-` filename.

4. **Grep for regressions** before finishing:
   `grep -rn "Fuel Tracker\|Fuelio" index.html sw.js` for the old names, and
   `grep -n "transition: all\|transform: scale" index.html` plus a scan for
   emoji in `button`/`summary` text for design-system drift.

## Repository layout

```
/            index.html, sw.js, README.md, README-id.md, AGENTS.md, LICENSE, .gitignore
/docs        ROADMAP.md, ROADMAP-id.md, SPEC.md (historical v1), screenshots/
```

- READMEs are mirrored EN/ID and must stay content-equivalent — change one,
  change the other.
- `docs/screenshots/light.png` and `docs/screenshots/dark.png` are referenced
  by both READMEs; regenerate them (390×844) if the UI changes visibly.
- No external badge or image dependencies in the docs. In-repo screenshots
  only.
