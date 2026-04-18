/**
 * Translations for the PDF proposal template.
 *
 * Five languages match the SUPPORTED_LANGUAGES list used throughout the app
 * (en, es, pt, ro, sq). The UI lets the user pick a language explicitly; when
 * they don't, we default to the country's native language via
 * `defaultLanguageForCountry()` from ./outreach.ts.
 */

import type { OutreachLanguage } from './outreach'

export type ProposalLanguage = OutreachLanguage

export interface ProposalStrings {
  // Header / hero
  brandTagPage1: string
  brandTagPage2: string
  heroEyebrow: string
  fallbackBusinessName: string
  fallbackLocationDescriptor: string
  solarVerified: string
  preliminaryEstimate: string
  googlePlacesData: string

  // Before/after visualization
  visualizationTitle: string
  beforeLabel: string
  afterLabel: string
  imageUnavailable: string
  currentRooftop: string
  usableSurfaceSuffix: string // e.g. "m² of usable surface"
  withPanelsTemplate: (opts: { count: string; kwp?: string; isEstimate: boolean }) => string

  // Business case (page 1 KPIs)
  businessCaseTitle: string
  kpiSystemSize: string
  kpiAnnualSavings: string
  kpiAnnualSavingsSubTemplate: (price: string) => string // "@ €0.20 / kWh"
  kpiPayback: string
  kpiPaybackSubTemplate: (cost: string) => string // "€X install"
  kpi25YearRoi: string
  kwhPerYr: string
  yrsShort: string
  tCo2PerYr: string

  // Narrative paragraph
  narrativeTemplate: (opts: {
    buildingDescriptor: string
    cityClause: string
    systemKwp: string
    annualProductionKwh: string
    electricityPrice: string
    annualSavings: string
    paybackYears: string
    lifetimeSavings: string
  }) => string

  // Footer
  footerPageTemplate: (page: number, total: number, date: string) => string

  // Page 2 — property details
  page2PropertyTitle: string
  page2SolarTitle: string
  page2FinancialTitle: string
  fieldBusiness: string
  fieldType: string
  fieldBuilding: string
  fieldAddress: string
  fieldCity: string
  fieldCoordinates: string
  fieldRoofAreaOsm: string
  fieldGoogleRating: string
  fieldPhone: string
  fieldEmail: string
  fieldWebsite: string

  // Page 2 — solar spec
  fieldDataSource: string
  dataSourceSolar: string
  dataSourceEstimate: string
  fieldImageryQuality: string
  fieldImageryDate: string
  fieldMaxPanels: string
  fieldMaxArrayArea: string
  fieldSystemDc: string
  fieldAnnualProduction: string
  fieldPeakSunshine: string
  fieldLifetimeProduction: string
  fieldCo2Offset: string
  fieldPanelCapacity: string
  fieldPanelLifetime: string
  yearsSuffix: string
  tPerYrSuffix: string
  hPerYrSuffix: string

  // Page 2 — financial model
  fieldInstallCost: string
  fieldElectricityTariff: string
  fieldSelfConsumption: string
  fieldAssumedSelfConsumption: string
  fieldAnnualSavings: string
  fieldPaybackPeriod: string
  fieldSystemLifetime: string
  fieldNetLifetimeSavings: string

  // CTA
  ctaTitle: string
  ctaBody: string

  // Disclaimer
  disclaimer: (hasRealSolar: boolean) => string
}

