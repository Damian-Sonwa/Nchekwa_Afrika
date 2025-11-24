import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Zustand Auth Store for Nchekwa_Afrika App
 * 
 * Manages authentication state, user data, and tokens.
 * Persists to localStorage for session continuity.
 */

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      anonymousId: null,
      
      // Initialize from localStorage on mount
      _hasHydrated: false,
      
      // Actions
      setUser: (userData) => {
        set({ 
          user: userData,
          isAuthenticated: !!userData 
        })
      },
      
      setToken: (token) => {
        set({ token })
        // Store token in axios default headers if needed
        if (token) {
          // Token will be added to requests via axios interceptor
        }
      },
      
      setAnonymousId: (id) => {
        set({ anonymousId: id })
        localStorage.setItem('anonymousId', id)
      },
      
      login: (userData, token, anonymousId) => {
        set({
          user: userData,
          token: token || null,
          anonymousId: anonymousId || null,
          isAuthenticated: true
        })
        if (anonymousId) {
          localStorage.setItem('anonymousId', anonymousId)
        }
        if (token) {
          localStorage.setItem('token', token)
        }
        // Ensure isOnboarded is set
        localStorage.setItem('isOnboarded', 'true')
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          anonymousId: null,
          isAuthenticated: false
        })
        localStorage.removeItem('token')
        localStorage.removeItem('anonymousId')
        localStorage.removeItem('isOnboarded')
        localStorage.removeItem('userDetailsCompleted')
      },
      
      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      }
    }),
    {
      name: 'nchekwa-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        anonymousId: state.anonymousId,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true
          // Sync with localStorage token if exists
          const token = localStorage.getItem('token')
          if (token && !state.token) {
            state.token = token
            state.isAuthenticated = true
          }
        }
      }
    }
  )
)


