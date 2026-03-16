import { servicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [servicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
