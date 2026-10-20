import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { User, AuthState } from '../types'
import api from '../utils/api'

// ── Actions ────────────────────────────────────────────────────
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'LOGIN_SUCCESS':
      return { user: action.payload.user, token: action.payload.token, isLoading: false }
    case 'LOGOUT':
      return { user: null, token: null, isLoading: false }
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null }
    default:
      return state
  }
}

// ── Context ────────────────────────────────────────────────────
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  isAdmin: boolean
  isUstad: boolean
  isStudent: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: true,
  })

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('qasmia_token')
    const userJson = localStorage.getItem('qasmia_user')
    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = async (username: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const res = await api.post('/auth/login', { username, password })
      const { user, token } = res.data.data
      localStorage.setItem('qasmia_token', token)
      localStorage.setItem('qasmia_user', JSON.stringify(user))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false })
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('qasmia_token')
    localStorage.removeItem('qasmia_user')
    delete api.defaults.headers.common['Authorization']
    dispatch({ type: 'LOGOUT' })
  }

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates })
    const stored = localStorage.getItem('qasmia_user')
    if (stored) {
      const user = JSON.parse(stored)
      localStorage.setItem('qasmia_user', JSON.stringify({ ...user, ...updates }))
    }
  }

  const isAdmin   = state.user?.role === 'super_admin' || state.user?.role === 'admin'
  const isUstad   = state.user?.role === 'ustad'
  const isStudent = state.user?.role === 'student'

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser, isAdmin, isUstad, isStudent }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
