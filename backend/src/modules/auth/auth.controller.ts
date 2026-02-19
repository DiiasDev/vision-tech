import { AuthService } from './auth.service';
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email?: string; password?: string }) {
    if (!body?.email || !body?.password) {
      throw new BadRequestException('Email e senha são obrigatórios');
    }

    return this.authService.auth(body.email, body.password);
  }
}
