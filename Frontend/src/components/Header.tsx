import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

  return (
    <>
      <header className="tf-header">
        <div className="tf-header-inner">
          {/* Left Purple Logo Block */}
          <Link to="/" className="tf-logo-block">
            <span className="tf-logo-text">
              smart hr<br />
              recruitment<br />
              agency
            </span>
          </Link>

          {/* Main Navigation Links */}
          <nav className={`tf-nav-links ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
            <Link to="/" className={`tf-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
              HOME <span className="caret">▾</span>
            </Link>
            <a href="#about" className="tf-nav-item">ABOUT</a>
            <div className="tf-nav-item has-dropdown">
              PAGES <span className="caret">▾</span>
            </div>
            <div className="tf-nav-item has-dropdown">
              JOBS <span className="caret">▾</span>
            </div>
            <a href="#faq" className="tf-nav-item">
              FAQ <span className="caret">▾</span>
            </a>
            <a href="#contact" className="tf-nav-item">
              CONTACT <span className="caret">▾</span>
            </a>
          </nav>

          {/* Right Header Controls */}
          <div className="tf-header-right">
            <button className="tf-auth-btn" onClick={() => setIsLoginOpen(true)}>
              <span className="auth-label">LOGIN/REGISTER</span>
              <svg className="door-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </button>

            <button 
              className="tf-basket-btn" 
              onClick={() => setIsBasketOpen(true)}
              aria-label="Job Basket"
            >
              <span className="basket-label">JOB BASKET</span>
              <div className="basket-icon-wrapper">
                <svg className="basket-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 8h16l-1.5 12h-13L4 8z" />
                  <path d="M9 8V5a3 3 0 0 1 6 0v3" />
                </svg>
                <span className="basket-badge">{basketCount}</span>
              </div>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button 
              className="tf-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Saved Jobs Basket Modal */}
      <JobBasketModal
        isOpen={isBasketOpen}
        onClose={() => setIsBasketOpen(false)}
        savedJobs={savedJobs}
        onRemoveItem={onRemoveFromBasket}
        onClearAll={onClearBasket}
      />

      {/* Login/Register Popup Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  )
}
