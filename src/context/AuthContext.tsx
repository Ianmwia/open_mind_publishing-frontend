import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, { getAuthToken, setAuthToken, clearAuthToken } from '@/api'
import type { User, Role } from '@/types/api'

interface LoginPayload {
  username?: string
  email?: string
  password: string
}

interface SignupPayload {
  username: string
  email: string
  password: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginPayload) => Promise<void>
  signup: (payload: SignupPayload) => Promise<void>
  logout: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ message?: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  refreshProfile: () => Promise<User | null>
  updateProfile: (data: Partial<User> & { role_ids?: number[] }) => Promise<User>
  fetchRoles: () => Promise<Role[]>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(() => getAuthToken())
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Fetch full profile from our backend accounts API
  const refreshProfile = useCallback(async (): Promise<User | null> => {
    const currentToken = getAuthToken()
    if (!currentToken) {
      setUser(null)
      return null
    }

    try {
      const response = await api.get<User>('/accounts/get_profile')
      setUser(response.data)
      return response.data
    } catch (error) {
      console.warn('Failed to load user profile or token expired:', error)
      clearAuthToken()
      setTokenState(null)
      setUser(null)
      return null
    }
  }, [])

  // Initial check on mount
  useEffect(() => {
    const initAuth = async () => {
      const existingToken = getAuthToken()
      if (existingToken) {
        setTokenState(existingToken)
        await refreshProfile()
      }
      setIsLoading(false)
    }

    initAuth()
  }, [refreshProfile])

  // Login handler
  const login = async (credentials: LoginPayload) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/account/login/', credentials)
      
      // Allauth headless JWT strategy returns session_token in data or header
      const receivedToken =
        response.data?.data?.session_token ||
        response.data?.token ||
        response.data?.session_token ||
        response.headers['x-session-token']

      if (receivedToken) {
        setAuthToken(receivedToken)
        setTokenState(receivedToken)
      }

      await refreshProfile()
    } finally {
      setIsLoading(false)
    }
  }

  // Signup handler
  const signup = async (payload: SignupPayload) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/account/signup/', payload)
      
      const receivedToken =
        response.data?.data?.session_token ||
        response.data?.token ||
        response.data?.session_token ||
        response.headers['x-session-token']

      if (receivedToken) {
        setAuthToken(receivedToken)
        setTokenState(receivedToken)
        await refreshProfile()
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout handler
  const logout = async () => {
    setIsLoading(true)
    try {
      await api.post('/auth/account/logout/').catch(() => {
        // Ignore network errors on logout
      })
    } finally {
      clearAuthToken()
      setTokenState(null)
      setUser(null)
      setIsLoading(false)
    }
  }

  // Request password reset email (Allauth)
  const requestPasswordReset = async (email: string) => {
    const response = await api.post('/auth/account/request-password/', { email })
    return response.data
  }

  // Change password (Allauth)
  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.post('/auth/account/change-password/', {
      current_password: currentPassword,
      new_password: newPassword,
    })
  }

  // Update profile in our own accounts app
  const updateProfile = async (data: Partial<User> & { role_ids?: number[] }) => {
    const response = await api.patch<User>('/accounts/update_profile', data)
    setUser(response.data)
    return response.data
  }

  // Fetch all system roles
  const fetchRoles = async (): Promise<Role[]> => {
    const response = await api.get<Role[]>('/accounts/roles/')
    return response.data
  }

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    signup,
    logout,
    requestPasswordReset,
    changePassword,
    refreshProfile,
    updateProfile,
    fetchRoles,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
