import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CircleCheck, CircleX, Eye, EyeOff, Lightbulb, Loader2, Play, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { storage } from '../lib/storage'
import { testJs, testPython } from '../lib/runners'
import Markdown from '../components/Markdown'
import CodeEditor from '../components/CodeEditor'
import CodeBlock from '../components/CodeBlock'
import WebPlayground from '../components/WebPlayground'
import { LevelBadge } from '../components/Badges'
import NotFound from './NotFound'

const show = (v) => (typeof v === 'string' ? JSON.stringify(v) : JSON.stringify(v))

export default function Problem() {
  const { questionId } = useParams()
  const { content, solved, markSolved } = useApp()
  const q = content.questionById[questionId]
  if (!q) return <NotFound />
  return <ProblemInner key={q.id} q={q} isSolved={!!solved[q.id]} markSolved={markSolved} list={content.questions} />
}

function ProblemInner({ q, isSolved, markSolved, list }) {
  const isWeb = q.language === 'web'
  const draftKey = `cr:draft:${q.id}`
  const [code, setCode] = useState(() => storage.get(draftKey, isWeb ? q.starter : q.starter))
  const [hintsShown, setHintsShown] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState('')
  const [outcome, setOutcome] = useState(null)

  useEffect(() => {
    storage.set(draftKey, code)
  }, [draftKey, code])

  const idx = list.findIndex((x) => x.id === q.id)
  const next = list[idx + 1]

  const run = async () => {
    setRunning(true)
    setOutcome(null)
    try {
      const fn = q.language === 'python' ? testPython : testJs
      const res = await fn(code, q.functionName, q.tests, { onStatus: setStatus })
      setOutcome(res)
      if (res.results && res.results.length && res.results.every((r) => r.pass)) markSolved(q.id)
    } finally {
      setRunning(false)
      setStatus('')
    }
  }

  const passed = outcome?.results?.filter((r) => r.pass).length || 0
  const total = outcome?.results?.length || 0

  return (
    <div className="problem">
      <nav className="crumbs"><Link to="/practice"><ArrowLeft size={14} /> All questions</Link></nav>
      <div className="problem-grid">
        <section className="problem-left">
          <header className="problem-head">
            <h1>{q.title}</h1>
            <div className="problem-meta">
              <LevelBadge level={q.difficulty} />
              <span className="q-track">{q.track}</span>
              {(q.tags || []).map((t) => <i key={t} className="tag">{t}</i>)}
              {isSolved && <span className="done-pill"><CircleCheck size={12} /> Solved</span>}
            </div>
          </header>
          <Markdown text={q.statement} />

          {q.hints?.length > 0 && (
            <div className="hints">
              {q.hints.slice(0, hintsShown).map((h, i) => (
                <div key={i} className="hint"><Lightbulb size={15} /> <span>{h}</span></div>
              ))}
              {hintsShown < q.hints.length && (
                <button className="btn small ghost" onClick={() => setHintsShown((n) => n + 1)}>
                  <Lightbulb size={14} /> Show hint ({hintsShown}/{q.hints.length})
                </button>
              )}
            </div>
          )}
        </section>

        <section className="problem-right">
          {isWeb ? (
            <WebPlayground key={q.id} initial={code} resetTo={q.starter} height={320} title={q.title} onChange={setCode} />
          ) : (
            <div className="playground">
              <div className="pg-bar">
                <div className="pg-tabs"><button className="active">{q.language === 'python' ? 'Python' : 'JavaScript'}</button></div>
                <div className="pg-actions">
                  <button className="btn small primary" onClick={run} disabled={running}>
                    {running ? <Loader2 size={14} className="spin" /> : <Play size={14} />} Run tests
                  </button>
                  <button className="btn small ghost" onClick={() => { setCode(q.starter); setOutcome(null) }}>
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>
              </div>
              <CodeEditor value={code} onChange={setCode} language={q.language} minHeight={260} maxHeight={460} ariaLabel="Solution editor" />
            </div>
          )}

          {!isWeb && (
            <div className="results">
              {status && <div className="console-status">{status}</div>}
              {outcome?.fatal && <div className="result-banner fail">{outcome.fatal}</div>}
              {outcome?.error && <div className="result-banner fail">{outcome.error}</div>}
              {outcome?.results && (
                <>
                  <div className={`result-banner ${passed === total ? 'pass' : 'fail'}`}>
                    {passed === total ? <CircleCheck size={16} /> : <CircleX size={16} />}
                    {passed === total ? `All ${total} tests passed – well done!` : `${passed} of ${total} tests passed`}
                  </div>
                  <ul className="test-list">
                    {outcome.results.map((r, i) => (
                      <li key={i} className={r.pass ? 'pass' : 'fail'}>
                        <div className="test-head">{r.pass ? <CircleCheck size={14} /> : <CircleX size={14} />} Test {i + 1}</div>
                        <div className="test-body">
                          <div><span>Input</span><code>{r.input.map(show).join(', ')}</code></div>
                          <div><span>Expected</span><code>{show(r.expected)}</code></div>
                          {!r.pass && (r.error ? <div><span>Error</span><code>{r.error}</code></div> : <div><span>Got</span><code>{show(r.got)}</code></div>)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          <div className="solution-box">
            <button className="btn small ghost" onClick={() => setShowSolution((s) => !s)}>
              {showSolution ? <EyeOff size={14} /> : <Eye size={14} />} {showSolution ? 'Hide' : 'Show'} solution
            </button>
            {showSolution && (
              <div className="solution">
                {isWeb ? (
                  <>
                    <WebPlayground initial={q.solution} height={260} title={`${q.title} solution`} />
                  </>
                ) : (
                  <CodeBlock code={q.solution} language={q.language} />
                )}
                {q.solutionExplanation && <Markdown text={q.solutionExplanation} />}
              </div>
            )}
          </div>

          {next && <Link to={`/practice/${next.id}`} className="btn ghost next-q">Next question →</Link>}
        </section>
      </div>
    </div>
  )
}
