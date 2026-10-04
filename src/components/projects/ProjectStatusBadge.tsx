import React from 'react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  idea: { label: 'Idea / Concept', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  drafting: { label: 'Drafting', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  translation: { label: 'Translating', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  illustration: { label: 'Illustration / Design', color: 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800' },
  editorial_review: { label: 'Editorial Review', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
  layout_approval: { label: 'Layout & Pre-Press', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' },
  published: { label: 'Published', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  archived: { label: 'Archived', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700' },
}

export const ProjectStatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => {
  const conf = STATUS_LABELS[status] || { label: status, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700' }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${conf.color} ${className}`}>
      {conf.label}
    </span>
  )
}
