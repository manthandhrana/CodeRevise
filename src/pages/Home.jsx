import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, FlaskConical, ListChecks, Play, Search, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { TrackIcon, LevelBadge } from '../components/Badges'

export default function Home() {
  const { content, done, solved, last } = useApp()
  const { tracks, topics, questions } = content
  const totalTopics = tracks.reduce((n, t) => n + t.topicCount, 0)
  const totalExamples = tracks.reduce((n, t) => n + t.exampleCount, 0)
  const doneCount = Object.keys(done).filter((id) => topics.has(id)).length
  const lastEntry = last && topics.get(last)
  const solvedCount = Object.keys(solved).filter((id) => content.questionById[id]).length

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow"><Sparkles size={14} /> One place to revise everything</span>
          <h1>
            Revise HTML, CSS, JavaScript, React, Node, Express &amp; Python <span className="grad">topic by topic</span>.
          </h1>
          <p>
            Every lesson from your course folders – rewritten with clear explanations, live runnable examples, interview questions and
            practice problems. No more opening folder after folder.
          </p>
          <div className="hero-cta">
            <Link to={`/track/${tracks[0]?.id || 'html'}`} className="btn primary large">
              Start revising <ArrowRight size={16} />
            </Link>
            <Link to="/playground" className="btn ghost large">
              <FlaskConical size={16} /> Open playground
            </Link>
          </div>
          <div className="hero-hint"><Search size={14} /> Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to search anything</div>
        </div>
        <div className="hero-panel" aria-hidden="true">
          <div className="mock-window">
            <div className="mock-bar"><i /><i /><i /></div>
            <pre>{`.card {
  display: grid;
  place-items: center;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgb(0 0 0 / .12);
}`}</pre>
            <div className="mock-out"><Play size={14} /> Live preview · edit &amp; run in your browser</div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div><b>{tracks.length}</b><span>Tracks</span></div>
        <div><b>{totalTopics}</b><span>Topics</span></div>
        <div><b>{totalExamples}</b><span>Runnable examples</span></div>
        <div><b>{questions.length}</b><span>Practice questions</span></div>
      </section>

      {lastEntry && (
        <Link to={`/topic/${lastEntry.topic.id}`} className="continue-card">
          <BookOpen size={20} />
          <div className="grow">
            <small>Continue where you left off</small>
            <strong>{lastEntry.topic.title}</strong>
            <span>{lastEntry.track.title} · {lastEntry.section.title}</span>
          </div>
          <ArrowRight size={18} />
        </Link>
      )}

      <section>
        <div className="section-head">
          <h2>Learning tracks</h2>
          <span className="muted">{doneCount} of {totalTopics} topics completed</span>
        </div>
        <div className="track-grid">
          {tracks.map((track) => {
            const d = track.topicIds.filter((id) => done[id]).length
            const pct = track.topicCount ? Math.round((d / track.topicCount) * 100) : 0
            return (
              <Link key={track.id} to={`/track/${track.id}`} className="track-card" style={{ '--accent': track.color }}>
                <div className="track-card-top">
                  <span className="track-icon"><TrackIcon id={track.id} size={22} /></span>
                  <ArrowRight size={18} className="arrow" />
                </div>
                <h3>{track.title}</h3>
                <p>{track.tagline}</p>
                <div className="track-meta">{track.sections.length} sections · {track.topicCount} topics</div>
                <div className="progress"><i style={{ width: `${pct}%` }} /></div>
                <div className="progress-label">{pct}% complete</div>
              </Link>
            )
          })}
          <Link to="/practice" className="track-card practice" style={{ '--accent': '#8b5cf6' }}>
            <div className="track-card-top">
              <span className="track-icon"><ListChecks size={22} /></span>
              <ArrowRight size={18} className="arrow" />
            </div>
            <h3>Coding practice</h3>
            <p>Solve problems with automatic tests – JavaScript, Python and HTML/CSS build tasks.</p>
            <div className="track-meta">{questions.length} questions</div>
            <div className="progress"><i style={{ width: `${questions.length ? Math.round((solvedCount / questions.length) * 100) : 0}%` }} /></div>
            <div className="progress-label">{solvedCount} solved</div>
          </Link>
        </div>
      </section>

      <section>
        <div className="section-head"><h2>Suggested roadmap</h2></div>
        <ol className="roadmap">
          {tracks.filter((t) => t.id !== 'devnotes').map((track, i) => (
            <li key={track.id}>
              <span className="step" style={{ background: track.color }}>{i + 1}</span>
              <div>
                <Link to={`/track/${track.id}`}><strong>{track.title}</strong></Link>
                <div className="muted">
                  {track.sections.slice(0, 4).map((s) => s.title).join(' → ')}{track.sections.length > 4 ? ' → …' : ''}
                </div>
              </div>
              <LevelBadge level="beginner" />
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
