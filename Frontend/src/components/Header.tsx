import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import JobBasketModal from './JobBasketModal'
import LoginModal from './LoginModal'

interface HeaderProps {
  basketCount?: number
  savedJobs?: Array<{ id: string; title: string; location: string; salary: string; type: string }>
  onRemoveFromBasket?: (id: string) => void
  onClearBasket?: () => void
}

export default function Header({
  basketCount = 0,
  savedJobs = [],
  onRemoveFromBasket,
  onClearBasket,
}: HeaderProps) {
  const [isBasketOpen, setIsBasketOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()
  const showBasket = basketCount > 0 || savedJobs.length > 0

  return (
    <>
      <header className="tf-header">
        <div className="tf-header-inner">
          <Link to="/" className="tf-logo-block">
            <span className="tf-logo-mark">SH</span>
            <span className="tf-logo-text">SmartHR</span>
          </Link>

          <nav className={`tf-nav-links ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
            <Link to="/" className={`tf-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>
            <a href="#platform" className="tf-nav-item">Platform</a>
            <a href="#workflow" className="tf-nav-item">Workflow</a>
            <a href="#faq" className="tf-nav-item">
              FAQ
            </a>
          </nav>

          <div className="tf-header-right">
            {user ? (
              <Link className="tf-auth-btn tf-auth-btn--solid" to={user.role === 'admin' ? '/admin' : user.role === 'candidate' ? '/candidate' : '/employer'}>
                Dashboard
              </Link>
            ) : (
              <>
                <button className="tf-auth-btn" onClick={() => setIsLoginOpen(true)}>
                  Sign in
                </button>
                <Link className="tf-auth-btn tf-auth-btn--solid" to="/signup">
                  Create account
                </Link>
              </>
            )}

            {showBasket && (
              <button
                className="tf-basket-btn"
                onClick={() => setIsBasketOpen(true)}
                aria-label="Saved jobs"
              >
                Saved
                <span className="basket-badge">{basketCount || savedJobs.length}</span>
              </button>
            )}

            <button 
              className="tf-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <JobBasketModal
        isOpen={isBasketOpen}
        onClose={() => setIsBasketOpen(false)}
        savedJobs={savedJobs}
        onRemoveItem={onRemoveFromBasket}
        onClearAll={onClearBasket}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  )
}
