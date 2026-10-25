import { useState } from 'react'
import { storage } from '../lib/storage'
import WebPlayground from '../components/WebPlayground'
import CodeRunner from '../components/CodeRunner'

const DEFAULTS = {
  web: {
    html: '<div class="card">\n  <h2>Hello, CodeRevise 👋</h2>\n  <p>Edit the HTML, CSS and JS – then press Run.</p>\n  <button id="btn">Click me</button>\n</div>',
    css: '.card{max-width:340px;margin:24px auto;padding:24px;border-radius:16px;text-align:center;\n  background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 12px 30px rgb(99 102 241/.35)}\nbutton{padding:8px 16px;border:0;border-radius:8px;cursor:pointer;font-weight:600}',
    js: "document.getElementById('btn').addEventListener('click', () => {\n  console.log('Button clicked at', new Date().toLocaleTimeString())\n})",
  },
  javascript: "const nums = [1, 2, 3, 4, 5]\nconst squares = nums.map((n) => n ** 2)\nconsole.log('squares:', squares)\nconsole.log('sum:', squares.reduce((a, b) => a + b, 0))",
  python: "def fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\nprint(list(fib(10)))\nprint({w: len(w) for w in ['python', 'is', 'fun']})",
}

const TABS = [
  { key: 'web', label: 'HTML / CSS / JS' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'python', label: 'Python' },
]

export default function PlaygroundPage() {
  const [tab, setTab] = useState(() => storage.get('cr:pg:tab', 'web'))
  const [saved, setSaved] = useState(() => ({ ...DEFAULTS, ...storage.get('cr:pg:code', {}) }))
  const [mount] = useState(saved) // snapshot used as the editors' starting code

  const update = (key, value) => {
    const next = { ...saved, [key]: value }
    setSaved(next)
    storage.set('cr:pg:code', next)
  }
  const pick = (key) => {
    setTab(key)
    storage.set('cr:pg:tab', key)
  }

  return (
    <div className="playground-page">
      <header className="page-title">
        <h1>Playground</h1>
        <p>Experiment freely. Your code is saved in this browser.</p>
      </header>
      <div className="chips">
        {TABS.map((t) => (
          <button key={t.key} className={`chip ${tab === t.key ? 'active' : ''}`} onClick={() => pick(t.key)}>{t.label}</button>
        ))}
      </div>
      {tab === 'web' && <WebPlayground key="web" initial={mount.web} resetTo={DEFAULTS.web} height={420} title="Playground" onChange={(v) => update('web', v)} />}
      {tab === 'javascript' && <CodeRunner key="js" language="javascript" code={mount.javascript} resetTo={DEFAULTS.javascript} minHeight={320} onChange={(v) => update('javascript', v)} />}
      {tab === 'python' && <CodeRunner key="py" language="python" code={mount.python} resetTo={DEFAULTS.python} minHeight={320} onChange={(v) => update('python', v)} />}
      {tab === 'python' && <p className="muted small">Python runs in your browser via Pyodide. The runtime (~10 MB) downloads from a CDN on the first run, so it needs an internet connection once.</p>}
    </div>
  )
}
