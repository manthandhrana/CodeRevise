import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { LevelBadge } from '../components/Badges'

export default function Saved() {
  const { content, saved, done } = useApp()
  const items = Object.entries(saved)
    .map(([id, at]) => ({ at, entry: content.topics.get(id) }))
    .filter((x) => x.entry)
    .sort((a, b) => b.at - a.at)

  return (
    <div>
      <header className="page-title">
        <h1>Saved topics</h1>
        <p>Bookmark topics with the Save button to build your own quick-revision list.</p>
      </header>
      {items.length === 0 ? (
        <div className="empty-state">
          <Bookmark size={32} />
          <p>Nothing saved yet. Open any topic and press <b>Save</b>.</p>
        </div>
      ) : (
        <div className="topic-grid">
          {items.map(({ entry }) => (
            <Link key={entry.topic.id} to={`/topic/${entry.topic.id}`} className={`topic-card ${done[entry.topic.id] ? 'is-done' : ''}`} style={{ '--accent': entry.track.color }}>
              <div className="topic-card-top">
                <LevelBadge level={entry.topic.level} />
                <span className="muted small">{entry.track.title}</span>
              </div>
              <h3>{entry.topic.title}</h3>
              <p>{entry.topic.summary}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
