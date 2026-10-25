# CodeRevise

A revision website for HTML, CSS, JavaScript and Python – topic-wise explanations, live runnable examples,
interview Q&A and auto-tested coding practice. Built with React + Vite. No backend: all content is JSON.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
```

## Where things live

| Path | What |
| --- | --- |
| `src/data/*.json` | Generated content: `html`, `css`, `javascript`, `python`, `devnotes`, `practice` |
| `src/data/_parts/<track>/*.json` | Editable source of the content (one file per section) |
| `scripts/merge-content.mjs` | `node scripts/merge-content.mjs [track]` – rebuilds `src/data/<track>.json` from `_parts` |
| `SCHEMA.md` | JSON shape of tracks, topics, examples and practice questions |
| `src/services/contentService.js` | The only file that loads content – swap its two `fetch*` functions for real API calls later |
| `src/lib/runners.js`, `src/workers/*` | Code execution (JS + Python in Web Workers, HTML/CSS/JS in a sandboxed iframe) |

## Adding / editing content

1. Edit or add a section file in `src/data/_parts/<track>/NN-name.json` (see `SCHEMA.md`).
2. Run `node scripts/merge-content.mjs <track>`.

## Backend later

`contentService.js` exposes `loadContent()`. Replace the body of `fetchTracks()` / `fetchPractice()` with
`fetch('/api/...')` calls returning the same JSON shape – nothing else in the UI changes.
Progress / bookmarks / theme are stored in `localStorage` (`cr:*` keys) via `AppContext`.

## Notes

* Light theme is the default; the dark theme toggle is in the top bar.
* Python examples run in the browser with Pyodide, downloaded from a CDN on first use (internet needed once).
* Django / Flask / scraping examples are view-only (they need real packages).
