import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-docker'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-diff'

const ALIAS = {
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
  web: 'markup',
  htm: 'markup',
  jinja: 'markup',
  jinja2: 'markup',
  django: 'markup',
  js: 'javascript',
  mjs: 'javascript',
  node: 'javascript',
  py: 'python',
  python3: 'python',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  console: 'bash',
  powershell: 'bash',
  yml: 'yaml',
  dockerfile: 'docker',
  md: 'markdown',
}

export const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function highlight(code, lang = 'text') {
  const key = ALIAS[lang] || lang
  const grammar = Prism.languages[key]
  if (!grammar) return escapeHtml(code)
  try {
    return Prism.highlight(code, grammar, key)
  } catch {
    return escapeHtml(code)
  }
}

// Best-effort language detection for `text` examples that carry no explicit language
export function guessLang(code = '', title = '') {
  const c = code.trim()
  const t = title.toLowerCase()
  if (/dockerfile/.test(t) || /^FROM\s+\S+/m.test(c) && /^(RUN|CMD|COPY|WORKDIR)\b/m.test(c)) return 'docker'
  if (/^(\$ |pip |npm |git |docker |python |curl |scrapy |django-admin|flask |cd |mkdir |source |uvicorn )/m.test(c) && !/^(def |class |import )/m.test(c)) return 'bash'
  if (/^\s*(SELECT|INSERT|UPDATE|CREATE TABLE|DELETE)\b/im.test(c)) return 'sql'
  if (/^[{[]/.test(c)) {
    try {
      JSON.parse(c)
      return 'json'
    } catch {
      /* fall through */
    }
  }
  if (/^\s*<(!DOCTYPE|html|div|form|head|body|ul|table|section|\{%)/i.test(c) || /\{%\s*(block|extends|for|if)/.test(c)) return 'markup'
  if (/^[\w-]+:\s*$/m.test(c) && /^\s+-\s/m.test(c) && !/[{};]/.test(c)) return 'yaml'
  if (/\b(def |import |from \S+ import|class \w+.*:|print\()/.test(c)) return 'python'
  if (/\b(function |const |let |=>|console\.log|require\()/.test(c)) return 'javascript'
  if (/[┌└│─→+]-{2,}|-->|\|\s*$/m.test(c) && !/[;{}]/.test(c)) return 'text'
  return 'text'
}
