import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Globe, Tag, Calendar, ArrowRight } from 'lucide-react'
import type { Project } from '@/types/api'
import { ProjectStatusBadge } from './ProjectStatusBadge'
import { ProjectCategoryBadge } from './ProjectCategoryBadge'

interface ProjectCardProps {
  project: Project
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const formattedDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div>
        {/* Category & Status Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <ProjectCategoryBadge category={project.category} />
          <ProjectStatusBadge status={project.status} />
        </div>

        {/* Project Title */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {project.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">
          {project.description || 'No description provided.'}
        </p>

        {/* Meta Info */}
        <div className="mt-4 flex flex-wrap gap-y-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 mr-4">
            <Globe className="h-3.5 w-3.5 text-indigo-500" />
            <span>
              {project.primary_language}
              {project.secondary_language ? ` / ${project.secondary_language}` : ''}
            </span>
          </div>

          {project.target_age_group && (
            <div className="flex items-center gap-1.5 mr-4">
              <Tag className="h-3.5 w-3.5 text-emerald-500" />
              <span>{project.target_age_group}</span>
            </div>
          )}

          {project.isbn_or_sku && (
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-amber-500" />
              <span>{project.isbn_or_sku}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formattedDate}
        </span>

        <Link
          to={`/projects/${project.id}`}
          className="flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          View Details
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
