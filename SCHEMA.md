# CodeRevise – content schema

All learning content lives in `src/data/*.json` (no backend). Later each file can be replaced by an API
response with the same shape. Every track file is ONE JSON file with this shape:

```jsonc
{
  "id": "html",                       // html | css | javascript | python
  "title": "HTML",
  "tagline": "One line pitch",
  "description": "2-3 sentence overview of the track",
  "color": "#e34c26",                 // brand accent
  "sections": [
    {
      "id": "html-basics",            // unique, kebab-case, prefixed with track id
      "title": "Basics",
      "level": "beginner",            // beginner | intermediate | advanced
      "topics": [
        {
          "id": "html-headings",      // unique across ALL tracks, kebab-case
          "title": "Headings",
          "level": "beginner",        // beginner | intermediate | advanced
          "summary": "One sentence shown on cards.",
          "description": "Markdown. 150-400 words. Explain WHAT, WHY, HOW, when to use. Hinglish is NOT used here – clear simple English. Use ### sub-headings, bullet lists, tables, `inline code`, and fenced code blocks.",
          "keyPoints": ["short revision bullet", "..."],      // 3-6 items
          "pitfalls": ["common mistake", "..."],              // 0-4 items
          "examples": [
            {
              "title": "Basic usage",
              "language": "web",       // "web" => html/css/js runnable in browser iframe
                                       // "javascript" => plain JS, console output (runnable)
                                       // "python" => runs with Pyodide (ONLY pure-python stdlib code)
                                       // "text" => not runnable, view only (use for Django/Flask/shell/etc)
              "html": "<h1>Hello</h1>",   // web only
              "css":  "h1{color:tomato}", // web only (may be "")
              "js":   "",                  // web only (may be "")
              "code": "",                  // javascript | python | text
              "explanation": "optional 1-2 sentences"
            }
          ],
          "interview": [ { "q": "Question?", "a": "Short, crisp answer." } ],  // 1-4 items
          "source": "HTML-one-shot/BEST_HTML_COURSE_ThapaTechnical/heading.html"   // original file(s) analysed, "" if new research content
        }
      ]
    }
  ]
}
```

Additions (v2)
* `language: "react"` => runnable React example (React 18 + Babel run in the preview iframe). Use `code` for a JSX program that
  DEFINES a component named `App` (do NOT call ReactDOM.render/createRoot – the host mounts `<App />` into `#root`) and optional `css`.
  These globals are pre-destructured for you: `useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, useContext, createContext,
  useReducer, Fragment, memo, forwardRef, useId, useTransition, useDeferredValue, lazy, Suspense, StrictMode, createElement`.
  Do NOT write `import` statements in a `react` example (no modules, no router/redux libs – those go in `text` examples). `console.log` is shown in the console tab.
* `language: "text"` examples may carry an optional `"lang"` for syntax highlighting: `bash | json | jsx | javascript | python | sql | yaml | docker | markup | css | http | text`.
  ALWAYS set `lang` on `text` examples (use `bash` for shell commands/terminal output, `javascript` for Node/Express server code, `jsx` for multi-file React code).
* Node.js / Express server code cannot run in the browser: use `"language":"text"` + `"lang":"javascript"`, and show expected terminal output in a separate `bash` example when useful.
  Pure-JS logic that needs no Node API (no require/process/fs) may use `"language":"javascript"`.

Rules
* `id`s must be unique and kebab-case. Topic ids start with the track prefix (`html-`, `css-`, `js-`, `py-`).
* Order sections/topics from basic -> advanced (the UI shows this as a roadmap).
* Examples must be COMPLETE and actually work: a `web` example's html is the BODY content only (no `<html>`/`<head>`);
  css/js are separate strings. No external network resources (no CDN links, no remote images – use CSS/emoji/inline SVG).
* `javascript` examples print using `console.log`. Keep them deterministic and short running (no infinite loops, no prompt()).
* `python` examples print with `print()`; stdlib only; no input(); no network, no files.
* Valid JSON only: escape quotes and newlines (`\n`) inside strings. Validate by running
  `node -e "JSON.parse(require('fs').readFileSync('src/data/<file>.json','utf8'))"`.

## Practice questions file – `src/data/practice.json`

```jsonc
{
  "questions": [
    {
      "id": "q-two-sum",
      "title": "Two Sum",
      "difficulty": "easy",             // easy | medium | hard
      "track": "javascript",            // javascript | python | html | css
      "tags": ["array", "hashmap"],
      "statement": "Markdown problem statement with examples.",
      "language": "javascript",         // "javascript" | "python" -> auto-tested ; "web" -> build task, no tests
      "functionName": "twoSum",          // function the tests call (javascript/python)
      "starter": "function twoSum(nums, target) {\n  // your code\n}",
      "solution": "full working solution code",
      "solutionExplanation": "Markdown: approach + complexity",
      "hints": ["hint 1", "hint 2"],
      "tests": [ { "input": [[2,7,11,15], 9], "expected": [0,1] } ]   // input = array of positional args (JSON values only)
    }
  ]
}
```
For `"language": "web"` tasks (e.g. "build a centered card with CSS") set `starter` to `{ "html": "...", "css": "...", "js": "" }`,
`solution` to the same shape and give an empty `tests` array.
