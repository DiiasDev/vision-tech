import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  private prisma = new PrismaClient();

  public async getOrganizations(){
    return await this.prisma.organization.findMany();
  }
}
