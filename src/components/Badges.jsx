import { Atom, Braces, Code2, Cpu, Hexagon, Palette, Route, Server, Layers } from 'lucide-react'

const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', easy: 'Easy', medium: 'Medium', hard: 'Hard' }

export function LevelBadge({ level }) {
  if (!level) return null
  return <span className={`badge level-${level}`}>{LEVEL_LABEL[level] || level}</span>
}

const ICONS = { html: Code2, css: Palette, javascript: Braces, react: Atom, node: Hexagon, express: Route, python: Cpu, devnotes: Server }

export function TrackIcon({ id, size = 18 }) {
  const Icon = ICONS[id] || Layers
  return <Icon size={size} />
}
