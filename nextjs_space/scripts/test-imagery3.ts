// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { fromArrayBuffer } from 'geotiff'  // pre-import to see if it pollutes fetch
import sharp from 'sharp'
import proj4 from 'proj4'

async function main() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY!
  const lat = 40.5978079
  const lng = -4.4950893
  const url = `https://solar.googleapis.com/v1/dataLayers:get?location.latitude=${lat}&location.longitude=${lng}&radiusMeters=40&view=IMAGERY_AND_ANNUAL_FLUX_LAYERS&requiredQuality=MEDIUM&key=${apiKey}`
  const res = await fetch(url, { cache: 'no-store' })
  console.log('STATUS:', res.status, 'CT:', res.headers.get('content-type'))
  const text = await res.text()
  console.log('BODY first 200:', text.slice(0, 200))
}
main().catch(console.error)
