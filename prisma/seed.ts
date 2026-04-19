import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@sorascout-pro.com'
  const adminPassword = 'L@nd@n1982'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'SolarScout Admin',
      password: hashedPassword,
      role: 'ADMIN',
      approved: true,
      surveyCompleted: true,
    },
    create: {
      email: adminEmail,
      name: 'SolarScout Admin',
      password: hashedPassword,
      role: 'ADMIN',
      approved: true,
      surveyCompleted: true,
    },
  })

  console.log(`Seeded admin user: ${adminEmail}`)
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
