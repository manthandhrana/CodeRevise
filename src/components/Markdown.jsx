import { useMemo } from 'react'
import { renderMarkdown } from '../lib/markdown'

export default function Markdown({ text, className = '' }) {
  const html = useMemo(() => renderMarkdown(text), [text])

  // copy buttons inside rendered code blocks (event delegation)
  const onClick = async (e) => {
    const btn = e.target.closest('[data-copy]')
    if (!btn) return
    const code = btn.closest('.codeblock')?.querySelector('code')?.textContent || ''
    try {
      await navigator.clipboard.writeText(code)
      btn.textContent = 'Copied'
      setTimeout(() => (btn.textContent = 'Copy'), 1400)
    } catch {
      /* clipboard blocked */
    }
  }

  return <div className={`prose ${className}`} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
}
