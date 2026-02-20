import { JwtAuthGuard } from '../auth/dto/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { Controller, Get, UseGuards, Req } from '@nestjs/common';

type AuthenticatedRequest = {
  user: {
    userId: string;
    organizationId?: string;
    role?: string;
  };
};

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Req() req: AuthenticatedRequest) {
    return this.userService.getCurrentUser(
      req.user.userId,
      req.user.organizationId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers(@Req() req: AuthenticatedRequest) {
    console.log('Usuário autenticado:', req.user);

    return this.userService.getUsers();
  }
}
