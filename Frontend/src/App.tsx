import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboardPage from './pages/AdminDashboardPage'
import CandidateDashboardPage from './pages/CandidateDashboardPage'
import CompleteProfilePage from './pages/CompleteProfilePage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import WorkspacePage from './pages/WorkspacePage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/complete-profile" element={<CompleteProfilePage />} />
          <Route
            path="/employer"
            element={(
              <ProtectedRoute role="employer">
                <WorkspacePage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/recruiter"
            element={(
              <ProtectedRoute role="recruiter">
                <WorkspacePage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin"
            element={(
              <ProtectedRoute role="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            )}
          />
          <Route path="/candidate" element={<CandidateDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
