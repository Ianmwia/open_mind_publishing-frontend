import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios'

// Token storage key
const TOKEN_KEY = 'omp_auth_token'

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

// Response Interceptor: Global response & auth error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear invalid / expired JWT token
      clearAuthToken()
    }
    return Promise.reject(error)
  }
)

export default api
