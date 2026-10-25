import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Menu, Moon, Search, Sun } from 'lucide-react'
import { useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import SearchPalette from './components/SearchPalette'
import Home from './pages/Home'
import Track from './pages/Track'
import Topic from './pages/Topic'
import Practice from './pages/Practice'
import Problem from './pages/Problem'
import PlaygroundPage from './pages/PlaygroundPage'
import Saved from './pages/Saved'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const { content, error, theme, toggleTheme } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      } else if (e.key === '/' && !typing) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (error) {
    return (
      <div className="splash">
        <h1>Could not load content</h1>
        <p>{String(error.message || error)}</p>
      </div>
    )
  }
  if (!content) {
    return (
      <div className="splash">
        <div className="loader" />
        <p>Loading your revision hub…</p>
      </div>
    )
  }

  return (
    <div className="app">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-col">
        <header className="topbar">
          <button className="icon-btn mobile-only" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <button className="search-trigger" onClick={() => setSearchOpen(true)}>
            <Search size={16} />
            <span>Search topics, concepts, questions…</span>
            <kbd>Ctrl K</kbd>
          </button>
          <button className="icon-btn" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </header>
        <main id="main" className="page">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/track/:trackId" element={<Track />} />
            <Route path="/topic/:topicId" element={<Topic />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/practice/:questionId" element={<Problem />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
