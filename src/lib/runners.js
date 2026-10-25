// Execution helpers: JavaScript + Python run in Web Workers (terminable), web (HTML/CSS/JS) in a sandboxed iframe.

const JS_TIMEOUT = 8000
const PY_RUN_TIMEOUT = 15000

function newJsWorker() {
  return new Worker(new URL('../workers/jsWorker.js', import.meta.url), { type: 'module' })
}

/** Run plain JavaScript; resolves when finished. onLog({level,text}) streams console output. */
export function runJs(code, { onLog, onClear } = {}) {
  return new Promise((resolve) => {
    const worker = newJsWorker()
    const finish = (extra) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(extra)
    }
    const timer = setTimeout(() => {
      onLog?.({ level: 'error', text: `Time limit exceeded (${JS_TIMEOUT / 1000}s) – possible infinite loop.` })
      finish({ timedOut: true })
    }, JS_TIMEOUT)
    worker.onmessage = (e) => {
      const m = e.data
      if (m.type === 'log') onLog?.({ level: m.level, text: m.text })
      else if (m.type === 'error') onLog?.({ level: 'error', text: m.text })
      else if (m.type === 'clear') onClear?.()
      else if (m.type === 'done') finish({})
    }
    worker.onerror = (e) => {
      onLog?.({ level: 'error', text: e.message || 'Worker error' })
      finish({})
    }
    worker.postMessage({ mode: 'run', code })
  })
}

/** Run test cases against a JS function. Resolves { results } | { fatal } | { error } */
export function testJs(code, fnName, tests) {
  return new Promise((resolve) => {
    const worker = newJsWorker()
    const finish = (r) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(r)
    }
    const timer = setTimeout(() => finish({ error: `Time limit exceeded (${JS_TIMEOUT / 1000}s) – check for an infinite loop.` }), JS_TIMEOUT)
    worker.onmessage = (e) => {
      const m = e.data
      if (m.type === 'tests') finish(m.fatal ? { fatal: m.fatal } : { results: m.results })
      else if (m.type === 'error') finish({ error: m.text })
    }
    worker.onerror = (e) => finish({ error: e.message || 'Worker error' })
    worker.postMessage({ mode: 'tests', code, fnName, tests })
  })
}

// ---------- Python (Pyodide) ----------
let pyWorker = null
let pyId = 0

function getPyWorker() {
  if (!pyWorker) pyWorker = new Worker(new URL('../workers/pyWorker.js', import.meta.url), { type: 'module' })
  return pyWorker
}

function pyCall(payload, { onLog, onStatus } = {}) {
  return new Promise((resolve) => {
    const worker = getPyWorker()
    const id = ++pyId
    let timer = null
    const cleanup = () => {
      clearTimeout(timer)
      worker.removeEventListener('message', handler)
    }
    const startTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        cleanup()
        worker.terminate() // pyodide state is lost, it will be re-created on next run
        pyWorker = null
        onLog?.({ level: 'error', text: `Time limit exceeded (${PY_RUN_TIMEOUT / 1000}s) – possible infinite loop.` })
        resolve({ error: 'Time limit exceeded' })
      }, PY_RUN_TIMEOUT)
    }
    function handler(e) {
      const m = e.data
      if (m.id !== id) return
      if (m.type === 'loading') onStatus?.('Loading Python runtime (first run only, needs internet)…')
      else if (m.type === 'ready') {
        onStatus?.('')
        startTimer()
      } else if (m.type === 'log') onLog?.({ level: m.level, text: m.text })
      else if (m.type === 'error') {
        onLog?.({ level: 'error', text: m.text })
        cleanup()
        resolve({ error: m.text })
      } else if (m.type === 'tests') {
        cleanup()
        resolve(m.fatal ? { fatal: m.fatal } : { results: m.results })
      } else if (m.type === 'done') {
        cleanup()
        resolve({})
      }
    }
    worker.addEventListener('message', handler)
    worker.postMessage({ id, ...payload })
  })
}

export const runPython = (code, opts) => pyCall({ mode: 'run', code }, opts)
export const testPython = (code, fnName, tests, opts) => pyCall({ mode: 'tests', code, fnName, tests }, opts)

