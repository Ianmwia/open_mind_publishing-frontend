export interface Role {
  id: number
  name: string
  description: string
}

export interface User {
  id: number
  username: string
  email?: string
  pen_name: string
  phone: string
  bio: string
  address: string
  specialties_or_languages: string
  portfolio_url: string
  emergency_or_agent_contact: string
  timezone: string
  is_custom: boolean
  roles: Role[]
  created_at: string
  updated_at: string
}

export interface UserPatch {
  username?: string
  email?: string
  pen_name?: string
  phone?: string
  bio?: string
  address?: string
  specialties_or_languages?: string
  portfolio_url?: string
  emergency_or_agent_contact?: string
  timezone?: string
  role_ids?: number[]
}

export type ProjectCategory = 'digital' | 'language' | 'chart'

export type ProjectStatus =
  | 'idea'
  | 'drafting'
  | 'translation'
  | 'illustration'
  | 'layout'
  | 'proofing'
  | 'final_approval'
  | 'published'

export interface Project {
  id: number
  title: string
  description: string
  category: ProjectCategory | string
  project_type: string
  status: ProjectStatus | string
  primary_language: string
  secondary_language: string
  target_age_group: string
  dimensions: string
  isbn_or_sku: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ProjectIn {
  title: string
  description?: string
  category: string
  project_type: string
  status?: string
  primary_language?: string
  secondary_language?: string
  target_age_group?: string
  dimensions?: string
  isbn_or_sku?: string
  is_published?: boolean
}

export interface ProjectPatch {
  title?: string
  description?: string
  category?: string
  project_type?: string
  status?: string
  primary_language?: string
  secondary_language?: string
  target_age_group?: string
  dimensions?: string
  isbn_or_sku?: string
  is_published?: boolean
}

export interface Assignment {
  id: number
  project_id: number
  user_id: number
  user_name: string
  user_email: string
  role: string
  assigned_date: string
  deliverable_notes: string
}

export interface AssignmentIn {
  user_id: number
  role: string
  deliverable_notes?: string
}

export interface Milestone {
  id: number
  project_id: number
  title: string
  due_date?: string | null
  is_completed: boolean
  completed_at?: string | null
  notes: string
  order: number
}

export interface MilestoneIn {
  title: string
  due_date?: string | null
  is_completed?: boolean
  notes?: string
  order?: number
}

export interface MilestonePatch {
  title?: string
  due_date?: string | null
  is_completed?: boolean
  notes?: string
  order?: number
}

export interface Asset {
  id: number
  project_id: number
  title: string
  asset_type: string
  file_url: string
  version: string
  created_at: string
}

export interface AssetIn {
  title: string
  asset_type: string
  file_url?: string
  version?: string
}

export interface ProjectDetail extends Project {
  assignments: Assignment[]
  milestones: Milestone[]
  assets: Asset[]
}
