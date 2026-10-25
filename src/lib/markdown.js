import { Marked } from 'marked'
import { highlight, escapeHtml, guessLang } from './highlight'

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    code({ text, lang }) {
      const raw = (lang || '').trim().split(/\s+/)[0].toLowerCase()
      const language = raw || guessLang(text)
      const body = highlight(text, language)
      const label = raw || (language === 'text' ? 'code' : language)
      return (
        `<div class="codeblock"><div class="codeblock-head"><span>${escapeHtml(label)}</span>` +
        `<button type="button" class="copy-btn" data-copy>Copy</button></div>` +
        `<pre><code class="language-${escapeHtml(language)}">${body}</code></pre></div>`
      )
    },
  },
})

export function renderMarkdown(text = '') {
  return marked.parse(String(text))
}

export function renderInline(text = '') {
  return marked.parseInline(String(text))
}

// plain-text version used for search indexing
export function stripMarkdown(text = '') {
  return String(text)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[`*_>#|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
