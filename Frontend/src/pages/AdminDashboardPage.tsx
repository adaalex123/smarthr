import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { apiRequest } from '../api/client'
import '../styles/admin-dashboard.css'

type AdminUser = {
  id: number
  fullName: string
  email: string
  role: 'admin' | 'employer' | 'recruiter' | 'candidate'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
}

type DashboardStats = {
  totalUsers: number
  totalRecruiters: number
  totalCandidates: number
  totalAdmins: number
}

const STATUSES: AdminUser['status'][] = ['active', 'inactive', 'suspended']

export default function AdminDashboardPage() {
  const { user, logout, accessToken } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [activeNav, setActiveNav] = useState('dashboard')

  useEffect(() => {
    if (!accessToken) {
      navigate('/login')
      return
    }
    void loadData()
  }, [accessToken, navigate])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [dashboard, usersData] = await Promise.all([
        apiRequest<{ data?: DashboardStats }>('/admin/dashboard'),
        apiRequest<{ users?: AdminUser[] }>('/admin/users'),
      ])
      setStats(dashboard.data ?? null)
      setUsers(usersData.users ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load admin dashboard')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(target: AdminUser, status: AdminUser['status']) {
    if (target.status === status) return
    setUpdatingUserId(target.id)
    setError('')
    try {
      await apiRequest(`/admin/users/${target.id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'updateStatus', data: { status } }),
      })
      setUsers((current) => current.map((u) => (u.id === target.id ? { ...u, status } : u)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update user status')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const recentUsers = useMemo(() => users.slice(0, 10), [users])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Admin'
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? users.length, icon: 'U', accent: 'purple' },
    { label: 'Recruiters', value: stats?.totalRecruiters ?? users.filter((u) => u.role === 'employer' || u.role === 'recruiter').length, icon: 'R', accent: 'blue' },
    { label: 'Candidates', value: stats?.totalCandidates ?? users.filter((u) => u.role === 'candidate').length, icon: 'C', accent: 'pink' },
    { label: 'Admins', value: stats?.totalAdmins ?? users.filter((u) => u.role === 'admin').length, icon: 'A', accent: 'green' },
  ]

  return (
    <div className="ad-shell">
      {/* Sidebar */}
      <aside className="ad-sidebar">
        <div className="ad-sidebar-brand">
          <Link to="/" className="ad-logo-block"><span>SH</span> SmartHR</Link>
        </div>

        <div className="ad-profile-mini">
          <div className="ad-avatar">{initials}</div>
          <div>
            <strong>{displayName}</strong>
            <p>Administrator</p>
          </div>
        </div>

        <nav className="ad-nav">
          <p className="ad-nav-label">Console</p>
          {[
            { id: 'dashboard', icon: 'D', label: 'Dashboard' },
            { id: 'users', icon: 'U', label: 'Users' },
            { id: 'settings', icon: 'S', label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={`ad-nav-item${activeNav === item.id ? ' active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="ad-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <button type="button" className="ad-nav-item ad-nav-logout" onClick={() => void handleLogout()}>
            <span className="ad-nav-icon">L</span> Log Out
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="ad-main">
        <header className="ad-topbar">
          <div>
            <h1>Admin dashboard</h1>
            <nav className="ad-breadcrumb">
              <span>Admin</span>
              <span className="ad-bc-sep">/</span>
              <span>{activeNav === 'users' ? 'Users' : activeNav === 'settings' ? 'Settings' : 'Dashboard'}</span>
              <span className="ad-bc-sep">/</span>
              <span className="ad-bc-active">Platform control</span>
            </nav>
          </div>
          <button type="button" className="ad-topbar-btn" onClick={() => void loadData()}>Refresh</button>
        </header>

        {error && <div className="ad-banner">{error}</div>}

        {/* Stat cards */}
        <div className="ad-stat-row">
          {statCards.map((card) => (
            <article key={card.label} className="ad-stat-card">
              <div className={`ad-stat-icon ad-stat-icon--${card.accent}`}>{card.icon}</div>
              <div>
                <span className="ad-stat-num">{card.value}</span>
                <span className="ad-stat-label">{card.label}</span>
              </div>
            </article>
          ))}
        </div>

        {/* Users table */}
        <section className="ad-card">
          <div className="ad-card-head">
            <h2>Recent Users</h2>
            <span className="ad-muted">{users.length} total</span>
          </div>

          {loading ? (
            <p className="ad-muted">Loading users...</p>
          ) : (
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.fullName || '-'}</strong></td>
                      <td className="ad-muted-cell">{item.email}</td>
                      <td><span className="ad-pill">{item.role}</span></td>
                      <td>
                        <select
                          value={item.status}
                          disabled={updatingUserId === item.id}
                          onChange={(e) => void updateStatus(item, e.target.value as AdminUser['status'])}
                          className={`ad-status-select ad-status--${item.status}`}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="ad-muted-cell">{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="ad-footnote">
          Signed in as <strong>{user?.email}</strong>
        </footer>
      </main>
    </div>
  )
}
