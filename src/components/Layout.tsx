import { Link, Outlet, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import './Layout.css'

export default function Layout() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="layout">
      <nav className="navigation">
        <div className="nav-content">
          <div className="nav-links">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <span className="nav-icon">🏠</span>
              Home
            </Link>
            <Link
              to="/explore"
              className={`nav-link ${location.pathname === '/explore' ? 'active' : ''}`}
            >
              <span className="nav-icon">✈️</span>
              Explore
            </Link>
          </div>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}