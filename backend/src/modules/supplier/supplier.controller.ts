import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Param,
  Put,
  Patch,
  Delete,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/dto/guards/jwt-auth.guard';
import {
  type SupplierTypes,
  type UpdateSupplierTypes,
} from './supplier.service';
import { SupplierService } from './supplier.service';

interface AuthenticatedUser {
  userId: string;
  organizationId: string;
}

@Controller('supplier')
export class SupllierController {
  constructor(private readonly supplierServices: SupplierService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async registerSupplier(@Req() req: Request, @Body() body: SupplierTypes) {
    const currentUser = req.user as AuthenticatedUser;

    const result = await this.supplierServices.newSupplier(currentUser, body);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getSuppliers(@Req() req: Request) {
    const currentUser = req.user as AuthenticatedUser;
    return this.supplierServices.getSuppliers(currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':supplierId')
  async getSupplierById(
    @Req() req: Request,
    @Param('supplierId') supplierId: string,
  ) {
    const currentUser = req.user as AuthenticatedUser;
    return this.supplierServices.getSupplierById(supplierId, currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':supplierId')
  async updateSupplier(
    @Req() req: Request,
    @Param('supplierId') supplierId: string,
    @Body() body: UpdateSupplierTypes,
  ) {
    const currentUser = req.user as AuthenticatedUser;
    return this.supplierServices.updateSupplier(supplierId, currentUser, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':supplierId')
  async patchSupplier(
    @Req() req: Request,
    @Param('supplierId') supplierId: string,
    @Body() body: UpdateSupplierTypes,
  ) {
    const currentUser = req.user as AuthenticatedUser;
    return this.supplierServices.updateSupplier(supplierId, currentUser, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':supplierId')
  async deleteSupplier(
    @Req() req: Request,
    @Param('supplierId') supplierId: string,
  ) {
    const currentUser = req.user as AuthenticatedUser;
    return this.supplierServices.deleteSupplier(supplierId, currentUser);
  }
}
