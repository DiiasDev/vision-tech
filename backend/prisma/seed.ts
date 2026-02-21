import {
  PrismaClient,
  PlanType,
  OrganizationStatus,
  ClientType,
  ClientStatus,
} from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'
import 'dotenv/config'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Check backend/.env before running seed.')
}

const adapter = new PrismaPg({ connectionString: databaseUrl })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  /*
   * 1️⃣ PERMISSIONS
   */

  const permissions = [
    { code: 'CREATE_PRODUCT', description: 'Create products' },
    { code: 'VIEW_PRODUCT', description: 'View products' },
    { code: 'CREATE_FINANCIAL', description: 'Create financial records' },
    { code: 'VIEW_FINANCIAL', description: 'View financial records' },
    { code: 'CREATE_CLIENT', description: 'Create clients' },
    { code: 'VIEW_CLIENT', description: 'View clients' },
  ]

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {},
      create: permission,
    })
  }

  console.log('✅ Permissions ensured.')

  /*
   * 2️⃣ ORGANIZATION
   */

  const organization = await prisma.organization.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Company',
      slug: 'demo-company',
      plan: PlanType.ESSENTIAL, // ✅ corrigido
      status: OrganizationStatus.ACTIVE, // ✅ corrigido
    },
  })

  console.log('✅ Organization ensured.')

  /*
   * 3️⃣ ROLE ADMIN
   */

  const adminRole =
    (await prisma.role.findFirst({
      where: {
        name: 'ADMIN',
        organizationId: organization.id,
      },
    })) ??
    (await prisma.role.create({
      data: {
        name: 'ADMIN',
        organizationId: organization.id,
      },
    }))

  console.log('✅ Admin role ensured.')

  /*
   * 4️⃣ ROLE PERMISSIONS
   */

  const allPermissions = await prisma.permission.findMany()

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    })
  }

  console.log('✅ Role permissions ensured.')

  /*
   * 5️⃣ USER ADMIN
   */

  const hashedPassword = await bcrypt.hash('123456', 10)

  const user = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@demo.com',
      passwordHash: hashedPassword,
      isActive: true,
    },
  })

  console.log('✅ Admin user ensured.')

  /*
   * 6️⃣ USER ↔ ORGANIZATION
   */

  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: organization.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      organizationId: organization.id,
      roleId: adminRole.id,
      isActive: true,
    },
  })

  console.log('✅ User linked to organization.')

  /*
   * 7️⃣ CLIENTES DEMO
   */

  const existingClients = await prisma.client.count({
    where: { organizationId: organization.id },
  })

  if (existingClients === 0) {
    await prisma.client.createMany({
      data: [
        {
          code: 'CLI-0001',
          organizationId: organization.id,
          type: ClientType.PJ,
          name: 'Empresa Alpha',
          document: '12.345.678/0001-99',
          email: 'contato@alpha.com',
          telephone: '11999999999',
          status: ClientStatus.ACTIVE,
          city: 'São Paulo',
          state: 'SP',
        },
        {
          code: 'CLI-0002',
          organizationId: organization.id,
          type: ClientType.PF,
          name: 'João Silva',
          document: '123.456.789-00',
          email: 'joao@email.com',
          telephone: '11888888888',
          status: ClientStatus.DELINQUENT,
          city: 'Campinas',
          state: 'SP',
        },
      ],
    })

    console.log('✅ Demo clients created.')
  }

  console.log('🌱 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })