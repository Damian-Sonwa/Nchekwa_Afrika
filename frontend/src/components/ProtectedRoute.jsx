import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute({ children }) {
  const { isOnboarded, loading, anonymousId } = useApp()
  const { isAuthenticated } = useAuthStore()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Check both AppContext and Zustand store for authentication
  // If authenticated, allow access
  if (isAuthenticated || (isOnboarded && anonymousId)) {
    return children
  }

  // If not authenticated and no anonymousId, redirect to auth (login)
  if (!isOnboarded && !isAuthenticated && !anonymousId) {
    return <Navigate to="/auth" replace />
  }

  // If has anonymousId but not fully onboarded, show onboarding
  if (anonymousId && !isOnboarded && !isAuthenticated) {
    return <Navigate to="/onboarding" replace />
  }

  // Default: redirect to auth (login) if not authenticated
  return <Navigate to="/auth" replace />
}

