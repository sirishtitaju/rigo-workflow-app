import { useState } from 'react'
import './Explore.css'

export default function Explore() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())

  const toggleSection = (section: string) => {
    const newOpenSections = new Set(openSections)
    if (newOpenSections.has(section)) {
      newOpenSections.delete(section)
    } else {
      newOpenSections.add(section)
    }
    setOpenSections(newOpenSections)
  }

  return (
    <div className="explore-container">
      <div className="header-section">
        <div className="header-icon">⚡</div>
        <h1 className="title">Explore</h1>
      </div>

      <p className="description">
        This app includes example code to help you get started.
      </p>

      <div className="collapsible-section">
        <button
          className="collapsible-header"
          onClick={() => toggleSection('routing')}
        >
          <span>File-based routing</span>
          <span className={`chevron ${openSections.has('routing') ? 'open' : ''}`}>
            ▼
          </span>
        </button>
        {openSections.has('routing') && (
          <div className="collapsible-content">
            <p>
              This app has two screens: <code>src/pages/Home.tsx</code> and{' '}
              <code>src/pages/Explore.tsx</code>
            </p>
            <p>
              The layout file in <code>src/components/Layout.tsx</code>{' '}
              sets up the navigation using React Router.
            </p>
            <a
              href="https://reactrouter.com/en/main"
              target="_blank"
              rel="noopener noreferrer"
              className="external-link"
            >
              Learn more about React Router →
            </a>
          </div>
        )}
      </div>

      <div className="collapsible-section">
        <button
          className="collapsible-header"
          onClick={() => toggleSection('web')}
        >
          <span>Web-only support</span>
          <span className={`chevron ${openSections.has('web') ? 'open' : ''}`}>
            ▼
          </span>
        </button>
        {openSections.has('web') && (
          <div className="collapsible-content">
            <p>
              This React application runs in web browsers and can be deployed
              to any static hosting service like Vercel, Netlify, or GitHub Pages.
            </p>
          </div>
        )}
      </div>

      <div className="collapsible-section">
        <button
          className="collapsible-header"
          onClick={() => toggleSection('images')}
        >
          <span>Images</span>
          <span className={`chevron ${openSections.has('images') ? 'open' : ''}`}>
            ▼
          </span>
        </button>
        {openSections.has('images') && (
          <div className="collapsible-content">
            <p>
              For static images, you can import them directly in your components
              or place them in the <code>public</code> folder for direct access.
            </p>
            <div className="image-container">
              <img
                src="/assets/images/react-logo.png"
                alt="React Logo"
                className="demo-image"
              />
            </div>
            <a
              href="https://vitejs.dev/guide/assets.html"
              target="_blank"
              rel="noopener noreferrer"
              className="external-link"
            >
              Learn more about Vite asset handling →
            </a>
          </div>
        )}
      </div>

      <div className="collapsible-section">
        <button
          className="collapsible-header"
          onClick={() => toggleSection('fonts')}
        >
          <span>Custom fonts</span>
          <span className={`chevron ${openSections.has('fonts') ? 'open' : ''}`}>
            ▼
          </span>
        </button>
        {openSections.has('fonts') && (
          <div className="collapsible-content">
            <p>
              You can load custom fonts by placing them in the <code>public</code> folder
              and importing them in your CSS, or by using web fonts from services like Google Fonts.
            </p>
            <p style={{ fontFamily: 'monospace' }}>
              This text uses a monospace font family.
            </p>
          </div>
        )}
      </div>

      <div className="collapsible-section">
        <button
          className="collapsible-header"
          onClick={() => toggleSection('themes')}
        >
          <span>Light and dark mode components</span>
          <span className={`chevron ${openSections.has('themes') ? 'open' : ''}`}>
            ▼
          </span>
        </button>
        {openSections.has('themes') && (
          <div className="collapsible-content">
            <p>
              This template has light and dark mode support. The theme context
              lets you inspect the current color scheme and adjust UI colors accordingly.
            </p>
            <p>
              Try clicking the theme toggle button in the navigation to see it in action!
            </p>
          </div>
        )}
      </div>

      <div className="collapsible-section">
        <button
          className="collapsible-header"
          onClick={() => toggleSection('animations')}
        >
          <span>Animations</span>
          <span className={`chevron ${openSections.has('animations') ? 'open' : ''}`}>
            ▼
          </span>
        </button>
        {openSections.has('animations') && (
          <div className="collapsible-content">
            <p>
              You can create animations using CSS transitions, keyframes, or
              libraries like Framer Motion for more complex animations.
            </p>
            <div className="animation-demo">
              <div className="bouncing-ball"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}