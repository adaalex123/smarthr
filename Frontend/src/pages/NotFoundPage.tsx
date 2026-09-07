import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { homePath } from '../types/auth'
import '../styles/error-pages.css'

export default function NotFoundPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const dashboardPath = user ? homePath(user.role) : '/login'

  return (
    <div className="error-page error-page--404">
      <div className="error-card error-card--404">
        <div className="error-404-illustration" aria-hidden>
          <span className="error-404-num">404</span>
          <div className="error-404-orbit">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="error-card__badge">
          <span className="error-badge error-badge--404">404</span>
          <span className="error-badge-label">Page not found</span>
        </div>

        <h1>We can&apos;t find that page</h1>
        <p className="error-card__lead">
          The link you followed may be broken, the page may have moved, or you typed an address that doesn&apos;t exist on
          SmartHR. If you were looking for a job application link, check that the URL is complete.
        </p>

        <div className="error-card__actions">
          <Link to="/" className="btn-error-primary">
            Back to homepage
          </Link>
          <button type="button" className="btn-error-ghost" onClick={() => navigate(-1)}>
            Go back
          </button>
          {user ? (
            <Link to={dashboardPath} className="btn-error-ghost">
              Open my dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn-error-ghost">
              Sign in
            </Link>
          )}
        </div>

        <div className="error-suggestions">
          <h2>Try instead</h2>
          <div className="error-suggestions-grid">
            <Link to="/" className="error-suggestion">
              <strong>Browse open roles</strong>
              <span>See all public jobs and apply with one click</span>
            </Link>
            <Link to="/signup" className="error-suggestion">
              <strong>Create an account</strong>
              <span>Candidate, recruiter, or admin — choose your path</span>
            </Link>
            <Link to="/login" className="error-suggestion">
              <strong>Sign in</strong>
              <span>Continue to your workspace or candidate dashboard</span>
            </Link>
          </div>
        </div>

        <div className="error-card__footer">
          <span>
            Lost? Contact support or check the address bar. Every 404 and API error is logged in the console for debugging.
          </span>
        </div>
      </div>
    </div>
  )
}
