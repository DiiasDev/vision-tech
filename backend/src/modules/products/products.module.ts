import { Module } from '@nestjs/common';
import { ProductsServices } from './products.service';
import { productsController } from './products.controller';

@Module({
  controllers: [productsController],
  providers: [ProductsServices],
  exports: [ProductsServices],
})
export class ProductsModule {}
