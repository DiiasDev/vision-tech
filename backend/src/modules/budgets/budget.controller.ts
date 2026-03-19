import { Body, Post, Controller,UseGuards, Req  } from "@nestjs/common";
import { BudgetService, type CreateBudgetDto } from "./budget.service";
import { JwtAuthGuard } from '../auth/dto/guards/jwt-auth.guard';
import type { Request } from 'express';


interface AuthenticatedUser {
  userId: string;
  organizationId: string;
}

@Controller('budget')
export class BudgetController{
    constructor(private readonly budgetService: BudgetService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createBudget(@Req() req: Request, @Body() body: CreateBudgetDto ){
        try{
            const currentUser = req.user as AuthenticatedUser;

            return await this.budgetService.createBudget(currentUser, body);
        }catch(error: any){
            throw error;
        }
    }
}