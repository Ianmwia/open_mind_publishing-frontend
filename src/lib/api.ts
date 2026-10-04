import type {
  Role,
  User,
  UserPatch,
  Project,
  ProjectIn,
  ProjectPatch,
  ProjectDetail,
  Assignment,
  AssignmentIn,
  Milestone,
  MilestoneIn,
  MilestonePatch,
  Asset,
  AssetIn,
} from '../types/api'

const API_BASE_URL = '/api'
const TOKEN_STORAGE_KEY = 'omp_auth_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorDetail = response.statusText
    try {
      const errJson = await response.json()
      errorDetail = errJson.message || errJson.detail || JSON.stringify(errJson)
    } catch {
      // ignore
    }
    throw new Error(errorDetail || `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export const api = {
  // --- AUTHENTICATION (Allauth Headless) ---
  auth: {
    async getSession(): Promise<{ meta: Record<string, unknown>; user?: User }> {
      return request('/auth/client/')
    },
    async login(data: Record<string, unknown>) {
      const res = await request<{ data?: { user?: User; session_token?: string }; token?: string }>('/login/', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      const token = res.token || res.data?.session_token
      if (token) {
        setStoredToken(token)
      }
      return res
    },
    async signup(data: Record<string, unknown>) {
      return request('/signup/', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    async logout() {
      try {
        await request('/api/logout/', { method: 'POST' })
      } finally {
        setStoredToken(null)
      }
    },
  },

  // --- ACCOUNTS & DIRECTORY ---
  accounts: {
    async getRoles(): Promise<Role[]> {
      return request<Role[]>('/accounts/roles/')
    },
    async getProfile(): Promise<User> {
      return request<User>('/accounts/get_profile')
    },
    async updateProfile(payload: UserPatch): Promise<User> {
      return request<User>('/accounts/update_profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    },
    async getUsers(role?: string, search?: string): Promise<User[]> {
      const params = new URLSearchParams()
      if (role) params.set('role', role)
      if (search) params.set('search', search)
      const q = params.toString() ? `?${params.toString()}` : ''
      return request<User[]>(`/accounts/users/${q}`)
    },
    async getUserDetail(userId: number): Promise<User> {
      return request<User>(`/accounts/users/${userId}/`)
    },
    async deleteAccount(): Promise<{ message: string }> {
      return request<{ message: string }>('/accounts/delete_account', {
        method: 'DELETE',
      })
    },
  },

  // --- PROJECTS ---
  projects: {
    async list(filters?: {
      category?: string
      project_type?: string
      status?: string
      language?: string
      search?: string
    }): Promise<Project[]> {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, val]) => {
          if (val) params.set(key, val)
        })
      }
      const q = params.toString() ? `?${params.toString()}` : ''
      return request<Project[]>(`/projects/${q}`)
    },
    async get(id: number): Promise<ProjectDetail> {
      return request<ProjectDetail>(`/projects/${id}/`)
    },
    async create(payload: ProjectIn): Promise<Project> {
      return request<Project>('/projects/', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
    async update(id: number, payload: ProjectPatch): Promise<Project> {
      return request<Project>(`/projects/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    },
    async delete(id: number): Promise<{ message: string }> {
      return request<{ message: string }>(`/projects/${id}/`, {
        method: 'DELETE',
      })
    },
  },

  // --- ASSIGNMENTS ---
  assignments: {
    async list(projectId: number): Promise<Assignment[]> {
      return request<Assignment[]>(`/projects/${projectId}/assignments/`)
    },
    async assign(projectId: number, payload: AssignmentIn): Promise<Assignment> {
      return request<Assignment>(`/projects/${projectId}/assignments/`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
    async remove(projectId: number, assignmentId: number): Promise<{ message: string }> {
      return request<{ message: string }>(`/projects/${projectId}/assignments/${assignmentId}/`, {
        method: 'DELETE',
      })
    },
  },

  // --- MILESTONES ---
  milestones: {
    async list(projectId: number): Promise<Milestone[]> {
      return request<Milestone[]>(`/projects/${projectId}/milestones/`)
    },
    async create(projectId: number, payload: MilestoneIn): Promise<Milestone> {
      return request<Milestone>(`/projects/${projectId}/milestones/`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
    async update(projectId: number, milestoneId: number, payload: MilestonePatch): Promise<Milestone> {
      return request<Milestone>(`/projects/${projectId}/milestones/${milestoneId}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    },
    async delete(projectId: number, milestoneId: number): Promise<{ message: string }> {
      return request<{ message: string }>(`/projects/${projectId}/milestones/${milestoneId}/`, {
        method: 'DELETE',
      })
    },
  },

  // --- ASSETS ---
  assets: {
    async list(projectId: number): Promise<Asset[]> {
      return request<Asset[]>(`/projects/${projectId}/assets/`)
    },
    async create(projectId: number, payload: AssetIn): Promise<Asset> {
      return request<Asset>(`/projects/${projectId}/assets/`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
    async delete(projectId: number, assetId: number): Promise<{ message: string }> {
      return request<{ message: string }>(`/projects/${projectId}/assets/${assetId}/`, {
        method: 'DELETE',
      })
    },
  },
}
