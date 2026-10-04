import React, { useEffect, useState } from 'react'
import { Plus, Search, Filter, Loader2, BookOpen, RefreshCw } from 'lucide-react'
import { projectService, type ProjectFilterParams } from '@/services/projectService'
import type { Project } from '@/types/api'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { Button } from '@/components/ui/button'

export const ProjectsListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filters state
  const [filters, setFilters] = useState<ProjectFilterParams>({
    category: '',
    status: '',
    search: '',
  })

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await projectService.getProjects(filters)
      setProjects(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [filters.category, filters.status])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProjects()
  }

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev])
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Publishing Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your digital storybooks, language readers, and chart publications.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2 self-start md:self-auto">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search form */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by title or description..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500"
          />
        </form>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">All Categories</option>
            <option value="digital">Digital Projects</option>
            <option value="language">Language Projects</option>
            <option value="chart">Charts</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="idea">Idea / Concept</option>
            <option value="drafting">Drafting</option>
            <option value="translation">Translating</option>
            <option value="illustration">Illustration</option>
            <option value="editorial_review">Editorial Review</option>
            <option value="layout_approval">Layout Pre-Press</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <Button variant="ghost" size="icon" onClick={fetchProjects} title="Refresh projects">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Loading projects...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mb-4">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No projects found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Get started by creating your first publishing project.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  )
}
