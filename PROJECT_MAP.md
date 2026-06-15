# PROJECT_MAP — نَحْرِير (Nahrir) v2.0.0

## TECH_STACK
- **Runtime:** Browser SPA (Electron removed)
- **Framework:** React 19 + Vite 8
- **Routing:** React Router v7 (lazy-loaded nested routes)
- **State:** Zustand 5 (theme, language)
- **Styling:** Tailwind CSS 4 + CSS Variables (dark/light)
- **Icons:** lucide-react 1.x
- **Canvas:** Konva + react-konva (Whiteboard)
- **PWA:** vite-plugin-pwa (service worker + manifest)
- **Storage:** localStorage
- **APIs:** axios (currency, prayer times, time zones)
- **PDF:** pdfjs-dist (Whiteboard PDF import)
- **Build Output:** `dist/` (static files)

## SYSTEM_FLOW
```
[User] → [index.html] → [src/app/main.jsx] → [App.jsx] → [RouterProvider]
                                                             │
                                                  [createBrowserRouter]
                                                             │
                                                   [/ → Shell Layout]
                                                        │        │
                                                  [Header]  [Outlet]
                                                        │        │
                                                 [Dropdown]  [Lazy Feature]
                                                        │        │
                                                 [stores]  [localStorage]
```

## ARCHITECTURE
```
src/
├── app/                    # App bootstrap
│   ├── main.jsx           # Entry point
│   ├── App.jsx            # RouterProvider
│   └── router.jsx         # 14 lazy routes (dashboard + 12 features + settings)
├── shared/                # Reusable UI
│   ├── layout/
│   │   ├── Shell.jsx      # Vertical flex layout: Header + Outlet
│   │   ├── Header.jsx     # Top navigation with dropdown and tools launchers
│   │   ├── Header.css     # Styles, animations, and responsive layout
│   │   └── GlobalServices.jsx  # Background timer/prayer/reminder services
│   └── ui/                # (future: Button, Card, Modal)
├── features/              # 12 domain features (unchanged from v1)
│   ├── QuranTeacher.jsx
│   ├── PrayerTimes/
│   ├── Whiteboard.jsx
│   ├── MeroCalendar/
│   ├── WorldClock.jsx
│   ├── Timer.jsx
│   ├── FocusMode.jsx
│   ├── CurrencyConverter.jsx
│   ├── Notes.jsx
│   ├── AddressBook/
│   ├── QuickLinks.jsx
│   ├── ImportantSites/
│   └── Settings.jsx
├── stores/
│   ├── themeStore.js      # Zustand: dark/light (persisted)
│   └── langStore.js       # Zustand: ar/en + t() (persisted)
├── contexts/              # Legacy (kept for feature backward compat)
│   ├── LanguageContext.jsx
│   ├── ThemeContext.jsx
│   └── AudioContext.jsx
├── services/              # API clients
├── utils/                 # storage, i18n (legacy), sound
├── i18n/
│   └── translations.js   # Compact ar/en translations (~200 keys)
└── styles/
    └── global.css         # Tailwind v4 + CSS custom properties
```

## VERIFIED_GOALS
- [x] Build passes with 0 errors (1.5s production build)
- [x] All 12 features lazy-loaded with code splitting
- [x] React Router v7 with browser history navigation
- [x] PWA: service worker precaches 69 entries (~3.5MB)
- [x] Dark/Light mode persisted + toggle in top header
- [x] Arabic/English i18n persisted + toggle in top header
- [x] MIT License with attribution clause
- [x] Zero Electron dependencies (removed)

## FORMATTING FIXES (2026-06-14)
- [x] Duplicate key `markComplete` removed from ar + en in old i18n.js
- [x] Duplicate `// Dashboard` comment line removed
- [x] Normalized line endings: CRLF → LF (56 files)
- [x] Normalized line endings: trailing whitespace + consecutive blank lines (56 files)
- [x] Normalized indentation: 4-space → 2-space (64 files)
- [x] Fixed missing semicolons in QuranTeacher.jsx
- [x] Deleted orphaned files: `src/components/Sidebar.css`, `src/utils/hijriUtils.js`
- [x] **CRITICAL BUG:** PowerShell `Get-Content -Raw` corrupts UTF-8 Arabic text (reads as Windows-1252)
- [x] **FIX:** Reversed encoding corruption for 31 source files (double reversal from mojibake)
- [x] Build passes with 0 errors (1.90s)

## ORPHANS & PENDING — EMPTY
All orphaned files have been removed. The project is clean and deployable.

## MOBILE RESPONSIVE FIXES (2026-06-15)
- [x] **PrayerTimes:** Added `padding-bottom` to container on mobile for Maghrib/Isha spacing
- [x] **Whiteboard:** Added `touch-action: none` and `overflow: hidden` to canvas-wrapper on mobile to prevent scroll-while-drawing
- [x] **MeroCalendar:** Added responsive layout (flex-column, full-width main, smaller day cells, scrollable month picker)
- [x] **AddressBook:** Added responsive layout (flex-column sidebar, scrollable table, hidden button labels)
