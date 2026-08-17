import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import SignupPage from "./pages/SignupPage" // <-- THIS LINE
import LandingPage from "./pages/LandingPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} /> {/* <-- AND THIS LINE */}
      </Routes>
    </Router>
  )
}
export default App