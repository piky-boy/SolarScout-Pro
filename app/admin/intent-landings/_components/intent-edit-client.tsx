'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Zap, ArrowLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { IntentLandingRecord } from '@/lib/intent-types'

interface IntentEditClientProps {
  page: IntentLandingRecord & { createdAt: string; updatedAt: string }
}

export function IntentEditClient({ page }: IntentEditClientProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  const [isActive, setIsActive] = useState(page.isActive)
  const [title, setTitle] = useState(page.title)
  const [h1, setH1] = useState(page.h1)
  const [metaTitle, setMetaTitle] = useState(page.metaTitle)
  const [metaDescription, setMetaDescription] = useState(page.metaDescription)
  const [intro, setIntro] = useState(page.intro)
  const [seoCopy, setSeoCopy] = useState(page.seoCopy)
  const [emotionalHook, setEmotionalHook] = useState(page.emotionalHook)
  const [heroSubcopy, setHeroSubcopy] = useState(page.heroSubcopy)
  const [cityLocalCopy, setCityLocalCopy] = useState(page.cityLocalCopy ?? '')

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/intent-landings/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive,
          title,
          h1,
          metaTitle,
          metaDescription,
          intro,
          seoCopy,
          emotionalHook,
          heroSubcopy,
          cityLocalCopy: cityLocalCopy || null,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Page saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    toast.loading('Generating AI content…', { id: 'gen' })
    try {
      const res = await fetch('/api/admin/intent-landings/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: page.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail ?? 'Generation failed')
      toast.success('AI content generated — reload to see updates', { id: 'gen' })
      // Refresh server-side data
      router.refresh()
    } catch (err: any) {
      toast.error(err.message, { id: 'gen' })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/intent-landings')}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline">{page.locale}</Badge>
          <Badge variant={page.isHub ? 'default' : 'secondary'}>
            {page.isHub ? 'Hub' : 'Geo'} · T{page.tier}
          </Badge>
          <a href={`/intent/${page.slug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Preview
            </Button>
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
          >
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            {generating ? 'Generating…' : 'Regenerate AI'}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="isActive" className="cursor-pointer">
              {isActive ? 'Active — page is live and indexed' : 'Inactive — page returns 404'}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* SEO Fields */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">SEO Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>H1</Label>
            <Input value={h1} onChange={(e) => setH1(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Meta Title</Label>
            <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
            <p className="text-xs text-muted-foreground">{metaTitle.length}/70 chars</p>
          </div>
          <div className="space-y-1.5">
            <Label>Meta Description</Label>
            <Textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">{metaDescription.length}/160 chars</p>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Copy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Conversion Copy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Emotional Hook (Hero headline)</Label>
            <Input
              value={emotionalHook}
              onChange={(e) => setEmotionalHook(e.target.value)}
              placeholder="Auto-filled by AI agent"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Hero Subcopy (2–3 sentences)</Label>
            <Textarea
              value={heroSubcopy}
              onChange={(e) => setHeroSubcopy(e.target.value)}
              rows={3}
              placeholder="Auto-filled by AI agent"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Intro (section intro paragraph)</Label>
            <Textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>SEO Body Copy (400–600 words)</Label>
            <Textarea
              value={seoCopy}
              onChange={(e) => setSeoCopy(e.target.value)}
              rows={8}
              placeholder="Auto-filled by AI agent"
            />
          </div>
          {page.tier === 1 && (
            <div className="space-y-1.5">
              <Label>City Local Context</Label>
              <Textarea
                value={cityLocalCopy}
                onChange={(e) => setCityLocalCopy(e.target.value)}
                rows={3}
                placeholder="Optional editorial context about this city shown in a callout"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Read-only info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">AI Content Status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">aiSearchQA:</span>{' '}
            <span className="font-medium">{(page.aiSearchQA as any[]).length} Q&amp;As</span>
          </div>
          <div>
            <span className="text-muted-foreground">Segments:</span>{' '}
            <span className="font-medium">{(page.segments as any[]).length} types</span>
          </div>
          <div>
            <span className="text-muted-foreground">FAQs:</span>{' '}
            <span className="font-medium">{(page.faqs as any[]).length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Social proof:</span>{' '}
            <span className="font-medium">{(page.socialProofClusters as any[]).length} clusters</span>
          </div>
          <div>
            <span className="text-muted-foreground">Updated:</span>{' '}
            <span className="font-medium">
              {new Date(page.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
