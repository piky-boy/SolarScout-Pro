import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const lead = await prisma.lead.findFirst({ where: { id: 'cmo4p9p28000vo6081453qpsj' } })
  if (!lead) throw new Error('not found')
  
  const raw = lead.solarRawJson as any
  console.log('Top-level keys:', Object.keys(raw))
  console.log('imageryDate:', raw.imageryDate)
  console.log('imageryProcessedDate:', raw.imageryProcessedDate)
  console.log('imageryQuality:', raw.imageryQuality)
  
  // Try Google Solar API dataLayers endpoint
  const apiKey = process.env.GOOGLE_MAPS_API_KEY!
  const url = `https://solar.googleapis.com/v1/dataLayers:get?location.latitude=${lead.latitude}&location.longitude=${lead.longitude}&radiusMeters=25&view=IMAGERY_AND_ANNUAL_FLUX_LAYERS&key=${apiKey}`
  const res = await fetch(url)
  const text = await res.text()
  console.log('\ndataLayers response status:', res.status)
  console.log('dataLayers body (first 1500 chars):', text.slice(0, 1500))
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
