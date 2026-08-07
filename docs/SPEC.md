> **Historical document — v1 spec, superseded.**
> This is the original brief the first version of the app was built from (then
> called "Fuel Consumption Tracker"). It is kept for provenance only and is
> **not** an accurate description of the shipped product: the app is now
> **Iritku**, its data model is at `schemaVersion: 2`, and several things listed
> here as "Out of Scope" (fuel-cost workflows in particular) have since shipped.
> For what the codebase actually does today, read `AGENTS.md` and the READMEs;
> for what is planned, read `docs/ROADMAP.md`. Original content follows
> unchanged below.

---

# Fuel Consumption Tracker PWA

## Context & Requirements

Build a mobile-first PWA for motorcyclists to track fuel consumption using the "full-tank method": measuring fuel needed to refill tank after a trip, then calculating efficiency based on distance traveled.

## Core User Flow

User fills tank (full) → rides 31km → refills tank again (takes 2.4L to fill) → enters distance and refill amount → sees "1:12.9" efficiency ratio.

## Technical Architecture

### File Structure

Single HTML file with inline CSS/JS, no external dependencies.

### Data Model (LocalStorage)

```javascript
{
  "fuelTrackerData": {
    "entries": [
      {
        "id": "timestamp_random", // e.g., "1732195200000_a3f2"
        "date": "2024-11-21",
        "distance": 31,
        "fuel": 2.4,
        "ratio": 12.92,
        "notes": "full throttle test",
        "timestamp": 1732195200000,
        "fuelCost":  30000,  // optional, untuk "Pertamax 30rb",
        "pricePerLiter":  12500  // auto-calculated if fuelCost provided
      }
    ],
    "settings": {
      "darkMode": "auto", // "auto" | "dark" | "light"
      "language": "id"
    }
  }
}

```

## Feature Specifications


### 1. Entry Form (Modal)
- **Fields:**
  - Distance (km): `<input type="number" min="0.1" max="9999" step="0.1" required>`
    - Label: "Jarak Tempuh (km)"
    - Placeholder: "Dari isi penuh ke isi penuh"
  - Fuel (L): `<input type="number" min="0.01" max="99" step="0.01" required>`
    - Label: "BBM untuk Isi Penuh (L)"
    - Placeholder: "Berapa liter sampai tangki penuh lagi"
  - Date: `<input type="date">` (default: today)
  - Notes: `<textarea maxlength="200">` (optional)
- **Help Text:** Show info icon with tooltip: "ℹ️ Cara ukur: Isi fulltank → Catat KM → Pakai motor → Isi fulltank lagi → Input jarak & liter yang masuk"
- **Validation:**
  - Prevent zero/negative values
  - Show inline errors below fields
  - Disable submit until valid
- **UI:** Full-screen modal on mobile, centered dialog on desktop

### 2. History View (Main Screen)

-   **Entry Card Display:**
    
    ```
    [Color Bar] 21 Nov 202431 km | 2.4 L | 1:12.9"full throttle test"
    
    ```
    
-   **Color Indicators:**
    -   Green (≥25 km/L): `#10b981`
    -   Yellow (15-24 km/L): `#f59e0b`
    -   Red (<15 km/L): `#ef4444`
-   **Actions:** Long-press to delete (with confirmation), tap to edit
-   **Empty State:** Icon + "Belum ada data. Tap + untuk menambah."


### 3. Statistics Header

-   **Metrics (horizontal scroll on mobile):**
    -   Rata-rata: X.X km/L
    -   Terbaik: X.X km/L
    -   Terburuk: X.X km/L
    -   Total: XXX km / XXX L
-   **Visual:** Card with subtle shadow, fixed at top

### 4. PWA Configuration

```javascript
// Inline manifest
const manifest = {
  "name": "Fuel Tracker",
  "short_name": "Fuel",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1e293b",
  "background_color": "#ffffff",
  "icons": [
    {"src": "data:image/svg+xml,...", "sizes": "192x192"},
    {"src": "data:image/svg+xml,...", "sizes": "512x512"}
  ]
};

// Service Worker - Cache-first strategy
const CACHE_NAME = 'fuel-tracker-v1';
const urlsToCache = ['/'];

```

## UI/UX Specifications

### Layout Structure

```
┌─────────────────────────┐
│     Stats Header        │ <- Fixed
├─────────────────────────┤
│                         │
│     History List        │ <- Scrollable
│                         │
└─────────────────────────┘
        [+] FAB            <- Fixed bottom-right

```

### Design Tokens

```css
/* Colors */
--primary: #3b82f6;
--success: #10b981;
--warning: #f59e0b;
--danger: #ef4444;
--bg-light: #ffffff;
--bg-dark: #1e293b;
--text-light: #1f2937;
--text-dark: #f3f4f6;

/* Spacing */
--spacing-unit: 0.5rem;
--radius: 0.75rem;

/* Breakpoints */
--mobile: 640px;
--tablet: 768px;

```

### Responsive Behavior

-   **Mobile (<640px):** Single column, full-width cards, bottom FAB
-   **Tablet (640-1024px):** Max-width container (640px), centered
-   **Desktop (>1024px):** Max-width 768px, add subtle shadows

## Implementation Requirements

### Must Have (MVP)

1.  Add/edit/delete entries
2.  Auto-calculate ratio
3.  Color-coded efficiency
4.  LocalStorage persistence
5.  Basic offline capability
6.  Dark mode (system preference)
7.  Indonesian language

### Nice to Have (Skip if Complex)

1.  CSV export (data URI download)
2.  Consumption trend chart (Canvas API)
3.  Manual dark mode toggle
4.  Swipe-to-delete gesture

### Out of Scope

1.  CSV import (security concerns)
2.  Fuel cost calculations
3.  Multi-language support
4.  Cloud sync

## Edge Cases & Error Handling

### Data Validation

-   Division by zero → Show "Invalid" instead of Infinity
-   LocalStorage quota → Alert user, offer to export data
-   No LocalStorage support → Show warning banner
-   Corrupted data → Validate on load, reset if invalid

### Number Formatting

-   Ratio: Always 2 decimals (12.92, not 12.916666)
-   Large numbers: Add thousand separator (1.234 km)
-   Very small fuel amounts: Allow 3 decimals (0.001 L)

## Success Metrics

User can complete full flow (add entry → see history → view stats) in under 30 seconds without instructions.

## Code Structure Requirements

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <!-- Meta tags, inline manifest -->
  <style>/* All CSS inline */</style>
</head>
<body>
  <!-- Semantic HTML5 structure -->
  <header><!-- Stats --></header>
  <main><!-- History list --></main>
  <button id="fab"><!-- Add button --></button>
  <dialog><!-- Entry form modal --></dialog>
  
  <script>
    // 1. Data layer (LocalStorage wrapper)
    // 2. UI components (render functions)
    // 3. Event handlers
    // 4. Service Worker registration
    // 5. Init function
  </script>
</body>
</html>