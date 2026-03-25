import { servicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Module } from '@nestjs/common';
import { OrderServicesModule } from './orderService/orderServices.module';

@Module({
  imports: [OrderServicesModule],
  controllers: [servicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
