/**
 * HTML template for the per-lead solar proposal PDF.
 *
 * Everything is inlined (no external CSS, no external JS, no Google Fonts @import
 * because the html2pdf service may not resolve them reliably). We use a
 * Mapbox Static Image API URL for the satellite photo of the roof, which works
 * from any server-side rendering context since it's a plain image URL.
 */

import type { BusinessCase } from './outreach'

export interface ProposalData {
  lead: {
    businessName: string | null
    businessType: string | null
    buildingType: string | null
    address: string | null
    city: string | null
    country: string | null
    latitude: number
    longitude: number
    roofAreaSqm: number | null
    contactPhone: string | null
    contactEmail: string | null
    website: string | null
    googleRating: number | null
    solarApiStatus: string | null
    solarMaxPanelCount: number | null
    solarMaxArrayAreaSqm: number | null
    solarYearlyEnergyKwh: number | null
    solarCarbonOffsetKgYr: number | null
    solarMaxSunshineHours: number | null
    solarPanelCapacityWatts: number | null
    solarPanelLifetimeYears: number | null
    solarImageryQuality: string | null
    solarImageryDate: string | null
    dataSource: string | null
  }
  businessCase: BusinessCase | null
  senderName: string
  senderCompany: string
  senderEmail: string | null
  senderPhone: string | null
  satelliteImageUrl: string | null
  generatedAt: string
}

