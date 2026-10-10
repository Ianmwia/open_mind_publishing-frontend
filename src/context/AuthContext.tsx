import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, { getAuthToken, setAuthToken, clearAuthToken, setRefreshToken, clearRefreshToken } from '@/api'
import type { User, Role } from '@/types/api'

// ─── Auth endpoint constants (matching backend urls.py) ──────────────────────
const AUTH_URLS = {
  LOGIN: '/auth/login/',
  SIGNUP: '/auth/signup/',
  SESSION: '/auth/session/',
  LOGOUT: '/auth/session/',         // DELETE on /auth/session/ = logout
  CHANGE_PASSWORD: '/auth/password/change/',
  REQUEST_RESET: '/auth/password/request/',
  RESET_PASSWORD: '/auth/password/reset/',
} as const

// ─── Helper: extract JWT access_token and refresh_token from allauth headless response ─────────
// Allauth JWT strategy places the access_token and refresh_token inside response.data.meta
function extractJwtTokens(responseData: Record<string, unknown>): { accessToken: string | null; refreshToken: string | null } {
  const meta = responseData?.meta as Record<string, unknown> | undefined
  return {
    accessToken: (meta?.access_token && typeof meta.access_token === 'string') ? meta.access_token : null,
    refreshToken: (meta?.refresh_token && typeof meta.refresh_token === 'string') ? meta.refresh_token : null,
  }
}

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
  requestPasswordReset: (email: string) => Promise<void>
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

  // Fetch full profile from our accounts app
  const refreshProfile = useCallback(async (): Promise<User | null> => {
    const currentToken = getAuthToken()
    if (!currentToken) {
      setUser(null)
      return null
    }
    try {
      const response = await api.get<User>('/accounts/get_profile/')
      setUser(response.data)
      return response.data
    } catch {
      clearAuthToken()
      clearRefreshToken()
      setTokenState(null)
      setUser(null)
      return null
    }
  }, [])

  // On mount: restore session if token exists
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

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (credentials: LoginPayload) => {
    setIsLoading(true)
    try {
      const response = await api.post<Record<string, unknown>>(AUTH_URLS.LOGIN, credentials)
      const { accessToken, refreshToken } = extractJwtTokens(response.data)
      if (!accessToken) {
        throw new Error('Login succeeded but no JWT access_token was returned. Check HEADLESS_TOKEN_STRATEGY in Django settings.')
      }
      setAuthToken(accessToken)
      if (refreshToken) {
        setRefreshToken(refreshToken)
      }
      setTokenState(accessToken)
      await refreshProfile()
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Signup ───────────────────────────────────────────────────────────────
  const signup = async (payload: SignupPayload) => {
    setIsLoading(true)
    try {
      const response = await api.post<Record<string, unknown>>(AUTH_URLS.SIGNUP, payload)
      const { accessToken, refreshToken } = extractJwtTokens(response.data)
      if (accessToken) {
        setAuthToken(accessToken)
        if (refreshToken) {
          setRefreshToken(refreshToken)
        }
        setTokenState(accessToken)
        await refreshProfile()
      }
      // If no token returned it may require email verification first
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Logout (DELETE /auth/session/) ──────────────────────────────────────
  const logout = async () => {
    setIsLoading(true)
    try {
      await api.post(AUTH_URLS.LOGOUT).catch(() => {
        // Ignore network errors on logout — clear local state regardless
      })
    } finally {
      clearAuthToken()
      clearRefreshToken()
      setTokenState(null)
      setUser(null)
      setIsLoading(false)
    }
  }

  // ─── Request password reset email ────────────────────────────────────────
  const requestPasswordReset = async (email: string) => {
    await api.post(AUTH_URLS.REQUEST_RESET, { email })
  }

  // ─── Change password (must be authenticated) ──────────────────────────────
  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.post(AUTH_URLS.CHANGE_PASSWORD, {
      current_password: currentPassword,
      new_password: newPassword,
    })
  }

  // ─── Update profile fields via our accounts app ───────────────────────────
  const updateProfile = async (data: Partial<User> & { role_ids?: number[] }) => {
    const response = await api.patch<User>('/accounts/update_profile/', data)
    setUser(response.data)
    return response.data
  }

  // ─── Fetch system roles list ──────────────────────────────────────────────
  const fetchRoles = async (): Promise<Role[]> => {
    const response = await api.get<Role[]>('/accounts/roles/')
    return response.data
  }

  const value: AuthContextType = {
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
