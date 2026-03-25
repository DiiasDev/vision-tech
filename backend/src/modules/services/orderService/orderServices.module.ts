import { OrderServiceService } from './orderServices.service';
import { OrderServicesController } from './orderServices.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [OrderServicesController],
  providers: [OrderServiceService],
  exports: [OrderServiceService],
})
export class OrderServicesModule {}
