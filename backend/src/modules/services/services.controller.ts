import type { createServiceDto } from './services.service';
import { ServicesService } from './services.service';
import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Delete,
  Param,
  Patch,
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
  @Post('')
  async createService(@Req() req: Request, @Body() body: createServiceDto) {
    const currentUser = req.user as AuthenticatedUser;

    return this.services.createService(currentUser, body);
  }
}
