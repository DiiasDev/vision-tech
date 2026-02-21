import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ClientStatus, Prisma } from '@prisma/client';

export class CreateClientDto {
  type!: 'PF' | 'PJ';
  name!: string;
  document!: string;
  status?: ClientStatus;
  lastContact?: string;
  email?: string;
  telephone?: string;
  responsibleName?: string;
  responsibleEmail?: string;
  responsiblePhone?: string;
  city?: string;
  state?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  zipCode?: string;
  responsibleUserId?: string;
}

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getNextClientCodeNumber(organizationId: string) {
    const rows = await this.prisma.$queryRaw<Array<{ next_number: number }>>`
      SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 5) AS INTEGER)), 0) + 1 AS next_number
      FROM "Client"
      WHERE "organizationId" = ${organizationId}
        AND code ~ '^CLI-[0-9]+$'
    `;

    const next = rows[0]?.next_number ?? 1;
    return Number.isFinite(next) && next > 0 ? next : 1;
  }

  async registerClient(dto: CreateClientDto, currentUser: any) {
    try {
      const organizationId = currentUser.organizationId;
      const userId = currentUser.id;

      const existingClient = await this.prisma.client.findFirst({
        where: {
          organizationId,
          document: dto.document,
          deletedAt: null,
        },
      });

      if (existingClient) {
        return {
          success: false,
          message: 'Já existe um cliente com esse documento.',
          data: null,
        };
      }

      let client: {
        id: string;
        code: string;
        name: string;
        document: string;
        status: ClientStatus;
      } | null = null;

      const maxAttempts = 5;

      const baseCodeNumber = await this.getNextClientCodeNumber(organizationId);

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const nextNumber = baseCodeNumber + (attempt - 1);
        const formattedCode = `CLI-${String(nextNumber).padStart(4, '0')}`;

        try {
          client = await this.prisma.client.create({
            data: {
              code: formattedCode,
              organizationId,
              type: dto.type,
              name: dto.name,
              document: dto.document,
              email: dto.email,
              telephone: dto.telephone,
              status: dto.status ?? 'ACTIVE',
              lastContact: dto.lastContact ? new Date(dto.lastContact) : null,
              responsibleName: dto.responsibleName,
              responsibleEmail: dto.responsibleEmail,
              responsiblePhone: dto.responsiblePhone,
              city: dto.city,
              state: dto.state,
              street: dto.street,
              number: dto.number,
              neighborhood: dto.neighborhood,
              zipCode: dto.zipCode,
              createdById: userId,
              responsibleUserId: dto.responsibleUserId ?? null,
            },
          });
          break;
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            const rawTarget = (error.meta as { target?: string[] | string | unknown })?.target;
            const target = Array.isArray(rawTarget)
              ? rawTarget.map((item) => String(item))
              : [String(rawTarget ?? '')];

            if (target.includes('organizationId') && target.includes('document')) {
              return {
                success: false,
                message: 'Ja existe um cliente com esse documento.',
                data: null,
              };
            }

            if (target.includes('organizationId') && target.includes('code') && attempt < maxAttempts) {
              continue;
            }
          }

          throw error;
        }
      }

      if (!client) {
        return {
          success: false,
          message: 'Nao foi possivel gerar um codigo unico para o cliente. Tente novamente.',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Cliente cadastrado com sucesso.',
        data: {
          id: client.id,
          code: client.code,
          name: client.name,
          document: client.document,
          status: client.status,
        },
      };
    } catch (error: any) {
      console.error(error);

      return {
        success: false,
        message: 'Erro ao registrar novo cliente.',
        data: null,
      };
    }
  }
}
