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
        <Link to="/" className="tf-footer-logo-block">
          <span className="tf-logo-mark">SH</span>
          <span className="tf-logo-text">SmartHR</span>
        </Link>

        <div className="tf-copyright-text">
          SmartHR Recruitment Agency. Built for clearer hiring decisions.
        </div>

        <button className="tf-back-to-top" onClick={scrollToTop}>
          Back to top
        </button>
      </div>
    </footer>
  )
}
