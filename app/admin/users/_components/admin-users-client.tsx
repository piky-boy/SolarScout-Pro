'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  User,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  FileText,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

type SurveyData = {
  id: string
  companyName?: string | null
  companyRole?: string | null
  teamSize?: string | null
  marketsOfInterest?: string | null
  monthlyLeadGoal?: string | null
  howDidYouHear?: string | null
  createdAt: string
}

type ActivityCounts = {
  scansRun: number
  leadsViewed: number
  leadsSaved: number
  statusChanges: number
  exports: number
  outreachGenerated: number
  proposalsGenerated: number
  lastActive: string | null
}

type UserRecord = {
  id: string
  name: string | null
  email: string
  role: string
  approved: boolean
  plan: string | null
  surveyCompleted: boolean
  createdAt: string
  surveyResponse: SurveyData | null
  _count: { leads: number; searchHistory: number; activityLogs: number }
  activity: ActivityCounts
}

export function AdminUsersClient() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setUsers(data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleDelete = async (userId: string) => {
    setDeleteLoading(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? 'Failed')
      }
      setUsers(prev => prev.filter(u => u.id !== userId))
      toast.success('User deleted')
    } catch (err: any) {
      toast.error(err?.message ?? 'Delete failed. Please try again.')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleAction = async (userId: string, approved: boolean) => {
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, approved }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success(approved ? 'User approved!' : 'User access revoked')
      fetchUsers()
    } catch {
      toast.error('Action failed. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = users.filter(u => {
    const matchesSearch = !search || u.email.toLowerCase().includes(search.toLowerCase()) || (u.name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'pending' && !u.approved) || (filter === 'approved' && u.approved)
    return matchesSearch && matchesFilter
  })

  const pendingCount = users.filter(u => !u.approved && u.surveyCompleted).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">User Management</h1>
        <p className="mt-1 text-muted-foreground">Review registrations and manage platform access.</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">Total users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{users.filter(u => u.approved).length}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Shield className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? 'bg-amber-500 text-white hover:bg-amber-600' : ''}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* User list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">No users match your filter.</p>
        )}
        {filtered.map(u => (
          <Card key={u.id} className={`transition ${!u.approved && u.surveyCompleted ? 'border-amber-500/40 shadow-amber-500/5 shadow-md' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold">{u.name || 'No name'}</h3>
                    {u.role === 'ADMIN' && <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400">Admin</Badge>}
                    {u.approved ? (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
                      </Badge>
                    ) : u.surveyCompleted ? (
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Clock className="mr-1 h-3 w-3" /> Pending
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-500/10 text-gray-500">
                        No survey
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{u.email}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Joined {new Date(u.createdAt).toLocaleDateString()}
                    {u.plan && <span> · <span className="font-medium capitalize">{u.plan.toLowerCase()}</span></span>}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground/70">
                    <span>{u._count.leads} leads</span>
                    <span>{u.activity?.scansRun ?? 0} scans</span>
                    <span>{u.activity?.exports ?? 0} exports</span>
                    <span>{u.activity?.proposalsGenerated ?? 0} proposals</span>
                    {u.activity?.lastActive && (
                      <span>last active {new Date(u.activity.lastActive).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {u.surveyCompleted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                      className="gap-1 text-xs"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Survey
                      {expandedUser === u.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  )}
                  {u.role !== 'ADMIN' && (
                    <>
                      {u.approved ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(u.id, false)}
                          disabled={actionLoading === u.id}
                          className="gap-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                        >
                          {actionLoading === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                          Revoke
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAction(u.id, true)}
                          disabled={actionLoading === u.id}
                          className="gap-1 bg-green-600 text-xs text-white hover:bg-green-700"
                        >
                          {actionLoading === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Approve
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={deleteLoading === u.id}
                            className="gap-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                          >
                            {deleteLoading === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete user?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete <strong>{u.name || u.email}</strong> and all their data (leads, search history, survey). This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(u.id)}
                              className="bg-red-600 text-white hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>

              {/* Expanded survey response */}
              {expandedUser === u.id && u.surveyResponse && (
                <div className="mt-4 rounded-lg border bg-muted/50 p-4">
                  <h4 className="mb-3 text-sm font-semibold">Survey Responses</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: 'Company', value: u.surveyResponse.companyName },
                      { label: 'Role', value: u.surveyResponse.companyRole },
                      { label: 'Team size', value: u.surveyResponse.teamSize },
                      { label: 'Markets', value: u.surveyResponse.marketsOfInterest },
                      { label: 'Monthly goal', value: u.surveyResponse.monthlyLeadGoal },
                      { label: 'Referral', value: u.surveyResponse.howDidYouHear },
                    ].map(field => (
                      <div key={field.label}>
                        <p className="text-xs font-medium text-muted-foreground">{field.label}</p>
                        <p className="text-sm">{field.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