// ---------- Web (HTML + CSS + JS) in an iframe ----------
const consoleShim = (token) => `
(function(){
  var T=${JSON.stringify(token)};
  function ser(a,d,seen){
    d=d||0; seen=seen||[];
    try{
      if(typeof a==='string') return d?JSON.stringify(a):a;
      if(a===undefined) return 'undefined';
      if(a===null) return 'null';
      if(typeof a==='function') return a.toString().split('\\n')[0];
      if(typeof a==='symbol'||typeof a==='bigint') return String(a);
      if(a instanceof Error) return a.name+': '+a.message;
      if(typeof Node!=='undefined' && a instanceof Node) return a.nodeType===1?'<'+a.tagName.toLowerCase()+'>':String(a);
      if(typeof a!=='object') return String(a);
      if(seen.indexOf(a)>-1) return '[Circular]';
      if(d>3) return Array.isArray(a)?'[Array]':'[Object]';
      seen=seen.concat([a]);
      if(Array.isArray(a)) return '['+a.map(function(x){return ser(x,d+1,seen)}).join(', ')+']';
      if(a instanceof Map) return 'Map('+a.size+') {'+Array.from(a).map(function(p){return ser(p[0],d+1,seen)+' => '+ser(p[1],d+1,seen)}).join(', ')+'}';
      if(a instanceof Set) return 'Set('+a.size+') {'+Array.from(a).map(function(x){return ser(x,d+1,seen)}).join(', ')+'}';
      if(a instanceof Date) return a.toISOString();
      var k=Object.keys(a);
      return k.length?'{ '+k.map(function(x){return x+': '+ser(a[x],d+1,seen)}).join(', ')+' }':'{}';
    }catch(e){return '[unprintable]'}
  }
  function send(level,args){
    try{parent.postMessage({__cr:T,type:'log',level:level,text:Array.prototype.map.call(args,function(a){return ser(a)}).join(' ')},'*')}catch(e){}
  }
  ['log','info','warn','error','debug','table','dir'].forEach(function(m){
    var level=m==='warn'?'warn':m==='error'?'error':m==='info'?'info':'log';
    console[m]=function(){send(level,arguments)};
  });
  console.clear=function(){parent.postMessage({__cr:T,type:'clear'},'*')};
  window.addEventListener('error',function(e){send('error',[e.message+(e.lineno?' (line '+e.lineno+')':'')])});
  window.addEventListener('unhandledrejection',function(e){send('error',['Unhandled promise rejection: '+ser(e.reason)])});
})();`

const BASE_CSS = `html{background:#fff}body{margin:0;padding:14px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1f2937;line-height:1.5}`

const safeScript = (s) => String(s || '').replace(/<\/(script)/gi, '<\\/$1')
const safeStyle = (s) => String(s || '').replace(/<\/(style)/gi, '<\\/$1')

// ---------- React example (React 18 UMD + Babel standalone from jsDelivr; needs internet) ----------
const REACT_CDN = [
  'https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.development.js',
  'https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.development.js',
  'https://cdn.jsdelivr.net/npm/@babel/standalone@7.26.4/babel.min.js',
]
const REACT_PRELUDE =
  'const { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, useContext, createContext, useReducer, Fragment, memo, forwardRef, useId, useTransition, useDeferredValue, useSyncExternalStore, useImperativeHandle, useInsertionEffect, useDebugValue, startTransition, lazy, Suspense, StrictMode, Profiler, Component, PureComponent, Children, cloneElement, isValidElement, createElement } = React;\n'

export function buildReactDoc({ code = '', css = '' }, token) {
  const mount = `\nReactDOM.createRoot(document.getElementById('root')).render(<App />);`
  // the prelude already destructures the hooks – drop a duplicate `const { useState } = React` written by the author
  code = code
    .replace(/^\s*(?:const|let|var)\s*\{[^}]*\}\s*=\s*React\s*;?[ \t]*$/gm, '')
    .replace(/^\s*(?:const|let|var)\s+(\w+)\s*=\s*React\.\1\s*;?[ \t]*$/gm, (m, name) => (REACT_PRELUDE.includes(` ${name},`) ? '' : m))
  return (
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<style>${BASE_CSS}</style><style>${safeStyle(css)}</style>` +
    `<script>${consoleShim(token)}</script>` +
    REACT_CDN.map((src) => `<script src="${src}"></script>`).join('') +
    `</head><body><div id="root"></div>` +
    `<script>if(!window.React||!window.Babel){document.getElementById('root').innerHTML='<p style="color:#b45309">React could not be loaded from the CDN. Check your internet connection and press Run.</p>'}</script>` +
    `<script type="text/babel" data-presets="react">${safeScript(REACT_PRELUDE + code + mount)}</script>` +
    `</body></html>`
  )
}

export function buildWebDoc({ html = '', css = '', js = '' }, token) {
  return (
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<style>${BASE_CSS}</style><style>${safeStyle(css)}</style>` +
    `<script>${consoleShim(token)}</script></head><body>${html}` +
    `<script>${safeScript(js)}</script></body></html>`
  )
}
