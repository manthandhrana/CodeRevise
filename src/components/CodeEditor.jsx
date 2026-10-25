import * as EditorModule from 'react-simple-code-editor'
import { highlight } from '../lib/highlight'

// package is CommonJS; depending on the bundler the component sits on .default or .default.default
const Editor = EditorModule.default?.default ?? EditorModule.default ?? EditorModule

export default function CodeEditor({ value, onChange, language = 'markup', minHeight = 140, maxHeight = 380, ariaLabel = 'Code editor' }) {
  return (
    <div className="editor-scroll" style={{ minHeight, maxHeight }}>
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={(code) => highlight(code, language)}
        padding={14}
        tabSize={2}
        insertSpaces
        textareaClassName="editor-textarea"
        preClassName="editor-pre"
        aria-label={ariaLabel}
        style={{ minHeight, fontFamily: 'var(--font-mono)', fontSize: 13.5, lineHeight: 1.6 }}
      />
    </div>
  )
}
