/**
 * Project Google Solar API panels onto a Mapbox static satellite image.
 *
 * The Solar API returns the precise lat/lng centre of every installable panel
 * plus the roof segment each panel belongs to (with the roof's azimuth and
 * physical panel dimensions). We use Web Mercator math to convert those real
 * coordinates into image-pixel positions, then emit an SVG overlay that sits
 * on top of the satellite image in the proposal PDF so panels land *exactly*
 * on the actual rooftop instead of floating in a generic grid.
 */

export interface SolarPanel {
  center: { latitude: number; longitude: number }
  orientation?: 'LANDSCAPE' | 'PORTRAIT'
  segmentIndex?: number
  yearlyEnergyDcKwh?: number
}

export interface RoofSegmentStat {
  center?: { latitude: number; longitude: number }
  azimuthDegrees?: number
  pitchDegrees?: number
  boundingBox?: {
    ne?: { latitude: number; longitude: number }
    sw?: { latitude: number; longitude: number }
  }
  stats?: { areaMeters2?: number }
}

export interface PanelLayoutInput {
  panels: SolarPanel[]
  segments: RoofSegmentStat[]
  panelWidthMeters: number
  panelHeightMeters: number
  centerLat: number
  centerLng: number
  zoom: number
  /** Rendered pixel width of the satellite image in the PDF. */
  imgWidth: number
  /** Rendered pixel height of the satellite image in the PDF. */
  imgHeight: number
  /** Bounding box of all panels (for optional zoom auto-fit). */
  bbox?: {
    north: number
    south: number
    east: number
    west: number
  }
}

const TILE_SIZE = 256

function lngToTileX(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * Math.pow(2, zoom) * TILE_SIZE
}

function latToTileY(lat: number, zoom: number): number {
  const sinLat = Math.sin((lat * Math.PI) / 180)
  // Clamp to avoid ±Infinity near poles.
  const s = Math.max(-0.9999, Math.min(0.9999, sinLat))
  return (
    (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) *
    Math.pow(2, zoom) *
    TILE_SIZE
  )
}

/**
 * Convert a (lat, lng) to pixel coordinates inside a Mapbox static image of
 * dimensions (imgWidth × imgHeight) centred at (centerLat, centerLng) at the
 * given zoom level. Origin is the top-left of the image.
 */
export function latLngToImagePixel(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  zoom: number,
  imgWidth: number,
  imgHeight: number
): { x: number; y: number } {
  const cx = lngToTileX(centerLng, zoom)
  const cy = latToTileY(centerLat, zoom)
  const px = lngToTileX(lng, zoom)
  const py = latToTileY(lat, zoom)
  return {
    x: imgWidth / 2 + (px - cx),
    y: imgHeight / 2 + (py - cy),
  }
}

/**
 * Metres per pixel at a given latitude and zoom level in Web Mercator.
 * 156543.03 is the m/px value at zoom 0 at the equator (Earth circumference / 256 px / tile).
 */
export function metersPerPixel(lat: number, zoom: number): number {
  return (
    (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom)
  )
}

/**
 * Pick a zoom level (17..20) that frames the building with a small margin.
 * If no bounding box is available, defaults to 19.
 */
export function pickZoomForBuilding(
  bbox: PanelLayoutInput['bbox'] | undefined,
  imgWidth: number,
  imgHeight: number
): number {
  if (!bbox) return 19

  // Approximate ground extent of the bbox in metres.
  const centerLat = (bbox.north + bbox.south) / 2
  const mPerDegLat = 111_132.954
  const mPerDegLng = 111_132.954 * Math.cos((centerLat * Math.PI) / 180)
  const heightMeters = Math.abs(bbox.north - bbox.south) * mPerDegLat
  const widthMeters = Math.abs(bbox.east - bbox.west) * mPerDegLng

  // Aim to fill ~70% of the image (leaves breathing room for panel edges).
  const targetFrac = 0.7

  // Try zoom 20..17 and pick the highest that still fits.
  for (let z = 20; z >= 17; z--) {
    const mpp = metersPerPixel(centerLat, z)
    const widthPx = widthMeters / mpp
    const heightPx = heightMeters / mpp
    if (
      widthPx <= imgWidth * targetFrac &&
      heightPx <= imgHeight * targetFrac
    ) {
      return z
    }
  }
  return 17
}

