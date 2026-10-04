import React from 'react'

const CURRENT_YEAR = new Date().getFullYear()

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          &copy; {CURRENT_YEAR} Open Mind Publishing. All rights reserved.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Publishing workflows for Digital, Language &amp; Chart projects.
        </p>
      </div>
    </footer>
  )
}
