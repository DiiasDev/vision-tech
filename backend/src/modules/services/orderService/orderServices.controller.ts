import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  OrderServiceService,
  type orderServiceDto,
} from './orderServices.service';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/dto/guards/jwt-auth.guard';

interface AuthenticatedUser {
  userId: string;
  organizationId: string;
}

@Controller('service-order')
export class OrderServicesController {
  constructor(private readonly orderService: OrderServiceService) {}

  @UseGuards(JwtAuthGuard)
  @Get('codes')
  async getOrderServiceCodes(@Req() req: Request) {
    const currentUser = req.user as AuthenticatedUser;

    return await this.orderService.getOrderServiceCodes(currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  async registerOrderService(
    @Req() req: Request,
    @Body() body: orderServiceDto,
  ) {
    const currentUser = req.user as AuthenticatedUser;

    return await this.orderService.createOrderService(body, currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getOrderService(@Req() req: Request) {
    const currentUser = req.user as AuthenticatedUser;

    return await this.orderService.getOrderService(currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':serviceOrderId')
  async updateOrderService(
    @Req() req: Request,
    @Param('serviceOrderId') serviceOrderId: string,
    @Body() body: Partial<orderServiceDto>,
  ) {
    const currentUser = req.user as AuthenticatedUser;

    return await this.orderService.updateOrderService(
      serviceOrderId,
      body,
      currentUser,
    );
  }
}
