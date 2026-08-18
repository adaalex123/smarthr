import { Link } from 'react-router-dom'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <footer className="tf-footer">
      <div className="tf-footer-inner">
        {/* Left Purple Logo Block */}
        <Link to="/" className="tf-footer-logo-block">
          <span className="tf-logo-text">
            smart hr<br />
            recruitment<br />
            agency
          </span>
        </Link>

        {/* Center Copyright Notice */}
        <div className="tf-copyright-text">
          © 2026. Theme by CMSSuperheroes / Smart HR
        </div>

        {/* Right Back to Top Button */}
        <button className="tf-back-to-top" onClick={scrollToTop}>
          Back to Top <span className="top-icon">➇</span>
        </button>
      </div>
    </footer>
  )
}
