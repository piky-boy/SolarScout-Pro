/**
 * Fetch Google Solar API RGB aerial imagery and decode the GeoTIFF into a PNG
 * plus a pixel↔lat/lng transform. Using this imagery (instead of Mapbox satellite)
 * guarantees that Solar API's panel lat/lngs land exactly on the roof visible in
 * the image, because both come from the same source data.
 *
 * Approach
 * --------
 * 1. Call `GetDataLayers` with the lead's coordinates to obtain a temporary `rgbUrl`.
 * 2. Download the RGB GeoTIFF (typically in UTM projection).
 * 3. Decode the raster + extract the model transformation (origin, pixel size, UTM zone).
 * 4. Convert the raster to PNG via sharp so it can be embedded in the proposal HTML.
 * 5. Return both the PNG buffer and a closure that maps (lat, lng) → source-pixel coordinates.
 */

import { fromArrayBuffer } from 'geotiff'
import sharp from 'sharp'
import proj4 from 'proj4'

const SOLAR_API_HOST = 'solar.googleapis.com'
const SOLAR_API_URL = `https://${SOLAR_API_HOST}/v1/dataLayers:get`

export interface SolarImagery {
  /** Raw RGB PNG buffer of the full image returned by Solar API. */
  pngBuffer: Buffer
  /** Native pixel dimensions of pngBuffer. */
  width: number
  height: number
  /** Convert a WGS84 (lat, lng) to an (x, y) pixel inside pngBuffer. */
  latLngToPixel: (lat: number, lng: number) => { x: number; y: number }
  /** Convert a pixel (x, y) back to (lat, lng) — used for computing crop bounds. */
  pixelToLatLng: (x: number, y: number) => { lat: number; lng: number }
  /** Date the imagery was captured (YYYY-MM-DD) for transparency in the proposal. */
  imageryDate: string | null
  /** Approximate metres-per-pixel (useful to render panels at the right size). */
  metersPerPixel: number
}

/**
 * Fetch the Solar API RGB imagery for a location.
 *
 * - `lat`, `lng`: centre of the request (usually the lead's pin)
 * - `radiusMeters`: how big an area to retrieve. Passed to Solar API.
 *
 * Returns null if Solar API has no imagery for this location, the API key is missing,
 * or anything else fails. Caller should fall back to Mapbox in that case.
 */
