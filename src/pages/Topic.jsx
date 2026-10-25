import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Check, CircleCheck, CircleHelp, Lightbulb, TriangleAlert } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Markdown from '../components/Markdown'
import ExampleView from '../components/ExampleView'
import { LevelBadge } from '../components/Badges'
import NotFound from './NotFound'

export default function Topic() {
  const { topicId } = useParams()
  const { content, done, toggleDone, saved, toggleSaved, setLast } = useApp()
  const entry = content.topics.get(topicId)

  useEffect(() => {
    if (entry) setLast(topicId)
  }, [entry, topicId, setLast])

  if (!entry) return <NotFound />
  const { topic, track, section, order } = entry
  const prev = order > 0 ? content.topics.get(track.topicIds[order - 1]) : null
  const next = order < track.topicIds.length - 1 ? content.topics.get(track.topicIds[order + 1]) : null
  const isDone = !!done[topic.id]
  const isSaved = !!saved[topic.id]

  const toc = [
    { id: 'overview', label: 'Overview', show: true },
    { id: 'key-points', label: 'Key points', show: topic.keyPoints?.length },
    { id: 'examples', label: 'Examples', show: topic.examples?.length },
    { id: 'pitfalls', label: 'Common mistakes', show: topic.pitfalls?.length },
    { id: 'interview', label: 'Interview Q&A', show: topic.interview?.length },
  ].filter((t) => t.show)

  return (
    <div className="topic-layout" style={{ '--accent': track.color }}>
      <article className="topic">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link> / <Link to={`/track/${track.id}`}>{track.title}</Link> / <span>{section.title}</span>
        </nav>

        <header className="topic-head">
          <div className="topic-head-top">
            <LevelBadge level={topic.level} />
            <span className="muted">Topic {order + 1} of {track.topicCount}</span>
          </div>
          <h1>{topic.title}</h1>
          <p className="lead">{topic.summary}</p>
          <div className="topic-actions">
            <button className={`btn small ${isDone ? 'success' : 'primary'}`} onClick={() => toggleDone(topic.id)}>
              {isDone ? <><CircleCheck size={15} /> Completed</> : <><Check size={15} /> Mark as done</>}
            </button>
            <button className="btn small ghost" onClick={() => toggleSaved(topic.id)} aria-pressed={isSaved}>
              {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />} {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </header>

        <section id="overview" className="block">
          <Markdown text={topic.description} />
        </section>

        {topic.keyPoints?.length > 0 && (
          <section id="key-points" className="block callout key">
            <h2><Lightbulb size={18} /> Key points to remember</h2>
            <ul>
              {topic.keyPoints.map((k, i) => <li key={i}>{k}</li>)}
            </ul>
          </section>
        )}

        {topic.examples?.length > 0 && (
          <section id="examples" className="block">
            <h2>Examples <span className="muted small">– edit the code and run it</span></h2>
            {topic.examples.map((ex, i) => (
              <ExampleView key={`${topic.id}-${i}`} example={ex} index={i} />
            ))}
          </section>
        )}

        {topic.pitfalls?.length > 0 && (
          <section id="pitfalls" className="block callout warn">
            <h2><TriangleAlert size={18} /> Common mistakes</h2>
            <ul>
              {topic.pitfalls.map((k, i) => <li key={i}>{k}</li>)}
            </ul>
          </section>
        )}

        {topic.interview?.length > 0 && (
          <section id="interview" className="block">
            <h2><CircleHelp size={18} /> Interview questions</h2>
            <div className="qa-list">
              {topic.interview.map((qa, i) => (
                <details key={i} className="qa">
                  <summary>{qa.q}</summary>
                  <Markdown text={qa.a} />
                </details>
              ))}
            </div>
          </section>
        )}

        {topic.source && <p className="source-note">Based on: <code>{topic.source}</code></p>}

        <nav className="pager" aria-label="Topic navigation">
          {prev ? (
            <Link to={`/topic/${prev.topic.id}`} className="pager-link prev">
              <ArrowLeft size={16} /><span><small>Previous</small>{prev.topic.title}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={`/topic/${next.topic.id}`} className="pager-link next">
              <span><small>Next</small>{next.topic.title}</span><ArrowRight size={16} />
            </Link>
          ) : <span />}
        </nav>
      </article>

      <aside className="toc" aria-label="On this page">
        <div className="toc-title">On this page</div>
        {toc.map((t) => (
          <a key={t.id} href={`#${t.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>
            {t.label}
          </a>
        ))}
      </aside>
    </div>
  )
}
