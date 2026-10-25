import { useEffect, useRef } from 'react'

export default function ConsolePanel({ lines, status, emptyText = 'Output will appear here. Press Run.' }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [lines])
  return (
    <div className="console" ref={ref} role="log" aria-live="polite">
      {status && <div className="console-status">{status}</div>}
      {lines.length === 0 && !status && <div className="console-empty">{emptyText}</div>}
      {lines.map((l, i) => (
        <div key={i} className={`console-line ${l.level}`}>
          {l.text}
        </div>
      ))}
    </div>
  )
}
