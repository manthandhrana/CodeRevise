import { useMemo } from 'react'
import { highlight, guessLang } from '../lib/highlight'
import CopyButton from './CopyButton'

export default function CodeBlock({ code, language, title }) {
  const lang = language && language !== 'text' ? language : guessLang(code, title)
  const html = useMemo(() => highlight(code || '', lang), [code, lang])
  return (
    <div className="codeblock">
      <div className="codeblock-head">
        <span>{lang === 'text' ? 'code' : lang}</span>
        <CopyButton text={code} />
      </div>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}