const en: ProposalStrings = {
  brandTagPage1: 'Commercial rooftop solar • Proposal',
  brandTagPage2: 'Solar specifications • Property details',
  heroEyebrow: 'Rooftop solar proposal',
  fallbackBusinessName: 'Commercial rooftop',
  fallbackLocationDescriptor: 'commercial building',
  solarVerified: 'Google Solar API verified',
  preliminaryEstimate: 'Preliminary estimate',
  googlePlacesData: 'Google Places data',

  visualizationTitle: 'Rooftop visualization — before & after',
  beforeLabel: 'Before',
  afterLabel: 'After',
  imageUnavailable: 'Satellite image unavailable',
  currentRooftop: 'Current rooftop',
  usableSurfaceSuffix: 'm² of usable surface',
  withPanelsTemplate: ({ count, kwp, isEstimate }) => {
    const prefix = isEstimate ? `With ~${count} solar panels` : `With ${count} solar panels`
    if (!kwp) return prefix
    return `${prefix} — ${kwp} kWp system${isEstimate ? ' (estimated)' : ''}`
  },

  businessCaseTitle: 'Business case',
  kpiSystemSize: 'System size',
  kpiAnnualSavings: 'Annual savings',
  kpiAnnualSavingsSubTemplate: (price) => `@ €${price} / kWh`,
  kpiPayback: 'Payback',
  kpiPaybackSubTemplate: (cost) => `${cost} install`,
  kpi25YearRoi: '25-year ROI',
  kwhPerYr: 'kWh / yr',
  yrsShort: 'yrs',
  tCo2PerYr: 't CO₂ / yr',

  narrativeTemplate: ({ buildingDescriptor, cityClause, systemKwp, annualProductionKwh, electricityPrice, annualSavings, paybackYears, lifetimeSavings }) =>
    `Based on our assessment of this ${buildingDescriptor}${cityClause}, a rooftop PV system of approximately <strong>${systemKwp} kWp</strong> would produce roughly <strong>${annualProductionKwh} kWh per year</strong>. Assuming a commercial self-consumption ratio of 70% and the local electricity tariff of €${electricityPrice}/kWh, this translates to <strong>${annualSavings} of annual savings</strong> with a payback period of <strong>${paybackYears} years</strong>. Over a 25-year panel lifetime the system delivers a net return of <strong>${lifetimeSavings}</strong>.`,

  footerPageTemplate: (page, total, date) => `Page ${page} / ${total} • Generated ${date}`,

  page2PropertyTitle: 'Rooftop & property',
  page2SolarTitle: 'Solar specification',
  page2FinancialTitle: 'Financial model',
  fieldBusiness: 'Business',
  fieldType: 'Type',
  fieldBuilding: 'Building',
  fieldAddress: 'Address',
  fieldCity: 'City',
  fieldCoordinates: 'Coordinates',
  fieldRoofAreaOsm: 'Roof area (OSM)',
  fieldGoogleRating: 'Google rating',
  fieldPhone: 'Phone',
  fieldEmail: 'Email',
  fieldWebsite: 'Website',

  fieldDataSource: 'Data source',
  dataSourceSolar: 'Google Solar API',
  dataSourceEstimate: 'Estimate from roof area',
  fieldImageryQuality: 'Imagery quality',
  fieldImageryDate: 'Imagery date',
  fieldMaxPanels: 'Max panels',
  fieldMaxArrayArea: 'Max array area',
  fieldSystemDc: 'System (DC)',
  fieldAnnualProduction: 'Annual production',
  fieldPeakSunshine: 'Peak sunshine',
  fieldLifetimeProduction: 'Lifetime production',
  fieldCo2Offset: 'CO₂ offset',
  fieldPanelCapacity: 'Panel capacity',
  fieldPanelLifetime: 'Panel lifetime',
  yearsSuffix: 'years',
  tPerYrSuffix: 't / yr',
  hPerYrSuffix: 'h / yr',

  fieldInstallCost: 'Install cost (turn-key)',
  fieldElectricityTariff: 'Electricity tariff',
  fieldSelfConsumption: 'Self-consumption',
  fieldAssumedSelfConsumption: 'Assumed self-consumption ratio',
  fieldAnnualSavings: 'Annual savings',
  fieldPaybackPeriod: 'Payback period',
  fieldSystemLifetime: 'System lifetime',
  fieldNetLifetimeSavings: 'Net lifetime savings',

  ctaTitle: 'Next step: a 15-minute site review',
  ctaBody:
    "We'd like to validate these numbers with a short on-site visit or video call to review the roof, current electricity bills, and any grid-connection constraints. We'll then send a fixed-price quote within 48 hours.",

  disclaimer: (hasRealSolar) =>
    `Figures in this proposal are based on ${hasRealSolar ? 'Google Solar API rooftop data and' : 'preliminary roof-area estimates and'} assumed commercial electricity tariffs. Actual system size, production and savings depend on site-specific factors including roof structure, shading, orientation, grid-connection limits, and current electricity contract. A detailed engineering survey is required before any binding proposal. Before/after visualization is illustrative and does not reflect the final panel layout.`,
}

