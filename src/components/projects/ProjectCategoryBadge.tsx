import React from 'react'

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  digital: { label: 'Digital Projects', color: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border-violet-200 dark:border-violet-800' },
  language: { label: 'Language Projects', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  chart: { label: 'Charts', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
}

export const ProjectCategoryBadge: React.FC<{ category: string; className?: string }> = ({ category, className = '' }) => {
  const conf = CATEGORY_LABELS[category] || { label: category, color: 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-200 dark:border-slate-800' }
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${conf.color} ${className}`}>
      {conf.label}
    </span>
  )
}
