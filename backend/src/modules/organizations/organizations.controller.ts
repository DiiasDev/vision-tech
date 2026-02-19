import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/dto/guards/jwt-auth.guard';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsservices: OrganizationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  public async getOrganizations(@Req() req: any) {
    console.log('Empresa autenticado:', req.organizations);
    return this.organizationsservices.getOrganizations();
  }
}
