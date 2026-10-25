import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, Home, FlaskConical, ListChecks, Bookmark, X, Sparkles, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { TrackIcon } from './Badges'

export default function Sidebar({ open, onClose }) {
  const { content, done } = useApp()
  const location = useLocation()
  const [openTracks, setOpenTracks] = useState({})
  const [openSections, setOpenSections] = useState({})

  // keep the active topic's track + section expanded
  useEffect(() => {
    const m = location.pathname.match(/^\/(?:topic|track)\/([^/]+)/)
    if (!m || !content) return
    const id = decodeURIComponent(m[1])
    const entry = content.topics.get(id)
    if (entry) {
      setOpenTracks((s) => ({ ...s, [entry.track.id]: true }))
      setOpenSections((s) => ({ ...s, [entry.section.id]: true }))
    } else if (content.trackById[id]) {
      setOpenTracks((s) => ({ ...s, [id]: true }))
    }
  }, [location.pathname, content])

  const flip = (setter) => (id) => setter((s) => ({ ...s, [id]: !s[id] }))

  return (
    <>
      <div className={`scrim ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Primary navigation">
        <div className="sidebar-head">
          <NavLink to="/" className="brand" onClick={onClose}>
            <span className="brand-mark"><Sparkles size={18} /></span>
            <span>
              Code<b>Revise</b>
            </span>
          </NavLink>
          <button className="icon-btn mobile-only" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-scroll">
          <div className="nav-group">
            <NavLink to="/" end className="nav-item" onClick={onClose}><Home size={16} /> Home</NavLink>
            <NavLink to="/playground" className="nav-item" onClick={onClose}><FlaskConical size={16} /> Playground</NavLink>
            <NavLink to="/practice" className="nav-item" onClick={onClose}><ListChecks size={16} /> Practice</NavLink>
            <NavLink to="/saved" className="nav-item" onClick={onClose}><Bookmark size={16} /> Saved</NavLink>
          </div>

          <div className="nav-label">Learning tracks</div>
          {content?.tracks.map((track) => {
            const isOpen = !!openTracks[track.id]
            const doneCount = track.topicIds.filter((id) => done[id]).length
            return (
              <div key={track.id} className="tree-track">
                <div className="tree-row track-row">
                  <button className="tree-toggle" onClick={() => flip(setOpenTracks)(track.id)} aria-expanded={isOpen} aria-label={`Toggle ${track.title}`}>
                    {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </button>
                  <NavLink to={`/track/${track.id}`} className="tree-link" onClick={onClose}>
                    <span className="track-dot" style={{ background: track.color }}><TrackIcon id={track.id} size={13} /></span>
                    <span className="grow">{track.title}</span>
                    <span className="count">{doneCount}/{track.topicCount}</span>
                  </NavLink>
                </div>
                {isOpen &&
                  track.sections.map((section) => {
                    const sOpen = !!openSections[section.id]
                    return (
                      <div key={section.id} className="tree-section">
                        <button className="tree-row section-row" onClick={() => flip(setOpenSections)(section.id)} aria-expanded={sOpen}>
                          {sOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                          <span className="grow">{section.title}</span>
                          <span className="count">{section.topics.length}</span>
                        </button>
                        {sOpen &&
                          section.topics.map((t) => (
                            <NavLink key={t.id} to={`/topic/${t.id}`} className="tree-topic" onClick={onClose}>
                              <span className="grow">{t.title}</span>
                              {done[t.id] && <Check size={13} className="done-tick" />}
                            </NavLink>
                          ))}
                      </div>
                    )
                  })}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
