import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { Module } from '@nestjs/common';
import { OrderServicesModule } from '../services/orderService/orderServices.module';

@Module({
  imports: [OrderServicesModule],
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}
