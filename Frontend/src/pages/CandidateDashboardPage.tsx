import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import '../styles/candidate-dashboard.css'

export default function CandidateDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const displayName = user?.fullName || 'Ada Johnson'

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="candidate-dashboard">
      <div className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="logo"><i className="fas fa-brain" /> SmartHR</div>
        <div className="user-badge">
          <div className="avatar">{displayName.charAt(0)}</div>
          <div className="user-info">
            <div className="name">{displayName}</div>
            <div className="role">{user?.role ?? 'Candidate'}</div>
          </div>
        </div>
        <div className="nav-section">Main</div>
        <nav>
          <a href="#" className="active"><i className="fas fa-chart-pie" /> Dashboard</a>
          <a href="#"><i className="fas fa-search" /> Browse Jobs</a>
          <a href="#"><i className="fas fa-file-alt" /> My Applications</a>
          <a href="#"><i className="fas fa-robot" /> AI Resume Feedback</a>
        </nav>
        <div className="bottom-links">
          <button type="button" style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer', font: 'inherit' }} onClick={() => void handleLogout()}>
            <i className="fas fa-sign-out-alt" /> Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <div className="top-bar">
          <div className="greeting">
            <button type="button" className="hamburger" onClick={() => setSidebarOpen(true)}><i className="fas fa-bars" /></button>
            <h1>Welcome back, {displayName.split(' ')[0]}!</h1>
            <p>Good morning! Here&apos;s what&apos;s happening with your career today.</p>
          </div>
          <div className="actions">
            <button type="button" className="icon-btn"><i className="fas fa-bell" /> <span>Notifications</span></button>
            <Link to="/complete-profile" className="icon-btn" style={{ textDecoration: 'none' }}><i className="fas fa-user-circle" /> <span>Profile</span></Link>
          </div>
        </div>

        <div className="profile-completion">
          <div className="completion-text"><strong>Your profile is 85% complete</strong><br />Complete your profile to get up to 3x more interview opportunities.</div>
          <div className="completion-bar"><div className="fill" style={{ width: '85%' }} /></div>
          <Link to="/complete-profile" className="completion-btn">Complete Profile →</Link>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header"><h3><i className="fas fa-robot" style={{ color: '#2563eb' }} /> AI Resume Score</h3></div>
            <div className="resume-score-grid">
              {[['92%', 'Overall'], ['95%', 'Skills'], ['98%', 'Experience']].map(([score, label]) => (
                <div key={label} className="score-item"><div className="score">{score}</div><div className="label">{label}</div><span className="badge">Excellent</span></div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3><i className="fas fa-briefcase" style={{ color: '#2563eb' }} /> Application Overview</h3></div>
            <div className="app-stats">
              {[['14', 'Applied'], ['5', 'Under Review'], ['2', 'Interview'], ['1', 'Offer']].map(([n, label]) => (
                <div key={label} className="app-stat"><div className="number">{n}</div><div className="label">{label}</div></div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3><i className="fas fa-star" style={{ color: '#f59e0b' }} /> Recommended Jobs</h3></div>
            <div className="job-list">
              {[
                ['AI Engineer', 'Google · Lagos', '93% match'],
                ['Data Scientist', 'Microsoft · Abuja', '93% match'],
                ['ML Engineer', 'Flutterwave · Lagos', '93% match'],
              ].map(([title, company, match]) => (
                <div key={title} className="job-item">
                  <div className="job-info"><div className="title">{title}</div><div className="company">{company}</div></div>
                  <div className="job-meta"><div className="match">{match}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3><i className="fas fa-bolt" style={{ color: '#f59e0b' }} /> Quick Actions</h3></div>
            <div className="quick-actions">
              {['Upload Resume', 'Browse Jobs', 'AI Feedback', 'Saved Jobs'].map((label) => (
                <div key={label} className="quick-action"><i className="fas fa-arrow-right" /><div className="action-label">{label}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
