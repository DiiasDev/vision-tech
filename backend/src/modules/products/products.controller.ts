import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProducts(@Req() req: Request) {
    const currentUser = req.user as AuthenticatedUser;
    return this.productsServices.getProducts(currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':productId')
  async deleteProduct(
    @Req() req: Request,
    @Param('productId') productId: string,
  ) {
    const currentUser = req.user as AuthenticatedUser;
    return this.productsServices.deleteProduct(productId, currentUser);
  }
}