const es: ProposalStrings = {
  brandTagPage1: 'Solar comercial en cubierta • Propuesta',
  brandTagPage2: 'Especificaciones solares • Detalles de la propiedad',
  heroEyebrow: 'Propuesta solar para cubierta',
  fallbackBusinessName: 'Cubierta comercial',
  fallbackLocationDescriptor: 'edificio comercial',
  solarVerified: 'Verificado con Google Solar API',
  preliminaryEstimate: 'Estimación preliminar',
  googlePlacesData: 'Datos de Google Places',

  visualizationTitle: 'Visualización de cubierta — antes y después',
  beforeLabel: 'Antes',
  afterLabel: 'Después',
  imageUnavailable: 'Imagen satelital no disponible',
  currentRooftop: 'Cubierta actual',
  usableSurfaceSuffix: 'm² de superficie útil',
  withPanelsTemplate: ({ count, kwp, isEstimate }) => {
    const prefix = isEstimate ? `Con ~${count} paneles solares` : `Con ${count} paneles solares`
    if (!kwp) return prefix
    return `${prefix} — sistema de ${kwp} kWp${isEstimate ? ' (estimado)' : ''}`
  },

  businessCaseTitle: 'Caso de negocio',
  kpiSystemSize: 'Tamaño del sistema',
  kpiAnnualSavings: 'Ahorro anual',
  kpiAnnualSavingsSubTemplate: (price) => `@ €${price} / kWh`,
  kpiPayback: 'Retorno',
  kpiPaybackSubTemplate: (cost) => `${cost} de inversión`,
  kpi25YearRoi: 'ROI a 25 años',
  kwhPerYr: 'kWh / año',
  yrsShort: 'años',
  tCo2PerYr: 't CO₂ / año',

  narrativeTemplate: ({ buildingDescriptor, cityClause, systemKwp, annualProductionKwh, electricityPrice, annualSavings, paybackYears, lifetimeSavings }) =>
    `Según nuestra evaluación de este ${buildingDescriptor}${cityClause}, una instalación fotovoltaica de aproximadamente <strong>${systemKwp} kWp</strong> produciría alrededor de <strong>${annualProductionKwh} kWh al año</strong>. Asumiendo una ratio de autoconsumo comercial del 70% y la tarifa eléctrica local de €${electricityPrice}/kWh, esto se traduce en <strong>${annualSavings} de ahorro anual</strong> con un plazo de retorno de <strong>${paybackYears} años</strong>. A lo largo de una vida útil de 25 años, el sistema genera un retorno neto de <strong>${lifetimeSavings}</strong>.`,

  footerPageTemplate: (page, total, date) => `Página ${page} / ${total} • Generado el ${date}`,

  page2PropertyTitle: 'Cubierta y propiedad',
  page2SolarTitle: 'Especificación solar',
  page2FinancialTitle: 'Modelo financiero',
  fieldBusiness: 'Negocio',
  fieldType: 'Tipo',
  fieldBuilding: 'Edificio',
  fieldAddress: 'Dirección',
  fieldCity: 'Ciudad',
  fieldCoordinates: 'Coordenadas',
  fieldRoofAreaOsm: 'Superficie de cubierta (OSM)',
  fieldGoogleRating: 'Valoración de Google',
  fieldPhone: 'Teléfono',
  fieldEmail: 'Correo',
  fieldWebsite: 'Sitio web',

  fieldDataSource: 'Fuente de datos',
  dataSourceSolar: 'Google Solar API',
  dataSourceEstimate: 'Estimación por área de cubierta',
  fieldImageryQuality: 'Calidad de imagen',
  fieldImageryDate: 'Fecha de imagen',
  fieldMaxPanels: 'Paneles máximos',
  fieldMaxArrayArea: 'Superficie máxima del array',
  fieldSystemDc: 'Sistema (DC)',
  fieldAnnualProduction: 'Producción anual',
  fieldPeakSunshine: 'Horas pico de sol',
  fieldLifetimeProduction: 'Producción total',
  fieldCo2Offset: 'Ahorro de CO₂',
  fieldPanelCapacity: 'Capacidad por panel',
  fieldPanelLifetime: 'Vida útil del panel',
  yearsSuffix: 'años',
  tPerYrSuffix: 't / año',
  hPerYrSuffix: 'h / año',

  fieldInstallCost: 'Coste de instalación (llave en mano)',
  fieldElectricityTariff: 'Tarifa eléctrica',
  fieldSelfConsumption: 'Autoconsumo',
  fieldAssumedSelfConsumption: 'Ratio de autoconsumo asumido',
  fieldAnnualSavings: 'Ahorro anual',
  fieldPaybackPeriod: 'Plazo de retorno',
  fieldSystemLifetime: 'Vida útil del sistema',
  fieldNetLifetimeSavings: 'Ahorro neto total',

  ctaTitle: 'Siguiente paso: revisión in situ de 15 minutos',
  ctaBody:
    'Nos gustaría validar estos datos con una breve visita in situ o videollamada para revisar la cubierta, las facturas eléctricas actuales y las limitaciones de conexión a red. En 48 horas le enviaremos una oferta a precio cerrado.',

  disclaimer: (hasRealSolar) =>
    `Las cifras de esta propuesta se basan en ${hasRealSolar ? 'datos de cubierta de Google Solar API y' : 'estimaciones preliminares de superficie de cubierta y'} tarifas eléctricas comerciales asumidas. El tamaño real del sistema, la producción y los ahorros dependen de factores específicos del emplazamiento como la estructura de la cubierta, sombras, orientación, límites de conexión a red y contrato eléctrico vigente. Se requiere un estudio de ingeniería detallado antes de cualquier propuesta vinculante. La visualización antes/después es ilustrativa y no refleja la disposición final de los paneles.`,
}

