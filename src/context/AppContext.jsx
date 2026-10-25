import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loadContent } from '../services/contentService'
import { storage } from '../lib/storage'

const AppContext = createContext(null)

function useStoredState(key, initial) {
  const [value, setValue] = useState(() => storage.get(key, initial))
  useEffect(() => {
    storage.set(key, value)
  }, [key, value])
  return [value, setValue]
}

export function AppProvider({ children }) {
  const [content, setContent] = useState(null)
  const [error, setError] = useState(null)

  // theme: light by default (as requested), user choice is remembered
  const [theme, setTheme] = useStoredState('cr:theme', 'light')
  const [done, setDone] = useStoredState('cr:done', {})
  const [saved, setSaved] = useStoredState('cr:saved', {})
  const [solved, setSolved] = useStoredState('cr:solved', {})
  const [last, setLast] = useStoredState('cr:last', null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    loadContent().then(setContent).catch((e) => setError(e))
  }, [])

  const toggle = useCallback((setter) => (id) => setter((m) => {
    const next = { ...m }
    if (next[id]) delete next[id]
    else next[id] = Date.now()
    return next
  }), [])

  const value = useMemo(
    () => ({
      content,
      error,
      theme,
      toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
      done,
      toggleDone: toggle(setDone),
      saved,
      toggleSaved: toggle(setSaved),
      solved,
      markSolved: (id) => setSolved((m) => (m[id] ? m : { ...m, [id]: Date.now() })),
      last,
      setLast,
    }),
    [content, error, theme, done, saved, solved, last, toggle, setTheme, setDone, setSaved, setSolved, setLast],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
