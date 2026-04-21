'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Camera, Eye, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import Image from 'next/image'

interface StreetViewImage {
  label: string
  heading: number
  url: string
}

interface StreetViewData {
  available: boolean
  status: string
  panoId?: string
  date?: string
  images: StreetViewImage[]
  embedUrl: string | null
}

export function StreetViewGallery({ leadId }: { leadId: string }) {
  const [data, setData] = useState<StreetViewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showEmbed, setShowEmbed] = useState(false)
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/leads/${leadId}/streetview`)
        if (!res.ok) throw new Error('fetch failed')
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch {
        if (!cancelled) setData({ available: false, status: 'ERROR', images: [], embedUrl: null })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [leadId])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading Street View imagery…</span>
        </CardContent>
      </Card>
    )
  }

  if (!data?.available || data.images.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Camera className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">Street View</div>
              <p className="text-sm text-muted-foreground">No Street View coverage available for this location.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const validImages = data.images.filter((_, i) => !imgErrors[i])
  const currentImg = data.images[activeIndex]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Camera className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Street View — Building Inspection</h3>
              <p className="text-xs text-muted-foreground">
                {data.date ? `Imagery from ${data.date}` : 'Google Street View'}
                {' · '}{validImages.length} facade views
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showEmbed ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowEmbed(!showEmbed)}
              className="gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" />
              {showEmbed ? 'Gallery' : '360° View'}
            </Button>
          </div>
        </div>

        {showEmbed && data.embedUrl ? (
          <div className="overflow-hidden rounded-xl border">
            <iframe
              src={data.embedUrl}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Interactive Street View"
            />
          </div>
        ) : (
          <div>
            {/* Main image */}
            <div className="relative overflow-hidden rounded-xl border bg-muted">
              <div className="aspect-[4/3] relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImg.url}
                  alt={`Street View — ${currentImg.label} facade`}
                  className="h-full w-full object-cover"
                  onError={() => setImgErrors((e) => ({ ...e, [activeIndex]: true }))}
                />
              </div>
              {/* Navigation arrows */}
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                onClick={() => setActiveIndex((i) => (i === 0 ? data.images.length - 1 : i - 1))}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                onClick={() => setActiveIndex((i) => (i === data.images.length - 1 ? 0 : i + 1))}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              {/* Direction badge */}
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm">
                  🧭 {currentImg.label} — {currentImg.heading}°
                </Badge>
              </div>
              <div className="absolute bottom-3 right-3">
                <Badge variant="outline" className="bg-white/80 backdrop-blur-sm text-xs">
                  {activeIndex + 1} / {data.images.length}
                </Badge>
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              {data.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                    i === activeIndex ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="aspect-[4/3] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`${img.label} thumbnail`}
                      className="h-full w-full object-cover"
                      onError={() => setImgErrors((e) => ({ ...e, [i]: true }))}
                    />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                    <span className="text-[10px] font-medium text-white">{img.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