export async function fetchSolarImagery(
  lat: number,
  lng: number,
  radiusMeters: number = 40
): Promise<SolarImagery | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return null

  const WGS84 = '+proj=longlat +datum=WGS84 +no_defs'

  try {
    // 1. dataLayers request — we only need IMAGERY_AND_ANNUAL_FLUX_LAYERS
    //    (the IMAGERY_LAYERS_ONLY view currently rejects many valid locations).
    const clampedRadius = Math.max(20, Math.min(175, Math.round(radiusMeters)))
    const url =
      `${SOLAR_API_URL}?location.latitude=${lat}&location.longitude=${lng}` +
      `&radiusMeters=${clampedRadius}&view=IMAGERY_AND_ANNUAL_FLUX_LAYERS` +
      `&requiredQuality=MEDIUM&key=${apiKey}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      console.warn('[solar-imagery] dataLayers fetch failed', res.status)
      return null
    }
    const data = (await res.json()) as {
      rgbUrl?: string
      imageryDate?: { year: number; month: number; day: number }
    }
    if (!data.rgbUrl) return null

    // 2. Download the GeoTIFF (URL already signed; key is appended for billing).
    const tiffRes = await fetch(data.rgbUrl + `&key=${apiKey}`, { cache: 'no-store' })
    if (!tiffRes.ok) {
      console.warn('[solar-imagery] geoTiff fetch failed', tiffRes.status)
      return null
    }
    const tiffArrBuf = await tiffRes.arrayBuffer()

    // 3. Decode GeoTIFF header + raster.
    const tiff = await fromArrayBuffer(tiffArrBuf)
    const image = await tiff.getImage()
    const width = image.getWidth()
    const height = image.getHeight()
    const bbox = image.getBoundingBox() // [minX, minY, maxX, maxY] in source CRS
    const geoKeys = image.getGeoKeys() as Record<string, number>
    const pcs = geoKeys.ProjectedCSTypeGeoKey || 0

    // Solar API currently always returns UTM/WGS84. We support both hemispheres.
    //   EPSG 326xx = UTM zone xx North
    //   EPSG 327xx = UTM zone xx South
    let sourceProj: string | null = null
    if (pcs >= 32601 && pcs <= 32660) {
      sourceProj = `+proj=utm +zone=${pcs - 32600} +datum=WGS84 +units=m +no_defs`
    } else if (pcs >= 32701 && pcs <= 32760) {
      sourceProj = `+proj=utm +zone=${pcs - 32700} +south +datum=WGS84 +units=m +no_defs`
    } else if (pcs === 3857 || pcs === 900913) {
      sourceProj = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs'
    }
    if (!sourceProj) {
      console.warn('[solar-imagery] unsupported projection EPSG', pcs)
      return null
    }

    const [minX, minY, maxX, maxY] = bbox
    const resX = (maxX - minX) / width // metres per pixel (X axis)
    const resY = (maxY - minY) / height // metres per pixel (Y axis, positive)
    // Convert origin corner (upper-left = minX, maxY) for informational centre calc.
    const [, ] = proj4(sourceProj, WGS84, [minX, maxY])

    // 4. Convert raster bytes → PNG. Solar API's RGB layers are 3-channel 8-bit.
    const raster = (await image.readRasters({ interleave: true })) as unknown as Uint8Array
    if (!(raster instanceof Uint8Array)) {
      console.warn('[solar-imagery] unexpected raster type')
      return null
    }
    const pngBuffer = await sharp(Buffer.from(raster), {
      raw: { width, height, channels: 3 },
    })
      .png({ compressionLevel: 6 })
      .toBuffer()

    // 5. Build pixel↔lat/lng transforms.
    const latLngToPixel = (la: number, lo: number) => {
      const [x, y] = proj4(WGS84, sourceProj!, [lo, la])
      return {
        x: (x - minX) / resX,
        y: (maxY - y) / resY, // pixel rows increase downward
      }
    }
    const pixelToLatLng = (px: number, py: number) => {
      const sx = minX + px * resX
      const sy = maxY - py * resY
      const [lo, la] = proj4(sourceProj!, WGS84, [sx, sy])
      return { lat: la, lng: lo }
    }

    const imageryDate = data.imageryDate
      ? `${data.imageryDate.year}-${String(data.imageryDate.month).padStart(2, '0')}-${String(data.imageryDate.day).padStart(2, '0')}`
      : null

    return {
      pngBuffer,
      width,
      height,
      latLngToPixel,
      pixelToLatLng,
      imageryDate,
      metersPerPixel: (resX + resY) / 2,
    }
  } catch (err) {
    console.error('[solar-imagery] error', err)
    return null
  }
}

/**
 * Crop a Solar API image to a tight area around a target bounding box (in lat/lng),
 * with padding, at the exact aspect ratio of the proposal's display container.
 * Returns both the cropped PNG and the pixel→lat/lng transform *for the crop*.
 */
export async function cropSolarImageryToBuildingBBox(
  imagery: SolarImagery,
  bbox: { north: number; south: number; east: number; west: number },
  displayAspectRatio: number,
  paddingMeters: number = 10
): Promise<{
  pngBuffer: Buffer
  width: number
  height: number
  latLngToPixel: (lat: number, lng: number) => { x: number; y: number }
} | null> {
  try {
    // Convert bbox corners to native pixels.
    const nw = imagery.latLngToPixel(bbox.north, bbox.west)
    const ne = imagery.latLngToPixel(bbox.north, bbox.east)
    const sw = imagery.latLngToPixel(bbox.south, bbox.west)
    const se = imagery.latLngToPixel(bbox.south, bbox.east)

    const minX = Math.min(nw.x, ne.x, sw.x, se.x)
    const maxX = Math.max(nw.x, ne.x, sw.x, se.x)
    const minY = Math.min(nw.y, ne.y, sw.y, se.y)
    const maxY = Math.max(nw.y, ne.y, sw.y, se.y)

    // Centre + half-extents of the bbox in source pixels.
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    let halfW = (maxX - minX) / 2
    let halfH = (maxY - minY) / 2

    // Add padding.
    const padPx = paddingMeters / imagery.metersPerPixel
    halfW += padPx
    halfH += padPx

    // Expand to display aspect ratio (don't crop the bbox away).
    const bboxAspect = halfW / halfH
    if (bboxAspect < displayAspectRatio) {
      halfW = halfH * displayAspectRatio
    } else {
      halfH = halfW / displayAspectRatio
    }

    // Final crop rectangle, clamped to image bounds.
    let cropLeft = Math.round(cx - halfW)
    let cropTop = Math.round(cy - halfH)
    let cropW = Math.round(halfW * 2)
    let cropH = Math.round(halfH * 2)
    if (cropLeft < 0) {
      cropW += cropLeft
      cropLeft = 0
    }
    if (cropTop < 0) {
      cropH += cropTop
      cropTop = 0
    }
    cropW = Math.min(cropW, imagery.width - cropLeft)
    cropH = Math.min(cropH, imagery.height - cropTop)
    if (cropW <= 4 || cropH <= 4) return null

    const croppedPng = await sharp(imagery.pngBuffer)
      .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
      .png()
      .toBuffer()

    const latLngToPixel = (la: number, lo: number) => {
      const native = imagery.latLngToPixel(la, lo)
      return {
        x: native.x - cropLeft,
        y: native.y - cropTop,
      }
    }

    return {
      pngBuffer: croppedPng,
      width: cropW,
      height: cropH,
      latLngToPixel,
    }
  } catch (err) {
    console.error('[solar-imagery] crop error', err)
    return null
  }
}

/**
 * Draw a red pin marker onto a PNG buffer at the given (x, y) pixel position.
 * Used on the BEFORE image so the user can see where the lead's coordinate
 * sits inside the satellite imagery.
 */
export async function drawPinOnPng(
  pngBuffer: Buffer,
  x: number,
  y: number,
  opts: { radius?: number } = {}
): Promise<Buffer> {
  const r = opts.radius ?? 9
  // Teardrop-style pin: red circle with a white border + small dot.
  const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${r * 4}" height="${r * 4}">
    <g transform="translate(${r * 2} ${r * 2})">
      <circle cx="0" cy="0" r="${r + 1.5}" fill="white" opacity="0.95" />
      <circle cx="0" cy="0" r="${r}" fill="#ef4444" />
      <circle cx="0" cy="0" r="${Math.max(2, r * 0.35)}" fill="white" />
    </g>
  </svg>`
  return sharp(pngBuffer)
    .composite([
      {
        input: Buffer.from(pinSvg),
        left: Math.round(x - r * 2),
        top: Math.round(y - r * 2),
      },
    ])
    .png()
    .toBuffer()
}
