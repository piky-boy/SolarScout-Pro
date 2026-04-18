import { fetchSolarImagery, cropSolarImageryToBuildingBBox } from '../lib/solar-imagery'
import * as fs from 'fs'

async function main() {
  const lat = 40.5978079
  const lng = -4.4950893
  const img = await fetchSolarImagery(lat, lng, 40)
  if (!img) {
    console.log('No imagery available')
    return
  }
  console.log('Got imagery:', img.width, 'x', img.height, '@ ', img.metersPerPixel, 'm/px')
  console.log('Date:', img.imageryDate)
  fs.writeFileSync('/tmp/solar-imagery-full.png', img.pngBuffer)
  
  // Test latLngToPixel
  const centerPx = img.latLngToPixel(lat, lng)
  console.log('Pin pixel:', centerPx)
  
  // Pharmacy panel bbox
  const bbox = {
    north: 40.5979319, south: 40.5977752, east: -4.4950341, west: -4.4951273
  }
  // Display aspect ratio 332 / 155 = 2.14:1
  const cropped = await cropSolarImageryToBuildingBBox(img, bbox, 332/155, 10)
  if (!cropped) {
    console.log('Crop failed')
    return
  }
  console.log('Cropped:', cropped.width, 'x', cropped.height)
  fs.writeFileSync('/tmp/solar-imagery-cropped.png', cropped.pngBuffer)
  
  // Test panel projection in crop
  const panelCenterPx = cropped.latLngToPixel((bbox.north + bbox.south)/2, (bbox.east + bbox.west)/2)
  console.log('Panel centroid in crop:', panelCenterPx)
  
  // Test corner
  const nwPx = cropped.latLngToPixel(bbox.north, bbox.west)
  const sePx = cropped.latLngToPixel(bbox.south, bbox.east)
  console.log('Panel NW in crop:', nwPx)
  console.log('Panel SE in crop:', sePx)
}
main().catch(e => { console.error(e); process.exit(1) })
