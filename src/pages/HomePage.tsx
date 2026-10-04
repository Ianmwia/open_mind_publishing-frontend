import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Languages, Layers, ShieldCheck, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge
          variant="outline"
          className="gap-1.5 py-1 px-3 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
        >
          Open Mind Publishing Platform
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Open Mind Publishing Management
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Manage digital publications, language translation workflows, and educational chart projects.
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-4">
          {isAuthenticated ? (
            <Link to="/profile">
              <Button size="lg" className="gap-2">
                Manage Profile ({user?.pen_name || user?.username})
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/signup">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-2">
              <BookOpen className="h-5 w-5" />
            </div>
            <CardTitle>Digital Books</CardTitle>
            <CardDescription>
              Storybooks, manuscripts, cover artwork, and proof PDFs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track project milestones from initial idea and drafting to proofing and final approval.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-2">
              <Languages className="h-5 w-5" />
            </div>
            <CardTitle>Language Adaptation</CardTitle>
            <CardDescription>
              Bilingual readers, translation workflows, and localizations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Coordinate translators and reviewers across primary and secondary languages.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-2">
              <Layers className="h-5 w-5" />
            </div>
            <CardTitle>Educational Charts</CardTitle>
            <CardDescription>
              Alphabet charts, poster dimensions, grid structures, and print outputs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage specs, print dimensions, and ISBN / SKU registries for physical releases.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Roles Link */}
      <Card className="border-indigo-100 dark:border-indigo-950 bg-indigo-50/50 dark:bg-indigo-950/20">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Custom Roles &amp; Team Contributor Directory
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Authors, illustrators, translators, editors, and reviewers collaborate seamlessly.
              </p>
            </div>
          </div>
          <Link to="/profile">
            <Button variant="secondary" className="shrink-0">
              Manage Profile &amp; Roles
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