const pt: ProposalStrings = {
  brandTagPage1: 'Solar comercial em cobertura • Proposta',
  brandTagPage2: 'Especificações solares • Detalhes do imóvel',
  heroEyebrow: 'Proposta solar para cobertura',
  fallbackBusinessName: 'Cobertura comercial',
  fallbackLocationDescriptor: 'edifício comercial',
  solarVerified: 'Verificado com Google Solar API',
  preliminaryEstimate: 'Estimativa preliminar',
  googlePlacesData: 'Dados do Google Places',

  visualizationTitle: 'Visualização da cobertura — antes e depois',
  beforeLabel: 'Antes',
  afterLabel: 'Depois',
  imageUnavailable: 'Imagem de satélite indisponível',
  currentRooftop: 'Cobertura atual',
  usableSurfaceSuffix: 'm² de superfície útil',
  withPanelsTemplate: ({ count, kwp, isEstimate }) => {
    const prefix = isEstimate ? `Com ~${count} painéis solares` : `Com ${count} painéis solares`
    if (!kwp) return prefix
    return `${prefix} — sistema de ${kwp} kWp${isEstimate ? ' (estimado)' : ''}`
  },

  businessCaseTitle: 'Caso de negócio',
  kpiSystemSize: 'Tamanho do sistema',
  kpiAnnualSavings: 'Poupança anual',
  kpiAnnualSavingsSubTemplate: (price) => `@ €${price} / kWh`,
  kpiPayback: 'Retorno',
  kpiPaybackSubTemplate: (cost) => `${cost} de instalação`,
  kpi25YearRoi: 'ROI a 25 anos',
  kwhPerYr: 'kWh / ano',
  yrsShort: 'anos',
  tCo2PerYr: 't CO₂ / ano',

  narrativeTemplate: ({ buildingDescriptor, cityClause, systemKwp, annualProductionKwh, electricityPrice, annualSavings, paybackYears, lifetimeSavings }) =>
    `Com base na nossa avaliação deste ${buildingDescriptor}${cityClause}, uma instalação fotovoltaica em cobertura de aproximadamente <strong>${systemKwp} kWp</strong> produziria cerca de <strong>${annualProductionKwh} kWh por ano</strong>. Assumindo uma taxa de autoconsumo comercial de 70% e a tarifa elétrica local de €${electricityPrice}/kWh, isto traduz-se em <strong>${annualSavings} de poupança anual</strong> com um período de retorno de <strong>${paybackYears} anos</strong>. Ao longo de 25 anos de vida útil, o sistema gera um retorno líquido de <strong>${lifetimeSavings}</strong>.`,

  footerPageTemplate: (page, total, date) => `Página ${page} / ${total} • Gerado em ${date}`,

  page2PropertyTitle: 'Cobertura e imóvel',
  page2SolarTitle: 'Especificação solar',
  page2FinancialTitle: 'Modelo financeiro',
  fieldBusiness: 'Negócio',
  fieldType: 'Tipo',
  fieldBuilding: 'Edifício',
  fieldAddress: 'Endereço',
  fieldCity: 'Cidade',
  fieldCoordinates: 'Coordenadas',
  fieldRoofAreaOsm: 'Área de cobertura (OSM)',
  fieldGoogleRating: 'Avaliação Google',
  fieldPhone: 'Telefone',
  fieldEmail: 'E-mail',
  fieldWebsite: 'Website',

  fieldDataSource: 'Fonte de dados',
  dataSourceSolar: 'Google Solar API',
  dataSourceEstimate: 'Estimativa por área de cobertura',
  fieldImageryQuality: 'Qualidade da imagem',
  fieldImageryDate: 'Data da imagem',
  fieldMaxPanels: 'Painéis máximos',
  fieldMaxArrayArea: 'Área máxima do array',
  fieldSystemDc: 'Sistema (DC)',
  fieldAnnualProduction: 'Produção anual',
  fieldPeakSunshine: 'Horas de pico solar',
  fieldLifetimeProduction: 'Produção total',
  fieldCo2Offset: 'Redução de CO₂',
  fieldPanelCapacity: 'Capacidade por painel',
  fieldPanelLifetime: 'Vida útil do painel',
  yearsSuffix: 'anos',
  tPerYrSuffix: 't / ano',
  hPerYrSuffix: 'h / ano',

  fieldInstallCost: 'Custo de instalação (chave-na-mão)',
  fieldElectricityTariff: 'Tarifa elétrica',
  fieldSelfConsumption: 'Autoconsumo',
  fieldAssumedSelfConsumption: 'Rácio de autoconsumo assumido',
  fieldAnnualSavings: 'Poupança anual',
  fieldPaybackPeriod: 'Período de retorno',
  fieldSystemLifetime: 'Vida útil do sistema',
  fieldNetLifetimeSavings: 'Poupança líquida total',

  ctaTitle: 'Próximo passo: visita ao local de 15 minutos',
  ctaBody:
    'Gostaríamos de validar estes números com uma breve visita ao local ou videochamada para rever a cobertura, as faturas elétricas atuais e eventuais restrições de ligação à rede. Dentro de 48 horas enviaremos uma proposta a preço fechado.',

  disclaimer: (hasRealSolar) =>
    `Os valores nesta proposta são baseados em ${hasRealSolar ? 'dados de cobertura do Google Solar API e' : 'estimativas preliminares da área de cobertura e'} tarifas elétricas comerciais assumidas. O tamanho real do sistema, a produção e as poupanças dependem de fatores específicos do local, incluindo estrutura da cobertura, sombreamento, orientação, limites de ligação à rede e contrato de eletricidade atual. É necessário um levantamento de engenharia detalhado antes de qualquer proposta vinculativa. A visualização antes/depois é ilustrativa e não reflete o layout final dos painéis.`,
}

