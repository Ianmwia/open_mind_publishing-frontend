import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios'

// Token storage keys
const TOKEN_KEY = 'omp_auth_token'
const REFRESH_TOKEN_KEY = 'omp_refresh_token'

// Helper utilities to manage JWT token in localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

// Helper utilities to manage refresh token
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export const clearRefreshToken = (): void => {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// Create centralized Axios instance
export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 
         (import.meta.env.PROD ? 'https://open-mind-publishing.onrender.com/api' : 'http://localhost:8000/api'),
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor: Attach JWT Bearer token if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
      config.headers['X-Session-Token'] = token
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Global response & auth error handling with token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        // No refresh token available, clear auth and reject
        clearAuthToken()
        clearRefreshToken()
        return Promise.reject(error)
      }

      try {
        // Call session endpoint with refresh token to get new access token
        const response = await api.post('/auth/session/', { refresh_token: refreshToken })
        const meta = response.data?.meta as Record<string, unknown> | undefined

        if (meta?.access_token && typeof meta.access_token === 'string') {
          const newAccessToken = meta.access_token
          setAuthToken(newAccessToken)

          // Update refresh token if rotated (default behavior in allauth)
          if (meta.refresh_token && typeof meta.refresh_token === 'string') {
            setRefreshToken(meta.refresh_token)
          }

          // Update Authorization header for the failed request
          originalRequest.headers!.Authorization = `Bearer ${newAccessToken}`

          // Retry the original request
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens
        clearAuthToken()
        clearRefreshToken()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
