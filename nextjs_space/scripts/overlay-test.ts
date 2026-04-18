import { extractPanelLayoutFromRawJson, renderPanelArraySvg, latLngToImagePixel } from '../lib/proposal-panels'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const lead = await prisma.lead.findFirst({ where: { id: 'cmo4p9p28000vo6081453qpsj' } })
  if (!lead) throw new Error('not found')

  const layout = extractPanelLayoutFromRawJson(lead.solarRawJson, lead.latitude, lead.longitude, 900, 600)
  if (!layout) throw new Error('no layout')

  console.log('Center:', layout.centerLat, layout.centerLng, 'zoom', layout.zoom)
  
  // Compute pixel coords for all panels
  const coords: { x: number, y: number, seg: number | undefined }[] = []
  for (const p of layout.panels) {
    const { x, y } = latLngToImagePixel(p.center.latitude, p.center.longitude, layout.centerLat, layout.centerLng, layout.zoom, 900, 600)
    coords.push({ x, y, seg: p.segmentIndex })
  }
  const xs = coords.map(c => c.x)
  const ys = coords.map(c => c.y)
  console.log('Panel pixel range: x=[' + Math.min(...xs).toFixed(1) + ', ' + Math.max(...xs).toFixed(1) + '] y=[' + Math.min(...ys).toFixed(1) + ', ' + Math.max(...ys).toFixed(1) + ']')
  console.log('Panel centroid: x=' + (xs.reduce((a,b)=>a+b)/xs.length).toFixed(1) + ' y=' + (ys.reduce((a,b)=>a+b)/ys.length).toFixed(1))
  
  // Also print roof segment info
  const raw = lead.solarRawJson as any
  const segments = raw.solarPotential.roofSegmentStats
  segments.forEach((s: any, i: number) => {
    console.log('Segment ' + i + ': azimuth=' + s.azimuthDegrees + ' pitch=' + s.pitchDegrees + ' area=' + s.stats?.areaMeters2)
  })
  
  // Test SVG output on a few panels
  const svg = renderPanelArraySvg(layout)
  console.log('\nFirst 500 chars of SVG:')
  console.log(svg.slice(0, 500))

  // Pin position in image
  const pinPx = latLngToImagePixel(lead.latitude, lead.longitude, layout.centerLat, layout.centerLng, layout.zoom, 900, 600)
  console.log('\nLead pin pixel:', pinPx)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
