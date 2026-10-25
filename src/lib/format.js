// Tiny formatters so one-line example sources are readable in the editor.
// They only touch code that has no line breaks at all, and never change meaning.

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const RAW = /^<(script|style|pre|textarea|svg)\b/i
const INLINE = new Set(['a', 'b', 'i', 'em', 'strong', 'span', 'code', 'small', 'mark', 'u', 's', 'sub', 'sup', 'abbr', 'kbd', 'label', 'q', 'cite', 'time', 'del', 'ins'])

export function prettyHtml(src = '') {
  if (!src || src.includes('\n') || src.length < 70 || RAW.test(src.trim())) return src
  const parts = src.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) || []
  const items = parts.map((p) => p.trim()).filter(Boolean)
  // mixed text + inline tags (e.g. `Hello <b>x</b>.`) – re-indenting would change the rendered spaces
  const tagName = (t) => (t && t.startsWith('<') ? (t.match(/^<\/?([a-zA-Z][\w-]*)/) || [])[1]?.toLowerCase() : null)
  for (let i = 0; i < items.length; i++) {
    if (items[i].startsWith('<')) continue
    const prev = items[i - 1]
    const next = items[i + 1]
    const wrapped = prev && next && prev.startsWith('<') && !prev.startsWith('</') && next === `</${tagName(prev)}>`
    if (!wrapped && (INLINE.has(tagName(prev)) || INLINE.has(tagName(next)))) return src
  }
  const lines = []
  let depth = 0
  for (let i = 0; i < items.length; i++) {
    const t = items[i]
    const isTag = t.startsWith('<') && !t.startsWith('<!--')
    const name = isTag ? (t.match(/^<\/?([a-zA-Z][\w-]*)/) || [])[1]?.toLowerCase() : null
    const isClose = isTag && t.startsWith('</')
    const isOpen = isTag && !isClose && !t.endsWith('/>') && !VOID.has(name)
    // <tag>text</tag>  -> single line
    if (isOpen && items[i + 1] && !items[i + 1].startsWith('<') && items[i + 2] === `</${name}>`) {
      lines.push('  '.repeat(depth) + t + items[i + 1] + items[i + 2])
      i += 2
      continue
    }
    if (isClose) depth = Math.max(0, depth - 1)
    lines.push('  '.repeat(depth) + t)
    if (isOpen) depth++
  }
  return lines.join('\n')
}

export function prettyCss(src = '') {
  if (!src || src.includes('\n') || src.length < 60) return src
  if (/url\(|["'][^"']*;[^"']*["']|\/\*/.test(src)) return src // data URIs, strings or comments: leave untouched
  return src
    .replace(/\s*\{\s*/g, ' {\n  ')
    .replace(/;\s*(?!\s*\})(?=[^}]*\})/g, ';\n  ')
    .replace(/;?\s*\}\s*/g, ';\n}\n')
    .replace(/\n  \n/g, '\n')
    .trim()
}
