async function main() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  console.log('API key available:', !!apiKey, 'length:', apiKey?.length)
  const lat = 40.5978079
  const lng = -4.4950893
  const url = `https://solar.googleapis.com/v1/dataLayers:get?location.latitude=${lat}&location.longitude=${lng}&radiusMeters=40&view=IMAGERY_AND_ANNUAL_FLUX_LAYERS&requiredQuality=MEDIUM&key=${apiKey}`
  console.log('URL:', url.replace(apiKey!, 'KEY'))
  const res = await fetch(url, { cache: 'no-store' })
  console.log('status:', res.status, 'content-type:', res.headers.get('content-type'))
  const text = await res.text()
  console.log('body first 500 chars:', text.slice(0, 500))
}
main().catch(console.error)
