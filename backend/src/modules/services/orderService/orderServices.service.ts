import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

export type orderServiceDto = {
  id?: string;
  organization_id?: string;
  budget_id?: string | null;
  client_id: string;
  service_id?: string | null;
  created_by_id?: string | null;
  responsible_user_id?: string | null;

  code: string; // OS-XXXX
  title: string;
  description?: string | null;
  status:
    | 'DRAFT'
    | 'SCHEDULED'
    | 'IN_PROGRESS'
    | 'AWAITING_PARTS'
    | 'COMPLETED'
    | 'CANCELED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  term: string; // ISO date
  scheduling?: string | null; // ISO date
  responsible: string;
  checklist?: string[];
  progress: number; // 0-100

  total_cost: number;
  total_value: number;
  margin_value: number;
  margin_percent: number;

  timeline?: Array<{
    id?: string;
    author_user_id?: string | null;
    author_name?: string | null;
    event: string;
    notes?: string | null;
    event_at?: string;
  }>;

  services?: Array<{
    id?: string;
    service_catalog_id?: string | null;
    code: string;
    name: string;
    category: string;
    service_type: string;
    billing_model: string;
    billing_unit: string;
    estimated_duration: string;
    complexity_level: string;
    responsible: string;
    catalog_status: string;
    is_completed: boolean;
    completed_at?: string | null;
    sort_order: number;
  }>;

  products?: Array<{
    id?: string;
    product_id?: string | null;
    description: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    status?: string | null;
  }>;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

type AuthenticatedUser = {
  userId: string;
  organizationId: string;
};

@Injectable()
export class OrderServiceService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeChecklist(value: unknown) {
    if (!Array.isArray(value)) return [];

    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  async getOrderServiceCodes(currentUser: AuthenticatedUser) {
    try {
      const organizationId = currentUser.organizationId?.trim();
      if (!organizationId) {
        return {
          success: false,
          message: 'Sessao invalida. Faca login novamente.',
          data: [],
        };
      }

      const rows = await this.prisma.serviceOrder.findMany({
        where: {
          organizationId,
          deletedAt: null,
        },
        select: {
          code: true,
        },
      });

      const codes = rows
        .map((row) => row.code?.trim())
        .filter((code): code is string => Boolean(code));

      return {
        success: true,
        message: 'Codigos de OS carregados com sucesso.',
        data: codes,
      };
    } catch (error: any) {
      console.error('Erro ao buscar codigos de OS: ', error);
      return {
        success: false,
        message: 'Erro ao buscar codigos de OS',
        data: [],
      };
    }
  }

  async createOrderService(
    dto: orderServiceDto,
    currentUser: AuthenticatedUser,
  ) {
    try {
      const organizationId =
        currentUser.organizationId?.trim() || dto.organization_id?.trim();
      if (!organizationId) {
        return {
          success: false,
          message: 'Sessao invalida. Faca login novamente.',
          data: null,
        };
      }

      const currentUserId = currentUser.userId?.trim() || null;

      const os = await this.prisma.serviceOrder.create({
        data: {
          organizationId,
          budgetId: dto.budget_id?.trim() || null,
          clientId: dto.client_id,
          serviceId: dto.service_id?.trim() || null,
          createdById: currentUserId || dto.created_by_id || null,
          responsibleUserId:
            dto.responsible_user_id?.trim() || currentUserId || null,
          code: dto.code,
          title: dto.title,
          description: dto.description,
          status: dto.status,
          priority: dto.priority,
          term: dto.term,
          scheduling: dto.scheduling,
          responsible: dto.responsible,
          checklist: this.normalizeChecklist(dto.checklist),
          progress: dto.progress,
          totalCost: dto.total_cost,
          totalValue: dto.total_value,
          marginValue: dto.margin_value,
          marginPercent: dto.margin_percent,
          products: {
            create: (dto.products ?? []).map((product) => ({
              productId: product.product_id,
              description: product.description,
              quantity: product.quantity,
              unitCost: product.unit_cost,
              totalCost: product.total_cost,
              status: product.status,
            })),
          },
          services: {
            create: (dto.services ?? []).map((service) => ({
              serviceCatalogId: service.service_catalog_id,
              code: service.code,
              name: service.name,
              category: service.category,
              serviceType: service.service_type,
              billingModel: service.billing_model,
              billingUnit: service.billing_unit,
              estimatedDuration: service.estimated_duration,
              complexityLevel: service.complexity_level,
              responsible: service.responsible,
              catalogStatus: service.catalog_status,
              isCompleted: service.is_completed,
              completedAt: service.completed_at,
              sortOrder: service.sort_order,
            })),
          },
          timeline: {
            create: (dto.timeline ?? []).map((item) => ({
              authorUserId: item.author_user_id?.trim() || currentUserId,
              authorName: item.author_name,
              event: item.event,
              notes: item.notes,
              eventAt: item.event_at,
            })),
          },
        },
      });

      return {
        success: true,
        message: 'Sucesso ao registrar OS',
        data: os,
      };
    } catch (error: any) {
      console.error('Erro ao criar OS: ', error);
      return {
        success: false,
        message: 'Erro ao criar OS',
        data: null,
      };
    }
  }

  async getOrderService(currentUser: AuthenticatedUser) {
    try {
      const organizationId = currentUser.organizationId?.trim();
      if (!organizationId) {
        return {
          success: false,
          message: 'Sessao invalida. Faca login novamente.',
          data: [],
        };
      }

      const os = await this.prisma.serviceOrder.findMany({
        where: {
          organizationId,
          deletedAt: null,
        },
        include: {
          budget: {
            select: {
              id: true,
              code: true,
            },
          },
          client: {
            select: {
              id: true,
              code: true,
              type: true,
              name: true,
              document: true,
              email: true,
              telephone: true,
              responsibleName: true,
              responsibleEmail: true,
              responsiblePhone: true,
              city: true,
              state: true,
              street: true,
              number: true,
              neighborhood: true,
            },
          },
          service: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          responsibleUser: {
            select: {
              id: true,
              name: true,
            },
          },
          services: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
          timeline: {
            orderBy: {
              eventAt: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        message: 'Sucesso ao trazer OS',
        data: os,
      };
    } catch (error: any) {
      console.error('erro ao trazer os: ', error);
      return {
        success: false,
        message: 'Erro ao trazer OS',
        data: [],
      };
    }
  }
}
