import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import type { Request } from 'express';
import { ProductsServices } from './products.service';
import { JwtAuthGuard } from '../auth/dto/guards/jwt-auth.guard';
import { type CreateProductDto } from './products.service';

interface AuthenticatedUser {
  userId: string;
  organizationId: string;
}

@Controller('products')
export class productsController {
  constructor(private readonly productsServices: ProductsServices) {}

  @UseGuards(JwtAuthGuard)
  @Get('codes')
  async getProductCodes(@Req() req: Request) {
    const currentUser = req.user as AuthenticatedUser;

    const result = await this.productsServices.getProductCodes(currentUser);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async registerProduct(@Req() req: Request, @Body() body: CreateProductDto) {
    const currentUser = req.user as AuthenticatedUser;

    const result = await this.productsServices.createProduct(currentUser, body);

    return result;
  }
}
