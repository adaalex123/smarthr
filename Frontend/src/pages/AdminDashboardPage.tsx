import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { apiRequest } from '../api/client'
import '../styles/admin-dashboard.css'

type AdminUser = { username: string; role: string }

export default function AdminDashboardPage() {
  const { user, logout, accessToken } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accessToken) {
      navigate('/login')
      return
    }
    void loadData()
  }, [accessToken, navigate])

  async function loadData() {
    setLoading(true)
    try {
      const data = await apiRequest('/admin/users')
      setUsers(data.users ?? [])
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="admin-dashboard">
      <div className="navbar">
        <h2>AI Resume Screener - Admin</h2>
        <button type="button" onClick={() => void handleLogout()}>Logout</button>
      </div>

      <div className="container">
        <div className="stats">
          <div className="card"><h3>Total Users</h3><p>{users.length || 3}</p></div>
          <div className="card"><h3>Total Jobs</h3><p>12</p></div>
          <div className="card"><h3>Resumes Screened</h3><p>145</p></div>
          <div className="card"><h3>API Calls</h3><p>1024</p></div>
        </div>

        <div className="card">
          <h2>Manage Users</h2>
          {loading ? <p>Loading users...</p> : (
            <table>
              <thead>
                <tr><th>Username</th><th>Role</th><th>Action</th></tr>
              </thead>
              <tbody>
                {users.length ? users.map((u) => (
                  <tr key={u.username}>
                    <td>{u.username}</td>
                    <td>{u.role}</td>
                    <td><button type="button" className="btn-danger">Delete</button></td>
                  </tr>
                )) : (
                  <tr><td colSpan={3}>No users loaded — connect admin API or use demo data.</td></tr>
                )}
              </tbody>
            </table>
          )}
          <button type="button" className="btn-primary" style={{ marginTop: 16 }}>+ Add User</button>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <h2>API Access</h2>
          <p>Signed in as {user?.email ?? 'admin'}. Your API Key: <b>sk-demo-12345-ADMIN</b></p>
        </div>
      </div>
    </div>
  )
}
