import { PrismaClient } from '@prisma/client'
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
   * 1️⃣ Criar permissões globais
   */

  const permissions = [
    { code: 'CREATE_PRODUCT', description: 'Create products' },
    { code: 'VIEW_PRODUCT', description: 'View products' },
    { code: 'CREATE_FINANCIAL', description: 'Create financial records' },
    { code: 'VIEW_FINANCIAL', description: 'View financial records' },
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
   * 2️⃣ Criar Organization demo
   */

  const organization = await prisma.organization.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Company',
      slug: 'demo-company',
      plan: 'FREE',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Organization ensured.')

  /*
   * 3️⃣ Criar Role ADMIN para essa organização
   */

  const existingAdminRole = await prisma.role.findFirst({
    where: {
      name: 'ADMIN',
      organizationId: organization.id,
    },
  })

  const adminRole =
    existingAdminRole ??
    (await prisma.role.create({
      data: {
        name: 'ADMIN',
        organizationId: organization.id,
      },
    }))

  console.log('✅ Admin role ensured.')

  /*
   * 4️⃣ Vincular permissões ao ADMIN
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
   * 5️⃣ Criar usuário admin
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
   * 6️⃣ Vincular usuário à organização
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
