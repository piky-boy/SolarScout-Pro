'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import type { LeadRow } from '@/app/dashboard/_components/dashboard-client'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

interface DashboardMapProps {
  center: [number, number]
  zoom: number
  leads: LeadRow[]
  selectedId: string | null
  onSelect: (lead: LeadRow) => void
}

export function DashboardMap({ center, zoom, leads, selectedId, onSelect }: DashboardMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center,
      zoom,
      attributionControl: true,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    mapRef.current = map
    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fly to new center/zoom
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!Array.isArray(center) || center.length !== 2) return
    map.flyTo({ center, zoom: zoom ?? map.getZoom(), essential: true, speed: 1.2 })
  }, [center, zoom])

  // Render markers for leads
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (!Array.isArray(leads) || leads.length === 0) return

    const bounds = new mapboxgl.LngLatBounds()
    for (const lead of leads) {
      if (typeof lead?.latitude !== 'number' || typeof lead?.longitude !== 'number') continue
      const el = document.createElement('button')
      el.type = 'button'
      el.setAttribute('aria-label', lead.businessName ?? 'commercial building')
      const isSelected = selectedId === lead.id
      const area = lead.roofAreaSqm ?? 0
      const size = area > 5000 ? 32 : area > 1500 ? 26 : 22
      el.style.cssText = `
        width:${size}px;height:${size}px;border-radius:9999px;
        background:${isSelected ? '#ef4444' : '#f59e0b'};
        border:2px solid rgba(255,255,255,0.95);
        box-shadow:0 4px 12px rgba(0,0,0,0.35);
        cursor:pointer;display:flex;align-items:center;justify-content:center;
        color:white;font-size:10px;font-weight:700;transition:all .2s ease;
      `
      el.textContent = ''
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.15)'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
      })
      el.addEventListener('click', () => onSelect(lead))
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lead.longitude, lead.latitude])
        .addTo(map)
      markersRef.current.push(marker)
      bounds.extend([lead.longitude, lead.latitude])
    }

    if (!bounds.isEmpty()) {
      try {
        map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 800 })
      } catch (e) {
        console.warn('fitBounds failed', e)
      }
    }
  }, [leads, selectedId, onSelect])

  return <div ref={containerRef} className="aspect-[16/9] w-full bg-muted" />
}
