/**
 * Intent SEO — Template Definitions
 *
 * Two exported maps:
 *   INTENT_CITIES    — cities by countryCode (~10 per market, 50 total)
 *   INTENT_TEMPLATES — intent archetypes (6 building types + hub variant)
 *   COUNTRY_HUB_TEMPLATES — national hub pages (one per country × intent)
 *
 * Adding a city   = one entry in INTENT_CITIES[countryCode]
 * Adding an intent = one entry in INTENT_TEMPLATES
 */

import type { IntentCity, IntentTemplate } from './intent-types'

// ─── Cities ──────────────────────────────────────────────────────────────────

export const INTENT_CITIES: Record<string, IntentCity[]> = {
  RO: [
    {
      slug: 'bucharest',
      label: 'Bucharest',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 1,
      genitive: 'Bucharest',
      context:
        'Bucharest is Romania\'s capital and largest commercial hub, home to thousands of warehouses, retail parks and industrial estates with high solar irradiance averaging 1,350 kWh/m²/year.',
    },
    {
      slug: 'cluj-napoca',
      label: 'Cluj-Napoca',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 1,
      genitive: 'Cluj-Napoca',
      context:
        'Cluj-Napoca is Romania\'s second-largest city and tech capital, with a dense cluster of logistics parks, light-industrial zones and commercial buildings ideal for rooftop solar.',
    },
    {
      slug: 'timisoara',
      label: 'Timișoara',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 1,
      genitive: 'Timișoara',
      context:
        'Timișoara is Romania\'s western industrial gateway, featuring large automotive supplier campuses and logistics corridors with abundant flat commercial rooftops.',
    },
    {
      slug: 'iasi',
      label: 'Iași',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 1,
      genitive: 'Iași',
      context:
        'Iași is the economic and cultural capital of Moldova region, with growing industrial parks and a strong push for energy independence driving solar adoption.',
    },
    {
      slug: 'constanta',
      label: 'Constanța',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 1,
      genitive: 'Constanța',
      context:
        'Constanța hosts Romania\'s main port and largest industrial zone, offering exceptional solar irradiance above 1,400 kWh/m²/year and massive flat warehouse rooftops.',
    },
    {
      slug: 'brasov',
      label: 'Brașov',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 1,
      genitive: 'Brașov',
      context:
        'Brașov is a major manufacturing and tourism hub in central Romania, with a strong industrial base and increasing corporate sustainability targets driving solar demand.',
    },
    {
      slug: 'craiova',
      label: 'Craiova',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Craiova',
    },
    {
      slug: 'galati',
      label: 'Galați',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Galați',
    },
    {
      slug: 'ploiesti',
      label: 'Ploiești',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Ploiești',
    },
    {
      slug: 'oradea',
      label: 'Oradea',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Oradea',
    },
    {
      slug: 'arad',
      label: 'Arad',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 1,
      genitive: 'Arad',
      context:
        'Arad is western Romania\'s industrial gateway on the Hungarian border, hosting automotive suppliers, electronics manufacturers and a large free-trade zone with excellent flat-roof solar conditions.',
    },
    {
      slug: 'sibiu',
      label: 'Sibiu',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 1,
      genitive: 'Sibiu',
      context:
        'Sibiu hosts a dense cluster of automotive and electronics factories (Continental, Marquardt) and a rapidly expanding logistics park, with commercial rooftop solar adoption accelerating above the national average.',
    },
    {
      slug: 'bacau',
      label: 'Bacău',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 1,
      genitive: 'Bacău',
      context:
        'Bacău is north-eastern Romania\'s commercial capital, with large industrial estates, food-processing facilities and plastics manufacturers driving high electricity demand — ideal for on-site solar offset.',
    },
    {
      slug: 'pitesti',
      label: 'Pitești',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 1,
      genitive: 'Pitești',
      context:
        'Pitești is Romania\'s automotive capital, home to the Dacia/Renault assembly plant and hundreds of tier-1 and tier-2 component suppliers — large energy consumers with vast flat factory rooftops perfect for solar.',
    },
    {
      slug: 'targu-mures',
      label: 'Târgu Mureș',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 1,
      genitive: 'Târgu Mureș',
      context:
        'Târgu Mureș is the commercial centre of Mureș County, with growing industrial parks and a key medical-equipment manufacturing cluster driving consistent demand for on-site solar generation.',
    },
    {
      slug: 'suceava',
      label: 'Suceava',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Suceava',
    },
    {
      slug: 'buzau',
      label: 'Buzău',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Buzău',
    },
    {
      slug: 'ramnicu-valcea',
      label: 'Râmnicu Vâlcea',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Râmnicu Vâlcea',
    },
    {
      slug: 'satu-mare',
      label: 'Satu Mare',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Satu Mare',
    },
    {
      slug: 'deva',
      label: 'Deva',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Deva',
    },
    {
      slug: 'baia-mare',
      label: 'Baia Mare',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Baia Mare',
    },
    {
      slug: 'botosani',
      label: 'Botoșani',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Botoșani',
    },
    {
      slug: 'piatra-neamt',
      label: 'Piatra Neamț',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Piatra Neamț',
    },
    {
      slug: 'focsani',
      label: 'Focșani',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Focșani',
    },
    {
      slug: 'alba-iulia',
      label: 'Alba Iulia',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Alba Iulia',
    },
    {
      slug: 'resita',
      label: 'Reșița',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Reșița',
    },
    {
      slug: 'sfantu-gheorghe',
      label: 'Sfântu Gheorghe',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Sfântu Gheorghe',
    },
    {
      slug: 'bistrita',
      label: 'Bistrița',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Bistrița',
    },
    {
      slug: 'drobeta-turnu-severin',
      label: 'Drobeta-Turnu Severin',
      countryCode: 'RO',
      countryLabel: 'Romania',
      tier: 2,
      genitive: 'Drobeta-Turnu Severin',
    },
  ],

  ES: [
    {
      slug: 'madrid',
      label: 'Madrid',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 1,
      genitive: 'de Madrid',
      context:
        'Madrid is Spain\'s capital and business capital, with one of Europe\'s highest solar irradiance values at over 1,700 kWh/m²/year and a dense commercial property market.',
    },
    {
      slug: 'barcelona',
      label: 'Barcelona',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 1,
      genitive: 'de Barcelona',
      context:
        'Barcelona is Spain\'s second-largest city and a major logistics hub, home to large retail parks and industrial zones along the coast with excellent solar conditions.',
    },
    {
      slug: 'seville',
      label: 'Seville',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 1,
      genitive: 'de Sevilla',
      context:
        'Seville receives some of Europe\'s highest solar irradiance at 1,900+ kWh/m²/year, making every commercial rooftop an exceptionally high-ROI solar opportunity.',
    },
    {
      slug: 'valencia',
      label: 'Valencia',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 1,
      genitive: 'de Valencia',
      context:
        'Valencia is Spain\'s third-largest city with a booming logistics sector and Mediterranean climate delivering 1,750+ kWh/m²/year of solar irradiance.',
    },
    {
      slug: 'zaragoza',
      label: 'Zaragoza',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 1,
      genitive: 'de Zaragoza',
      context:
        'Zaragoza is Spain\'s central logistics crossroads, with massive warehouse parks and industrial estates along major motorways that offer perfect flat-roof solar installations.',
    },
    {
      slug: 'malaga',
      label: 'Málaga',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 1,
      genitive: 'de Málaga',
    },
    {
      slug: 'bilbao',
      label: 'Bilbao',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Bilbao',
    },
    {
      slug: 'alicante',
      label: 'Alicante',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Alicante',
    },
    {
      slug: 'murcia',
      label: 'Murcia',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Murcia',
    },
    {
      slug: 'cordoba',
      label: 'Córdoba',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Córdoba',
    },
    {
      slug: 'valladolid',
      label: 'Valladolid',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 1,
      genitive: 'de Valladolid',
      context:
        'Valladolid is northern Spain\'s industrial powerhouse, with a major Renault assembly plant, extensive food-processing estates and over 2,600 annual sun hours delivering excellent commercial solar ROI.',
    },
    {
      slug: 'las-palmas',
      label: 'Las Palmas',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 1,
      genitive: 'de Las Palmas',
      context:
        'Las Palmas on Gran Canaria enjoys over 3,000 hours of sunshine per year — among the highest in Europe — making every commercial rooftop an exceptional solar investment with near-year-round generation.',
    },
    {
      slug: 'palma',
      label: 'Palma',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 1,
      genitive: 'de Palma',
      context:
        'Palma de Mallorca is the Balearic Islands\' commercial capital, combining a booming tourism-related commercial sector with 2,900+ annual sun hours and high island electricity prices creating a premium solar market.',
    },
    {
      slug: 'vitoria',
      label: 'Vitoria-Gasteiz',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 1,
      genitive: 'de Vitoria-Gasteiz',
      context:
        'Vitoria-Gasteiz is the Basque Country capital and a major automotive-industrial centre hosting Mercedes-Benz and hundreds of tier-1 suppliers with large factory rooftops primed for solar.',
    },
    {
      slug: 'granada',
      label: 'Granada',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 1,
      genitive: 'de Granada',
      context:
        'Granada is Andalusia\'s second-largest city, combining a large commercial property market with 1,900+ kWh/m²/year of irradiance and strong regional renewable energy subsidies.',
    },
    {
      slug: 'la-coruna',
      label: 'La Coruña',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de La Coruña',
    },
    {
      slug: 'santander',
      label: 'Santander',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Santander',
    },
    {
      slug: 'gijon',
      label: 'Gijón',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Gijón',
    },
    {
      slug: 'pamplona',
      label: 'Pamplona',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Pamplona',
    },
    {
      slug: 'cadiz',
      label: 'Cádiz',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Cádiz',
    },
    {
      slug: 'almeria',
      label: 'Almería',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 1,
      genitive: 'de Almería',
      context:
        'Almería receives the highest solar irradiance in mainland Spain at over 2,000 kWh/m²/year, powering a booming agri-solar and commercial rooftop market that is attracting installers from across Europe.',
    },
    {
      slug: 'tarragona',
      label: 'Tarragona',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 1,
      genitive: 'de Tarragona',
      context:
        'Tarragona hosts one of Europe\'s largest petrochemical industrial complexes and a major port, with enormous flat-roofed industrial buildings and 2,500+ annual sun hours creating premium solar opportunities.',
    },
    {
      slug: 'huelva',
      label: 'Huelva',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Huelva',
    },
    {
      slug: 'jaen',
      label: 'Jaén',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Jaén',
    },
    {
      slug: 'castellon',
      label: 'Castellón',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Castellón',
    },
    {
      slug: 'burgos',
      label: 'Burgos',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Burgos',
    },
    {
      slug: 'salamanca',
      label: 'Salamanca',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Salamanca',
    },
    {
      slug: 'santa-cruz-tenerife',
      label: 'Santa Cruz de Tenerife',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Tenerife',
    },
    {
      slug: 'marbella',
      label: 'Marbella',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Marbella',
    },
    {
      slug: 'logrono',
      label: 'Logroño',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Logroño',
    },
    {
      slug: 'lleida',
      label: 'Lleida',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Lleida',
    },
    {
      slug: 'girona',
      label: 'Girona',
      countryCode: 'ES',
      countryLabel: 'Spain',
      tier: 2,
      genitive: 'de Girona',
    },
  ],

  PT: [
    {
      slug: 'lisbon',
      label: 'Lisbon',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 1,
      genitive: 'de Lisboa',
      context:
        'Lisbon is Portugal\'s capital and commercial centre, with 2,800+ hours of sunshine annually and a rapidly expanding logistics and retail property market.',
    },
    {
      slug: 'porto',
      label: 'Porto',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 1,
      genitive: 'do Porto',
      context:
        'Porto is Portugal\'s northern industrial hub, home to major port operations, light manufacturing and a growing base of sustainability-minded commercial property owners.',
    },
    {
      slug: 'braga',
      label: 'Braga',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 1,
      genitive: 'de Braga',
    },
    {
      slug: 'setubal',
      label: 'Setúbal',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 2,
      genitive: 'de Setúbal',
    },
    {
      slug: 'coimbra',
      label: 'Coimbra',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 2,
      genitive: 'de Coimbra',
    },
    {
      slug: 'faro',
      label: 'Faro',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 2,
      genitive: 'de Faro',
    },
    {
      slug: 'aveiro',
      label: 'Aveiro',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 1,
      genitive: 'de Aveiro',
      context:
        'Aveiro is Portugal\'s industrial heartland, home to a major ceramics and chemicals manufacturing cluster, a large business park corridor and over 2,700 sun hours per year ideal for commercial solar.',
    },
    {
      slug: 'evora',
      label: 'Évora',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 1,
      genitive: 'de Évora',
      context:
        'Évora sits in the Alentejo region, which has the highest solar irradiance in Western Europe at up to 1,900 kWh/m²/year, making every commercial and agricultural property an outstanding solar prospect.',
    },
    {
      slug: 'funchal',
      label: 'Funchal',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 2,
      genitive: 'do Funchal',
    },
    {
      slug: 'portimao',
      label: 'Portimão',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 2,
      genitive: 'de Portimão',
    },
    {
      slug: 'viseu',
      label: 'Viseu',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 2,
      genitive: 'de Viseu',
    },
    {
      slug: 'guimaraes',
      label: 'Guimarães',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 2,
      genitive: 'de Guimarães',
    },
    {
      slug: 'almada',
      label: 'Almada',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 2,
      genitive: 'de Almada',
    },
    {
      slug: 'leiria',
      label: 'Leiria',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 2,
      genitive: 'de Leiria',
    },
    {
      slug: 'santarem',
      label: 'Santarém',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 2,
      genitive: 'de Santarém',
    },
    {
      slug: 'viana-do-castelo',
      label: 'Viana do Castelo',
      countryCode: 'PT',
      countryLabel: 'Portugal',
      tier: 2,
      genitive: 'de Viana do Castelo',
    },
  ],

  AL: [
    {
      slug: 'tirana',
      label: 'Tirana',
      countryCode: 'AL',
      countryLabel: 'Albania',
      tier: 1,
      genitive: 'e Tiranës',
      context:
        'Tirana is Albania\'s capital and fastest-growing commercial centre, with a rapidly expanding industrial belt and government incentives for renewable energy installations.',
    },
    {
      slug: 'durres',
      label: 'Durrës',
      countryCode: 'AL',
      countryLabel: 'Albania',
      tier: 1,
      genitive: 'e Durrësit',
      context:
        'Durrës hosts Albania\'s busiest port and a major industrial zone, with large flat-roofed warehouses and logistics facilities benefiting from 2,400+ hours of sunshine per year.',
    },
    {
      slug: 'fier',
      label: 'Fier',
      countryCode: 'AL',
      countryLabel: 'Albania',
      tier: 2,
      genitive: 'e Fierit',
    },
    {
      slug: 'shkoder',
      label: 'Shkodër',
      countryCode: 'AL',
      countryLabel: 'Albania',
      tier: 2,
      genitive: 'e Shkodrës',
    },
    {
      slug: 'vlore',
      label: 'Vlorë',
      countryCode: 'AL',
      countryLabel: 'Albania',
      tier: 2,
      genitive: 'e Vlorës',
    },
    {
      slug: 'elbasan',
      label: 'Elbasan',
      countryCode: 'AL',
      countryLabel: 'Albania',
      tier: 1,
      genitive: 'e Elbasanit',
      context:
        'Elbasan is Albania\'s main industrial city east of Tirana, with a large metallurgical complex, growing light-manufacturing zones and strong government incentives for on-site renewable energy.',
    },
    {
      slug: 'korce',
      label: 'Korçë',
      countryCode: 'AL',
      countryLabel: 'Albania',
      tier: 2,
      genitive: 'e Korçës',
    },
    {
      slug: 'berat',
      label: 'Berat',
      countryCode: 'AL',
      countryLabel: 'Albania',
      tier: 2,
      genitive: 'e Beratit',
    },
    {
      slug: 'lezhe',
      label: 'Lezhë',
      countryCode: 'AL',
      countryLabel: 'Albania',
      tier: 2,
      genitive: 'e Lezhës',
    },
    {
      slug: 'gjirokaster',
      label: 'Gjirokastër',
      countryCode: 'AL',
      countryLabel: 'Albania',
      tier: 2,
      genitive: 'e Gjirokastërit',
    },
    {
      slug: 'sarande',
      label: 'Sarandë',
      countryCode: 'AL',
      countryLabel: 'Albania',
      tier: 2,
      genitive: 'e Sarandës',
    },
    {
      slug: 'kavaje',
      label: 'Kavajë',
      countryCode: 'AL',
      countryLabel: 'Albania',
      tier: 2,
      genitive: 'e Kavajës',
    },
    {
      slug: 'pogradec',
      label: 'Pogradec',
      countryCode: 'AL',
      countryLabel: 'Albania',
      tier: 2,
      genitive: 'e Pogradecit',
    },
  ],

  GB: [
    {
      slug: 'london',
      label: 'London',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 1,
      context:
        'London is the UK\'s commercial capital with thousands of flat-roofed commercial and industrial buildings. UK solar payback periods average 5–7 years with government incentives.',
    },
    {
      slug: 'birmingham',
      label: 'Birmingham',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 1,
      context:
        'Birmingham is the UK\'s second-largest city and a major manufacturing hub, with vast industrial and logistics estates across the West Midlands offering strong commercial solar ROI.',
    },
    {
      slug: 'manchester',
      label: 'Manchester',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 1,
      context:
        'Manchester\'s Greater Manchester conurbation hosts one of the UK\'s largest concentrations of logistics and retail parks, with commercial property owners increasingly mandated to meet sustainability targets.',
    },
    {
      slug: 'leeds',
      label: 'Leeds',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 1,
    },
    {
      slug: 'bristol',
      label: 'Bristol',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 1,
    },
    {
      slug: 'glasgow',
      label: 'Glasgow',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'sheffield',
      label: 'Sheffield',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'liverpool',
      label: 'Liverpool',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'edinburgh',
      label: 'Edinburgh',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 1,
      context:
        'Edinburgh is Scotland\'s capital and a major financial and technology hub, with an expanding commercial property market and strong Scottish Government renewable energy incentives driving solar adoption.',
    },
    {
      slug: 'cardiff',
      label: 'Cardiff',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 1,
      context:
        'Cardiff is Wales\' commercial capital with significant industrial and logistics estates across the Cardiff Bay and South Wales corridor, benefiting from UK-wide solar incentives and sustainability mandates.',
    },
    {
      slug: 'newcastle',
      label: 'Newcastle',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 1,
      context:
        'Newcastle upon Tyne anchors the North East England commercial market, with a large industrial base and expanding logistics parks across the Tyne and Wear corridor that offer strong rooftop solar potential.',
    },
    {
      slug: 'nottingham',
      label: 'Nottingham',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 1,
      context:
        'Nottingham is the East Midlands commercial centre with a strong distribution and manufacturing sector, significant retail parks and major industrial estates along the M1 motorway corridor.',
    },
    {
      slug: 'leicester',
      label: 'Leicester',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 1,
      context:
        'Leicester is a major East Midlands manufacturing and logistics hub, with garment factories, food production facilities and large warehouse complexes that are prime commercial solar targets.',
    },
    {
      slug: 'southampton',
      label: 'Southampton',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'plymouth',
      label: 'Plymouth',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'reading',
      label: 'Reading',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'coventry',
      label: 'Coventry',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'hull',
      label: 'Hull',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'belfast',
      label: 'Belfast',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 1,
      context:
        'Belfast is Northern Ireland\'s capital and main commercial centre, with a growing commercial property market, major port facilities and UK government support for renewable energy in Northern Ireland.',
    },
    {
      slug: 'oxford',
      label: 'Oxford',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'cambridge',
      label: 'Cambridge',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'brighton',
      label: 'Brighton',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'portsmouth',
      label: 'Portsmouth',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'derby',
      label: 'Derby',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'wolverhampton',
      label: 'Wolverhampton',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'stoke-on-trent',
      label: 'Stoke-on-Trent',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'swansea',
      label: 'Swansea',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'middlesbrough',
      label: 'Middlesbrough',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'aberdeen',
      label: 'Aberdeen',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
    {
      slug: 'exeter',
      label: 'Exeter',
      countryCode: 'GB',
      countryLabel: 'United Kingdom',
      tier: 2,
    },
  ],
}

// Flat list for convenience
export const ALL_CITIES: IntentCity[] = Object.values(INTENT_CITIES).flat()

// ─── Intent Templates ────────────────────────────────────────────────────────

export const INTENT_TEMPLATES: Record<string, IntentTemplate> = {
  'solar-leads': {
    intentType: 'solar-leads',
    titleTemplate: 'Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Find Solar Installation Prospects in {city}',
    metaTitleTemplate: 'Solar Leads in {city} — Automated Rooftop Detection | SolarScout Pro',
    metaDescriptionTemplate:
      'Discover qualified solar installation leads in {city}. SolarScout Pro auto-detects commercial, industrial and retail buildings with high solar potential. Start free.',
    introTemplate:
      'SolarScout Pro scans every commercial and industrial rooftop in {city} using live satellite data and OpenStreetMap — delivering a ready-to-contact pipeline of solar prospects in seconds.',
    hooks: [
      'Your next 50 solar contracts are already on a rooftop in {city}.',
      'Stop Googling. Start closing {city} solar deals.',
      '{city}\'s commercial rooftops are untapped solar revenue. Find them instantly.',
    ],
    faqs: [
      {
        question: 'How many solar leads can I find in {city}?',
        answer:
          'SolarScout Pro detects hundreds to thousands of commercial rooftops per city scan depending on urban density. {city} typically returns 50–500 qualified buildings per search area.',
      },
      {
        question: 'What types of buildings are included in {city} solar leads?',
        answer:
          'All commercial building types: offices, warehouses, industrial facilities, retail units, logistics parks and mixed-use developments. Residential buildings are automatically excluded.',
      },
      {
        question: 'Is there real solar data for buildings in {city}?',
        answer:
          'Yes. For supported buildings, we integrate Google Solar API data — including estimated panel count, annual kWh production, sunshine hours and CO₂ offset — so you can qualify leads before the first call.',
      },
      {
        question: 'Can I export {city} leads to my CRM?',
        answer:
          'Absolutely. Export any selection of {city} solar leads to CSV or Excel (.xlsx) in one click, then import directly to HubSpot, Salesforce, or any CRM.',
      },
    ],
    leadFilter: {},
    keywords: ['solar leads', 'solar prospects', 'rooftop solar', 'commercial solar installations'],
    seedSegments: [
      { type: 'commercial', label: 'Commercial Offices', ctaLabel: 'View commercial leads', ctaHref: '/dashboard', icon: 'Building2' },
      { type: 'warehouse', label: 'Warehouses & Logistics', ctaLabel: 'View warehouse leads', ctaHref: '/dashboard', icon: 'Warehouse' },
      { type: 'industrial', label: 'Industrial Facilities', ctaLabel: 'View industrial leads', ctaHref: '/dashboard', icon: 'Factory' },
      { type: 'retail', label: 'Retail Parks', ctaLabel: 'View retail leads', ctaHref: '/dashboard', icon: 'Store' },
      { type: 'residential', label: 'Residential Buildings', ctaLabel: 'View residential leads', ctaHref: '/dashboard', icon: 'Home' },
    ],
  },

  'commercial-solar-leads': {
    intentType: 'commercial-solar-leads',
    titleTemplate: 'Commercial Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Commercial Rooftop Solar Prospects in {city}',
    metaTitleTemplate: 'Commercial Solar Leads in {city} — Office & Business Buildings | SolarScout Pro',
    metaDescriptionTemplate:
      'Find commercial office and business building solar leads in {city}. Auto-detected with roof area, contact data and Google Solar API insights. Try free today.',
    introTemplate:
      'Commercial buildings in {city} — offices, business parks and mixed-use developments — represent the highest-value solar sales opportunities. SolarScout Pro maps every qualifying rooftop, complete with contact data and energy potential estimates.',
    hooks: [
      '{city} has hundreds of untouched commercial rooftops ready for solar. Find them in seconds.',
      'Close your next commercial solar contract in {city} before lunch.',
      'Office buildings in {city} are switching to solar. Be the installer who shows them how.',
    ],
    faqs: [
      {
        question: 'What counts as a commercial solar lead in {city}?',
        answer:
          'Commercial leads include office buildings, business parks, mixed-use commercial properties and corporate campuses in {city}. We filter for buildings with flat or low-pitch roofs and a minimum detectable area.',
      },
      {
        question: 'How large are commercial rooftops in {city} typically?',
        answer:
          'Commercial office buildings in {city} average 500–3,000 m² of usable roof space, supporting 50–300+ solar panels. Our data includes estimated roof area so you can prioritise the biggest opportunities.',
      },
      {
        question: 'Does SolarScout provide contact details for commercial buildings in {city}?',
        answer:
          'Yes. Where available, SolarScout Pro returns business name, phone number, email address, website and Google rating for commercial properties in {city} — so you can begin outreach immediately.',
      },
    ],
    leadFilter: { businessTypes: ['commercial'] },
    keywords: ['commercial solar leads', 'office solar', 'business solar installation', 'commercial rooftop solar'],
    seedSegments: [
      { type: 'office', label: 'Office Buildings', ctaLabel: 'Scan offices in {city}', ctaHref: '/dashboard', icon: 'Building2' },
      { type: 'business-park', label: 'Business Parks', ctaLabel: 'Scan business parks', ctaHref: '/dashboard', icon: 'LayoutGrid' },
      { type: 'mixed-use', label: 'Mixed-Use Commercial', ctaLabel: 'Scan mixed-use', ctaHref: '/dashboard', icon: 'Buildings' },
    ],
  },

  'warehouse-solar-leads': {
    intentType: 'warehouse-solar-leads',
    titleTemplate: 'Warehouse Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Warehouse & Logistics Solar Prospects in {city}',
    metaTitleTemplate: 'Warehouse Solar Leads in {city} — Large Flat Rooftops Mapped | SolarScout Pro',
    metaDescriptionTemplate:
      'Target warehouse and logistics companies in {city} for solar installation. Flat roofs, large areas, fast payback. Auto-detected with full contact data.',
    introTemplate:
      'Warehouses and logistics facilities in {city} offer the best economics in commercial solar: large flat rooftops, high energy consumption and straightforward installations. SolarScout Pro maps every qualifying facility, so you can focus on closing.',
    hooks: [
      'Warehouses in {city} are the easiest solar wins. Find them all instantly.',
      'Flat roof. High power bill. Perfect solar customer. {city} has hundreds of them.',
      '{city}\'s logistics belt is untapped solar revenue. Start mapping it today.',
    ],
    faqs: [
      {
        question: 'Why are warehouses the best solar opportunity in {city}?',
        answer:
          'Warehouses combine three ideal factors: large flat roofs (1,000–20,000+ m²), high daytime electricity consumption, and straightforward installation logistics. In {city}, payback periods for warehouse solar average 3–5 years.',
      },
      {
        question: 'How many warehouse solar leads are there in {city}?',
        answer:
          'Depending on the industrial zone density, {city} typically has 50–300 qualifying warehouse and logistics properties detectable via SolarScout Pro in a single scan.',
      },
      {
        question: 'What data do I get for each warehouse lead in {city}?',
        answer:
          'Each warehouse lead includes GPS coordinates, estimated roof area (m²), business name, contact details (phone/email/website), and where available, Google Solar API data including panel capacity and annual kWh estimate.',
      },
    ],
    leadFilter: { businessTypes: ['warehouse'] },
    keywords: ['warehouse solar leads', 'logistics solar', 'flat roof solar', 'industrial estate solar', 'warehousing solar installation'],
    seedSegments: [
      { type: 'distribution', label: 'Distribution Centres', ctaLabel: 'Find distribution centres', ctaHref: '/dashboard', icon: 'Warehouse' },
      { type: 'logistics', label: 'Logistics Facilities', ctaLabel: 'Find logistics parks', ctaHref: '/dashboard', icon: 'Truck' },
      { type: 'cold-storage', label: 'Cold Storage', ctaLabel: 'Find cold storage', ctaHref: '/dashboard', icon: 'PackageOpen' },
    ],
  },

  'industrial-solar-leads': {
    intentType: 'industrial-solar-leads',
    titleTemplate: 'Industrial Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Industrial Solar Installation Prospects in {city}',
    metaTitleTemplate: 'Industrial Solar Leads in {city} — Factories & Manufacturing Plants | SolarScout Pro',
    metaDescriptionTemplate:
      'Discover industrial solar leads in {city}: factories, manufacturing plants and industrial estates. High energy demand = faster payback. Full contact data included.',
    introTemplate:
      'Industrial facilities in {city} are among the highest-priority solar targets: massive energy bills, large rooftops and strong government incentives. SolarScout Pro identifies every qualifying factory and plant, complete with roof area and contact data.',
    hooks: [
      'Factories in {city} spend millions on electricity. Solar fixes that. You can be the solution.',
      'Industrial solar in {city}: biggest roofs, biggest bills, biggest commissions.',
      'Find every {city} factory that needs solar — before your competitors do.',
    ],
    faqs: [
      {
        question: 'What makes industrial buildings ideal solar targets in {city}?',
        answer:
          'Industrial facilities in {city} typically have large, unobstructed flat rooftops, high and consistent energy consumption, and operate during peak solar generation hours — meaning self-consumption rates of 70–90%, significantly improving ROI.',
      },
      {
        question: 'How do I reach industrial decision-makers in {city}?',
        answer:
          'SolarScout Pro returns the business name, phone, email and website for industrial properties in {city} where available via Google Places data. You can generate personalised outreach copy in one click using our AI outreach tool.',
      },
      {
        question: 'What is the typical payback period for industrial solar in {city}?',
        answer:
          'Industrial solar installations in {city} typically have payback periods of 3–6 years, driven by high electricity tariffs, large system sizes (100 kW – 2 MW+) and available capacity market premiums.',
      },
    ],
    leadFilter: { businessTypes: ['industrial'] },
    keywords: ['industrial solar leads', 'factory solar', 'manufacturing solar', 'industrial estate solar installation', 'plant solar energy'],
    seedSegments: [
      { type: 'manufacturing', label: 'Manufacturing Plants', ctaLabel: 'Scan manufacturing', ctaHref: '/dashboard', icon: 'Factory' },
      { type: 'processing', label: 'Processing Facilities', ctaLabel: 'Scan processing plants', ctaHref: '/dashboard', icon: 'Settings2' },
      { type: 'industrial-park', label: 'Industrial Parks', ctaLabel: 'Scan industrial parks', ctaHref: '/dashboard', icon: 'LayoutGrid' },
    ],
  },

  'retail-solar-leads': {
    intentType: 'retail-solar-leads',
    titleTemplate: 'Retail Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Retail & Shopping Solar Prospects in {city}',
    metaTitleTemplate: 'Retail Solar Leads in {city} — Shopping Centres & Retail Parks | SolarScout Pro',
    metaDescriptionTemplate:
      'Find retail solar leads in {city}: supermarkets, shopping centres and retail parks. Large carpark canopy and rooftop potential. Scan in seconds.',
    introTemplate:
      'Retail parks, supermarkets and shopping centres in {city} offer unique solar opportunities: massive flat rooftops, high daytime loads, carpark canopy potential and sustainability mandates from major brands. SolarScout maps them all.',
    hooks: [
      'Every supermarket in {city} is a potential solar customer. Let\'s find them all.',
      'Retail park solar in {city}: carpark canopies + flat roofs = premium projects.',
      '{city}\'s retail sector has sustainability KPIs to hit. Be the installer that helps them.',
    ],
    faqs: [
      {
        question: 'What types of retail properties can I find solar leads for in {city}?',
        answer:
          'SolarScout Pro detects supermarkets, hypermarkets, retail parks, shopping centres, DIY stores, garden centres and standalone retail units in {city} — any commercial property with usable roof or canopy area.',
      },
      {
        question: 'Are carpark canopy solar leads included for {city}?',
        answer:
          'Our satellite detection identifies retail properties with large car parks in {city} that are prime candidates for canopy-mounted solar — a growing opportunity driven by EV charging co-installation.',
      },
      {
        question: 'How do retail chains make solar decisions?',
        answer:
          'Large retail chains typically have central sustainability or facilities teams who make solar decisions centrally. SolarScout Pro helps you identify local site managers and store directors as initial contacts.',
      },
    ],
    leadFilter: { businessTypes: ['retail'] },
    keywords: ['retail solar leads', 'supermarket solar', 'shopping centre solar', 'retail park solar', 'carpark canopy solar'],
    seedSegments: [
      { type: 'supermarket', label: 'Supermarkets', ctaLabel: 'Find supermarkets', ctaHref: '/dashboard', icon: 'ShoppingCart' },
      { type: 'retail-park', label: 'Retail Parks', ctaLabel: 'Find retail parks', ctaHref: '/dashboard', icon: 'Store' },
      { type: 'shopping-centre', label: 'Shopping Centres', ctaLabel: 'Find shopping centres', ctaHref: '/dashboard', icon: 'ShoppingBag' },
    ],
  },

  'residential-solar-leads': {
    intentType: 'residential-solar-leads',
    titleTemplate: 'Residential Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Residential Solar Prospects in {city}',
    metaTitleTemplate: 'Residential Solar Leads in {city} — Homeowner & Multi-Unit Prospects | SolarScout Pro',
    metaDescriptionTemplate:
      'Find residential solar leads in {city} using satellite detection. Target housing estates, apartment blocks and residential developments. Contact data included.',
    introTemplate:
      'The residential solar market in {city} is expanding fast, driven by rising energy prices and government incentives. SolarScout Pro maps every qualifying residential property — from individual houses to large apartment complexes — so you can scale your pipeline.',
    hooks: [
      'Homeowners in {city} are switching to solar. Find the ones ready to buy today.',
      '{city}\'s energy bills are up. Residential solar demand is up. Your pipeline should be too.',
      'Residential solar in {city}: every roof is an opportunity. Find yours.',
    ],
    faqs: [
      {
        question: 'Can SolarScout Pro find residential solar leads in {city}?',
        answer:
          'Yes. While SolarScout Pro is primarily designed for commercial leads, residential detection mode surfaces houses, townhouses and apartment buildings in {city} with roof area estimates and available contact data.',
      },
      {
        question: 'What residential property types does SolarScout detect in {city}?',
        answer:
          'SolarScout Pro detects detached houses, semi-detached, terraced housing and low-rise apartment blocks in {city}, filtering for properties with minimum usable roof area for solar installation.',
      },
      {
        question: 'How is residential solar different from commercial in {city}?',
        answer:
          'Residential solar projects in {city} are smaller (3–12 kW) but higher volume. Decision-makers are individual homeowners — SolarScout returns address data for door-to-door, postal and online retargeting campaigns.',
      },
    ],
    leadFilter: { businessTypes: ['residential'] },
    keywords: ['residential solar leads', 'homeowner solar', 'house solar installation', 'domestic solar leads', 'rooftop solar homes'],
    seedSegments: [
      { type: 'detached', label: 'Detached Houses', ctaLabel: 'Find detached homes', ctaHref: '/dashboard', icon: 'Home' },
      { type: 'apartment', label: 'Apartment Blocks', ctaLabel: 'Find apartment blocks', ctaHref: '/dashboard', icon: 'Building' },
      { type: 'housing-estate', label: 'Housing Estates', ctaLabel: 'Find housing estates', ctaHref: '/dashboard', icon: 'MapPin' },
    ],
  },

  'hotel-solar-leads': {
    intentType: 'hotel-solar-leads',
    titleTemplate: 'Hotel Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Hotel & Hospitality Solar Prospects in {city}',
    metaTitleTemplate: 'Hotel Solar Leads in {city} — Hotels, Resorts & B&Bs | SolarScout Pro',
    metaDescriptionTemplate:
      'Find hotels and hospitality properties in {city} that are ideal for solar installation. High energy demand, 24/7 operation and sustainability mandates. Start free.',
    introTemplate:
      'Hotels, resorts and hospitality venues in {city} run around the clock — meaning solar panels generate savings every day of the year. SolarScout Pro maps every qualifying hospitality property, delivering a ready-to-pitch pipeline of high-value solar prospects.',
    hooks: [
      'Hotels in {city} pay electricity bills 365 days a year. Solar changes that — and you can close the deal.',
      '{city} hospitality sector has sustainability KPIs to meet. Be the solar partner that helps.',
      'Every hotel rooftop in {city} is a revenue opportunity waiting to be claimed.',
    ],
    faqs: [
      {
        question: 'Why are hotels great solar leads in {city}?',
        answer:
          'Hotels operate 24/7 with consistent high electricity demand — air conditioning, hot water, lifts, kitchens and lighting. This means a high self-consumption rate for solar in {city}, typically 80–95%, resulting in payback periods of 4–6 years.',
      },
      {
        question: 'What size solar systems do hotels in {city} typically need?',
        answer:
          'A mid-size hotel in {city} (50–150 rooms) typically suits a 50–200 kW rooftop system. Larger resort hotels can support 500 kW+. SolarScout Pro shows roof area estimates to help you size proposals before the first call.',
      },
      {
        question: 'How do I contact hotel decision-makers in {city}?',
        answer:
          'SolarScout Pro surfaces the hotel name, phone number, email, website and Google rating for hospitality properties in {city} — giving you everything needed to reach the general manager or facilities director directly.',
      },
    ],
    leadFilter: { businessTypes: ['hotel'] },
    keywords: ['hotel solar leads', 'hospitality solar installation', 'hotel rooftop solar', 'resort solar energy', 'bed and breakfast solar'],
    seedSegments: [
      { type: 'hotel', label: 'Hotels', ctaLabel: 'Find hotels in {city}', ctaHref: '/dashboard', icon: 'Building2' },
      { type: 'resort', label: 'Resorts & Spas', ctaLabel: 'Find resorts', ctaHref: '/dashboard', icon: 'Sparkles' },
      { type: 'hostel', label: 'Hostels & B&Bs', ctaLabel: 'Find hostels', ctaHref: '/dashboard', icon: 'BedDouble' },
    ],
  },

  'school-solar-leads': {
    intentType: 'school-solar-leads',
    titleTemplate: 'School & University Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Educational Building Solar Prospects in {city}',
    metaTitleTemplate: 'School Solar Leads in {city} — Schools, Colleges & Universities | SolarScout Pro',
    metaDescriptionTemplate:
      'Discover schools, colleges and universities in {city} that are prime solar prospects. Education sector solar grants, large rooftops, stable tenures. Try free.',
    introTemplate:
      'Educational institutions in {city} — schools, colleges and universities — combine large, unobstructed rooftops with stable long-term occupancy and growing sustainability obligations. SolarScout Pro identifies every qualifying educational building so you can pitch solar with confidence.',
    hooks: [
      'Schools in {city} have the biggest rooftops and the strongest sustainability mandates. Win them.',
      'Education sector solar in {city}: grant-funded, long tenure, stable revenue.',
      '{city}\'s universities are switching to solar. Be the installer on every campus.',
    ],
    faqs: [
      {
        question: 'Are schools good solar leads in {city}?',
        answer:
          'Yes. Schools and universities in {city} are among the most predictable solar customers: large flat or low-pitch rooftops, daytime electricity consumption aligned with generation, access to public sector grants and long building tenures that justify the capital investment.',
      },
      {
        question: 'What grants are available for school solar in {city}?',
        answer:
          'Educational institutions in {city} can often access public sector energy efficiency grants, carbon reduction funds and EU or national renewable energy programmes that offset 20–50% of installation costs — making your pitch significantly easier.',
      },
      {
        question: 'How many school solar leads can I find in {city}?',
        answer:
          'Depending on city size, SolarScout Pro typically detects 20–200 primary schools, secondary schools, colleges and university campuses per city scan, including estimated roof area and available contact data for each.',
      },
    ],
    leadFilter: { businessTypes: ['school'] },
    keywords: ['school solar leads', 'university solar installation', 'education sector solar', 'college solar panels', 'school rooftop solar'],
    seedSegments: [
      { type: 'primary-school', label: 'Primary Schools', ctaLabel: 'Find primary schools', ctaHref: '/dashboard', icon: 'GraduationCap' },
      { type: 'secondary-school', label: 'Secondary Schools', ctaLabel: 'Find secondary schools', ctaHref: '/dashboard', icon: 'BookOpen' },
      { type: 'university', label: 'Universities & Colleges', ctaLabel: 'Find universities', ctaHref: '/dashboard', icon: 'Building2' },
    ],
  },

  'agricultural-solar-leads': {
    intentType: 'agricultural-solar-leads',
    titleTemplate: 'Agricultural Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Farm & Agricultural Solar Prospects near {city}',
    metaTitleTemplate: 'Agricultural Solar Leads near {city} — Farms, Barns & Agri-Buildings | SolarScout Pro',
    metaDescriptionTemplate:
      'Find farms and agricultural buildings near {city} for solar installation. Large barn rooftops, agri-voltaic potential and rural energy grants. Full contact data.',
    introTemplate:
      'Farms and agricultural buildings around {city} offer some of the most compelling solar economics: huge unshaded barn rooftops, high electricity consumption from pumps and refrigeration, and access to agricultural energy grants. SolarScout Pro maps every qualifying rural property.',
    hooks: [
      'Farm buildings near {city} have the biggest rooftops of all. Find them all instantly.',
      'Agri-solar near {city}: rural grants + vast barn roofs = your most profitable installs.',
      'Farmers near {city} are cutting energy costs with solar. Be the installer they call.',
    ],
    faqs: [
      {
        question: 'What agricultural buildings can I find solar leads for near {city}?',
        answer:
          'SolarScout Pro detects barns, grain stores, livestock sheds, polytunnels, farm workshops and rural industrial buildings near {city} — any agricultural structure with usable roof area for solar panels or agri-voltaic ground mounting.',
      },
      {
        question: 'Are there grants for agricultural solar near {city}?',
        answer:
          'Yes. Farmers near {city} can often access agricultural energy efficiency grants, rural development funds and national renewable energy subsidy programmes that make solar an even more attractive investment.',
      },
      {
        question: 'What are the typical system sizes for agricultural solar near {city}?',
        answer:
          'Agricultural solar installations near {city} range from 10 kW on small farm outbuildings to 500 kW+ on large grain stores and poultry sheds. The economics are often the best of any sector given the combination of large roofs and high energy demand.',
      },
    ],
    leadFilter: { businessTypes: ['agricultural'] },
    keywords: ['agricultural solar leads', 'farm solar installation', 'barn rooftop solar', 'agri-voltaic solar', 'rural solar leads', 'farm energy solar'],
    seedSegments: [
      { type: 'barn', label: 'Farm Barns', ctaLabel: 'Find farm barns', ctaHref: '/dashboard', icon: 'Warehouse' },
      { type: 'livestock', label: 'Livestock Facilities', ctaLabel: 'Find livestock sheds', ctaHref: '/dashboard', icon: 'Leaf' },
      { type: 'agricultural-building', label: 'Agricultural Buildings', ctaLabel: 'Find agri buildings', ctaHref: '/dashboard', icon: 'Tractor' },
    ],
  },

  'carpark-solar-leads': {
    intentType: 'carpark-solar-leads',
    titleTemplate: 'Car Park Solar Canopy Leads in {city} | SolarScout Pro',
    h1Template: 'Car Park Solar Canopy Prospects in {city}',
    metaTitleTemplate: 'Car Park Solar Leads in {city} — Canopy & EV Charging Solar | SolarScout Pro',
    metaDescriptionTemplate:
      'Find large car parks in {city} for solar canopy installation. Premium projects combining solar generation and EV charging infrastructure. Contact data included.',
    introTemplate:
      'Large car parks in {city} are the fastest-growing solar opportunity: solar canopies generate electricity, provide shade and enable EV charging infrastructure — triple value for every square metre. SolarScout Pro identifies every qualifying car park, from retail to stadium to hospital.',
    hooks: [
      'Car parks in {city} = solar canopy + EV charging + premium project value. Find them all.',
      '{city} has hundreds of car parks ready for solar canopies. You just need to find them first.',
      'Car park solar in {city}: your highest-value installs with the most straightforward ROI story.',
    ],
    faqs: [
      {
        question: 'What makes car parks good solar canopy projects in {city}?',
        answer:
          'Car parks in {city} offer unobstructed horizontal structures ideal for canopy-mounted solar, with the added benefit of EV charging co-installation which dramatically improves project economics and appeal to sustainability-driven property owners.',
      },
      {
        question: 'What types of car parks should I target in {city}?',
        answer:
          'Retail park car parks, supermarket lots, hospital car parks, office campus car parks and stadium parking in {city} are the highest-value targets — large, flat, managed facilities whose operators are under sustainability pressure and can sign long-term agreements.',
      },
      {
        question: 'How profitable are car park solar canopy projects in {city}?',
        answer:
          'Car park solar canopy projects are typically 200 kW to 2 MW+ in {city}, making them among the highest-value installations. EV charging integration can double the revenue per space and command premium power purchase agreement prices.',
      },
    ],
    leadFilter: { businessTypes: ['carpark'] },
    keywords: ['car park solar canopy', 'solar carport leads', 'EV charging solar installation', 'car park solar canopy leads', 'parking lot solar'],
    seedSegments: [
      { type: 'retail-carpark', label: 'Retail Car Parks', ctaLabel: 'Find retail car parks', ctaHref: '/dashboard', icon: 'ShoppingCart' },
      { type: 'office-carpark', label: 'Office Car Parks', ctaLabel: 'Find office car parks', ctaHref: '/dashboard', icon: 'Car' },
      { type: 'stadium-carpark', label: 'Stadium & Venue Parking', ctaLabel: 'Find stadium parking', ctaHref: '/dashboard', icon: 'ParkingSquare' },
    ],
  },

  'healthcare-solar-leads': {
    intentType: 'healthcare-solar-leads',
    titleTemplate: 'Healthcare Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Hospital & Healthcare Solar Prospects in {city}',
    metaTitleTemplate: 'Healthcare Solar Leads in {city} — Hospitals, Clinics & Medical Centres | SolarScout Pro',
    metaDescriptionTemplate:
      'Find hospitals, clinics and healthcare facilities in {city} for solar installation. 24/7 high energy demand, resilience benefits and public sector grants.',
    introTemplate:
      'Hospitals and healthcare facilities in {city} operate 24/7 with some of the highest energy demands of any building type — making solar a critical cost-reduction and resilience tool. SolarScout Pro maps every qualifying healthcare property, from large hospitals to private clinics.',
    hooks: [
      'Hospitals in {city} never switch off. Neither should their solar panels.',
      '{city}\'s healthcare sector spends millions on electricity. Solar ROI here is unbeatable.',
      'Healthcare solar in {city}: energy resilience + cost savings + sustainability compliance.',
    ],
    faqs: [
      {
        question: 'Why are hospitals and clinics good solar leads in {city}?',
        answer:
          'Healthcare facilities in {city} have exceptionally high and stable energy demand around the clock, meaning solar self-consumption rates of 85–95% and payback periods of 4–7 years — even without subsidies.',
      },
      {
        question: 'What healthcare buildings can I target with solar in {city}?',
        answer:
          'SolarScout Pro detects hospitals, private clinics, GP surgery clusters, dental practices, care homes, rehabilitation centres and pharmaceutical manufacturing facilities in {city} — all with high energy demand and usable roof space.',
      },
      {
        question: 'Are there special grants for healthcare solar in {city}?',
        answer:
          'Public sector healthcare facilities in {city} can often access NHS energy efficiency funds, public sector decarbonisation schemes or EU-backed healthcare infrastructure grants, reducing net installation costs by 20–40%.',
      },
    ],
    leadFilter: { businessTypes: ['healthcare'] },
    keywords: ['healthcare solar leads', 'hospital solar installation', 'clinic solar panels', 'medical centre solar', 'care home solar energy'],
    seedSegments: [
      { type: 'hospital', label: 'Hospitals', ctaLabel: 'Find hospitals', ctaHref: '/dashboard', icon: 'Activity' },
      { type: 'clinic', label: 'Clinics & Medical Centres', ctaLabel: 'Find clinics', ctaHref: '/dashboard', icon: 'Stethoscope' },
      { type: 'care-home', label: 'Care Homes', ctaLabel: 'Find care homes', ctaHref: '/dashboard', icon: 'Heart' },
    ],
  },

  'food-industry-solar-leads': {
    intentType: 'food-industry-solar-leads',
    titleTemplate: 'Food Industry Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Food & Beverage Manufacturing Solar Prospects in {city}',
    metaTitleTemplate: 'Food Industry Solar Leads in {city} — Food Manufacturing & Processing | SolarScout Pro',
    metaDescriptionTemplate:
      'Find food manufacturers, processors and cold-chain facilities in {city} for solar installation. High energy demand, refrigeration loads, fast payback.',
    introTemplate:
      'Food and beverage manufacturers in {city} are among the highest-energy-intensity businesses — refrigeration, processing, packaging and HVAC running continuously. SolarScout Pro maps every qualifying food industry facility, from bakeries to large-scale cold stores.',
    hooks: [
      'Food factories in {city} run cold storage 24/7. Solar slashes those bills — and you can win the contract.',
      '{city}\'s food industry has enormous electricity bills. Solar ROI here is exceptional.',
      'Food processing plants in {city} need solar to hit sustainability targets. Find them first.',
    ],
    faqs: [
      {
        question: 'Why is the food industry a strong solar market in {city}?',
        answer:
          'Food and beverage businesses in {city} have very high and continuous electricity consumption for refrigeration, processing and HVAC. This means solar self-consumption rates above 80% and payback periods of 3–5 years — among the best in any sector.',
      },
      {
        question: 'What food industry buildings does SolarScout detect in {city}?',
        answer:
          'SolarScout Pro identifies bakeries, breweries, meat processing plants, dairy facilities, cold-chain logistics centres, food packaging factories and wholesale distribution centres in {city} — all with high energy loads and large rooftops.',
      },
      {
        question: 'Do food manufacturers in {city} have sustainability requirements?',
        answer:
          'Yes. Major food retailers and brands require suppliers to report and reduce Scope 2 emissions. Solar PV is the fastest and most cost-effective way for {city} food businesses to meet these requirements, making your pitch straightforward.',
      },
    ],
    leadFilter: { businessTypes: ['food-industry'] },
    keywords: ['food industry solar leads', 'food manufacturing solar', 'cold store solar panels', 'beverage factory solar', 'food processing solar installation'],
    seedSegments: [
      { type: 'food-factory', label: 'Food Factories', ctaLabel: 'Find food factories', ctaHref: '/dashboard', icon: 'UtensilsCrossed' },
      { type: 'cold-storage', label: 'Cold Storage Facilities', ctaLabel: 'Find cold stores', ctaHref: '/dashboard', icon: 'Thermometer' },
      { type: 'brewery', label: 'Breweries & Distilleries', ctaLabel: 'Find breweries', ctaHref: '/dashboard', icon: 'Beer' },
    ],
  },

  'logistics-solar-leads': {
    intentType: 'logistics-solar-leads',
    titleTemplate: 'Logistics Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Logistics & Supply Chain Solar Prospects in {city}',
    metaTitleTemplate: 'Logistics Solar Leads in {city} — 3PL, Fulfilment & Supply Chain | SolarScout Pro',
    metaDescriptionTemplate:
      'Find logistics, 3PL and fulfilment centres in {city} for solar installation. Large flat rooftops, high dock-door energy loads and ESG targets. Scan free.',
    introTemplate:
      'Third-party logistics (3PL) providers, e-commerce fulfilment centres and supply chain hubs in {city} are under intense ESG pressure from clients — and solar is the fastest route to Scope 2 reduction. SolarScout Pro maps every qualifying logistics facility with full contact data.',
    hooks: [
      'Logistics operators in {city} face ESG pressure from every direction. Solar is their solution — and you can sell it.',
      '{city}\'s logistics parks have the flattest roofs and the biggest power bills. Win them all.',
      '3PL and fulfilment centres in {city} need solar to keep their contracts. Be the supplier they call.',
    ],
    faqs: [
      {
        question: 'Why are logistics companies great solar prospects in {city}?',
        answer:
          'Logistics and 3PL companies in {city} occupy large, flat-roofed warehouses with very high electricity consumption from dock equipment, forklifts, lighting and temperature control. Their major retail clients increasingly mandate green supply chains, making solar a procurement requirement.',
      },
      {
        question: 'How large are logistics solar installations in {city}?',
        answer:
          'Logistics facilities in {city} range from 5,000 to 200,000+ m² of floor area, with rooftop solar systems typically ranging from 100 kW to 5 MW+. SolarScout Pro includes estimated roof area data to help you prioritise the largest opportunities.',
      },
      {
        question: 'Who makes solar decisions at logistics companies in {city}?',
        answer:
          'Solar buying decisions in {city} logistics companies are typically made by the Head of Facilities, Head of Sustainability or COO. SolarScout Pro returns business contact data including phone, email and website to help you reach the right person.',
      },
    ],
    leadFilter: { businessTypes: ['logistics'] },
    keywords: ['logistics solar leads', '3PL solar installation', 'fulfilment centre solar', 'supply chain solar', 'distribution centre solar panels'],
    seedSegments: [
      { type: '3pl', label: '3PL Providers', ctaLabel: 'Find 3PL facilities', ctaHref: '/dashboard', icon: 'Truck' },
      { type: 'fulfilment', label: 'Fulfilment Centres', ctaLabel: 'Find fulfilment centres', ctaHref: '/dashboard', icon: 'Package' },
      { type: 'cross-dock', label: 'Cross-Dock Facilities', ctaLabel: 'Find cross-docks', ctaHref: '/dashboard', icon: 'ArrowLeftRight' },
    ],
  },

  'solar-installation-quotes': {
    intentType: 'solar-installation-quotes',
    titleTemplate: 'Solar Installation Quotes in {city} | SolarScout Pro',
    h1Template: 'Get Commercial Solar Installation Quotes in {city}',
    metaTitleTemplate: 'Solar Installation Quotes in {city} — Commercial & Industrial | SolarScout Pro',
    metaDescriptionTemplate:
      'Find businesses in {city} actively seeking solar installation quotes. High-intent commercial and industrial prospects ready to buy. Start building your pipeline.',
    introTemplate:
      'Commercial businesses in {city} searching for solar installation quotes are the highest-intent prospects in the market — they have already decided to go solar and are comparing installers. SolarScout Pro helps you identify and reach these ready-to-buy businesses before your competitors do.',
    hooks: [
      '{city} businesses are actively requesting solar quotes right now. Be the first installer to reach them.',
      'High-intent solar prospects in {city} are already in buying mode. Your pipeline starts here.',
      'Stop cold calling. Find {city} businesses already looking for solar installation quotes.',
    ],
    faqs: [
      {
        question: 'How does SolarScout help me find businesses seeking solar quotes in {city}?',
        answer:
          'SolarScout Pro scans commercial and industrial properties in {city} and combines satellite rooftop data with business profile indicators to surface the highest-probability solar buyers — saving you time on prospecting so you can focus on closing.',
      },
      {
        question: 'What types of businesses are looking for solar installation in {city}?',
        answer:
          'In {city}, the most active solar quote-seekers are warehouse operators, manufacturers, retail parks and commercial office owners — all driven by rising electricity tariffs and sustainability reporting requirements from stakeholders and customers.',
      },
      {
        question: 'What information do I get for each solar quote prospect in {city}?',
        answer:
          'Each prospect record includes business name, address, contact details (phone, email, website), estimated roof area, and where available, Google Solar API data — so you can provide an informed indicative quote on the first call.',
      },
    ],
    leadFilter: {},
    keywords: ['solar installation quotes', 'commercial solar quotes', 'solar panel quotes business', 'solar estimate commercial', 'get solar quotes'],
    seedSegments: [
      { type: 'commercial', label: 'Commercial Buildings', ctaLabel: 'Find quote prospects', ctaHref: '/dashboard', icon: 'Building2' },
      { type: 'industrial', label: 'Industrial Facilities', ctaLabel: 'Find industrial prospects', ctaHref: '/dashboard', icon: 'Factory' },
      { type: 'warehouse', label: 'Warehouses', ctaLabel: 'Find warehouse prospects', ctaHref: '/dashboard', icon: 'Warehouse' },
    ],
  },

  'rooftop-solar-leads': {
    intentType: 'rooftop-solar-leads',
    titleTemplate: 'Rooftop Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Rooftop Solar Installation Prospects in {city}',
    metaTitleTemplate: 'Rooftop Solar Leads in {city} — All Building Types Mapped | SolarScout Pro',
    metaDescriptionTemplate:
      'Find every rooftop solar prospect in {city}: commercial, industrial, retail and residential. Satellite-detected with roof area, contact data and solar estimates.',
    introTemplate:
      'SolarScout Pro scans every rooftop in {city} — commercial, industrial, retail and residential — using live satellite imagery and OpenStreetMap data to deliver the most comprehensive rooftop solar lead database available for your market.',
    hooks: [
      'Every rooftop in {city} is a potential solar installation. SolarScout Pro maps them all.',
      'Stop guessing which {city} buildings have solar potential. See them all on a map right now.',
      '{city}\'s rooftop solar market is bigger than you think. Start with the data to prove it.',
    ],
    faqs: [
      {
        question: 'How many rooftop solar leads are there in {city}?',
        answer:
          'Depending on the size of {city}, SolarScout Pro can detect hundreds to tens of thousands of qualifying rooftops across all building types. A typical mid-size city returns 1,000–10,000 commercial buildings with usable roof area.',
      },
      {
        question: 'What rooftop solar data does SolarScout provide for {city}?',
        answer:
          'For each building in {city}, SolarScout Pro provides GPS coordinates, building footprint area, business name and contact details (where available), and Google Solar API data including estimated annual kWh production and panel capacity for supported buildings.',
      },
      {
        question: 'Can I filter rooftop solar leads by building type in {city}?',
        answer:
          'Yes. SolarScout Pro lets you filter {city} rooftop leads by building type (commercial, warehouse, industrial, retail, residential), roof size, contact availability, and Google Solar API data availability — so you build the exact pipeline you need.',
      },
    ],
    leadFilter: {},
    keywords: ['rooftop solar leads', 'commercial rooftop solar', 'solar roof prospects', 'rooftop solar installation leads', 'solar panel rooftop detection'],
    seedSegments: [
      { type: 'flat-roof', label: 'Flat Roof Buildings', ctaLabel: 'Find flat roof buildings', ctaHref: '/dashboard', icon: 'LayoutGrid' },
      { type: 'pitched-roof', label: 'Pitched Roof Buildings', ctaLabel: 'Find pitched roof buildings', ctaHref: '/dashboard', icon: 'Home' },
      { type: 'large-roof', label: 'Large Rooftops 1,000m²+', ctaLabel: 'Find large rooftops', ctaHref: '/dashboard', icon: 'Maximize2' },
    ],
  },

  'sports-solar-leads': {
    intentType: 'sports-solar-leads',
    titleTemplate: 'Sports & Leisure Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Sports Facility & Leisure Centre Solar Prospects in {city}',
    metaTitleTemplate: 'Sports Solar Leads in {city} — Leisure Centres, Stadiums & Sports Clubs | SolarScout Pro',
    metaDescriptionTemplate:
      'Find sports centres, leisure facilities and stadiums in {city} for solar installation. Large rooftops, high HVAC loads and community sustainability goals.',
    introTemplate:
      'Sports and leisure facilities in {city} — from community leisure centres to professional stadiums — combine large, often flat rooftops with high electricity consumption from pools, lighting, HVAC and event operations. SolarScout Pro maps every qualifying facility so you can pitch with confidence.',
    hooks: [
      'Leisure centres in {city} heat swimming pools and run floodlights 365 days. Solar changes their economics entirely.',
      '{city} sports facilities are under pressure to go green. Be the solar partner that makes it happen.',
      'Stadium solar in {city}: massive rooftops + public sustainability pledges = your biggest installs.',
    ],
    faqs: [
      {
        question: 'Why are sports facilities good solar prospects in {city}?',
        answer:
          'Sports and leisure centres in {city} have very high electricity consumption driven by swimming pool heating, floodlighting, HVAC and catering — all year round. Large roof areas and strong community sustainability mandates make them receptive, long-term solar customers.',
      },
      {
        question: 'What types of sports facilities can I find in {city}?',
        answer:
          'SolarScout Pro detects leisure centres, swimming pools, football stadiums, golf clubs, tennis centres, indoor sports arenas and sports club buildings in {city} — any facility with usable roof area and significant energy consumption.',
      },
      {
        question: 'How do sports organisations make solar decisions in {city}?',
        answer:
          'Public leisure centres in {city} are typically owned by local authorities or leisure trusts with sustainability targets and access to public sector energy grants. Private sports clubs make decisions at board level. SolarScout Pro provides contact details for both.',
      },
    ],
    leadFilter: { businessTypes: ['sports'] },
    keywords: ['sports solar leads', 'leisure centre solar', 'stadium solar panels', 'sports club solar installation', 'swimming pool solar energy'],
    seedSegments: [
      { type: 'leisure-centre', label: 'Leisure Centres', ctaLabel: 'Find leisure centres', ctaHref: '/dashboard', icon: 'Dumbbell' },
      { type: 'stadium', label: 'Stadiums & Arenas', ctaLabel: 'Find stadiums', ctaHref: '/dashboard', icon: 'Trophy' },
      { type: 'sports-club', label: 'Sports Clubs', ctaLabel: 'Find sports clubs', ctaHref: '/dashboard', icon: 'Users' },
    ],
  },

  // ── Google-search-driven intent templates ───────────────────────────────────

  'buy-solar-leads': {
    intentType: 'buy-solar-leads',
    titleTemplate: 'Buy Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Buy Qualified Solar Leads in {city}',
    metaTitleTemplate: 'Buy Solar Leads in {city} — Verified Commercial & Industrial Prospects',
    metaDescriptionTemplate:
      'Buy solar leads in {city} instantly. Satellite-verified commercial rooftops with contact data, roof area and Google Solar API insights. No contracts, cancel anytime.',
    introTemplate:
      'SolarScout Pro is the fastest way to buy solar leads in {city} — no middlemen, no shared lists, no monthly minimums. Search our satellite-verified database of commercial and industrial rooftops in real time, export exactly the leads you want, and start closing.',
    hooks: [
      'Stop sharing leads. Buy exclusive {city} solar prospects from satellite data — not recycled lists.',
      'Buy {city} solar leads that are actually verified. Rooftop detected. Contact data included.',
      'The cheapest solar leads in {city} are still expensive if they\'re wrong. Ours are satellite-verified.',
    ],
    faqs: [
      {
        question: 'How do I buy solar leads for {city}?',
        answer:
          'Sign up for SolarScout Pro, run a scan of {city}, filter by building type, roof size and contact availability, then export your chosen leads to CSV or Excel. You only pay for the plan — not per lead — so you can buy as many {city} solar leads as you need.',
      },
      {
        question: 'Are the {city} solar leads exclusive?',
        answer:
          'SolarScout Pro gives you access to {city} solar lead data sourced from satellite imagery and public mapping datasets — not shared lists. You can run your own searches and build your own exclusive pipeline independently of other installers.',
      },
      {
        question: 'What is the quality of solar leads available for {city}?',
        answer:
          'Every {city} solar lead includes a satellite-confirmed rooftop, GPS coordinates, building classification, and where available: business name, phone number, email, website, and Google Solar API data with annual kWh and panel capacity estimates.',
      },
    ],
    leadFilter: {},
    keywords: ['buy solar leads', 'purchase solar leads', 'solar lead database', 'verified solar leads', 'solar leads for sale'],
    seedSegments: [
      { type: 'commercial', label: 'Commercial Leads', ctaLabel: 'Buy commercial leads', ctaHref: '/pricing', icon: 'Building2' },
      { type: 'industrial', label: 'Industrial Leads', ctaLabel: 'Buy industrial leads', ctaHref: '/pricing', icon: 'Factory' },
      { type: 'warehouse', label: 'Warehouse Leads', ctaLabel: 'Buy warehouse leads', ctaHref: '/pricing', icon: 'Warehouse' },
    ],
  },

  'solar-lead-generation': {
    intentType: 'solar-lead-generation',
    titleTemplate: 'Solar Lead Generation in {city} | SolarScout Pro',
    h1Template: 'Automated Solar Lead Generation for {city}',
    metaTitleTemplate: 'Solar Lead Generation in {city} — Automated Rooftop Prospecting | SolarScout Pro',
    metaDescriptionTemplate:
      'Automate solar lead generation in {city} with satellite rooftop detection. Generate a pipeline of commercial and industrial solar prospects in minutes.',
    introTemplate:
      'Solar lead generation in {city} used to mean hours of manual prospecting, cold calls and door knocking. SolarScout Pro automates the entire process — scanning every commercial rooftop, enriching with contact data and delivering a qualified pipeline in under 60 seconds.',
    hooks: [
      'Generate a {city} solar pipeline in 60 seconds. Not 60 hours.',
      'Automated solar lead generation for {city}: satellite scan → contact data → export. That simple.',
      '{city} solar lead generation has changed. Let the satellite do the prospecting.',
    ],
    faqs: [
      {
        question: 'How does automated solar lead generation work in {city}?',
        answer:
          'SolarScout Pro uses satellite imagery and OpenStreetMap data to detect every commercial and industrial rooftop in {city}. It then enriches each building with Google Places contact data and, for qualifying buildings, Google Solar API irradiance and capacity estimates — all in real time.',
      },
      {
        question: 'How many solar leads can I generate in {city} per month?',
        answer:
          'There is no per-lead cap on SolarScout Pro. A single scan of {city} can surface hundreds to thousands of qualifying rooftops. You can run unlimited scans across {city} and any other city in your market.',
      },
      {
        question: 'What makes SolarScout Pro better than other solar lead generation tools for {city}?',
        answer:
          'Unlike lead brokers who sell aged, shared lists, SolarScout Pro generates {city} solar leads from live satellite and mapping data — so every lead is current, location-verified, and fully owned by you. No contracts, no shared lead pools.',
      },
    ],
    leadFilter: {},
    keywords: ['solar lead generation', 'solar prospecting tool', 'automated solar leads', 'solar pipeline generation', 'solar prospect finder'],
    seedSegments: [
      { type: 'commercial', label: 'Commercial Prospects', ctaLabel: 'Generate commercial leads', ctaHref: '/dashboard', icon: 'Building2' },
      { type: 'industrial', label: 'Industrial Prospects', ctaLabel: 'Generate industrial leads', ctaHref: '/dashboard', icon: 'Factory' },
      { type: 'all-buildings', label: 'All Building Types', ctaLabel: 'Generate all leads', ctaHref: '/dashboard', icon: 'Map' },
    ],
  },

  'commercial-solar-installation': {
    intentType: 'commercial-solar-installation',
    titleTemplate: 'Commercial Solar Installation Leads in {city} | SolarScout Pro',
    h1Template: 'Find Commercial Solar Installation Prospects in {city}',
    metaTitleTemplate: 'Commercial Solar Installation in {city} — Find Businesses Ready to Install',
    metaDescriptionTemplate:
      'Discover commercial businesses in {city} ready for solar installation. Pre-qualified with roof area, contact details and energy potential data. Start free.',
    introTemplate:
      'Commercial solar installation is booming in {city} — but finding the right businesses to pitch takes time. SolarScout Pro maps every qualifying commercial rooftop, surfaces contact data and provides energy potential estimates so you arrive at every pitch fully prepared.',
    hooks: [
      'Win more commercial solar installation contracts in {city} with satellite-verified prospects.',
      '{city}\'s commercial solar installation market is growing fast. Get ahead of it with real data.',
      'Find {city} businesses that are ready for commercial solar installation — before your competition does.',
    ],
    faqs: [
      {
        question: 'Which commercial buildings in {city} are most ready for solar installation?',
        answer:
          'The strongest commercial solar installation prospects in {city} are businesses with large flat or low-pitch rooftops, high daytime electricity consumption, and rising energy bills. SolarScout Pro identifies these using satellite roof detection and business data — warehouses, offices, retail parks and industrial units.',
      },
      {
        question: 'What is the average commercial solar installation size in {city}?',
        answer:
          'Commercial solar installations in {city} typically range from 20 kW for small retail units to 500 kW+ for large distribution centres. SolarScout Pro provides estimated roof area for each prospect so you can size systems and proposals before the first call.',
      },
      {
        question: 'How long does commercial solar installation take in {city}?',
        answer:
          'A typical commercial solar installation in {city} takes 3–10 days from scaffolding to commissioning, depending on system size and building type. Planning permission is rarely required for flat-roof commercial systems under 50 kW.',
      },
    ],
    leadFilter: { businessTypes: ['commercial'] },
    keywords: ['commercial solar installation', 'commercial solar installer leads', 'business solar installation', 'commercial rooftop solar install', 'commercial pv installation'],
    seedSegments: [
      { type: 'office', label: 'Office Buildings', ctaLabel: 'Find office buildings', ctaHref: '/dashboard', icon: 'Building2' },
      { type: 'retail', label: 'Retail Properties', ctaLabel: 'Find retail properties', ctaHref: '/dashboard', icon: 'Store' },
      { type: 'mixed-use', label: 'Mixed-Use Buildings', ctaLabel: 'Find mixed-use', ctaHref: '/dashboard', icon: 'LayoutGrid' },
    ],
  },

  'flat-roof-solar-leads': {
    intentType: 'flat-roof-solar-leads',
    titleTemplate: 'Flat Roof Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Flat Roof Solar Installation Prospects in {city}',
    metaTitleTemplate: 'Flat Roof Solar Leads in {city} — Commercial & Industrial Buildings | SolarScout Pro',
    metaDescriptionTemplate:
      'Find flat roof buildings in {city} for solar installation. Optimal panel orientation, minimal ballast fixing, fastest payback. Satellite-detected with contact data.',
    introTemplate:
      'Flat roofs are the gold standard for commercial solar installation — optimal south-facing panel tilt, no penetration fixings required, and rapid installation. SolarScout Pro identifies every flat-roofed commercial and industrial building in {city} with roof area data and contact details.',
    hooks: [
      'Flat roofs in {city} are the fastest, easiest solar installs. Find every single one.',
      '{city}\'s flat-roofed buildings are your most bankable solar projects. Stop missing them.',
      'Every flat roof in {city} is a solar opportunity. SolarScout maps all of them.',
    ],
    faqs: [
      {
        question: 'Why are flat roofs the best for solar installation in {city}?',
        answer:
          'Flat roof solar in {city} allows optimum panel tilt adjustment (10–15°), eliminates penetration fixing risk, uses ballast or non-penetrative mounting systems, and typically allows faster installation. The result is lower installation cost and higher energy yield per m².',
      },
      {
        question: 'How many flat roof solar leads are there in {city}?',
        answer:
          'Industrial estates and commercial zones in {city} are densely packed with flat-roofed buildings. A SolarScout Pro scan typically surfaces 100–1,000+ qualifying flat-roof buildings per city depending on urban density and the industrial footprint.',
      },
      {
        question: 'What building types have flat roofs in {city}?',
        answer:
          'The most common flat-roof buildings in {city} are warehouses, distribution centres, industrial units, supermarkets, retail parks, office blocks and public buildings — all ideal commercial solar candidates with strong return on investment.',
      },
    ],
    leadFilter: {},
    keywords: ['flat roof solar leads', 'flat roof solar installation', 'commercial flat roof solar', 'industrial flat roof solar panels', 'ballasted solar system leads'],
    seedSegments: [
      { type: 'industrial', label: 'Industrial Units', ctaLabel: 'Find industrial flat roofs', ctaHref: '/dashboard', icon: 'Factory' },
      { type: 'warehouse', label: 'Warehouses', ctaLabel: 'Find warehouse flat roofs', ctaHref: '/dashboard', icon: 'Warehouse' },
      { type: 'retail', label: 'Retail Buildings', ctaLabel: 'Find retail flat roofs', ctaHref: '/dashboard', icon: 'Store' },
    ],
  },

  'solar-energy-leads': {
    intentType: 'solar-energy-leads',
    titleTemplate: 'Solar Energy Leads in {city} | SolarScout Pro',
    h1Template: 'Solar Energy Prospects & Leads in {city}',
    metaTitleTemplate: 'Solar Energy Leads in {city} — Commercial & Industrial | SolarScout Pro',
    metaDescriptionTemplate:
      'Find solar energy leads across all sectors in {city}. Satellite-mapped rooftops, Google Solar API data and full contact details for every prospect.',
    introTemplate:
      'The solar energy market in {city} spans every sector — commercial, industrial, retail, agricultural and residential. SolarScout Pro gives you a complete picture of the solar energy opportunity in {city} across all building types, with the data you need to prioritise and pitch.',
    hooks: [
      '{city}\'s solar energy market is worth millions. Start mapping it in minutes.',
      'Find every solar energy opportunity in {city} — across every sector and building type.',
      'The solar energy transition in {city} is accelerating. Be the business that captures it.',
    ],
    faqs: [
      {
        question: 'How large is the solar energy market in {city}?',
        answer:
          'The commercial and industrial solar energy market in {city} is driven by rising electricity tariffs, carbon reduction targets and government incentives. SolarScout Pro helps you quantify this opportunity by scanning all building types and estimating the total system capacity potential across the city.',
      },
      {
        question: 'What solar energy data does SolarScout provide for {city}?',
        answer:
          'For each building in {city}, SolarScout Pro provides GPS location, roof area estimate, business contact data, and where available, Google Solar API outputs including annual kWh production potential, estimated number of panels, and carbon offset — giving you a fully data-backed sales pitch.',
      },
      {
        question: 'Which sectors drive the most solar energy demand in {city}?',
        answer:
          'In {city}, the highest solar energy demand comes from warehousing and logistics, food manufacturing, industrial facilities and retail parks — all with high daytime electricity consumption aligned with peak solar generation hours.',
      },
    ],
    leadFilter: {},
    keywords: ['solar energy leads', 'solar power leads', 'renewable energy leads', 'solar energy prospects', 'PV energy leads'],
    seedSegments: [
      { type: 'commercial', label: 'Commercial', ctaLabel: 'Find commercial leads', ctaHref: '/dashboard', icon: 'Building2' },
      { type: 'industrial', label: 'Industrial', ctaLabel: 'Find industrial leads', ctaHref: '/dashboard', icon: 'Factory' },
      { type: 'agricultural', label: 'Agricultural', ctaLabel: 'Find agricultural leads', ctaHref: '/dashboard', icon: 'Leaf' },
    ],
  },

  'pv-installation-leads': {
    intentType: 'pv-installation-leads',
    titleTemplate: 'PV Installation Leads in {city} | SolarScout Pro',
    h1Template: 'Photovoltaic (PV) Installation Prospects in {city}',
    metaTitleTemplate: 'PV Installation Leads in {city} — Commercial & Industrial Solar PV | SolarScout Pro',
    metaDescriptionTemplate:
      'Find commercial and industrial PV installation leads in {city}. Satellite-detected rooftops with solar irradiance data, roof area and contact details.',
    introTemplate:
      'Solar PV installation is the fastest-growing clean energy sector in {city}. SolarScout Pro maps every qualifying commercial and industrial rooftop using satellite imagery, enriches each prospect with Google Solar API irradiance data, and delivers a ready-to-pitch PV installation pipeline.',
    hooks: [
      '{city}\'s PV installation market is booming. SolarScout helps you win your share.',
      'Find every commercial PV installation prospect in {city} — satellite-verified, contact data included.',
      'Your next 100 PV installation contracts in {city} are already on a rooftop. Find them now.',
    ],
    faqs: [
      {
        question: 'What is the commercial PV installation opportunity in {city}?',
        answer:
          'Commercial PV installation in {city} is driven by rising energy costs, net metering policies and corporate sustainability targets. SolarScout Pro maps the entire commercial and industrial rooftop stock in {city}, helping you identify and prioritise the highest-ROI PV installation prospects.',
      },
      {
        question: 'What PV system sizes are common for commercial installations in {city}?',
        answer:
          'Commercial PV installations in {city} range from 10 kW for small retail units to multi-megawatt systems on large logistics facilities. SolarScout Pro provides estimated roof area per building to help you pre-size proposals and prepare bankable financial models.',
      },
      {
        question: 'Does SolarScout Pro provide solar irradiance data for {city}?',
        answer:
          'Yes. For supported buildings in {city}, SolarScout Pro integrates Google Solar API data including estimated annual kWh production, peak sun hours, optimal panel count and CO₂ offset — giving you the data foundation for a professional PV installation proposal.',
      },
    ],
    leadFilter: {},
    keywords: ['PV installation leads', 'solar PV leads', 'photovoltaic installation prospects', 'PV system leads', 'solar panel system leads'],
    seedSegments: [
      { type: 'commercial-pv', label: 'Commercial PV', ctaLabel: 'Find commercial PV leads', ctaHref: '/dashboard', icon: 'Zap' },
      { type: 'industrial-pv', label: 'Industrial PV', ctaLabel: 'Find industrial PV leads', ctaHref: '/dashboard', icon: 'Factory' },
      { type: 'ground-mount', label: 'Ground Mount PV', ctaLabel: 'Find ground mount sites', ctaHref: '/dashboard', icon: 'Layers' },
    ],
  },

  'b2b-solar-leads': {
    intentType: 'b2b-solar-leads',
    titleTemplate: 'B2B Solar Leads in {city} | SolarScout Pro',
    h1Template: 'B2B Solar Sales Leads in {city}',
    metaTitleTemplate: 'B2B Solar Leads in {city} — Business-to-Business Solar Prospects | SolarScout Pro',
    metaDescriptionTemplate:
      'Find B2B solar leads in {city} — businesses buying solar for their own operations. Commercial, industrial and retail building data with verified contact details.',
    introTemplate:
      'B2B solar sales in {city} means selling to businesses that will install solar on their own premises — not reselling to consumers. SolarScout Pro is purpose-built for B2B solar prospecting, mapping every commercial and industrial building in {city} with the contact intelligence you need to close deals.',
    hooks: [
      'B2B solar sales in {city} starts with the right data. SolarScout Pro gives you the complete picture.',
      'Stop B2B solar prospecting blind. See every {city} business building that needs solar — before your first call.',
      '{city} businesses are your B2B solar market. SolarScout maps all of them.',
    ],
    faqs: [
      {
        question: 'What makes B2B solar leads different in {city}?',
        answer:
          'B2B solar leads in {city} are businesses buying solar for their own facilities — a larger, more committed purchase than consumer solar. Decision-makers are facilities managers, CFOs or sustainability directors. SolarScout Pro surfaces the business name, contact details and building data needed for a professional B2B solar pitch.',
      },
      {
        question: 'What B2B solar lead data does SolarScout provide for {city}?',
        answer:
          'Each B2B solar lead in {city} includes GPS coordinates, business name, category, phone, email, website, Google rating, and estimated roof area — plus Google Solar API data for qualifying buildings. Everything you need for a data-driven B2B solar sales approach.',
      },
      {
        question: 'How do I build a B2B solar pipeline for {city}?',
        answer:
          'SolarScout Pro lets you define your ideal B2B solar customer profile in {city} — building type, size, sector — then scan the entire city to surface matching businesses. You can then filter, score and export your list to start systematic B2B outreach.',
      },
    ],
    leadFilter: {},
    keywords: ['B2B solar leads', 'business solar leads', 'commercial solar sales leads', 'B2B solar prospects', 'solar business development leads'],
    seedSegments: [
      { type: 'manufacturing', label: 'Manufacturing Businesses', ctaLabel: 'Find manufacturers', ctaHref: '/dashboard', icon: 'Factory' },
      { type: 'logistics', label: 'Logistics Companies', ctaLabel: 'Find logistics companies', ctaHref: '/dashboard', icon: 'Truck' },
      { type: 'retail-chain', label: 'Retail Chains', ctaLabel: 'Find retail chains', ctaHref: '/dashboard', icon: 'Store' },
    ],
  },

  'solar-installer-leads': {
    intentType: 'solar-installer-leads',
    titleTemplate: 'Solar Installer Leads in {city} | SolarScout Pro',
    h1Template: 'Solar Installer Pipeline — Prospects in {city}',
    metaTitleTemplate: 'Solar Installer Leads in {city} — Build Your Installation Pipeline | SolarScout Pro',
    metaDescriptionTemplate:
      'Build your solar installer pipeline in {city} with satellite-detected rooftops. Commercial and industrial prospects with contact data and energy estimates ready to pitch.',
    introTemplate:
      'SolarScout Pro is the lead generation platform built specifically for solar installers in {city}. Whether you focus on commercial, industrial or residential, SolarScout helps you find the right buildings, get the contact data, and build a pipeline that converts — all from one dashboard.',
    hooks: [
      'Solar installer in {city}? Stop prospecting manually. SolarScout builds your pipeline automatically.',
      'Every solar installer in {city} needs a full pipeline. SolarScout gives you one in minutes.',
      'Win more {city} solar installation contracts with verified prospects from satellite data.',
    ],
    faqs: [
      {
        question: 'How does SolarScout Pro help solar installers find leads in {city}?',
        answer:
          'SolarScout Pro lets solar installers scan the entire commercial and industrial rooftop stock of {city} from a dashboard. It detects buildings by type, estimates roof area, surfaces contact data and provides Google Solar API energy estimates — cutting prospecting time by 90% versus manual research.',
      },
      {
        question: 'Can I filter solar installer leads by building type in {city}?',
        answer:
          'Yes. Solar installers using SolarScout Pro can filter {city} leads by building type (warehouse, industrial, commercial, retail, agricultural), minimum roof area, contact data availability, and solar API data presence — so you only work leads that match your install speciality.',
      },
      {
        question: 'How many leads can a solar installer generate in {city} per month?',
        answer:
          'There is no monthly lead cap. SolarScout Pro charges a flat plan fee — not per lead. Solar installers typically generate 50–500 qualified {city} prospects per scan depending on the search area and filters applied, then re-scan monthly as new buildings open and businesses change.',
      },
    ],
    leadFilter: {},
    keywords: ['solar installer leads', 'solar installation pipeline', 'installer prospect database', 'solar contractor prospects', 'solar company leads'],
    seedSegments: [
      { type: 'commercial', label: 'Commercial Installs', ctaLabel: 'Find commercial prospects', ctaHref: '/dashboard', icon: 'Building2' },
      { type: 'industrial', label: 'Industrial Installs', ctaLabel: 'Find industrial prospects', ctaHref: '/dashboard', icon: 'Factory' },
      { type: 'residential', label: 'Residential Installs', ctaLabel: 'Find residential prospects', ctaHref: '/dashboard', icon: 'Home' },
    ],
  },

  'new-build-solar-leads': {
    intentType: 'new-build-solar-leads',
    titleTemplate: 'New Build Solar Leads in {city} | SolarScout Pro',
    h1Template: 'New Build Solar Installation Prospects in {city}',
    metaTitleTemplate: 'New Build Solar Leads in {city} — Developers & New Properties | SolarScout Pro',
    metaDescriptionTemplate:
      'Find new build commercial and residential developments in {city} for solar installation. Early-stage projects, mandated solar requirements and developer contacts.',
    introTemplate:
      'New build developments in {city} — commercial parks, housing estates and mixed-use schemes — increasingly require solar as standard, driven by building regulations and planning conditions. SolarScout Pro helps you identify new build sites and reach developers before any other installer.',
    hooks: [
      'New build solar in {city} is mandated by regulations. Find the developments before they go to tender.',
      '{city}\'s new build market is your most reliable solar pipeline. Get there first.',
      'Property developers in {city} need solar on every new scheme. Be their preferred installer.',
    ],
    faqs: [
      {
        question: 'Why is the new build solar market growing in {city}?',
        answer:
          'New building regulations in {city} and across the country are progressively mandating solar PV as a standard feature of new commercial and residential buildings — creating a guaranteed, recurring demand for solar installers willing to build developer relationships.',
      },
      {
        question: 'How do I find new build solar leads in {city}?',
        answer:
          'SolarScout Pro detects recently completed and under-construction commercial buildings in {city}, including new warehouse parks, retail schemes, office campuses and housing developments. You can then contact the developer or managing agent to pitch solar as part of the build.',
      },
      {
        question: 'What types of new builds need solar in {city}?',
        answer:
          'In {city}, new commercial builds — logistics parks, business parks, retail schemes and mixed-use developments — are the most active solar buyers. New residential developments seeking energy performance certificates (EPCs) also increasingly include solar as standard to meet requirements.',
      },
    ],
    leadFilter: {},
    keywords: ['new build solar leads', 'developer solar installation', 'new construction solar', 'new build solar panels', 'development solar prospects'],
    seedSegments: [
      { type: 'commercial-dev', label: 'Commercial Developments', ctaLabel: 'Find commercial developments', ctaHref: '/dashboard', icon: 'Building2' },
      { type: 'housing-dev', label: 'Housing Developments', ctaLabel: 'Find housing developments', ctaHref: '/dashboard', icon: 'Home' },
      { type: 'mixed-use-dev', label: 'Mixed-Use Schemes', ctaLabel: 'Find mixed-use schemes', ctaHref: '/dashboard', icon: 'LayoutGrid' },
    ],
  },

  'public-sector-solar-leads': {
    intentType: 'public-sector-solar-leads',
    titleTemplate: 'Public Sector Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Public Sector & Council Building Solar Prospects in {city}',
    metaTitleTemplate: 'Public Sector Solar Leads in {city} — Council, Government & Public Buildings | SolarScout Pro',
    metaDescriptionTemplate:
      'Find public sector buildings in {city} for solar installation. Councils, government offices, libraries, leisure centres and public infrastructure with grant funding available.',
    introTemplate:
      'Public sector buildings in {city} — councils, government offices, libraries, leisure centres and schools — are under statutory obligation to reduce carbon emissions, with access to dedicated public sector energy grants that make solar a near-zero-cost proposition. SolarScout Pro maps every qualifying public building.',
    hooks: [
      'Public buildings in {city} have legal carbon targets. Solar is the solution — and grants pay for it.',
      '{city} council buildings are required to go green. Help them — and win long-term public sector contracts.',
      'Public sector solar in {city}: grant-funded, long-term contracts, zero churn. The best clients you\'ll ever have.',
    ],
    faqs: [
      {
        question: 'Are there grants for public sector solar in {city}?',
        answer:
          'Public sector buildings in {city} can access a range of grant funding including public sector decarbonisation schemes, local authority renewable energy funds, and EU-backed infrastructure grants — often covering 30–60% of installation costs and making solar a straightforward financial decision.',
      },
      {
        question: 'What public buildings can I target for solar in {city}?',
        answer:
          'SolarScout Pro detects council offices, libraries, community centres, police stations, fire stations, leisure centres, public swimming pools and government-owned commercial properties in {city} — all with usable rooftop area and strong sustainability mandates.',
      },
      {
        question: 'How do public sector solar decisions get made in {city}?',
        answer:
          'Public sector solar projects in {city} typically go through a procurement officer, estates manager or sustainability team. SolarScout Pro helps you identify the right buildings and gives you the data needed to pre-qualify for framework contracts and submit competitive tenders.',
      },
    ],
    leadFilter: { businessTypes: ['public-sector'] },
    keywords: ['public sector solar leads', 'council building solar', 'government solar installation', 'local authority solar', 'public building solar grants'],
    seedSegments: [
      { type: 'council', label: 'Council Buildings', ctaLabel: 'Find council buildings', ctaHref: '/dashboard', icon: 'Landmark' },
      { type: 'library', label: 'Libraries & Community Centres', ctaLabel: 'Find community buildings', ctaHref: '/dashboard', icon: 'BookOpen' },
      { type: 'public-leisure', label: 'Public Leisure Facilities', ctaLabel: 'Find public leisure', ctaHref: '/dashboard', icon: 'Dumbbell' },
    ],
  },

  'solar-farm-leads': {
    intentType: 'solar-farm-leads',
    titleTemplate: 'Solar Farm Leads near {city} | SolarScout Pro',
    h1Template: 'Ground-Mount & Solar Farm Site Leads near {city}',
    metaTitleTemplate: 'Solar Farm Leads near {city} — Ground Mount & Utility Scale Solar | SolarScout Pro',
    metaDescriptionTemplate:
      'Find ground-mount and solar farm land sites near {city}. Agricultural and brownfield land with high irradiance, grid connection proximity and landowner data.',
    introTemplate:
      'Ground-mount solar and solar farm development near {city} requires identifying the right land — flat or gently sloping, unshaded, close to grid infrastructure and with a receptive landowner. SolarScout Pro maps agricultural and open land near {city} to help you find viable solar farm sites before your competitors.',
    hooks: [
      'Solar farm sites near {city} are scarce and competitive. Find them first with satellite data.',
      'Ground-mount solar near {city}: the biggest projects, the best margins. SolarScout finds the land.',
      'Every solar farm near {city} starts with the right field. SolarScout helps you find it.',
    ],
    faqs: [
      {
        question: 'How do I find solar farm land near {city}?',
        answer:
          'SolarScout Pro identifies agricultural and open land near {city} with characteristics suitable for ground-mount solar: flat terrain, high irradiance, proximity to grid substations and limited planning constraints. Each site comes with landowner contact data where available.',
      },
      {
        question: 'What size solar farm is viable near {city}?',
        answer:
          'Near {city}, ground-mount solar farms range from 500 kW (about 2 acres) for community or commercial schemes to 50 MW+ utility-scale projects on larger agricultural land holdings. SolarScout Pro helps you identify sites in the size range that matches your development capabilities.',
      },
      {
        question: 'What solar irradiance can I expect near {city}?',
        answer:
          'Solar irradiance near {city} determines the annual energy yield of any ground-mount installation. SolarScout Pro provides irradiance estimates from Google Solar API data for specific parcels, enabling accurate financial modelling before approaching landowners or planning authorities.',
      },
    ],
    leadFilter: { businessTypes: ['agricultural'] },
    keywords: ['solar farm leads', 'ground mount solar leads', 'utility solar leads', 'solar farm development sites', 'solar land leads'],
    seedSegments: [
      { type: 'farmland', label: 'Agricultural Land', ctaLabel: 'Find farm land', ctaHref: '/dashboard', icon: 'Leaf' },
      { type: 'brownfield', label: 'Brownfield Sites', ctaLabel: 'Find brownfield sites', ctaHref: '/dashboard', icon: 'MapPin' },
      { type: 'commercial-land', label: 'Commercial Land', ctaLabel: 'Find commercial land', ctaHref: '/dashboard', icon: 'Layers' },
    ],
  },

  'ev-charging-solar-leads': {
    intentType: 'ev-charging-solar-leads',
    titleTemplate: 'EV Charging & Solar Leads in {city} | SolarScout Pro',
    h1Template: 'EV Charging + Solar Co-Installation Prospects in {city}',
    metaTitleTemplate: 'EV Charging Solar Leads in {city} — Co-Install Solar + EV Charging | SolarScout Pro',
    metaDescriptionTemplate:
      'Find businesses in {city} ready for combined solar and EV charging installation. Fleet depots, car parks, logistics hubs and commercial premises with EV charging demand.',
    introTemplate:
      'Solar and EV charging co-installation is the fastest-growing commercial energy project type in {city}. Businesses installing EV charging for fleets and employees simultaneously need on-site solar generation to offset charging costs. SolarScout Pro maps every qualifying commercial and logistics site.',
    hooks: [
      'Solar + EV charging in {city}: double the project value, same roof. Find your next co-install.',
      '{city} businesses installing EV chargers need solar to power them. You can supply both.',
      'EV charging mandates in {city} are creating a solar installation wave. Ride it.',
    ],
    faqs: [
      {
        question: 'Why do EV charging sites in {city} need solar co-installation?',
        answer:
          'EV charging significantly increases a business\'s electricity bill in {city}. Solar co-installation offsets charging costs with on-site generation, often making the combined project payback faster than solar alone — creating a compelling combined proposition for fleet-operating businesses.',
      },
      {
        question: 'What types of businesses in {city} need EV charging and solar together?',
        answer:
          'The strongest EV charging + solar co-install prospects in {city} are logistics companies with delivery fleets, commercial property owners with car parks, manufacturing companies with shift worker transport, and retail parks mandated to provide customer EV charging.',
      },
      {
        question: 'How do I find EV charging solar co-install leads in {city}?',
        answer:
          'SolarScout Pro identifies {city} businesses with large car parks, fleet-operating logistics facilities and commercial premises with sustainability mandates — the exact profile of organisations most likely to invest in combined solar and EV charging infrastructure.',
      },
    ],
    leadFilter: {},
    keywords: ['EV charging solar leads', 'solar EV co-installation', 'electric vehicle solar', 'fleet charging solar', 'solar carport EV leads'],
    seedSegments: [
      { type: 'fleet-depot', label: 'Fleet Depots', ctaLabel: 'Find fleet depots', ctaHref: '/dashboard', icon: 'Truck' },
      { type: 'car-park-ev', label: 'Car Parks with EV Potential', ctaLabel: 'Find car parks', ctaHref: '/dashboard', icon: 'Car' },
      { type: 'logistics-ev', label: 'Logistics with EV Fleets', ctaLabel: 'Find logistics EV leads', ctaHref: '/dashboard', icon: 'Package' },
    ],
  },

  'office-solar-leads': {
    intentType: 'office-solar-leads',
    titleTemplate: 'Office Building Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Office Solar Installation Prospects in {city}',
    metaTitleTemplate: 'Office Solar Leads in {city} — Office Buildings & Business Parks | SolarScout Pro',
    metaDescriptionTemplate:
      'Find office buildings and business parks in {city} for solar installation. Sustainability-driven tenants, ESG compliance mandates and flat-roof opportunities.',
    introTemplate:
      'Office buildings and business parks in {city} are under increasing pressure from tenants, investors and regulators to improve sustainability credentials — and solar PV is the most visible, bankable response. SolarScout Pro maps every qualifying office building with roof area and contact data.',
    hooks: [
      'Office buildings in {city} are getting ESG pressure from every angle. Solar is the answer — and you can supply it.',
      '{city}\'s business parks are going green to attract tenants. Be the solar partner they call.',
      'Every office block in {city} is a solar opportunity. Find them all before your competition.',
    ],
    faqs: [
      {
        question: 'Why are office buildings good solar targets in {city}?',
        answer:
          'Office buildings in {city} face mounting ESG reporting requirements from tenants, investors and regulators. Solar PV directly reduces Scope 2 emissions, improves EPC ratings and can be presented as a tenant benefit — making it an easy investment decision for landlords and owner-occupiers.',
      },
      {
        question: 'How large are office rooftops in {city}?',
        answer:
          'Office buildings in {city} range from small 200 m² units to large multi-floor business park blocks with 2,000–5,000 m² of rooftop. SolarScout Pro provides estimated roof area for each building, enabling preliminary system sizing before the first call.',
      },
      {
        question: 'Who makes solar decisions for office buildings in {city}?',
        answer:
          'For owner-occupied offices in {city}, the sustainability or facilities manager typically initiates solar projects. For leased offices, the decision lies with the property manager or freeholder. SolarScout Pro surfaces the business contact — name, phone, email — to help you reach the right person.',
      },
    ],
    leadFilter: { businessTypes: ['commercial'] },
    keywords: ['office solar leads', 'business park solar', 'office building solar panels', 'commercial office solar', 'office rooftop solar'],
    seedSegments: [
      { type: 'office-block', label: 'Office Blocks', ctaLabel: 'Find office blocks', ctaHref: '/dashboard', icon: 'Building2' },
      { type: 'business-park', label: 'Business Parks', ctaLabel: 'Find business parks', ctaHref: '/dashboard', icon: 'LayoutGrid' },
      { type: 'coworking', label: 'Co-working Spaces', ctaLabel: 'Find co-working spaces', ctaHref: '/dashboard', icon: 'Users' },
    ],
  },

  'church-solar-leads': {
    intentType: 'church-solar-leads',
    titleTemplate: 'Church & Place of Worship Solar Leads in {city} | SolarScout Pro',
    h1Template: 'Church & Religious Building Solar Prospects in {city}',
    metaTitleTemplate: 'Church Solar Leads in {city} — Places of Worship & Community Buildings | SolarScout Pro',
    metaDescriptionTemplate:
      'Find churches, mosques, temples and places of worship in {city} for solar installation. Large rooftops, community sustainability goals and charitable grant funding.',
    introTemplate:
      'Places of worship in {city} — churches, mosques, temples, synagogues and community faith centres — often have large, suitable rooftops and growing interest in sustainability as a stewardship value. Many can access charitable energy grants that make solar near cost-neutral. SolarScout Pro maps every qualifying building.',
    hooks: [
      'Churches in {city} have the biggest roof-to-congregation ratio of any building type. Find them all.',
      'Faith communities in {city} are going solar for sustainability — and grant funding makes it easy.',
      '{city}\'s places of worship are an overlooked solar market. Get there first.',
    ],
    faqs: [
      {
        question: 'Are churches good solar candidates in {city}?',
        answer:
          'Yes. Churches and places of worship in {city} often have large, relatively unobstructed roof areas, moderate but consistent electricity consumption, and access to charity sector energy grants and faith-based sustainability funds that significantly offset installation costs.',
      },
      {
        question: 'What grants are available for church solar in {city}?',
        answer:
          'Faith buildings in {city} can access faith-sector sustainability funds, community energy grants and public-good renewable energy programmes — reducing or eliminating the net cost of solar installation for qualifying buildings.',
      },
      {
        question: 'How do I approach churches about solar in {city}?',
        answer:
          'SolarScout Pro provides the name and contact details for places of worship in {city}, including church secretary and vicar details where available. The most effective approach combines the energy cost savings message with the sustainability-as-stewardship framing that resonates strongly with faith community leaders.',
      },
    ],
    leadFilter: { businessTypes: ['religious'] },
    keywords: ['church solar leads', 'place of worship solar', 'mosque solar installation', 'temple solar panels', 'faith building solar'],
    seedSegments: [
      { type: 'church', label: 'Churches', ctaLabel: 'Find churches', ctaHref: '/dashboard', icon: 'Building2' },
      { type: 'mosque', label: 'Mosques & Islamic Centres', ctaLabel: 'Find mosques', ctaHref: '/dashboard', icon: 'Building' },
      { type: 'community-hall', label: 'Community & Faith Halls', ctaLabel: 'Find community halls', ctaHref: '/dashboard', icon: 'Users' },
    ],
  },

  'solar-roof-survey': {
    intentType: 'solar-roof-survey',
    titleTemplate: 'Solar Roof Survey Leads in {city} | SolarScout Pro',
    h1Template: 'Solar Roof Survey & Assessment Prospects in {city}',
    metaTitleTemplate: 'Solar Roof Survey in {city} — Find Buildings Ready for Solar Assessment | SolarScout Pro',
    metaDescriptionTemplate:
      'Find commercial buildings in {city} ready for a solar roof survey. Satellite pre-assessed with roof area and irradiance data — arrive at every survey fully prepared.',
    introTemplate:
      'A solar roof survey is the first step in any commercial installation — and SolarScout Pro transforms the process. Instead of cold-calling to book surveys, you can pre-screen every commercial rooftop in {city} using satellite imagery, irradiance data and contact details — arriving at every survey appointment already knowing the opportunity.',
    hooks: [
      'Skip the cold calls. Pre-screen every {city} rooftop before you book a single solar survey.',
      '{city} commercial solar surveys start with the right rooftop. SolarScout finds them for you.',
      'Know the opportunity before you arrive. SolarScout Pre-assesses every {city} rooftop for you.',
    ],
    faqs: [
      {
        question: 'How does SolarScout Pro help with solar roof surveys in {city}?',
        answer:
          'SolarScout Pro satellite-pre-screens every commercial rooftop in {city} — confirming buildable area, roof orientation, shading risk and proximity factors — before you ever book a survey. This means you only book solar surveys for buildings that are genuinely viable, drastically improving your conversion rate.',
      },
      {
        question: 'What data does SolarScout provide before a solar roof survey in {city}?',
        answer:
          'Before visiting a {city} rooftop for a solar survey, SolarScout Pro provides: satellite roof image, estimated usable area (m²), Google Solar API energy potential (kWh/year), estimated panel count, irradiance data, and the business contact details — everything you need for a fully prepared survey visit.',
      },
      {
        question: 'Can I book solar roof surveys directly from SolarScout Pro for {city}?',
        answer:
          'SolarScout Pro provides all the contact data and building information you need to book solar roof surveys in {city} efficiently. Our AI outreach tool can also generate personalised email and phone scripts to maximise survey booking conversion rates.',
      },
    ],
    leadFilter: {},
    keywords: ['solar roof survey', 'solar roof assessment', 'commercial solar assessment', 'solar feasibility survey', 'roof solar inspection leads'],
    seedSegments: [
      { type: 'survey-commercial', label: 'Commercial Survey Prospects', ctaLabel: 'Find survey prospects', ctaHref: '/dashboard', icon: 'Building2' },
      { type: 'survey-industrial', label: 'Industrial Survey Prospects', ctaLabel: 'Find industrial prospects', ctaHref: '/dashboard', icon: 'Factory' },
      { type: 'survey-warehouse', label: 'Warehouse Survey Prospects', ctaLabel: 'Find warehouse prospects', ctaHref: '/dashboard', icon: 'Warehouse' },
    ],
  },
}

// ─── Country-level hub templates ──────────────────────────────────────────────
// These generate national hub pages (no city), e.g. "solar-leads-romania"

export const COUNTRY_CONFIG: Record<
  string,
  { slug: string; label: string; adjective: string; locale: string }
> = {
  RO: { slug: 'romania',        label: 'Romania',        adjective: 'Romanian', locale: 'ro' },
  ES: { slug: 'spain',          label: 'Spain',          adjective: 'Spanish',  locale: 'es' },
  PT: { slug: 'portugal',       label: 'Portugal',       adjective: 'Portuguese', locale: 'en' },
  AL: { slug: 'albania',        label: 'Albania',        adjective: 'Albanian', locale: 'sq' },
  GB: { slug: 'united-kingdom', label: 'United Kingdom', adjective: 'UK',       locale: 'en' },
}
