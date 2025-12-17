import './CorsNotice.css'

interface CorsNoticeProps {
  onDismiss: () => void
}

export default function CorsNotice({ onDismiss }: CorsNoticeProps) {
  return (
    <div className="cors-notice">
      <div className="cors-notice-content">
        <h3>🔒 CORS Limitation Notice</h3>
        <p>
          Due to browser security restrictions (CORS), this web app cannot directly access the GitHub API.
          Here are your options:
        </p>
        <div className="cors-solutions">
          <div className="solution">
            <h4>🛠️ Development Solution:</h4>
            <p>Use a browser extension like "CORS Unblock" or "Disable CORS" (Chrome/Edge)</p>
          </div>
          <div className="solution">
            <h4>🚀 Production Solution:</h4>
            <p>Deploy with a backend proxy server or use GitHub Apps with proper authentication</p>
          </div>
          <div className="solution">
            <h4>🔧 Alternative:</h4>
            <p>Use the original React Native app or GitHub CLI for full API access</p>
          </div>
        </div>
        <div className="cors-notice-actions">
          <button onClick={onDismiss} className="dismiss-button">
            I understand, continue anyway
          </button>
        </div>
      </div>
    </div>
  )
}