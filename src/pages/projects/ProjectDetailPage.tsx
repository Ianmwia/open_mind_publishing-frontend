import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  Users,
  CheckSquare,
  FileText,
  Plus,
  Trash2,
  Calendar,
  Globe,
  Tag,
  BookOpen,
  Check,
  Upload,
  UserPlus,
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import type { ProjectDetail, User } from '@/types/api'
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge'
import { ProjectCategoryBadge } from '@/components/projects/ProjectCategoryBadge'
import { Button } from '@/components/ui/button'

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'team' | 'assets'>('overview')

  // Forms modal states
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showAssetModal, setShowAssetModal] = useState(false)

  // New Milestone Form
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    due_date: '',
    notes: '',
  })

  // New Assignment Form
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
  const [selectedRole, setSelectedRole] = useState('author')
  const [deliverableNotes, setDeliverableNotes] = useState('')

  // New Asset Form
  const [newAsset, setNewAsset] = useState({
    title: '',
    asset_type: 'manuscript',
    file_url: '',
    version: 'v1.0',
  })

  const fetchProjectDetail = async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await projectService.getProject(id)
      setProject(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to load project details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectDetail()
  }, [id])

  // Fetch directory users when opening team modal
  useEffect(() => {
    if (showTeamModal && allUsers.length === 0) {
      projectService.getUsers().then(setAllUsers).catch(console.error)
    }
  }, [showTeamModal])

  // --- Handlers for Milestones ---
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !newMilestone.title) return
    try {
      const created = await projectService.createMilestone(project.id, {
        title: newMilestone.title,
        due_date: newMilestone.due_date || null,
        notes: newMilestone.notes,
      })
      setProject({ ...project, milestones: [...project.milestones, created] })
      setShowMilestoneModal(false)
      setNewMilestone({ title: '', due_date: '', notes: '' })
    } catch (err: any) {
      alert(err.message || 'Failed to create milestone')
    }
  }

  const handleToggleMilestone = async (milestoneId: number, currentCompleted: boolean) => {
    if (!project) return
    try {
      const updated = await projectService.updateMilestone(project.id, milestoneId, {
        is_completed: !currentCompleted,
      })
      setProject({
        ...project,
        milestones: project.milestones.map((m) => (m.id === milestoneId ? updated : m)),
      })
    } catch (err: any) {
      alert(err.message || 'Failed to update milestone')
    }
  }

  const handleDeleteMilestone = async (milestoneId: number) => {
    if (!project || !confirm('Are you sure you want to delete this milestone?')) return
    try {
      await projectService.deleteMilestone(project.id, milestoneId)
      setProject({
        ...project,
        milestones: project.milestones.filter((m) => m.id !== milestoneId),
      })
    } catch (err: any) {
      alert(err.message || 'Failed to delete milestone')
    }
  }

  // --- Handlers for Team Assignments ---
  const handleAssignTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !selectedUserId) return
    try {
      const created = await projectService.assignContributor(project.id, {
        user_id: Number(selectedUserId),
        role: selectedRole,
        deliverable_notes: deliverableNotes,
      })
      setProject({ ...project, assignments: [...project.assignments, created] })
      setShowTeamModal(false)
      setSelectedUserId('')
      setDeliverableNotes('')
    } catch (err: any) {
      alert(err.message || 'Failed to assign team member')
    }
  }

  const handleRemoveAssignment = async (assignmentId: number) => {
    if (!project || !confirm('Remove team member from project?')) return
    try {
      await projectService.removeAssignment(project.id, assignmentId)
      setProject({
        ...project,
        assignments: project.assignments.filter((a) => a.id !== assignmentId),
      })
    } catch (err: any) {
      alert(err.message || 'Failed to remove assignment')
    }
  }

  // --- Handlers for Assets ---
  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !newAsset.title) return
    try {
      const created = await projectService.createAsset(project.id, newAsset)
      setProject({ ...project, assets: [...project.assets, created] })
      setShowAssetModal(false)
      setNewAsset({ title: '', asset_type: 'manuscript', file_url: '', version: 'v1.0' })
    } catch (err: any) {
      alert(err.message || 'Failed to add asset')
    }
  }

  const handleDeleteAsset = async (assetId: number) => {
    if (!project || !confirm('Delete this asset?')) return
    try {
      await projectService.deleteAsset(project.id, assetId)
      setProject({
        ...project,
        assets: project.assets.filter((a) => a.id !== assetId),
      })
    } catch (err: any) {
      alert(err.message || 'Failed to delete asset')
    }
  }

  const handleDeleteProject = async () => {
    if (!project || !confirm(`Permanently delete project "${project.title}"?`)) return
    try {
      await projectService.deleteProject(project.id)
      navigate('/projects')
    } catch (err: any) {
      alert(err.message || 'Failed to delete project')
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/projects')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Button>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-600 dark:border-rose-900 dark:bg-rose-950">
          {error || 'Project not found.'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <ProjectCategoryBadge category={project.category} />
              <ProjectStatusBadge status={project.status} />
              {project.is_published && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Published
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {project.title}
            </h1>
          </div>

          <Button variant="outline" onClick={handleDeleteProject} className="gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50">
            <Trash2 className="h-4 w-4" />
            Delete Project
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'milestones', label: `Milestones (${project.milestones?.length || 0})`, icon: CheckSquare },
            { id: 'team', label: `Team (${project.assignments?.length || 0})`, icon: Users },
            { id: 'assets', label: `Assets & Files (${project.assets?.length || 0})`, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Project Description</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {project.description || 'No detailed description available for this project.'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Specifications</h3>
              
              <div className="flex items-center gap-3 text-sm">
                <Globe className="h-4 w-4 text-indigo-500" />
                <div>
                  <div className="font-medium text-slate-700 dark:text-slate-300">Languages</div>
                  <div className="text-slate-500 dark:text-slate-400">
                    {project.primary_language} {project.secondary_language ? `/ ${project.secondary_language}` : ''}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Tag className="h-4 w-4 text-emerald-500" />
                <div>
                  <div className="font-medium text-slate-700 dark:text-slate-300">Target Age Group</div>
                  <div className="text-slate-500 dark:text-slate-400">{project.target_age_group || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <BookOpen className="h-4 w-4 text-amber-500" />
                <div>
                  <div className="font-medium text-slate-700 dark:text-slate-300">ISBN / SKU</div>
                  <div className="text-slate-500 dark:text-slate-400">{project.isbn_or_sku || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="font-medium text-slate-700 dark:text-slate-300">Dimensions / Print Size</div>
                  <div className="text-slate-500 dark:text-slate-400">{project.dimensions || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONES */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Workflow Milestones</h2>
            <Button size="sm" onClick={() => setShowMilestoneModal(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add Milestone
            </Button>
          </div>

          {project.milestones?.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-800">
              No milestones created yet. Click "Add Milestone" to start tracking workflow progress.
            </div>
          ) : (
            <div className="space-y-3">
              {project.milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleMilestone(m.id, m.is_completed)}
                      className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                        m.is_completed
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 hover:border-slate-400 dark:border-slate-700'
                      }`}
                    >
                      {m.is_completed && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <div>
                      <h4 className={`text-sm font-semibold ${m.is_completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                        {m.title}
                      </h4>
                      {m.notes && <p className="text-xs text-slate-500 mt-1">{m.notes}</p>}
                      {m.due_date && <p className="text-xs text-indigo-500 mt-1">Due: {m.due_date}</p>}
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" onClick={() => handleDeleteMilestone(m.id)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TEAM */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Assigned Contributors</h2>
            <Button size="sm" onClick={() => setShowTeamModal(true)} className="gap-2">
              <UserPlus className="h-4 w-4" /> Assign Member
            </Button>
          </div>

          {project.assignments?.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-800">
              No contributors assigned to this project yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {project.assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                  <div>
                    <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 uppercase tracking-wider mb-1">
                      {a.role}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{a.user_name}</h4>
                    {a.deliverable_notes && <p className="text-xs text-slate-500 mt-1">{a.deliverable_notes}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveAssignment(a.id)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ASSETS */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Assets & Manuscripts</h2>
            <Button size="sm" onClick={() => setShowAssetModal(true)} className="gap-2">
              <Upload className="h-4 w-4" /> Add Asset
            </Button>
          </div>

          {project.assets?.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-800">
              No files or assets uploaded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {project.assets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{asset.title}</h4>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {asset.version}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 capitalize">Type: {asset.asset_type}</p>
                    {asset.file_url && (
                      <a href={asset.file_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">
                        View / Download File
                      </a>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteAsset(asset.id)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: MILESTONE */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Milestone</h3>
            <form onSubmit={handleCreateMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Due Date</label>
                <input
                  type="date"
                  value={newMilestone.due_date}
                  onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Notes</label>
                <textarea
                  rows={2}
                  value={newMilestone.notes}
                  onChange={(e) => setNewMilestone({ ...newMilestone, notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowMilestoneModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TEAM ASSIGNMENT */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Assign Team Member</h3>
            <form onSubmit={handleAssignTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">User</label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Select User...</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.pen_name || u.username} ({u.email || 'No email'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="author">Author</option>
                  <option value="co_author">Co-Author</option>
                  <option value="translator">Translator</option>
                  <option value="illustrator">Illustrator</option>
                  <option value="editor">Editor</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="typesetter">Typesetter / Layout Artist</option>
                  <option value="project_manager">Project Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Deliverable Notes</label>
                <input
                  type="text"
                  value={deliverableNotes}
                  onChange={(e) => setDeliverableNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="e.g. Chapter 1-5 French translation"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowTeamModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Assign</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSET */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Asset / Document</h3>
            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Asset Title</label>
                <input
                  type="text"
                  required
                  value={newAsset.title}
                  onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="e.g. Storyboard Draft"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Asset Type</label>
                <select
                  value={newAsset.asset_type}
                  onChange={(e) => setNewAsset({ ...newAsset, asset_type: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="manuscript">Manuscript</option>
                  <option value="illustration">Illustration</option>
                  <option value="cover_art">Cover Art</option>
                  <option value="chart_grid">Chart Grid</option>
                  <option value="proof_pdf">Proof PDF</option>
                  <option value="final_export">Final Export</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">File URL</label>
                <input
                  type="text"
                  value={newAsset.file_url}
                  onChange={(e) => setNewAsset({ ...newAsset, file_url: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Version</label>
                <input
                  type="text"
                  value={newAsset.version}
                  onChange={(e) => setNewAsset({ ...newAsset, version: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAssetModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Asset</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
