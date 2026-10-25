import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, CornerDownLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { searchContent } from '../services/contentService'
import { LevelBadge } from './Badges'

export default function SearchPalette({ open, onClose }) {
  const { content } = useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const results = useMemo(() => (content ? searchContent(content.searchIndex, query) : []), [content, query])

  useEffect(() => {
    setActive(0)
  }, [query])

  if (!open) return null

  const go = (item) => {
    navigate(item.kind === 'topic' ? `/topic/${item.id}` : `/practice/${item.id}`)
    onClose()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && results[active]) go(results[active])
  }

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search" onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKeyDown}>
        <div className="palette-input">
          <Search size={18} />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics, concepts, questions…  (e.g. flexbox, closure, flask)" />
          <kbd>Esc</kbd>
        </div>
        <div className="palette-results">
          {query && results.length === 0 && <div className="palette-empty">No results for “{query}”</div>}
          {!query && <div className="palette-empty">Type to search across HTML, CSS, JavaScript, React, Node, Express, Python and practice questions.</div>}
          {results.map((r, i) => (
            <button key={`${r.kind}-${r.id}`} className={`palette-item ${i === active ? 'active' : ''}`} onMouseEnter={() => setActive(i)} onClick={() => go(r)}>
              <span className="track-dot" style={{ background: r.color }} />
              <span className="grow">
                <span className="palette-title">{r.title}</span>
                <span className="palette-sub">{r.subtitle}</span>
              </span>
              <LevelBadge level={r.level} />
              {i === active && <CornerDownLeft size={14} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
