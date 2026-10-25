import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleCheck, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { LevelBadge } from '../components/Badges'

const TRACKS = ['all', 'javascript', 'python', 'html', 'css']
const DIFFS = ['all', 'easy', 'medium', 'hard']
const TRACK_LABEL = { all: 'All', javascript: 'JavaScript', python: 'Python', html: 'HTML', css: 'CSS' }

export default function Practice() {
  const { content, solved } = useApp()
  const [track, setTrack] = useState('all')
  const [diff, setDiff] = useState('all')
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return content.questions.filter((x) => {
      if (track !== 'all' && x.track !== track) return false
      if (diff !== 'all' && x.difficulty !== diff) return false
      if (status === 'solved' && !solved[x.id]) return false
      if (status === 'todo' && solved[x.id]) return false
      if (term && !(x.title.toLowerCase().includes(term) || (x.tags || []).some((t) => t.toLowerCase().includes(term)))) return false
      return true
    })
  }, [content.questions, track, diff, status, q, solved])

  const solvedCount = content.questions.filter((x) => solved[x.id]).length

  return (
    <div className="practice-page">
      <header className="page-title">
        <h1>Coding practice</h1>
        <p>
          {content.questions.length} problems with built-in test cases. Write code, press <b>Run tests</b>, then compare with the solution.
          <span className="muted"> · {solvedCount} solved</span>
        </p>
      </header>

      <div className="filters">
        <label className="search-field">
          <Search size={15} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by title or tag…" aria-label="Filter questions" />
        </label>
        <div className="chips">
          {TRACKS.map((t) => <button key={t} className={`chip ${track === t ? 'active' : ''}`} onClick={() => setTrack(t)}>{TRACK_LABEL[t]}</button>)}
        </div>
        <div className="chips">
          {DIFFS.map((d) => <button key={d} className={`chip ${diff === d ? 'active' : ''}`} onClick={() => setDiff(d)}>{d === 'all' ? 'Any difficulty' : d[0].toUpperCase() + d.slice(1)}</button>)}
        </div>
        <div className="chips">
          {['all', 'todo', 'solved'].map((s) => <button key={s} className={`chip ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>{s === 'all' ? 'All status' : s === 'todo' ? 'To do' : 'Solved'}</button>)}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty-state"><p>No questions match these filters.</p></div>
      ) : (
        <div className="q-list">
          {list.map((x) => (
            <Link key={x.id} to={`/practice/${x.id}`} className="q-row">
              <span className={`q-status ${solved[x.id] ? 'on' : ''}`}>{solved[x.id] ? <CircleCheck size={18} /> : <span className="q-dot" />}</span>
              <span className="grow">
                <span className="q-title">{x.title}</span>
                <span className="q-tags">{(x.tags || []).slice(0, 4).map((t) => <i key={t}>{t}</i>)}</span>
              </span>
              <span className="q-track">{TRACK_LABEL[x.track] || x.track}</span>
              <LevelBadge level={x.difficulty} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