const ro: ProposalStrings = {
  brandTagPage1: 'Energie solară comercială pe acoperiș • Ofertă',
  brandTagPage2: 'Specificații solare • Detalii proprietate',
  heroEyebrow: 'Ofertă solară pentru acoperiș',
  fallbackBusinessName: 'Acoperiș comercial',
  fallbackLocationDescriptor: 'clădire comercială',
  solarVerified: 'Verificat prin Google Solar API',
  preliminaryEstimate: 'Estimare preliminară',
  googlePlacesData: 'Date Google Places',

  visualizationTitle: 'Vizualizare acoperiș — înainte și după',
  beforeLabel: 'Înainte',
  afterLabel: 'După',
  imageUnavailable: 'Imaginea satelit nu este disponibilă',
  currentRooftop: 'Acoperiș actual',
  usableSurfaceSuffix: 'm² de suprafață utilă',
  withPanelsTemplate: ({ count, kwp, isEstimate }) => {
    const prefix = isEstimate ? `Cu ~${count} panouri solare` : `Cu ${count} panouri solare`
    if (!kwp) return prefix
    return `${prefix} — sistem de ${kwp} kWp${isEstimate ? ' (estimat)' : ''}`
  },

  businessCaseTitle: 'Analiză de business',
  kpiSystemSize: 'Dimensiune sistem',
  kpiAnnualSavings: 'Economii anuale',
  kpiAnnualSavingsSubTemplate: (price) => `@ €${price} / kWh`,
  kpiPayback: 'Amortizare',
  kpiPaybackSubTemplate: (cost) => `${cost} instalare`,
  kpi25YearRoi: 'ROI pe 25 de ani',
  kwhPerYr: 'kWh / an',
  yrsShort: 'ani',
  tCo2PerYr: 't CO₂ / an',

  narrativeTemplate: ({ buildingDescriptor, cityClause, systemKwp, annualProductionKwh, electricityPrice, annualSavings, paybackYears, lifetimeSavings }) =>
    `Pe baza evaluării acestei ${buildingDescriptor}${cityClause}, un sistem fotovoltaic pe acoperiș de aproximativ <strong>${systemKwp} kWp</strong> ar produce circa <strong>${annualProductionKwh} kWh pe an</strong>. Presupunând un raport de autoconsum comercial de 70% și tariful local de €${electricityPrice}/kWh, aceasta înseamnă <strong>${annualSavings} economii anuale</strong> cu o perioadă de amortizare de <strong>${paybackYears} ani</strong>. Pe durata de viață de 25 de ani, sistemul generează un retur net de <strong>${lifetimeSavings}</strong>.`,

  footerPageTemplate: (page, total, date) => `Pagina ${page} / ${total} • Generat ${date}`,

  page2PropertyTitle: 'Acoperiș și proprietate',
  page2SolarTitle: 'Specificație solară',
  page2FinancialTitle: 'Model financiar',
  fieldBusiness: 'Business',
  fieldType: 'Tip',
  fieldBuilding: 'Clădire',
  fieldAddress: 'Adresă',
  fieldCity: 'Oraș',
  fieldCoordinates: 'Coordonate',
  fieldRoofAreaOsm: 'Suprafață acoperiș (OSM)',
  fieldGoogleRating: 'Evaluare Google',
  fieldPhone: 'Telefon',
  fieldEmail: 'Email',
  fieldWebsite: 'Website',

  fieldDataSource: 'Sursă de date',
  dataSourceSolar: 'Google Solar API',
  dataSourceEstimate: 'Estimare după suprafața acoperișului',
  fieldImageryQuality: 'Calitate imagine',
  fieldImageryDate: 'Dată imagine',
  fieldMaxPanels: 'Panouri maxime',
  fieldMaxArrayArea: 'Suprafață maximă panouri',
  fieldSystemDc: 'Sistem (DC)',
  fieldAnnualProduction: 'Producție anuală',
  fieldPeakSunshine: 'Ore maxime de soare',
  fieldLifetimeProduction: 'Producție totală',
  fieldCo2Offset: 'Reducere CO₂',
  fieldPanelCapacity: 'Capacitate panou',
  fieldPanelLifetime: 'Durată de viață panou',
  yearsSuffix: 'ani',
  tPerYrSuffix: 't / an',
  hPerYrSuffix: 'h / an',

  fieldInstallCost: 'Cost instalare (la cheie)',
  fieldElectricityTariff: 'Tarif electricitate',
  fieldSelfConsumption: 'Autoconsum',
  fieldAssumedSelfConsumption: 'Raport autoconsum asumat',
  fieldAnnualSavings: 'Economii anuale',
  fieldPaybackPeriod: 'Perioadă de amortizare',
  fieldSystemLifetime: 'Durată de viață sistem',
  fieldNetLifetimeSavings: 'Economii nete totale',

  ctaTitle: 'Următorul pas: vizită la fața locului de 15 minute',
  ctaBody:
    'Dorim să validăm aceste cifre printr-o scurtă vizită la fața locului sau un apel video pentru a analiza acoperișul, facturile actuale de energie electrică și eventualele constrângeri de racordare la rețea. În 48 de ore veți primi o ofertă la preț fix.',

  disclaimer: (hasRealSolar) =>
    `Cifrele din această ofertă se bazează pe ${hasRealSolar ? 'date Google Solar API privind acoperișul și' : 'estimări preliminare ale suprafeței acoperișului și'} tarife comerciale de electricitate asumate. Dimensiunea reală a sistemului, producția și economiile depind de factori specifici locației, inclusiv structura acoperișului, umbrire, orientare, limite de racordare la rețea și contractul actual de electricitate. Un studiu tehnic detaliat este necesar înaintea oricărei oferte ferme. Vizualizarea înainte/după este ilustrativă și nu reflectă aranjamentul final al panourilor.`,
}

