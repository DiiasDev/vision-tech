import { JwtAuthGuard } from '../auth/dto/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { Controller, Get, UseGuards, Req } from '@nestjs/common';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers(@Req() req: any) {
    console.log('Usuário autenticado:', req.user);

    return this.userService.getUsers();
  }
}
