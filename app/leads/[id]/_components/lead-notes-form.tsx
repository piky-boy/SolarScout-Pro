'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, NotebookPen } from 'lucide-react'
import { toast } from 'sonner'

const STATUSES = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
]

export function LeadNotesForm({
  id,
  initialNotes,
  initialStatus,
}: {
  id: string
  initialNotes: string
  initialStatus: string
}) {
  const [notes, setNotes] = useState(initialNotes)
  const [status, setStatus] = useState(initialStatus)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, status }),
      })
      if (!res.ok) {
        toast.error('Failed to save')
        return
      }
      toast.success('Saved')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-amber-500" />
          <h2 className="font-display text-lg font-semibold">Notes &amp; status</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr,200px]">
          <div>
            <Label htmlFor="notes">Outreach notes</Label>
            <Textarea
              id="notes"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes from your last call, estimates, contact history..."
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="bg-amber-500 text-white hover:bg-amber-600">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
