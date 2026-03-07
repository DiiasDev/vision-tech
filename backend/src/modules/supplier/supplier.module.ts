import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupllierController } from './supplier.controller';

@Module({
  controllers: [SupllierController],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}
