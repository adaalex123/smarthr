import { Link } from 'react-router-dom'
import { useState } from 'react'
import '../styles/error-pages.css'

type Props = {
  error?: Error | null
  onReset?: () => void
  status?: number
  title?: string
  message?: string
}

export default function ErrorPage({ error, onReset, status = 500, title, message }: Props) {
  const [showDetails, setShowDetails] = useState(false)
  const displayTitle = title ?? 'Something went wrong'
  const displayMessage =
    message ??
    error?.message ??
    'An unexpected error stopped this page from rendering. The details have been logged to the browser console.'

  const handleReload = () => {
    if (onReset) onReset()
    window.location.reload()
  }

  return (
    <div className="error-page">
      <div className="error-card error-card--crash">
        <div className="error-card__icon error-card__icon--crash">!</div>
        <div className="error-card__badge">
          <span className="error-badge error-badge--server">{status}</span>
          <span className="error-badge-label">Application error</span>
        </div>
        <h1>{displayTitle}</h1>
        <p className="error-card__lead">{displayMessage}</p>

        <div className="error-card__actions">
          <button type="button" className="btn-error-primary" onClick={handleReload}>
            Reload page
          </button>
          <Link to="/" className="btn-error-ghost" onClick={onReset}>
            Go to homepage
          </Link>
          <button type="button" className="btn-error-ghost" onClick={() => window.history.back()}>
            Go back
          </button>
        </div>

        <div className="error-card__meta">
          <p>
            If this keeps happening, copy the details below and share them with support. Every API error is also printed in the
            browser console with full request info.
          </p>
          <button type="button" className="error-details-toggle" onClick={() => setShowDetails((v) => !v)}>
            {showDetails ? 'Hide technical details' : 'Show technical details'}
          </button>
          {showDetails && (
            <pre className="error-raw">
              {error?.stack ? `${error.name}: ${error.message}\n\n${error.stack}` : error ? `${error.name}: ${error.message}` : 'No stack available'}
            </pre>
          )}
        </div>

        <div className="error-card__footer">
          <span>SmartHR · Error boundary caught an uncaught exception</span>
          <span>{new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
