import { Suspense } from 'react'
import WebPlayground from './WebPlayground'
import CodeRunner from './CodeRunner'
import CodeBlock from './CodeBlock'
import { renderInline } from '../lib/markdown'

const webInitial = new WeakMap()
function initialFor(example) {
  if (!webInitial.has(example)) webInitial.set(example, { html: example.html, css: example.css, js: example.js, code: example.code })
  return webInitial.get(example)
}

export default function ExampleView({ example, index }) {
  const lang = example.language || 'text'
  return (
    <figure className="example">
      <figcaption>
        <span className="example-index">{index + 1}</span>
        <span className="example-title">{example.title}</span>
        <span className="example-kind">{lang === 'web' || lang === 'react' ? 'Live editor' : lang === 'text' ? 'Reference' : 'Runnable'}</span>
      </figcaption>
      {example.explanation && <p className="example-note" dangerouslySetInnerHTML={{ __html: renderInline(example.explanation) }} />}
      <Suspense fallback={null}>
        {lang === 'web' ? (
          <WebPlayground initial={initialFor(example)} title={example.title} />
        ) : lang === 'react' ? (
          <WebPlayground kind="react" initial={initialFor(example)} title={example.title} height={320} />
        ) : lang === 'javascript' || lang === 'python' ? (
          <CodeRunner language={lang} code={example.code || ''} />
        ) : (
          <CodeBlock code={example.code || ''} language={example.lang} title={example.title} />
        )}
      </Suspense>
    </figure>
  )
}
