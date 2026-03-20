import {
  Body,
  Post,
  Controller,
  UseGuards,
  Req,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import {
  BudgetService,
  type CreateBudgetDto,
  type UpdateBudgetDto,
} from './budget.service';
import { JwtAuthGuard } from '../auth/dto/guards/jwt-auth.guard';
import type { Request } from 'express';

interface AuthenticatedUser {
  userId: string;
  organizationId: string;
}

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createBudget(@Req() req: Request, @Body() body: CreateBudgetDto) {
    const currentUser = req.user as AuthenticatedUser;

    return await this.budgetService.createBudget(currentUser, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getBudget(@Req() req: Request) {
    const currentUser = req.user as AuthenticatedUser;

    return await this.budgetService.getBudget(currentUser);
  }

  @Patch(':budgetId')
  @UseGuards(JwtAuthGuard)
  async updateBudget(
    @Req() req: Request,
    @Param('budgetId') budgetId: string,
    @Body() body: UpdateBudgetDto,
  ) {
    const currentUser = req.user as AuthenticatedUser;

    return await this.budgetService.updateBudget(budgetId, currentUser, body);
  }

  @Delete(':budgetId')
  @UseGuards(JwtAuthGuard)
  async deleteBudget(@Req() req: Request, @Param('budgetId') budgetId: string) {
    const currentUser = req.user as AuthenticatedUser;

    return await this.budgetService.deleteBudget(budgetId, currentUser);
  }
}
