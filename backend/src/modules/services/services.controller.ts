import type { createServiceDto } from './services.service';
import { ServicesService } from './services.service';
import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/dto/guards/jwt-auth.guard';

interface AuthenticatedUser {
  userId: string;
  organizationId: string;
}

@Controller('services')
export class servicesController {
  constructor(private readonly services: ServicesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getServices(@Req() req: Request) {
    const currentUser = req.user as AuthenticatedUser;

    return this.services.getServices(currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':serviceId')
  async getServiceById(
    @Req() req: Request,
    @Param('serviceId') serviceId: string,
  ) {
    const currentUser = req.user as AuthenticatedUser;

    return this.services.getServiceById(serviceId, currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  async createService(@Req() req: Request, @Body() body: createServiceDto) {
    const currentUser = req.user as AuthenticatedUser;

    return this.services.createService(currentUser, body);
  }
}
