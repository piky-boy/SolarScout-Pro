import { PrismaClient } from '@prisma/client'
import { computeBusinessCase } from '../lib/outreach'
import { renderProposalHtml } from '../lib/proposal-html'
import { extractPanelLayoutFromRawJson } from '../lib/proposal-panels'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const lead = await prisma.lead.findFirst({
    where: { id: 'cmo4p9p28000vo6081453qpsj' },
    include: { user: { select: { name: true, email: true } } },
  })
  if (!lead) throw new Error('Lead not found')

  const MAP_W = 900
  const MAP_H = 600

  const businessCase = computeBusinessCase({
    country: lead.country,
    panels: lead.solarMaxPanelCount,
    panelCapacityWatts: lead.solarPanelCapacityWatts,
    yearlyEnergyKwh: lead.solarYearlyEnergyKwh,
    panelLifetimeYears: lead.solarPanelLifetimeYears,
    carbonOffsetKgYr: lead.solarCarbonOffsetKgYr,
    roofAreaSqm: lead.roofAreaSqm,
  })

  const panelLayout = extractPanelLayoutFromRawJson(
    lead.solarRawJson,
    lead.latitude,
    lead.longitude,
    MAP_W,
    MAP_H
  )

  console.log('panelLayout:')
  if (panelLayout) {
    console.log('  zoom:', panelLayout.zoom)
    console.log('  centerLat:', panelLayout.centerLat)
    console.log('  centerLng:', panelLayout.centerLng)
    console.log('  num panels:', panelLayout.panels.length)
    console.log('  imgWidth/Height:', panelLayout.imgWidth, panelLayout.imgHeight)
    console.log('  bbox:', panelLayout.bbox)
  } else {
    console.log('  NULL')
  }

  const token = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  console.log('\nMAPBOX_TOKEN present:', !!token)

  const mapCenterLat = panelLayout?.centerLat ?? lead.latitude
  const mapCenterLng = panelLayout?.centerLng ?? lead.longitude
  const mapZoom = panelLayout?.zoom ?? 19

  const style = 'satellite-v9'
  const buildUrl = (pin: { lat: number; lng: number } | null) => {
    const overlay = pin ? `pin-s+ef4444(${pin.lng},${pin.lat})/` : ''
    return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${overlay}${mapCenterLng},${mapCenterLat},${mapZoom},0/${MAP_W}x${MAP_H}@2x?access_token=${encodeURIComponent(token!)}`
  }

  const beforeUrl = buildUrl({ lat: lead.latitude, lng: lead.longitude })
  const afterUrl = buildUrl(null)
  console.log('\nBEFORE URL:', beforeUrl.slice(0, 150))
  console.log('\nAFTER URL:', afterUrl.slice(0, 150))

  const html = renderProposalHtml({
    lead: {
      businessName: lead.businessName,
      businessType: lead.businessType,
      buildingType: lead.buildingType,
      address: lead.address,
      city: lead.city,
      country: lead.country,
      latitude: lead.latitude,
      longitude: lead.longitude,
      roofAreaSqm: lead.roofAreaSqm,
      contactPhone: lead.contactPhone,
      contactEmail: lead.contactEmail,
      website: lead.website,
      googleRating: lead.googleRating,
      solarApiStatus: lead.solarApiStatus,
      solarMaxPanelCount: lead.solarMaxPanelCount,
      solarMaxArrayAreaSqm: lead.solarMaxArrayAreaSqm,
      solarYearlyEnergyKwh: lead.solarYearlyEnergyKwh,
      solarCarbonOffsetKgYr: lead.solarCarbonOffsetKgYr,
      solarMaxSunshineHours: lead.solarMaxSunshineHours,
      solarPanelCapacityWatts: lead.solarPanelCapacityWatts,
      solarPanelLifetimeYears: lead.solarPanelLifetimeYears,
      solarImageryQuality: lead.solarImageryQuality,
      solarImageryDate: lead.solarImageryDate,
      dataSource: lead.dataSource,
    },
    businessCase,
    senderName: 'John Doe',
    senderCompany: 'SolarScout Pro',
    senderEmail: 'john@doe.com',
    senderPhone: null,
    satelliteImageUrl: beforeUrl,
    satelliteImageUrlClean: afterUrl,
    panelLayout,
    generatedAt: new Date().toLocaleDateString('en-GB'),
  })

  fs.writeFileSync('/tmp/proposal-current.html', html)
  console.log('\nHTML saved to /tmp/proposal-current.html (length:', html.length, 'chars)')
}

main().catch(console.error).finally(() => prisma.$disconnect())
