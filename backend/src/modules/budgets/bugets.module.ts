import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}
