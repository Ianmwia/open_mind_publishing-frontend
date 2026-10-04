import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User as UserIcon,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Globe,
  Briefcase,
  Phone,
  Clock,
  Sparkles,
  Save,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type { Role } from '@/types/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading, updateProfile, fetchRoles } = useAuth()
  const navigate = useNavigate()

  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])

  const [penName, setPenName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [address, setAddress] = useState('')
  const [specialties, setSpecialties] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [timezone, setTimezone] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isLoading, isAuthenticated, navigate])

  // Load roles & populate initial form data
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await fetchRoles()
        setAvailableRoles(roles)
      } catch (err) {
        console.error('Failed to load roles:', err)
      }
    }
    loadRoles()
  }, [fetchRoles])

  useEffect(() => {
    if (user) {
      setPenName(user.pen_name || '')
      setPhone(user.phone || '')
      setBio(user.bio || '')
      setAddress(user.address || '')
      setSpecialties(user.specialties_or_languages || '')
      setPortfolioUrl(user.portfolio_url || '')
      setEmergencyContact(user.emergency_or_agent_contact || '')
      setTimezone(user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
      setSelectedRoleIds(user.roles?.map((r: Role) => r.id) || [])
    }
  }, [user])

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    try {
      await updateProfile({
        pen_name: penName,
        phone,
        bio,
        address,
        specialties_or_languages: specialties,
        portfolio_url: portfolioUrl,
        emergency_or_agent_contact: emergencyContact,
        timezone,
        role_ids: selectedRoleIds,
      })
      setSuccessMsg('Your profile and roles were updated successfully!')
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message || 'Failed to update profile.')
      } else {
        setErrorMsg('Failed to update profile.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <UserIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Account &amp; Publishing Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your publishing identities, roles, specialties, and contact details
          </p>
        </div>

        <Link to="/change-password">
          <Button variant="outline" className="gap-2">
            <KeyRound className="h-4 w-4" />
            Change Password
          </Button>
        </Link>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 p-4 text-sm text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Overview & Roles */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Publishing Identity</CardTitle>
              <CardDescription>Primary account identifiers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs uppercase text-slate-400 tracking-wider">Username</Label>
                <div className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                  @{user.username}
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase text-slate-400 tracking-wider">Email Address</Label>
                <div className="mt-1 text-sm text-slate-700 dark:text-slate-300 break-all">
                  {user.email || 'No email provided'}
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase text-slate-400 tracking-wider">Member Since</Label>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publishing Roles Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <CardTitle className="text-lg">Assigned Roles</CardTitle>
              </div>
              <CardDescription>Select all roles applicable to you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableRoles.length === 0 ? (
                <p className="text-xs text-slate-400">Loading roles...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map((role) => {
                    const isSelected = selectedRoleIds.includes(role.id)
                    return (
                      <button
                        type="button"
                        key={role.id}
                        onClick={() => toggleRole(role.id)}
                        className="text-left"
                      >
                        <Badge
                          variant={isSelected ? 'default' : 'outline'}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {role.name}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              )}
              <p className="text-xs text-slate-400 pt-2">
                Click a role tag to toggle assignment. These appear in directory searches for authors, translators, and editors.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Profile Details Form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <CardTitle className="text-lg">Publishing &amp; Creative Info</CardTitle>
              </div>
              <CardDescription>
                Details visible to editors and collaborators across projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="penName">Pen Name / Display Name</Label>
                  <Input
                    id="penName"
                    value={penName}
                    onChange={(e) => setPenName(e.target.value)}
                    placeholder="e.g. Jane Austen"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biography / Author Note</Label>
                <textarea
                  id="bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio, publishing background, or artist statement..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-400 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialties" className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    Specialties &amp; Languages
                  </Label>
                  <Input
                    id="specialties"
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                    placeholder="e.g. English, French, Bilingual Early Readers"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl" className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    Portfolio / Website URL
                  </Label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://authorportfolio.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    Timezone
                  </Label>
                  <Input
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="e.g. America/New_York or UTC"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Agent or Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Literary Agent / Emergency contact info"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Mailing / Invoicing Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, Postal Code, Country"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving Changes...' : 'Save Profile Details'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
