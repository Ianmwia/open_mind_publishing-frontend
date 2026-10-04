import { api } from '@/api'
import type {
  Project,
  ProjectDetail,
  ProjectIn,
  ProjectPatch,
  Assignment,
  AssignmentIn,
  Milestone,
  MilestoneIn,
  MilestonePatch,
  Asset,
  AssetIn,
  User,
} from '@/types/api'

export interface ProjectFilterParams {
  category?: string
  project_type?: string
  status?: string
  language?: string
  search?: string
}

export const projectService = {
  // Core Projects
  async getProjects(params?: ProjectFilterParams): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects/', { params })
    return response.data
  },

  async getProject(id: number | string): Promise<ProjectDetail> {
    const response = await api.get<ProjectDetail>(`/projects/${id}/`)
    return response.data
  },

  async createProject(payload: ProjectIn): Promise<Project> {
    const response = await api.post<Project>('/projects/', payload)
    return response.data
  },

  async updateProject(id: number | string, payload: ProjectPatch): Promise<Project> {
    const response = await api.patch<Project>(`/projects/${id}/`, payload)
    return response.data
  },

  async deleteProject(id: number | string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/projects/${id}/`)
    return response.data
  },

  // Team Assignments
  async getAssignments(projectId: number | string): Promise<Assignment[]> {
    const response = await api.get<Assignment[]>(`/projects/${projectId}/assignments/`)
    return response.data
  },

  async assignContributor(projectId: number | string, payload: AssignmentIn): Promise<Assignment> {
    const response = await api.post<Assignment>(`/projects/${projectId}/assignments/`, payload)
    return response.data
  },

  async removeAssignment(projectId: number | string, assignmentId: number | string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/projects/${projectId}/assignments/${assignmentId}/`)
    return response.data
  },

  // Milestones
  async getMilestones(projectId: number | string): Promise<Milestone[]> {
    const response = await api.get<Milestone[]>(`/projects/${projectId}/milestones/`)
    return response.data
  },

  async createMilestone(projectId: number | string, payload: MilestoneIn): Promise<Milestone> {
    const response = await api.post<Milestone>(`/projects/${projectId}/milestones/`, payload)
    return response.data
  },

  async updateMilestone(projectId: number | string, milestoneId: number | string, payload: MilestonePatch): Promise<Milestone> {
    const response = await api.patch<Milestone>(`/projects/${projectId}/milestones/${milestoneId}/`, payload)
    return response.data
  },

  async deleteMilestone(projectId: number | string, milestoneId: number | string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/projects/${projectId}/milestones/${milestoneId}/`)
    return response.data
  },

  // Assets
  async getAssets(projectId: number | string): Promise<Asset[]> {
    const response = await api.get<Asset[]>(`/projects/${projectId}/assets/`)
    return response.data
  },

  async createAsset(projectId: number | string, payload: AssetIn): Promise<Asset> {
    const response = await api.post<Asset>(`/projects/${projectId}/assets/`, payload)
    return response.data
  },

  async deleteAsset(projectId: number | string, assetId: number | string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/projects/${projectId}/assets/${assetId}/`)
    return response.data
  },

  // Users Directory (from accounts for assigning team members)
  async getUsers(search?: string, role?: string): Promise<User[]> {
    const response = await api.get<User[]>('/accounts/users/', {
      params: { search, role },
    })
    return response.data
  },
}
