import { useAuth } from '../AuthContext'

export default function WorkspacePage() {
  const { user, logout } = useAuth()

  return (
    <div className="home-shell">
      <header>
        <div>
          <h2>{user?.role} workspace</h2>
          <p className="muted">{user?.fullName || user?.email}</p>
        </div>
        <button className="btn btn-ghost" type="button" onClick={() => void logout()}>Log out</button>
      </header>
    </div>
  )
}
