// Runs Python in the browser through Pyodide (loaded lazily from the jsDelivr CDN).
// Messages in : { id, mode: 'run', code } | { id, mode: 'tests', code, fnName, tests }
// Messages out: { type: 'loading'|'ready'|'log'|'error'|'done'|'tests', id, ... }

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.2/full/'
let pyodide = null

async function ensurePyodide(id) {
  if (pyodide) return pyodide
  self.postMessage({ type: 'loading', id })
  const mod = await import(/* @vite-ignore */ PYODIDE_URL + 'pyodide.mjs')
  pyodide = await mod.loadPyodide({ indexURL: PYODIDE_URL })
  return pyodide
}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  return ka.every((k) => deepEqual(a[k], b[k]))
}

self.onmessage = async (e) => {
  const { id, mode, code, fnName, tests } = e.data
  try {
    const py = await ensurePyodide(id)
    self.postMessage({ type: 'ready', id })
    py.setStdout({ batched: (text) => self.postMessage({ type: 'log', id, level: 'log', text }) })
    py.setStderr({ batched: (text) => self.postMessage({ type: 'log', id, level: 'error', text }) })

    if (mode === 'run') {
      await py.runPythonAsync(code, { globals: py.runPython('dict()') })
      self.postMessage({ type: 'done', id })
      return
    }

    const ns = py.runPython('dict()')
    await py.runPythonAsync(code, { globals: ns })
    const exists = py.runPython(`'${fnName}' in globals() and callable(globals()['${fnName}'])`, { globals: ns })
    if (!exists) {
      self.postMessage({ type: 'tests', id, fatal: `Function "${fnName}" is not defined. Keep the function name exactly as in the starter code.` })
      return
    }
    const results = []
    for (const t of tests) {
      const started = performance.now()
      try {
        ns.set('__args__', JSON.stringify(t.input))
        const out = py.runPython(`import json\njson.dumps(${fnName}(*json.loads(__args__)))`, { globals: ns })
        const got = JSON.parse(out)
        results.push({ pass: deepEqual(got, t.expected), got, expected: t.expected, input: t.input, ms: Math.round(performance.now() - started) })
      } catch (err) {
        const msg = String(err && err.message ? err.message : err).trim().split('\n').slice(-1)[0]
        results.push({ pass: false, error: msg, expected: t.expected, input: t.input })
      }
    }
    self.postMessage({ type: 'tests', id, results })
  } catch (err) {
    const msg = String(err && err.message ? err.message : err).trim()
    // keep only the final line of a Python traceback (the actual error)
    self.postMessage({ type: 'error', id, text: msg.includes('Traceback') ? msg.split('\n').slice(-1)[0] : msg })
    self.postMessage({ type: 'done', id })
  }
}
