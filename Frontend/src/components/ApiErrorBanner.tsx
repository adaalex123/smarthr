import { useState } from 'react'
import { getApiErrorDetails } from '../api/client'
import '../styles/api-error.css'

type Props = {
  error: unknown
  onDismiss?: () => void
  title?: string
  compact?: boolean
}

export default function ApiErrorBanner({ error, onDismiss, title, compact }: Props) {
  const [showDetails, setShowDetails] = useState(false)

  if (!error) return null

  // Allow passing plain string quickly
  const isStringError = typeof error === 'string'
  const details = isStringError
    ? { status: null, message: error, errors: [], raw: null, path: null, isNetwork: false }
    : getApiErrorDetails(error)

  const statusLabel = details.status === 0 ? 'Network' : details.status ? String(details.status) : null
  const statusTone =
    details.status === 0
      ? 'network'
      : details.status && details.status >= 500
        ? 'server'
        : details.status && details.status >= 400
          ? 'client'
          : 'unknown'

  const hasFieldErrors = details.errors.length > 0

  return (
    <div className={`api-error-banner ${compact ? 'api-error-banner--compact' : ''}`} role="alert" aria-live="assertive">
      <div className="api-error-banner__head">
        <div className="api-error-banner__icon" aria-hidden>
          !
        </div>
        <div className="api-error-banner__main">
          <div className="api-error-banner__title-row">
            {statusLabel && <span className={`api-error-status api-error-status--${statusTone}`}>{statusLabel}</span>}
            <strong className="api-error-banner__title">{title ?? (details.isNetwork ? 'Network error' : 'Request failed')}</strong>
            {details.path && <span className="api-error-banner__path">{details.path}</span>}
          </div>
          <p className="api-error-banner__message">{details.message}</p>
          {hasFieldErrors && (
            <ul className="api-error-banner__field-list">
              {details.errors.map((e, idx) => (
                <li key={`${e.field}-${idx}`}>
                  <span className="api-error-field">{e.field}</span>
                  <span className="api-error-field-msg">{e.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="api-error-banner__actions">
          {details.raw && (
            <button
              type="button"
              className="api-error-banner__toggle"
              onClick={() => setShowDetails((v) => !v)}
              aria-expanded={showDetails}
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </button>
          )}
          {onDismiss && (
            <button type="button" className="api-error-banner__dismiss" onClick={onDismiss} aria-label="Dismiss error">
              ×
            </button>
          )}
        </div>
      </div>

      {showDetails && details.raw && (
        <div className="api-error-banner__details">
          <div className="api-error-banner__details-grid">
            <div>
              <span className="api-error-details-label">Status</span>
              <span className="api-error-details-value">{details.status ?? '—'}</span>
            </div>
            <div>
              <span className="api-error-details-label">Path</span>
              <span className="api-error-details-value">{details.path ?? '—'}</span>
            </div>
            <div>
              <span className="api-error-details-label">Type</span>
              <span className="api-error-details-value">{details.isNetwork ? 'Network / CORS' : 'API response'}</span>
            </div>
          </div>
          <pre className="api-error-banner__raw">{JSON.stringify(details.raw, null, 2)}</pre>
          <p className="api-error-banner__hint">
            This is the exact error returned by the API. Check the browser console for the full grouped log with status, payload and stack.
          </p>
        </div>
      )}
    </div>
  )
}
