// Runs user JavaScript off the main thread so an infinite loop can be terminated.
// Messages in : { mode: 'run', code } | { mode: 'tests', code, fnName, tests }
// Messages out: { type: 'log'|'error'|'done'|'tests', ... }

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

function fmt(value, seen = new WeakSet(), depth = 0) {
  if (typeof value === 'string') return depth === 0 ? value : JSON.stringify(value)
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'bigint') return `${value}n`
  if (typeof value === 'symbol') return value.toString()
  if (typeof value === 'function') return value.toString().split('\n')[0].replace(/\s*\{$/, '') + ' { … }'
  if (value instanceof Error) return `${value.name}: ${value.message}`
  if (typeof value !== 'object') return String(value)
  if (seen.has(value)) return '[Circular]'
  if (depth > 4) return Array.isArray(value) ? '[Array]' : '[Object]'
  seen.add(value)
  let out
  if (Array.isArray(value)) {
    out = '[' + value.map((v) => fmt(v, seen, depth + 1)).join(', ') + ']'
  } else if (value instanceof Map) {
    out = `Map(${value.size}) {` + [...value].map(([k, v]) => `${fmt(k, seen, depth + 1)} => ${fmt(v, seen, depth + 1)}`).join(', ') + '}'
  } else if (value instanceof Set) {
    out = `Set(${value.size}) {` + [...value].map((v) => fmt(v, seen, depth + 1)).join(', ') + '}'
  } else if (value instanceof Date) {
    out = value.toISOString()
  } else if (value instanceof RegExp) {
    out = String(value)
  } else if (value instanceof Promise) {
    out = 'Promise { <pending> }'
  } else {
    const name = value.constructor && value.constructor.name && value.constructor.name !== 'Object' ? value.constructor.name + ' ' : ''
    const entries = Object.keys(value).map((k) => `${k}: ${fmt(value[k], seen, depth + 1)}`)
    out = name + (entries.length ? '{ ' + entries.join(', ') + ' }' : '{}')
  }
  seen.delete(value)
  return out
}

const post = (msg) => self.postMessage(msg)
const send = (level) => (...args) => post({ type: 'log', level, text: args.map((a) => fmt(a)).join(' ') })

function installConsole() {
  const groupStack = []
  const wrap = (level) => (...args) => send(level)(...(groupStack.length ? [groupStack.join(' › ') + ' ›', ...args] : args))
  self.console = {
    log: wrap('log'),
    info: wrap('info'),
    debug: wrap('log'),
    warn: wrap('warn'),
    error: wrap('error'),
    table: wrap('log'),
    dir: wrap('log'),
    trace: wrap('log'),
    assert: (c, ...a) => !c && send('error')('Assertion failed:', ...a),
    group: (...a) => { if (a.length) send('log')(...a); groupStack.push(a.length ? fmt(a[0]) : 'group') },
    groupEnd: () => { groupStack.pop() },
    time: () => {},
    timeEnd: () => {},
    clear: () => post({ type: 'clear' }),
    count: (() => { const c = {}; return (l = 'default') => { c[l] = (c[l] || 0) + 1; send('log')(`${l}: ${c[l]}`) } })(),
  }
}

function installBrowserLike() {
  const mem = new Map()
  self.window = self
  self.localStorage = self.sessionStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => void mem.set(String(k), String(v)),
    removeItem: (k) => void mem.delete(k),
    clear: () => mem.clear(),
    key: (i) => [...mem.keys()][i] ?? null,
    get length() { return mem.size },
  }
  self.alert = (m) => send('log')('alert:', m)
  self.confirm = () => true
  self.prompt = () => null
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
  const { mode, code, fnName, tests } = e.data
  installConsole()
  installBrowserLike()
  try {
    if (mode === 'run') {
      await new AsyncFunction(code)()
      post({ type: 'done' })
      return
    }
    // tests
    const factory = new Function(`${code}\n;return typeof ${fnName} !== 'undefined' ? ${fnName} : undefined;`)
    const fn = factory()
    if (typeof fn !== 'function') {
      post({ type: 'tests', fatal: `Function "${fnName}" is not defined. Keep the function name exactly as in the starter code.` })
      return
    }
    const results = []
    for (const t of tests) {
      const started = performance.now()
      try {
        const got = await fn(...JSON.parse(JSON.stringify(t.input)))
        // normalise through JSON so undefined/-0 etc. compare the same way as the expected value
        const gotJson = got === undefined ? null : JSON.parse(JSON.stringify(got))
        results.push({ pass: deepEqual(gotJson, t.expected), got: gotJson, expected: t.expected, input: t.input, ms: Math.round(performance.now() - started) })
      } catch (err) {
        results.push({ pass: false, error: String(err && err.message ? err.message : err), expected: t.expected, input: t.input })
      }
    }
    post({ type: 'tests', results })
  } catch (err) {
    post({ type: 'error', text: `${err && err.name ? err.name : 'Error'}: ${err && err.message ? err.message : err}` })
    post({ type: 'done' })
  }
}
