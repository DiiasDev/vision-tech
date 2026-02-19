import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async auth(email: string, password: string) {
    try {
      // 1️⃣ Buscar usuário
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.passwordHash) {
        return {
          success: false,
          message: 'Credenciais inválidas',
        };
      }

      // 2️⃣ Validar senha
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        return {
          success: false,
          message: 'Credenciais inválidas',
        };
      }

      // 3️⃣ Buscar organização ativa
      const userOrg = await this.prisma.userOrganization.findFirst({
        where: {
          userId: user.id,
          isActive: true,
        },
        include: {
          organization: true,
          role: true,
        },
      });

      if (!userOrg || !userOrg.organization || !userOrg.role) {
        return {
          success: false,
          message: 'Usuário sem organização ativa',
        };
      }

      // 4️⃣ Criar payload do token
      const payload = {
        sub: user.id,
        org: userOrg.organizationId,
        role: userOrg.role.name,
      };

      // 5️⃣ Gerar token
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        success: true,
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          organization: userOrg.organization.name,
          role: userOrg.role.name,
        },
      };
    } catch (error) {
      console.error('AuthService.auth error:', error);
      throw new InternalServerErrorException('Erro ao processar login');
    }
  }
}
