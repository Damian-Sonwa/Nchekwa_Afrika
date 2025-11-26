import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import ResetPassword from './pages/ResetPassword'
import ConfirmEmail from './pages/ConfirmEmail'
import Onboarding from './pages/Onboarding'
import UserDetails from './pages/UserDetails'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Resources from './pages/Resources'
import SafetyPlan from './pages/SafetyPlan'
import EvidenceVault from './pages/EvidenceVault'
import Education from './pages/Education'
import Settings from './pages/Settings'
import AdvancedSafety from './pages/AdvancedSafety'
import Wellness from './pages/Wellness'
import Legal from './pages/Legal'
import Community from './pages/Community'
import Tech from './pages/Tech'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  // Debug: Log when App renders
  console.log('App component rendering...')
  
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
          
          {/* Onboarding (first-time users) */}
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* User Details (after signup) */}
          <Route path="/user-details" element={<UserDetails />} />
          
          {/* Protected App Routes */}
          <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="chat" element={<Chat />} />
            <Route path="resources" element={<Resources />} />
            <Route path="safety-plan" element={<SafetyPlan />} />
            <Route path="evidence" element={<EvidenceVault />} />
            <Route path="education" element={<Education />} />
            <Route path="advanced-safety" element={<AdvancedSafety />} />
            <Route path="wellness" element={<Wellness />} />
            <Route path="settings" element={<Settings />} />
            <Route path="legal" element={<Legal />} />
            <Route path="community" element={<Community />} />
            <Route path="tech" element={<Tech />} />
          </Route>
          
          {/* Redirect root to landing */}
          <Route path="/" element={<Navigate to="/landing" replace />} />
        </Routes>
      </Router>
      </AppProvider>
    </ThemeProvider>
  )
}

export default App

