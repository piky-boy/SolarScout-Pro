import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const testEmail = 'john@doe.com'
  const testPassword = 'johndoe123'
  const hashed = await bcrypt.hash(testPassword, 10)

  const user = await prisma.user.upsert({
    where: { email: testEmail },
    update: { name: 'John Doe', password: hashed, role: 'ADMIN', approved: true, surveyCompleted: true },
    create: {
      email: testEmail,
      name: 'John Doe',
      password: hashed,
      role: 'ADMIN',
      approved: true,
      surveyCompleted: true,
    },
  })

  // Master Admin account
  const masterEmail = 'amiosif@icloud.com'
  const masterPassword = 'L@nd@n112'
  const masterHashed = await bcrypt.hash(masterPassword, 10)
  await prisma.user.upsert({
    where: { email: masterEmail },
    update: { name: 'Master Admin', password: masterHashed, role: 'ADMIN', approved: true, surveyCompleted: true },
    create: {
      email: masterEmail,
      name: 'Master Admin',
      password: masterHashed,
      role: 'ADMIN',
      approved: true,
      surveyCompleted: true,
    },
  })

  // Seed a handful of realistic commercial leads across the four markets so
  // a new account has something to explore without waiting on an Overpass call.
  const sampleLeads = [
    {
      osmId: 'seed/ro-bucharest-1',
      businessName: 'ProLogis Bucharest DC-1',
      businessType: 'Warehouse',
      buildingType: 'warehouse',
      address: 'Bulevardul Theodor Pallady 51, Sector 3',
      city: 'Bucharest',
      country: 'Romania',
      latitude: 44.4173,
      longitude: 26.1844,
      roofAreaSqm: 18400,
      contactPhone: '+40 21 305 2000',
      contactEmail: 'info@prologis-bucharest.example',
      website: 'https://example.com/prologis-bucharest',
    },
    {
      osmId: 'seed/es-madrid-1',
      businessName: 'Mercamadrid Logistics Hub',
      businessType: 'Logistics',
      buildingType: 'warehouse',
      address: 'Avenida de Madrid 19, 28053 Madrid',
      city: 'Madrid',
      country: 'Spain',
      latitude: 40.3822,
      longitude: -3.6501,
      roofAreaSqm: 26100,
      contactPhone: '+34 91 785 0000',
      contactEmail: 'info@mercamadrid.example',
      website: 'https://example.com/mercamadrid',
    },
    {
      osmId: 'seed/pt-porto-1',
      businessName: 'Leixões Industrial Park',
      businessType: 'Industrial',
      buildingType: 'industrial',
      address: 'Avenida da Liberdade 456, Matosinhos',
      city: 'Porto',
      country: 'Portugal',
      latitude: 41.18,
      longitude: -8.695,
      roofAreaSqm: 12400,
      contactPhone: '+351 22 999 0000',
      contactEmail: 'hello@leixoes-park.example',
      website: null,
    },
    {
      osmId: 'seed/al-tirana-1',
      businessName: 'Tirana Logistics Center',
      businessType: 'Warehouse',
      buildingType: 'warehouse',
      address: 'Rruga e Durrësit 123, Tirana',
      city: 'Tirana',
      country: 'Albania',
      latitude: 41.323,
      longitude: 19.79,
      roofAreaSqm: 8600,
      contactPhone: '+355 4 224 5678',
      contactEmail: null,
      website: null,
    },
    {
      osmId: 'seed/es-barcelona-1',
      businessName: 'Barcelona Free Zone Factory',
      businessType: 'Factory',
      buildingType: 'factory',
      address: 'Carrer del Foc 45, Zona Franca, Barcelona',
      city: 'Barcelona',
      country: 'Spain',
      latitude: 41.342,
      longitude: 2.128,
      roofAreaSqm: 15800,
      contactPhone: '+34 93 445 0000',
      contactEmail: 'contact@bcn-factory.example',
      website: null,
    },
    {
      osmId: 'seed/ro-cluj-1',
      businessName: 'Cluj Auto Components',
      businessType: 'Factory',
      buildingType: 'industrial',
      address: 'Strada Fabricii de Zahăr 1, Cluj-Napoca',
      city: 'Cluj-Napoca',
      country: 'Romania',
      latitude: 46.77,
      longitude: 23.6,
      roofAreaSqm: 9750,
      contactPhone: '+40 264 123 456',
      contactEmail: null,
      website: null,
    },
    {
      osmId: 'seed/gb-manchester-1',
      businessName: 'Trafford Park Distribution Hub',
      businessType: 'Warehouse',
      buildingType: 'warehouse',
      address: 'Westinghouse Road, Trafford Park, Manchester',
      city: 'Manchester',
      country: 'United Kingdom',
      latitude: 53.4629,
      longitude: -2.3369,
      roofAreaSqm: 18900,
      contactPhone: '+44 161 872 0000',
      contactEmail: 'info@trafford-hub.example',
      website: null,
    },
    {
      osmId: 'seed/gb-birmingham-1',
      businessName: 'Midlands Logistics Centre',
      businessType: 'Warehouse',
      buildingType: 'industrial',
      address: 'Tyburn Road, Erdington, Birmingham',
      city: 'Birmingham',
      country: 'United Kingdom',
      latitude: 52.5231,
      longitude: -1.8249,
      roofAreaSqm: 11400,
      contactPhone: '+44 121 327 0000',
      contactEmail: null,
      website: null,
    },
  ]

  for (const l of sampleLeads) {
    await prisma.lead.upsert({
      where: { userId_osmId: { userId: user.id, osmId: l.osmId } },
      update: {},
      create: { ...l, userId: user.id },
    })
  }

  await prisma.searchHistory.upsert({
    where: { id: 'seed-history-1' },
    update: {},
    create: {
      id: 'seed-history-1',
      userId: user.id,
      locationSearched: 'Madrid, Spain',
      country: 'Spain',
      leadsFound: 2,
    },
  })

  console.log('Seeded user:', user.email)
  console.log('Seeded leads:', sampleLeads.length)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
