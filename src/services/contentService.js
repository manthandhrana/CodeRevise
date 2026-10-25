// ─────────────────────────────────────────────────────────────────────────────
// Content service – the ONLY place that knows where content comes from.
//
// Today: static JSON files in src/data (bundled by Vite, loaded lazily).
// Tomorrow (backend): replace the bodies of `fetchTracks` / `fetchPractice`
// with `fetch('/api/tracks')` / `fetch('/api/practice')`. The JSON shape is
// documented in SCHEMA.md and the rest of the UI does not need to change.
// ─────────────────────────────────────────────────────────────────────────────
import { stripMarkdown } from '../lib/markdown'

const TRACK_ORDER = ['html', 'css', 'javascript', 'react', 'node', 'express', 'python', 'devnotes']
const jsonFiles = import.meta.glob('../data/*.json')

async function loadFile(name) {
  const loader = jsonFiles[`../data/${name}.json`]
  if (!loader) return null
  const mod = await loader()
  return mod.default ?? mod
}

async function fetchTracks() {
  const loaded = await Promise.all(TRACK_ORDER.map(loadFile))
  return loaded.filter(Boolean)
}

async function fetchPractice() {
  const data = await loadFile('practice')
  return data?.questions ?? []
}

/** Loads everything and builds lookup indexes used across the app. */
export async function loadContent() {
  const [rawTracks, questions] = await Promise.all([fetchTracks(), fetchPractice()])

  const topics = new Map() // id -> { topic, track, section, order, trackTopics }
  const tracks = rawTracks.map((raw) => {
    const flat = raw.sections.flatMap((section) => section.topics.map((topic) => ({ topic, section })))
    const track = {
      ...raw,
      topicIds: flat.map((f) => f.topic.id),
      topicCount: flat.length,
      exampleCount: flat.reduce((n, f) => n + (f.topic.examples?.length || 0), 0),
    }
    flat.forEach(({ topic, section }, order) => {
      topics.set(topic.id, { topic, track, section, order })
    })
    return track
  })

  // lightweight search index (plain-text, lowercased)
  const searchIndex = [
    ...[...topics.values()].map(({ topic, track, section }) => ({
      kind: 'topic',
      id: topic.id,
      title: topic.title,
      subtitle: `${track.title} · ${section.title}`,
      color: track.color,
      level: topic.level,
      haystack: [topic.title, topic.summary, ...(topic.keyPoints || []), stripMarkdown(topic.description || '')].join(' ').toLowerCase(),
      titleLower: topic.title.toLowerCase(),
    })),
    ...questions.map((q) => ({
      kind: 'question',
      id: q.id,
      title: q.title,
      subtitle: `Practice · ${q.track} · ${q.difficulty}`,
      color: '#8b5cf6',
      level: q.difficulty,
      haystack: [q.title, ...(q.tags || []), stripMarkdown(q.statement || '')].join(' ').toLowerCase(),
      titleLower: q.title.toLowerCase(),
    })),
  ]

  return {
    tracks,
    trackById: Object.fromEntries(tracks.map((t) => [t.id, t])),
    topics,
    questions,
    questionById: Object.fromEntries(questions.map((q) => [q.id, q])),
    searchIndex,
  }
}

export function searchContent(index, query, limit = 24) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const words = q.split(/\s+/)
  const scored = []
  for (const item of index) {
    if (!words.every((w) => item.haystack.includes(w))) continue
    let score = 1
    if (item.titleLower === q) score += 100
    else if (item.titleLower.startsWith(q)) score += 50
    else if (words.every((w) => item.titleLower.includes(w))) score += 25
    scored.push({ item, score })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.item)
}
