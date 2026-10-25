import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, RotateCcw, Eye, Terminal } from 'lucide-react'
import CodeEditor from './CodeEditor'
import ConsolePanel from './ConsolePanel'
import { buildReactDoc, buildWebDoc } from '../lib/runners'
import { prettyCss, prettyHtml } from '../lib/format'

const WEB_TABS = [
  { key: 'html', label: 'HTML', lang: 'markup' },
  { key: 'css', label: 'CSS', lang: 'css' },
  { key: 'js', label: 'JS', lang: 'javascript' },
]
const REACT_TABS = [
  { key: 'code', label: 'App.jsx', lang: 'jsx' },
  { key: 'css', label: 'CSS', lang: 'css' },
]

let counter = 0

/**
 * Editable live preview + console.
 * kind "web":   `initial` = { html, css, js }
 * kind "react": `initial` = { code, css }  (code defines `function App()`)
 */
export default function WebPlayground({ initial, resetTo, height = 300, onChange, title, kind = 'web' }) {
  const isReact = kind === 'react'
  const TABS = isReact ? REACT_TABS : WEB_TABS
  const buildDoc = isReact ? buildReactDoc : buildWebDoc
  // `initial` is read on mount only (remount with a `key` to load different code); Reset goes back to `resetTo`
  const norm = (v) => (isReact ? { code: v.code || '', css: prettyCss(v.css || '') } : { html: prettyHtml(v.html || ''), css: prettyCss(v.css || ''), js: v.js || '' })
  const base = useMemo(() => norm(resetTo || initial), [resetTo, initial]) // eslint-disable-line react-hooks/exhaustive-deps
  const [code, setCode] = useState(() => norm(initial))
  const [tab, setTab] = useState(() => (isReact ? 'code' : base.html ? 'html' : base.css ? 'css' : 'js'))
  const [view, setView] = useState('preview')
  const [doc, setDoc] = useState('')
  const [lines, setLines] = useState([])
  const token = useRef(`cr-${++counter}-${Math.random().toString(36).slice(2, 7)}`).current
  const iframeRef = useRef(null)

  // debounce re-render of the preview
  useEffect(() => {
    const t = setTimeout(() => {
      setLines([])
      setDoc(buildDoc(code, token))
    }, 450)
    return () => clearTimeout(t)
  }, [code, token, buildDoc])

  useEffect(() => {
    const onMessage = (e) => {
      const m = e.data
      if (!m || m.__cr !== token) return
      if (m.type === 'clear') setLines([])
      else if (m.type === 'log') setLines((l) => [...l.slice(-199), { level: m.level, text: m.text }])
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [token])

  const update = (key, value) => {
    const next = { ...code, [key]: value }
    setCode(next)
    onChange?.(next)
  }
  const rerun = () => {
    setLines([])
    setDoc(buildDoc(code, token) + `<!--${Date.now()}-->`)
  }
  const reset = () => {
    setCode(base)
    onChange?.(base)
  }

  const visibleTabs = TABS.filter((t) => t.key === 'html' || t.key === 'code' || code[t.key] || base[t.key] || t.key === tab)
  const current = TABS.find((t) => t.key === tab) || TABS[0]

  return (
    <div className="playground">
      <div className="pg-bar">
        <div className="pg-tabs" role="tablist" aria-label={title || 'Editor files'}>
          {visibleTabs.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="pg-actions">
          <button className="btn small primary" onClick={rerun}>
            <Play size={14} /> Run
          </button>
          <button className="btn small ghost" onClick={reset} title="Reset to original">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>
      <div className="pg-body">
        <div className="pg-editor">
          <CodeEditor value={code[current.key]} onChange={(v) => update(current.key, v)} language={current.lang} minHeight={height} maxHeight={height + 80} ariaLabel={`${current.label} editor`} />
        </div>
        <div className="pg-output">
          <div className="pg-output-tabs">
            <button className={view === 'preview' ? 'active' : ''} onClick={() => setView('preview')}>
              <Eye size={13} /> Preview
            </button>
            <button className={view === 'console' ? 'active' : ''} onClick={() => setView('console')}>
              <Terminal size={13} /> Console{lines.length ? ` (${lines.length})` : ''}
            </button>
          </div>
          <div className="pg-frame" style={{ height }}>
            <iframe
              ref={iframeRef}
              title={`${title || 'Example'} preview`}
              sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
              srcDoc={doc}
              style={{ display: view === 'preview' ? 'block' : 'none' }}
            />
            {view === 'console' && <ConsolePanel lines={lines} emptyText="No console output yet. Use console.log() in the JS tab." />}
          </div>
        </div>
      </div>
    </div>
  )
}
