'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

interface LeadDetailMapProps {
  center: [number, number]
  name: string
}

export function LeadDetailMap({ center, name }: LeadDetailMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center,
      zoom: 17,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    const el = document.createElement('div')
    el.style.cssText = `
      width:28px;height:28px;border-radius:9999px;
      background:#f59e0b;border:3px solid white;
      box-shadow:0 6px 18px rgba(0,0,0,0.5);
    `
    new mapboxgl.Marker({ element: el })
      .setLngLat(center)
      .setPopup(new mapboxgl.Popup({ offset: 18 }).setText(name))
      .addTo(map)

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} className="aspect-[16/10] w-full bg-muted" />
}
