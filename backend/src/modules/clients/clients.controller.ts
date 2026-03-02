import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import type { Request } from 'express';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/dto/guards/jwt-auth.guard';
import { CreateClientDto } from './clients.service';

interface AuthenticatedUser {
  id: string;
  organizationId: string;
  permissions?: string[];
}

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async registerClient(@Req() req: Request, @Body() body: CreateClientDto) {
    const currentUser = req.user as AuthenticatedUser;

    const result = await this.clientsService.registerClient(body, currentUser);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getClient(@Req() req: Request) {
    const currentUser = req.user as AuthenticatedUser;
    return await this.clientsService.getClients(currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getClientById(@Req() req: Request, @Param('id') id: string) {
    const currentUser = req.user as AuthenticatedUser;
    return await this.clientsService.getClientById(id, currentUser);
  }
}