/**
 * Extract panel layout information from a cached Google Solar API response.
 * Returns null if the response lacks the expected `solarPanels` array.
 */
export function extractPanelLayoutFromRawJson(
  rawJson: unknown,
  fallbackLat: number,
  fallbackLng: number,
  imgWidth: number,
  imgHeight: number
): PanelLayoutInput | null {
  if (!rawJson || typeof rawJson !== 'object') return null
  const raw = rawJson as any
  const sp = raw.solarPotential
  if (!sp || !Array.isArray(sp.solarPanels) || sp.solarPanels.length === 0) {
    return null
  }

  const panels: SolarPanel[] = sp.solarPanels.filter(
    (p: any) =>
      p?.center &&
      typeof p.center.latitude === 'number' &&
      typeof p.center.longitude === 'number'
  )
  if (panels.length === 0) return null

  const segments: RoofSegmentStat[] = Array.isArray(sp.roofSegmentStats)
    ? sp.roofSegmentStats
    : []

  const panelWidthMeters: number = sp.panelWidthMeters || 1.045
  const panelHeightMeters: number = sp.panelHeightMeters || 1.879

  // Compute bounding box across all panels.
  let north = -Infinity,
    south = Infinity,
    east = -Infinity,
    west = Infinity
  for (const p of panels) {
    north = Math.max(north, p.center.latitude)
    south = Math.min(south, p.center.latitude)
    east = Math.max(east, p.center.longitude)
    west = Math.min(west, p.center.longitude)
  }
  const bbox = { north, south, east, west }

  // Prefer Solar API's reported building centre; else fall back to panel bbox centre.
  const center =
    raw.center && typeof raw.center.latitude === 'number'
      ? { latitude: raw.center.latitude, longitude: raw.center.longitude }
      : { latitude: (north + south) / 2, longitude: (east + west) / 2 }

  const zoom = pickZoomForBuilding(bbox, imgWidth, imgHeight)

  return {
    panels,
    segments,
    panelWidthMeters,
    panelHeightMeters,
    centerLat: center.latitude,
    centerLng: center.longitude,
    zoom,
    imgWidth,
    imgHeight,
    bbox,
  }
}

/**
 * Build the SVG string that wraps a set of panel rectangles. Kept in one place
 * so the Mapbox (Web Mercator) and Solar API (UTM) code paths both produce
 * visually identical overlays.
 */
function svgWithPanels(parts: string[], viewBoxW: number, viewBoxH: number): string {
  return `<svg class="panel-svg" viewBox="0 0 ${viewBoxW} ${viewBoxH}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="panelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e3a6b" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#0b1a3a" stop-opacity="0.95" />
      </linearGradient>
      <filter id="panelShadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="0.6" stdDeviation="0.4" flood-opacity="0.5" />
      </filter>
    </defs>
    <g fill="url(#panelGrad)" stroke="#4a68a0" stroke-width="0.35" filter="url(#panelShadow)">
      ${parts.join('')}
    </g>
  </svg>`
}

/**
 * Azimuth-to-rotation mapping.
 *
 * Google Solar API reports each roof segment's azimuth in degrees clockwise
 * from North — i.e. the compass direction the roof *faces* (downslope).
 * A panel's long axis is perpendicular to the downslope, so drawing it with
 * SVG rotate(azimuth) aligns the long side exactly along the ridge.
 * SVG rotation is clockwise, matching compass orientation.
 */
function rotationForAzimuth(azimuth: number): number {
  return azimuth
}

/**
 * Render an SVG overlay containing every panel drawn at its real pixel
 * position, sized to the real panel dimensions, and rotated to match each
 * roof segment's azimuth. Uses Web Mercator math — suitable for Mapbox
 * static satellite images.
 */
