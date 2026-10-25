import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { LevelBadge, TrackIcon } from '../components/Badges'
import NotFound from './NotFound'

const LEVELS = ['all', 'beginner', 'intermediate', 'advanced']

export default function Track() {
  const { trackId } = useParams()
  const { content, done } = useApp()
  const [level, setLevel] = useState('all')
  const track = content.trackById[trackId]
  if (!track) return <NotFound />

  const doneCount = track.topicIds.filter((id) => done[id]).length
  const pct = track.topicCount ? Math.round((doneCount / track.topicCount) * 100) : 0

  return (
    <div className="track-page" style={{ '--accent': track.color }}>
      <header className="page-hero">
        <span className="track-icon big"><TrackIcon id={track.id} size={28} /></span>
        <div className="grow">
          <h1>{track.title}</h1>
          <p>{track.description || track.tagline}</p>
          <div className="progress wide"><i style={{ width: `${pct}%` }} /></div>
          <div className="progress-label">{doneCount} / {track.topicCount} topics completed · {pct}%</div>
        </div>
      </header>

      <div className="chips" role="group" aria-label="Filter by level">
        {LEVELS.map((l) => (
          <button key={l} className={`chip ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)}>
            {l === 'all' ? 'All levels' : l[0].toUpperCase() + l.slice(1)}
          </button>
        ))}
      </div>

      {track.sections.map((section, si) => {
        const topics = section.topics.filter((t) => level === 'all' || t.level === level)
        if (!topics.length) return null
        return (
          <section key={section.id} className="track-section">
            <div className="section-head">
              <h2><span className="section-num">{si + 1}</span>{section.title}</h2>
              <span className="muted">{topics.length} topics</span>
            </div>
            <div className="topic-grid">
              {topics.map((t) => (
                <Link key={t.id} to={`/topic/${t.id}`} className={`topic-card ${done[t.id] ? 'is-done' : ''}`}>
                  <div className="topic-card-top">
                    <LevelBadge level={t.level} />
                    {done[t.id] && <span className="done-pill"><Check size={12} /> Done</span>}
                  </div>
                  <h3>{t.title}</h3>
                  <p>{t.summary}</p>
                  <div className="topic-card-foot">{t.examples?.length || 0} examples</div>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
