import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany();
  }

  async getCurrentUser(userId: string, organizationId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    const userOrg = await this.prisma.userOrganization.findFirst({
      where: {
        userId,
        isActive: true,
        ...(organizationId ? { organizationId } : {}),
      },
      include: {
        role: true,
        organization: true,
      },
    });

    return {
      ...user,
      role: userOrg?.role?.name ?? null,
      organization: userOrg?.organization?.name ?? null,
      organizationId: userOrg?.organizationId ?? null,
    };
  }
}
