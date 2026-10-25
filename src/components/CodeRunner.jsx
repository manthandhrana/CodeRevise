import { useState } from 'react'
import { Play, RotateCcw, Loader2 } from 'lucide-react'
import CodeEditor from './CodeEditor'
import ConsolePanel from './ConsolePanel'
import { runJs, runPython } from '../lib/runners'

/** Editable code + console output for plain JavaScript or Python. */
export default function CodeRunner({ language = 'javascript', code: initial, resetTo, minHeight = 150, onChange }) {
  // `initial` is read on mount only (remount with a `key` to load different code); Reset goes back to `resetTo`
  const original = resetTo ?? initial
  const [code, setCode] = useState(initial)
  const [lines, setLines] = useState([])
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState('')

  const run = async () => {
    setLines([])
    setRunning(true)
    const onLog = (l) => setLines((prev) => [...prev.slice(-299), l])
    try {
      if (language === 'python') await runPython(code, { onLog, onStatus: setStatus })
      else await runJs(code, { onLog, onClear: () => setLines([]) })
    } finally {
      setRunning(false)
      setStatus('')
    }
  }

  return (
    <div className="playground runner">
      <div className="pg-bar">
        <div className="pg-tabs">
          <button className="active">{language === 'python' ? 'Python' : 'JavaScript'}</button>
        </div>
        <div className="pg-actions">
          <button className="btn small primary" onClick={run} disabled={running}>
            {running ? <Loader2 size={14} className="spin" /> : <Play size={14} />} Run
          </button>
          <button
            className="btn small ghost"
            onClick={() => {
              setCode(original)
              onChange?.(original)
              setLines([])
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>
      <div className="pg-body">
        <div className="pg-editor">
          <CodeEditor
            value={code}
            onChange={(v) => {
              setCode(v)
              onChange?.(v)
            }}
            language={language}
            minHeight={minHeight}
            maxHeight={420}
            ariaLabel={`${language} editor`}
          />
        </div>
        <div className="pg-output">
          <div className="pg-output-tabs">
            <span className="static-tab">Output</span>
          </div>
          <ConsolePanel lines={lines} status={status} emptyText={language === 'python' ? 'Press Run – Python runs in your browser (Pyodide).' : 'Press Run to see console output.'} />
        </div>
      </div>
    </div>
  )
}