function escape(input: string | null | undefined): string {
  if (input === null || input === undefined) return ''
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function num(n: number | null | undefined, decimals = 0): string {
  if (n === null || n === undefined || !isFinite(n)) return '–'
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function eur(n: number | null | undefined): string {
  if (n === null || n === undefined || !isFinite(n)) return '–'
  return '€' + Math.round(n).toLocaleString()
}

export function renderProposalHtml(data: ProposalData): string {
  const { lead, businessCase, senderName, senderCompany, senderEmail, senderPhone, satelliteImageUrl, generatedAt } = data
  const displayName = lead.businessName || 'Commercial rooftop'
  const addr = lead.address || `${lead.latitude.toFixed(5)}, ${lead.longitude.toFixed(5)}`
  const city = [lead.city, lead.country].filter(Boolean).join(', ')
  const hasRealSolar = lead.solarApiStatus === 'OK' && !!lead.solarYearlyEnergyKwh

  const panelKw =
    lead.solarMaxPanelCount && lead.solarPanelCapacityWatts
      ? (lead.solarMaxPanelCount * lead.solarPanelCapacityWatts) / 1000
      : null
  const lifetimeProductionMwh =
    lead.solarYearlyEnergyKwh && lead.solarPanelLifetimeYears
      ? (lead.solarYearlyEnergyKwh * lead.solarPanelLifetimeYears) / 1000
      : null

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Solar proposal — ${escape(displayName)}</title>
<style>
  @page { margin: 0; size: A4; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #1a1a1a; line-height: 1.4; }
  .page { width: 210mm; min-height: 297mm; padding: 18mm 16mm; position: relative; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  h1, h2, h3, h4 { margin: 0; font-weight: 700; letter-spacing: -0.01em; }
  h1 { font-size: 28px; color: #0a0a0a; }
  h2 { font-size: 18px; color: #0a0a0a; margin-bottom: 10px; }
  h3 { font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
  p  { margin: 0 0 10px 0; font-size: 11px; color: #374151; }
  .muted { color: #6b7280; }
  .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
  .brand-dot { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #f59e0b, #f97316); display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 15px; }
  .brand-name { font-weight: 800; font-size: 16px; letter-spacing: -0.01em; }
  .brand-tag { font-size: 10px; color: #6b7280; margin-top: 1px; }
  .hero { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; border-radius: 14px; padding: 20px; margin-bottom: 18px; }
  .hero .eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #b45309; }
  .hero .title { font-size: 26px; font-weight: 800; color: #111827; margin-top: 4px; }
  .hero .addr { color: #6b7280; font-size: 12px; margin-top: 6px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .kpi { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
  .kpi .label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; }
  .kpi .value { font-size: 20px; font-weight: 800; color: #111827; margin-top: 4px; }
  .kpi .sub { font-size: 10px; color: #6b7280; margin-top: 2px; }
  .kpi.accent .value { color: #d97706; }
  .section { margin-top: 18px; }
  .row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px; }
  .row:last-child { border-bottom: none; }
  .row .k { color: #6b7280; }
  .row .v { color: #111827; font-weight: 600; }
  .map-img { width: 100%; height: 180px; object-fit: cover; border-radius: 10px; border: 1px solid #e5e7eb; }
  .badge { display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
  .badge-amber { background: #fef3c7; color: #b45309; }
  .badge-emerald { background: #d1fae5; color: #065f46; }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .cta { background: #111827; color: white; border-radius: 12px; padding: 18px 20px; margin-top: 20px; }
  .cta h2 { color: white; margin-bottom: 6px; }
  .cta p { color: #d1d5db; }
  .cta .sender { margin-top: 12px; padding-top: 12px; border-top: 1px solid #374151; display: flex; gap: 16px; font-size: 10px; color: #d1d5db; }
  .cta .sender strong { color: white; }
  .footer { position: absolute; bottom: 12mm; left: 16mm; right: 16mm; border-top: 1px solid #e5e7eb; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #9ca3af; }
  .narrative { background: #f9fafb; border-left: 3px solid #f59e0b; padding: 12px 14px; border-radius: 0 10px 10px 0; font-size: 11px; color: #374151; line-height: 1.55; }
  .disclaimer { margin-top: 14px; font-size: 9px; color: #9ca3af; line-height: 1.5; }
</style>
</head>
<body>
<div class="page">
  <div class="brand">
    <span class="brand-dot">☀</span>
    <div>
      <div class="brand-name">${escape(senderCompany)}</div>
      <div class="brand-tag">Commercial rooftop solar • Proposal</div>
    </div>
  </div>

  <div class="hero">
    <div class="eyebrow">Rooftop solar proposal</div>
    <div class="title">${escape(displayName)}</div>
    <div class="addr">${escape(addr)}${city ? ' — ' + escape(city) : ''}</div>
    <div style="margin-top:10px">
      ${lead.businessType ? `<span class="badge badge-amber">${escape(lead.businessType)}</span>` : ''}
      ${hasRealSolar ? '<span class="badge badge-amber" style="margin-left:6px">Google Solar API verified</span>' : '<span class="badge badge-emerald" style="margin-left:6px">Preliminary estimate</span>'}
      ${lead.dataSource === 'GOOGLE_PLACES' || lead.dataSource === 'HYBRID' ? '<span class="badge badge-blue" style="margin-left:6px">Google Places data</span>' : ''}
    </div>
  </div>

  ${satelliteImageUrl ? `<img class="map-img" src="${escape(satelliteImageUrl)}" alt="Satellite view of the building" />` : ''}

  <div class="section">
    <h3>Business case</h3>
    <div class="grid-4" style="margin-top:8px">
      <div class="kpi">
        <div class="label">System size</div>
        <div class="value">${businessCase ? businessCase.systemKwp.toFixed(1) + ' kWp' : '–'}</div>
        <div class="sub">${businessCase ? num(businessCase.annualProductionKwh) + ' kWh / yr' : ''}</div>
      </div>
      <div class="kpi accent">
        <div class="label">Annual savings</div>
        <div class="value">${businessCase ? eur(businessCase.annualSavingsEur) : '–'}</div>
        <div class="sub">@ €${businessCase ? businessCase.electricityPrice.toFixed(2) : '0.20'} / kWh</div>
      </div>
      <div class="kpi">
        <div class="label">Payback</div>
        <div class="value">${businessCase ? businessCase.paybackYears.toFixed(1) + ' yrs' : '–'}</div>
        <div class="sub">${businessCase ? eur(businessCase.systemCostEur) + ' install' : ''}</div>
      </div>
      <div class="kpi accent">
        <div class="label">25-year ROI</div>
        <div class="value">${businessCase ? eur(businessCase.lifetimeSavingsEur) : '–'}</div>
        <div class="sub">${businessCase && businessCase.co2TonnesPerYear > 0 ? businessCase.co2TonnesPerYear.toFixed(1) + ' t CO₂ / yr' : ''}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="narrative">
      Based on our assessment of this ${escape(lead.buildingType || lead.businessType || 'commercial building')}${city ? ' in ' + escape(city) : ''}, a rooftop PV system of approximately <strong>${businessCase ? businessCase.systemKwp.toFixed(1) + ' kWp' : 'TBD'}</strong> would produce roughly <strong>${businessCase ? num(businessCase.annualProductionKwh) + ' kWh per year</strong>' : 'TBD'}. Assuming a commercial self-consumption ratio of 70% and the local electricity tariff of €${businessCase ? businessCase.electricityPrice.toFixed(2) : '0.20'}/kWh, this translates to <strong>${businessCase ? eur(businessCase.annualSavingsEur) + ' of annual savings</strong>' : 'significant annual savings</strong>'} with a payback period of <strong>${businessCase ? businessCase.paybackYears.toFixed(1) + ' years' : 'TBD'}</strong>. Over a 25-year panel lifetime the system delivers a net return of <strong>${businessCase ? eur(businessCase.lifetimeSavingsEur) : 'TBD'}</strong>.
    </div>
  </div>

  <div class="footer">
    <span>${escape(senderCompany)}</span>
    <span>Page 1 / 2 • Generated ${escape(generatedAt)}</span>
  </div>
</div>

<div class="page">
  <div class="brand">
    <span class="brand-dot">☀</span>
    <div>
      <div class="brand-name">${escape(senderCompany)}</div>
      <div class="brand-tag">Solar specifications • Property details</div>
    </div>
  </div>

  <div class="grid-2">
    <div>
      <h2>Rooftop & property</h2>
      <div class="row"><span class="k">Business</span><span class="v">${escape(displayName)}</span></div>
      <div class="row"><span class="k">Type</span><span class="v">${escape(lead.businessType || '–')}</span></div>
      <div class="row"><span class="k">Building</span><span class="v">${escape(lead.buildingType || '–')}</span></div>
      <div class="row"><span class="k">Address</span><span class="v">${escape(addr)}</span></div>
      <div class="row"><span class="k">City</span><span class="v">${escape(city || '–')}</span></div>
      <div class="row"><span class="k">Coordinates</span><span class="v" style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace">${lead.latitude.toFixed(5)}, ${lead.longitude.toFixed(5)}</span></div>
      <div class="row"><span class="k">Roof area (OSM)</span><span class="v">${num(lead.roofAreaSqm)} m²</span></div>
      ${typeof lead.googleRating === 'number' ? `<div class="row"><span class="k">Google rating</span><span class="v">★ ${lead.googleRating.toFixed(1)}</span></div>` : ''}
      ${lead.contactPhone ? `<div class="row"><span class="k">Phone</span><span class="v">${escape(lead.contactPhone)}</span></div>` : ''}
      ${lead.contactEmail ? `<div class="row"><span class="k">Email</span><span class="v">${escape(lead.contactEmail)}</span></div>` : ''}
      ${lead.website ? `<div class="row"><span class="k">Website</span><span class="v">${escape(lead.website)}</span></div>` : ''}
    </div>
    <div>
      <h2>Solar specification</h2>
      <div class="row"><span class="k">Data source</span><span class="v">${hasRealSolar ? 'Google Solar API' : 'Estimate from roof area'}</span></div>
      ${lead.solarImageryQuality ? `<div class="row"><span class="k">Imagery quality</span><span class="v">${escape(lead.solarImageryQuality)}</span></div>` : ''}
      ${lead.solarImageryDate ? `<div class="row"><span class="k">Imagery date</span><span class="v">${escape(lead.solarImageryDate)}</span></div>` : ''}
      <div class="row"><span class="k">Max panels</span><span class="v">${num(lead.solarMaxPanelCount)}</span></div>
      <div class="row"><span class="k">Max array area</span><span class="v">${num(lead.solarMaxArrayAreaSqm)} m²</span></div>
      <div class="row"><span class="k">System (DC)</span><span class="v">${panelKw ? panelKw.toFixed(1) + ' kWp' : '–'}</span></div>
      <div class="row"><span class="k">Annual production</span><span class="v">${num(lead.solarYearlyEnergyKwh)} kWh / yr</span></div>
      <div class="row"><span class="k">Peak sunshine</span><span class="v">${num(lead.solarMaxSunshineHours)} h / yr</span></div>
      <div class="row"><span class="k">Lifetime production</span><span class="v">${lifetimeProductionMwh ? num(lifetimeProductionMwh) + ' MWh' : '–'}</span></div>
      <div class="row"><span class="k">CO₂ offset</span><span class="v">${lead.solarCarbonOffsetKgYr ? (lead.solarCarbonOffsetKgYr / 1000).toFixed(1) + ' t / yr' : '–'}</span></div>
      <div class="row"><span class="k">Panel capacity</span><span class="v">${lead.solarPanelCapacityWatts ? lead.solarPanelCapacityWatts + ' W' : '–'}</span></div>
      <div class="row"><span class="k">Panel lifetime</span><span class="v">${lead.solarPanelLifetimeYears ? lead.solarPanelLifetimeYears + ' years' : '–'}</span></div>
    </div>
  </div>

  <div class="section">
    <h2>Financial model</h2>
    <div class="grid-2" style="margin-top:6px">
      <div>
        <div class="row"><span class="k">Install cost (turn-key)</span><span class="v">${businessCase ? eur(businessCase.systemCostEur) : '–'}</span></div>
        <div class="row"><span class="k">Electricity tariff</span><span class="v">€${businessCase ? businessCase.electricityPrice.toFixed(2) : '–'} / kWh</span></div>
        <div class="row"><span class="k">Self-consumption</span><span class="v">${businessCase ? Math.round(businessCase.selfConsumedKwh).toLocaleString() : '–'} kWh / yr</span></div>
        <div class="row"><span class="k">Assumed self-consumption ratio</span><span class="v">70%</span></div>
      </div>
      <div>
        <div class="row"><span class="k">Annual savings</span><span class="v">${businessCase ? eur(businessCase.annualSavingsEur) : '–'}</span></div>
        <div class="row"><span class="k">Payback period</span><span class="v">${businessCase ? businessCase.paybackYears.toFixed(1) + ' years' : '–'}</span></div>
        <div class="row"><span class="k">System lifetime</span><span class="v">${businessCase ? businessCase.lifetimeYears + ' years' : '–'}</span></div>
        <div class="row"><span class="k">Net lifetime savings</span><span class="v">${businessCase ? eur(businessCase.lifetimeSavingsEur) : '–'}</span></div>
      </div>
    </div>
  </div>

  <div class="cta">
    <h2>Next step: a 15-minute site review</h2>
    <p>We'd like to validate these numbers with a short on-site visit or video call to review the roof, current electricity bills, and any grid-connection constraints. We'll then send a fixed-price quote within 48 hours.</p>
    <div class="sender">
      <div><strong>${escape(senderName)}</strong><br/>${escape(senderCompany)}</div>
      ${senderEmail ? `<div><strong>Email</strong><br/>${escape(senderEmail)}</div>` : ''}
      ${senderPhone ? `<div><strong>Phone</strong><br/>${escape(senderPhone)}</div>` : ''}
    </div>
  </div>

  <p class="disclaimer">Figures in this proposal are based on ${hasRealSolar ? 'Google Solar API rooftop data and' : 'preliminary roof-area estimates and'} assumed commercial electricity tariffs. Actual system size, production and savings depend on site-specific factors including roof structure, shading, orientation, grid-connection limits, and current electricity contract. A detailed engineering survey is required before any binding proposal.</p>

  <div class="footer">
    <span>${escape(senderCompany)}</span>
    <span>Page 2 / 2 • Generated ${escape(generatedAt)}</span>
  </div>
</div>
</body>
</html>`
}