const sq: ProposalStrings = {
  brandTagPage1: 'Solar komercial në çati • Propozim',
  brandTagPage2: 'Specifikime solare • Detaje të pronës',
  heroEyebrow: 'Propozim solar për çatinë',
  fallbackBusinessName: 'Çati komerciale',
  fallbackLocationDescriptor: 'ndërtesë komerciale',
  solarVerified: 'E verifikuar me Google Solar API',
  preliminaryEstimate: 'Vlerësim paraprak',
  googlePlacesData: 'Të dhëna Google Places',

  visualizationTitle: 'Vizualizim i çatisë — para dhe pas',
  beforeLabel: 'Para',
  afterLabel: 'Pas',
  imageUnavailable: 'Imazhi satelitor nuk është i disponueshëm',
  currentRooftop: 'Çatia aktuale',
  usableSurfaceSuffix: 'm² sipërfaqe e përdorshme',
  withPanelsTemplate: ({ count, kwp, isEstimate }) => {
    const prefix = isEstimate ? `Me ~${count} panele diellore` : `Me ${count} panele diellore`
    if (!kwp) return prefix
    return `${prefix} — sistem ${kwp} kWp${isEstimate ? ' (i vlerësuar)' : ''}`
  },

  businessCaseTitle: 'Rasti i biznesit',
  kpiSystemSize: 'Madhësia e sistemit',
  kpiAnnualSavings: 'Kursimi vjetor',
  kpiAnnualSavingsSubTemplate: (price) => `@ €${price} / kWh`,
  kpiPayback: 'Kthimi',
  kpiPaybackSubTemplate: (cost) => `${cost} instalim`,
  kpi25YearRoi: 'ROI për 25 vjet',
  kwhPerYr: 'kWh / vit',
  yrsShort: 'vjet',
  tCo2PerYr: 't CO₂ / vit',

  narrativeTemplate: ({ buildingDescriptor, cityClause, systemKwp, annualProductionKwh, electricityPrice, annualSavings, paybackYears, lifetimeSavings }) =>
    `Bazuar në vlerësimin e kësaj ${buildingDescriptor}${cityClause}, një sistem fotovoltaik në çati prej afërsisht <strong>${systemKwp} kWp</strong> do të prodhonte rreth <strong>${annualProductionKwh} kWh në vit</strong>. Duke marrë një raport vetëkonsumi komercial 70% dhe tarifën lokale të energjisë prej €${electricityPrice}/kWh, kjo përkthehet në <strong>${annualSavings} kursime vjetore</strong> me një periudhë kthimi prej <strong>${paybackYears} vjet</strong>. Gjatë jetëgjatësisë 25-vjeçare, sistemi gjeneron një kthim neto prej <strong>${lifetimeSavings}</strong>.`,

  footerPageTemplate: (page, total, date) => `Faqe ${page} / ${total} • Gjeneruar më ${date}`,

  page2PropertyTitle: 'Çatia dhe prona',
  page2SolarTitle: 'Specifikim solar',
  page2FinancialTitle: 'Modeli financiar',
  fieldBusiness: 'Biznesi',
  fieldType: 'Lloji',
  fieldBuilding: 'Ndërtesa',
  fieldAddress: 'Adresa',
  fieldCity: 'Qyteti',
  fieldCoordinates: 'Koordinatat',
  fieldRoofAreaOsm: 'Sipërfaqe çatie (OSM)',
  fieldGoogleRating: 'Vlerësim Google',
  fieldPhone: 'Telefon',
  fieldEmail: 'Email',
  fieldWebsite: 'Website',

  fieldDataSource: 'Burimi i të dhënave',
  dataSourceSolar: 'Google Solar API',
  dataSourceEstimate: 'Vlerësim nga sipërfaqja e çatisë',
  fieldImageryQuality: 'Cilësia e imazhit',
  fieldImageryDate: 'Data e imazhit',
  fieldMaxPanels: 'Panele maksimale',
  fieldMaxArrayArea: 'Sipërfaqe maksimale paneli',
  fieldSystemDc: 'Sistemi (DC)',
  fieldAnnualProduction: 'Prodhimi vjetor',
  fieldPeakSunshine: 'Orë maksimale dielli',
  fieldLifetimeProduction: 'Prodhimi total',
  fieldCo2Offset: 'Reduktim CO₂',
  fieldPanelCapacity: 'Kapaciteti i panelit',
  fieldPanelLifetime: 'Jetëgjatësia e panelit',
  yearsSuffix: 'vjet',
  tPerYrSuffix: 't / vit',
  hPerYrSuffix: 'h / vit',

  fieldInstallCost: 'Kosto instalimi (çelës-në-dorë)',
  fieldElectricityTariff: 'Tarifa e energjisë',
  fieldSelfConsumption: 'Vetëkonsumi',
  fieldAssumedSelfConsumption: 'Raporti i vetëkonsumit i supozuar',
  fieldAnnualSavings: 'Kursimi vjetor',
  fieldPaybackPeriod: 'Periudha e kthimit',
  fieldSystemLifetime: 'Jetëgjatësia e sistemit',
  fieldNetLifetimeSavings: 'Kursimi neto total',

  ctaTitle: 'Hapi tjetër: rishikim 15-minutësh në vend',
  ctaBody:
    'Dëshirojmë t\'i vlerësojmë këto shifra me një vizitë të shkurtër në vend ose me një thirrje video për të shqyrtuar çatinë, faturat aktuale të energjisë dhe eventualisht kufizimet e lidhjes me rrjetin. Brenda 48 orëve do t\'ju dërgojmë një ofertë me çmim fiks.',

  disclaimer: (hasRealSolar) =>
    `Shifrat në këtë propozim bazohen në ${hasRealSolar ? 'të dhënat e çatisë nga Google Solar API dhe' : 'vlerësime paraprake të sipërfaqes së çatisë dhe'} tarifa komerciale të energjisë të supozuara. Madhësia reale e sistemit, prodhimi dhe kursimet varen nga faktorë specifikë të vendit, duke përfshirë strukturën e çatisë, hijen, orientimin, kufizimet e lidhjes me rrjetin dhe kontratën aktuale të energjisë. Një studim i detajuar inxhinierik kërkohet përpara çdo propozimi detyrues. Vizualizimi para/pas është ilustrues dhe nuk pasqyron dizenjimin përfundimtar të paneleve.`,
}

const LOCALE_BY_LANGUAGE: Record<ProposalLanguage, string> = {
  en: 'en-GB',
  es: 'es-ES',
  pt: 'pt-PT',
  ro: 'ro-RO',
  sq: 'sq-AL',
}

const TRANSLATIONS: Record<ProposalLanguage, ProposalStrings> = { en, es, pt, ro, sq }

export function getProposalStrings(lang: ProposalLanguage | null | undefined): ProposalStrings {
  if (lang && lang in TRANSLATIONS) return TRANSLATIONS[lang as ProposalLanguage]
  return en
}

export function getProposalLocale(lang: ProposalLanguage | null | undefined): string {
  if (lang && lang in LOCALE_BY_LANGUAGE) return LOCALE_BY_LANGUAGE[lang as ProposalLanguage]
  return 'en-GB'
}

/**
 * Format a date for the proposal footer using the requested language's locale.
 */
export function formatProposalDate(date: Date, lang: ProposalLanguage): string {
  try {
    return date.toLocaleDateString(getProposalLocale(lang), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return date.toISOString().slice(0, 10)
  }
}
