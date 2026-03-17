import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

export type createServiceDto = {
  code?: string;
  name: string;
  description: string;

  category: string;
  service_type: string;

  billing_model: string;
  billing_unit: string;

  base_price: number | string;
  internal_cost: number | string;

  estimated_duration: string;

  complexity_level: string;

  responsible?: string;

  status?: string;
  is_recurring?: boolean;

  created_at?: Date;
  updated_at?: Date;
};

type AuthenticatedUser = {
  userId: string;
  organizationId: string;
};

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getNextServiceCatalogCodeNumber() {
    const rows = await this.prisma.$queryRaw<Array<{ next_number: number }>>`
      SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 6 FOR 4) AS INTEGER)), 0) + 1 AS next_number
      FROM "ServiceCatalog"
      WHERE code ~ '^CSVC-[0-9]{4}$'
    `;

    const next = rows[0]?.next_number ?? 1;
    return Number.isFinite(next) && next > 0 ? next : 1;
  }

  async createService(currentUser: AuthenticatedUser, dto: createServiceDto) {
    try {
      const baseCodeNumber = await this.getNextServiceCatalogCodeNumber();

      let service: { id: string; code: string } | null = null;
      const maxAttempts = 5;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const codeNumber = baseCodeNumber + (attempt - 1);

        if (codeNumber > 9999) {
          return {
            success: false,
            message:
              'Limite de códigos do catálogo atingido para o padrão CSVC-XXXX.',
            data: null,
          };
        }

        const generatedCode = `CSVC-${String(codeNumber).padStart(4, '0')}`;

        try {
          service = await this.prisma.serviceCatalog.create({
            data: {
              organizationId: currentUser.organizationId,
              createdById: currentUser.userId,
              code: generatedCode,
              name: dto.name,
              description: dto.description,

              category: dto.category,
              service_type: dto.service_type,

              billing_model: dto.billing_model,
              billing_unit: dto.billing_unit,

              base_price: dto.base_price,
              internal_cost: dto.internal_cost,

              estimated_duration: dto.estimated_duration,

              complexity_level: dto.complexity_level,

              status: dto.status ?? 'ACTIVE',
              is_recurring: dto.is_recurring ?? false,

              ...(dto.created_at ? { created_at: dto.created_at } : {}),
              ...(dto.updated_at ? { updated_at: dto.updated_at } : {}),
            },
            select: {
              id: true,
              code: true,
            },
          });
          break;
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
          ) {
            const rawTarget = (
              error.meta as {
                target?: string[] | string;
              }
            )?.target;

            const target = Array.isArray(rawTarget)
              ? rawTarget
              : typeof rawTarget === 'string'
                ? [rawTarget]
                : [];

            const isCodeConflict =
              target.includes('code') ||
              target.includes('ServiceCatalog_code_key');

            if (isCodeConflict && attempt < maxAttempts) {
              continue;
            }
          }

          throw error;
        }
      }

      if (!service) {
        return {
          success: false,
          message:
            'Nao foi possivel gerar um codigo unico para o catalogo de servico. Tente novamente.',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Sucesso ao criar service',
        data: service,
      };
    } catch (error: any) {
      console.error('erro ao cadastrar service: ', error);

      return {
        success: false,
        message: 'Erro ao criar serviço',
        data: null,
      };
    }
  }

  async getServices(currentUser: { organizationId: string }) {
    try {
      const services = await this.prisma.serviceCatalog.findMany({
        orderBy: {
          updated_at: 'desc',
        },
        where: {
          organizationId: currentUser.organizationId,
        },
      });

      return {
        success: true,
        message: 'Sucesso ao trazer serviços',
        data: services,
      };
    } catch (error: any) {
      console.error('erro ao trazer services: ', error);

      return {
        success: false,
        message: 'Erro ao trazer os serviços para catálogo',
        data: [],
      };
    }
  }

  async getServiceById(
    serviceId: string,
    currentUser: { organizationId: string },
  ) {
    try {
      const service = await this.prisma.serviceCatalog.findFirst({
        where: {
          id: serviceId,
          organizationId: currentUser.organizationId,
        },
      });

      if (!service) {
        return {
          success: false,
          message: 'Servico nao encontrado no catalogo.',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Sucesso ao trazer servico',
        data: service,
      };
    } catch (error: any) {
      console.error('erro ao trazer service por id: ', error);

      return {
        success: false,
        message: 'Erro ao trazer servico do catalogo',
        data: null,
      };
    }
  }
}