export function renderPanelArraySvg(layout: PanelLayoutInput): string {
  const { panels, segments, panelWidthMeters, panelHeightMeters, centerLat, centerLng, zoom, imgWidth, imgHeight } = layout

  // Panel dimensions in pixels at this zoom/latitude.
  const mpp = metersPerPixel(centerLat, zoom)
  // For LANDSCAPE orientation, the panel's long axis is horizontal *before rotation*.
  const longSidePx = panelHeightMeters / mpp
  const shortSidePx = panelWidthMeters / mpp

  const parts: string[] = []
  for (const panel of panels) {
    const { x, y } = latLngToImagePixel(
      panel.center.latitude,
      panel.center.longitude,
      centerLat,
      centerLng,
      zoom,
      imgWidth,
      imgHeight
    )
    if (x < -longSidePx || x > imgWidth + longSidePx || y < -longSidePx || y > imgHeight + longSidePx) {
      continue
    }

    const landscape = panel.orientation !== 'PORTRAIT'
    const w = landscape ? longSidePx : shortSidePx
    const h = landscape ? shortSidePx : longSidePx

    const segIdx = typeof panel.segmentIndex === 'number' ? panel.segmentIndex : -1
    const seg = segIdx >= 0 && segIdx < segments.length ? segments[segIdx] : undefined
    const azimuth = seg && typeof seg.azimuthDegrees === 'number' ? seg.azimuthDegrees : 0
    const rot = rotationForAzimuth(azimuth)

    parts.push(
      `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(1)})"><rect x="${(-w / 2).toFixed(2)}" y="${(-h / 2).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" /></g>`
    )
  }

  return svgWithPanels(parts, imgWidth, imgHeight)
}

/**
 * Projection-based panel rendering. Takes a caller-supplied `latLngToPixel`
 * closure plus the metres-per-pixel scale of the image, and draws every
 * panel at its true image-pixel location.
 *
 * Use this with any image whose pixel↔world projection is known ahead of time
 * (e.g. Solar API's UTM GeoTIFF, where the pixel mapping is derived from the
 * GeoTIFF's ModelTransformation instead of Web Mercator math).
 */
export function renderPanelArraySvgByProjection(args: {
  panels: SolarPanel[]
  segments: RoofSegmentStat[]
  panelWidthMeters: number
  panelHeightMeters: number
  metersPerPixel: number
  imgWidth: number
  imgHeight: number
  latLngToPixel: (lat: number, lng: number) => { x: number; y: number }
}): string {
  const {
    panels,
    segments,
    panelWidthMeters,
    panelHeightMeters,
    metersPerPixel,
    imgWidth,
    imgHeight,
    latLngToPixel,
  } = args

  const longSidePx = panelHeightMeters / metersPerPixel
  const shortSidePx = panelWidthMeters / metersPerPixel

  const parts: string[] = []
  for (const panel of panels) {
    const { x, y } = latLngToPixel(panel.center.latitude, panel.center.longitude)
    if (x < -longSidePx || x > imgWidth + longSidePx || y < -longSidePx || y > imgHeight + longSidePx) {
      continue
    }

    const landscape = panel.orientation !== 'PORTRAIT'
    const w = landscape ? longSidePx : shortSidePx
    const h = landscape ? shortSidePx : longSidePx

    const segIdx = typeof panel.segmentIndex === 'number' ? panel.segmentIndex : -1
    const seg = segIdx >= 0 && segIdx < segments.length ? segments[segIdx] : undefined
    const azimuth = seg && typeof seg.azimuthDegrees === 'number' ? seg.azimuthDegrees : 0
    const rot = rotationForAzimuth(azimuth)

    parts.push(
      `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(1)})"><rect x="${(-w / 2).toFixed(2)}" y="${(-h / 2).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" /></g>`
    )
  }

  return svgWithPanels(parts, imgWidth, imgHeight)
}
