import { fromArrayBuffer } from 'geotiff'
import sharp from 'sharp'
import proj4 from 'proj4'
import * as fs from 'fs'

async function main() {
  const tiff = fs.readFileSync('/tmp/solar-rgb.tif')
  const tiffObj = await fromArrayBuffer(tiff.buffer.slice(tiff.byteOffset, tiff.byteOffset + tiff.byteLength))
  const image = await tiffObj.getImage()
  console.log('Width:', image.getWidth(), 'Height:', image.getHeight())
  console.log('bbox:', image.getBoundingBox())
  const geoKeys = image.getGeoKeys() as any
  console.log('geoKeys:', geoKeys)
  const origin = image.getOrigin()
  console.log('origin:', origin)
  const res = image.getResolution()
  console.log('resolution:', res)
  
  // bbox returns [minX, minY, maxX, maxY] in source CRS (UTM here)
  const bbox = image.getBoundingBox()
  const [minX, minY, maxX, maxY] = bbox

  // Convert UTM to WGS84 (EPSG:4326)
  const pcs = geoKeys.ProjectedCSTypeGeoKey // e.g. 32630
  console.log('Projected CS:', pcs)
  
  // Define UTM zone from EPSG code: 32630 = UTM 30N, 32631 = UTM 31N, etc.
  // Formula: 326XX for UTM zone XX North, 327XX for UTM zone XX South
  const zone = pcs - 32600  // Assumes northern hemisphere
  console.log('UTM zone:', zone, 'North')
  
  const utmProj = `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`
  const wgs84 = `+proj=longlat +datum=WGS84 +no_defs`
  
  const [lng_sw, lat_sw] = proj4(utmProj, wgs84, [minX, minY])
  const [lng_se, lat_se] = proj4(utmProj, wgs84, [maxX, minY])
  const [lng_nw, lat_nw] = proj4(utmProj, wgs84, [minX, maxY])
  const [lng_ne, lat_ne] = proj4(utmProj, wgs84, [maxX, maxY])
  console.log('SW:', lat_sw.toFixed(7), lng_sw.toFixed(7))
  console.log('SE:', lat_se.toFixed(7), lng_se.toFixed(7))
  console.log('NW:', lat_nw.toFixed(7), lng_nw.toFixed(7))
  console.log('NE:', lat_ne.toFixed(7), lng_ne.toFixed(7))
  
  // Expected center around 40.5978, -4.4951
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const [lng_c, lat_c] = proj4(utmProj, wgs84, [cx, cy])
  console.log('Center:', lat_c.toFixed(7), lng_c.toFixed(7))
  
  // Test: panel at lat=40.5978513, lng=-4.495062 (raw.center)
  const [panelX, panelY] = proj4(wgs84, utmProj, [-4.495062, 40.5978513])
  console.log('raw.center in UTM:', panelX, panelY)
  const pxCol = (panelX - minX) / res[0]
  const pxRow = (panelY - maxY) / res[1]  // res[1] is negative
  console.log('raw.center in image pixel:', pxCol.toFixed(1), pxRow.toFixed(1))
  
  // Also convert the image to PNG
  // Load raster data
  const raster = await image.readRasters({ interleave: true }) as any
  console.log('Raster type:', raster.constructor.name, 'length:', raster.length)
  const w = image.getWidth()
  const h = image.getHeight()
  
  const png = await sharp(Buffer.from(raster), {
    raw: { width: w, height: h, channels: 3 },
  }).png().toBuffer()
  fs.writeFileSync('/tmp/solar-rgb-direct.png', png)
  console.log('Saved /tmp/solar-rgb-direct.png')
}
main().catch(e => { console.error(e); process.exit(1) })
