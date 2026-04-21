'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Box, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'

interface Building3DViewerProps {
  lat: number
  lng: number
  name: string
}

// Load Google Maps JS API script dynamically
function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject('SSR')
    if ((window as any).__googleMapsLoaded) return resolve()
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        ;(window as any).__googleMapsLoaded = true
        resolve()
      })
      return
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=maps3d`
    script.async = true
    script.defer = true
    script.onload = () => {
      ;(window as any).__googleMapsLoaded = true
      resolve()
    }
    script.onerror = () => reject('Google Maps script failed to load')
    document.head.appendChild(script)
  })
}

export function Building3DViewer({ lat, lng, name }: Building3DViewerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tilt, setTilt] = useState(55)
  const [heading, setHeading] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        // Fetch api key from a lightweight endpoint
        const keyRes = await fetch('/api/config/maps-key')
        if (!keyRes.ok) throw new Error('Could not get Maps API key')
        const { key } = await keyRes.json()
        if (!key) throw new Error('Maps API key not configured')

        await loadGoogleMapsScript(key)

        if (cancelled || !mapRef.current) return

        const google = (window as any).google
        if (!google?.maps) throw new Error('Google Maps not loaded')

        const map = new google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 19,
          tilt: 55,
          heading: 0,
          mapTypeId: 'satellite',
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: false,
          gestureHandling: 'greedy',
        })

        mapInstanceRef.current = map

        // Add marker
        new google.maps.Marker({
          position: { lat, lng },
          map,
          title: name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#F59E0B',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFF',
          },
        })

        if (!cancelled) setLoading(false)
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load 3D viewer')
          setLoading(false)
        }
      }
    }

    init()
    return () => { cancelled = true }
  }, [lat, lng, name])

  const rotate = useCallback(() => {
    const map = mapInstanceRef.current
    if (!map) return
    const newHeading = ((map.getHeading?.() ?? heading) + 90) % 360
    map.setHeading(newHeading)
    setHeading(newHeading)
  }, [heading])

  const toggleTilt = useCallback(() => {
    const map = mapInstanceRef.current
    if (!map) return
    const newTilt = (map.getTilt?.() ?? tilt) > 0 ? 0 : 55
    map.setTilt(newTilt)
    setTilt(newTilt)
  }, [tilt])

  const zoomIn = useCallback(() => {
    const map = mapInstanceRef.current
    if (!map) return
    map.setZoom((map.getZoom() ?? 19) + 1)
  }, [])

  const zoomOut = useCallback(() => {
    const map = mapInstanceRef.current
    if (!map) return
    map.setZoom((map.getZoom() ?? 19) - 1)
  }, [])

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Box className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">3D Building View</div>
              <p className="text-sm text-muted-foreground">3D satellite view is not available at the moment.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <Box className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold">3D Satellite View</h3>
              <p className="text-xs text-muted-foreground">
                Google Maps 3D with tilt & rotation · Zoom 19+
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={zoomIn} title="Zoom in">
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={zoomOut} title="Zoom out">
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={rotate} className="gap-1.5">
              <RotateCw className="h-3.5 w-3.5" /> Rotate 90°
            </Button>
            <Button variant="outline" size="sm" onClick={toggleTilt} className="gap-1.5">
              {tilt > 0 ? '2D' : '3D'}
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border bg-muted">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          <div ref={mapRef} className="aspect-[16/10] w-full" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Heading: {heading}°</Badge>
          <Badge variant="outline" className="text-xs">{tilt > 0 ? '3D Tilt' : 'Top-down'}</Badge>
          <span className="ml-auto text-[10px] text-muted-foreground">Drag to pan · Scroll to zoom · Ctrl+drag to rotate</span>
        </div>
      </CardContent>
    </Card>
  )
}
