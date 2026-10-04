import React, { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { projectService } from '@/services/projectService'
import type { Project, ProjectIn } from '@/types/api'
import { Button } from '@/components/ui/button'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated: (newProject: Project) => void
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ProjectIn>({
    title: '',
    description: '',
    category: 'digital',
    project_type: 'english_storybook',
    status: 'idea',
    primary_language: 'English',
    secondary_language: '',
    target_age_group: '',
    dimensions: '',
    isbn_or_sku: '',
    is_published: false,
  })

  if (!isOpen) return null

  const projectTypesByCategory: Record<string, { value: string; label: string }[]> = {
    digital: [
      { value: 'english_storybook', label: 'English Storybook' },
      { value: 'french_storybook', label: 'French Storybook' },
      { value: 'digital_storybook', label: 'Storybook (General)' },
    ],
    language: [
      { value: 'bilingual_reader', label: 'Bilingual Reader' },
      { value: 'bilingual_vocabulary', label: 'Bilingual Vocabulary Book' },
    ],
    chart: [
      { value: 'alphabet_chart', label: 'Alphabet Chart' },
      { value: 'syllable_chart', label: 'Syllable Chart' },
    ],
  }

  const handleCategoryChange = (cat: string) => {
    const defaultType = projectTypesByCategory[cat]?.[0]?.value || ''
    setFormData((prev) => ({
      ...prev,
      category: cat,
      project_type: defaultType,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setError('Project title is required.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const created = await projectService.createProject(formData)
      onProjectCreated(created)
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.detail || err.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Project</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. My First Bilingual Adventure"
            />
          </div>

          {/* Category & Project Type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="digital">Digital Projects</option>
                <option value="language">Language Projects</option>
                <option value="chart">Charts</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Project Type *
              </label>
              <select
                value={formData.project_type}
                onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {projectTypesByCategory[formData.category]?.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Target Age Group */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="idea">Idea / Concept</option>
                <option value="drafting">Manuscript Drafting</option>
                <option value="translation">Translating</option>
                <option value="illustration">Illustration / Graphic Design</option>
                <option value="editorial_review">Editorial Review & Proofreading</option>
                <option value="layout_approval">Layout & Pre-Press Approval</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Target Age Group
              </label>
              <input
                type="text"
                value={formData.target_age_group}
                onChange={(e) => setFormData({ ...formData, target_age_group: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. Ages 3-5, Grades 1-3"
              />
            </div>
          </div>

          {/* Languages */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Primary Language
              </label>
              <input
                type="text"
                value={formData.primary_language}
                onChange={(e) => setFormData({ ...formData, primary_language: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. English"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Secondary Language (Optional)
              </label>
              <input
                type="text"
                value={formData.secondary_language}
                onChange={(e) => setFormData({ ...formData, secondary_language: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. French, Swahili"
              />
            </div>
          </div>

          {/* Dimensions & ISBN/SKU */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Dimensions / Print Size
              </label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. A1, 8.5x11 inches"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                ISBN or SKU
              </label>
              <input
                type="text"
                value={formData.isbn_or_sku}
                onChange={(e) => setFormData({ ...formData, isbn_or_sku: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. 978-3-16-148410-0"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="Brief summary or concept overview..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
