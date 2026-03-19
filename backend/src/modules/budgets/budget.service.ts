import { Injectable } from '@nestjs/common';
import { BudgetPriority, BudgetStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

export type CreateBudgetItemDto = {
  productId?: string;
  description: string;
  category?: string;
  quantity?: number | string;
  unitPrice: number | string;
  discount?: number | string;
  internalCost?: number | string;
  estimatedHours?: number | string;
  deliveryWindow?: string;
};

export type CreateBudgetDto = {
  code?: string;
  clientId: string;
  serviceId?: string | null;
  title: string;
  status?:
    | BudgetStatus
    | 'draft'
    | 'sent'
    | 'negotiation'
    | 'approved'
    | 'rejected'
    | 'expired';
  priority?: BudgetPriority | 'low' | 'medium' | 'high';
  owner: string;
  validUntil: string | Date;
  approvalDate?: string | Date | null;
  expectedCloseDate?: string | Date | null;
  paymentTerms?: string | null;
  deliveryTerm?: string | null;
  slaSummary?: string | null;
  scopeSummary?: string | null;
  assumptions?: string[];
  exclusions?: string[];
  attachments?: string[];
  clientName?: string | null;
  clientSegment?: string | null;
  clientDocument?: string | null;
  clientCity?: string | null;
  clientState?: string | null;
  clientContactName?: string | null;
  clientContactRole?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  serviceCode?: string | null;
  serviceName?: string | null;
  serviceCategory?: string | null;
  serviceBillingModel?: string | null;
  serviceDescription?: string | null;
  serviceEstimatedDuration?: string | null;
  serviceResponsible?: string | null;
  serviceStatus?: string | null;
  productsTotalAmount?: number | string;
  productsCostAmount?: number | string;
  serviceTotalAmount?: number | string;
  serviceCostAmount?: number | string;
  budgetDiscount?: number | string;
  budgetTotalCostAmount?: number | string;
  budgetTotalAmount?: number | string;
  budgetProfitPercent?: number | string;
  items: CreateBudgetItemDto[];
};

type AuthenticatedUser = {
  id?: string;
  userId?: string;
  organizationId: string;
};

@Injectable()
export class BudgetService {
  createBudget(currentUser: AuthenticatedUser, body: CreateBudgetDto) {
    return this.newBudget(currentUser, body);
  }
  constructor(private readonly prisma: PrismaService) {}

  private parseDecimal(
    value: number | string | undefined | null,
    fallback = 0,
  ) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;

    if (typeof value === 'string') {
      const normalized = value
        .replace(/[^\d,.-]/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim();
      const parsed = Number.parseFloat(normalized);
      if (Number.isFinite(parsed)) return parsed;
    }

    return fallback;
  }

  private parsePositiveInt(
    value: number | string | undefined | null,
    fallback = 1,
  ) {
    const numeric =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number.parseInt(value, 10)
          : Number.NaN;

    if (Number.isFinite(numeric) && numeric > 0) return Math.trunc(numeric);
    return fallback;
  }

  private parseDate(value: string | Date | null | undefined) {
    if (!value) return null;
    if (value instanceof Date)
      return Number.isNaN(value.getTime()) ? null : value;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  }

  private async getNextBudgetCodeNumber(organizationId: string, year: number) {
    const rows = await this.prisma.$queryRaw<Array<{ next_number: number }>>`
      SELECT COALESCE(MAX(CAST(SPLIT_PART(code, '-', 3) AS INTEGER)), 0) + 1 AS next_number
      FROM "Budget"
      WHERE "organizationId" = ${organizationId}
        AND code ~ ${`^ORC-${year}-[0-9]+$`}
    `;

    const next = rows[0]?.next_number ?? 1;
    return Number.isFinite(next) && next > 0 ? next : 1;
  }

  async newBudget(currentUser: AuthenticatedUser, dto: CreateBudgetDto) {
    try {
      const { organizationId } = currentUser;
      if (!organizationId?.trim()) {
        return {
          success: false,
          message: 'Sessao invalida. Faca login novamente.',
          data: null,
        };
      }

      const clientId = dto.clientId?.trim();
      if (!clientId) {
        return {
          success: false,
          message: 'Cliente e obrigatorio para cadastrar orcamento.',
          data: null,
        };
      }

      if (!dto.title?.trim()) {
        return {
          success: false,
          message: 'Titulo do orcamento e obrigatorio.',
          data: null,
        };
      }

      if (!Array.isArray(dto.items) || dto.items.length === 0) {
        return {
          success: false,
          message: 'Adicione ao menos um item ao orcamento.',
          data: null,
        };
      }

      const validUntilDate = this.parseDate(dto.validUntil);
      if (!validUntilDate) {
        return {
          success: false,
          message: 'Data de validade invalida.',
          data: null,
        };
      }

      const approvalDate = this.parseDate(dto.approvalDate ?? null);
      if (dto.approvalDate && !approvalDate) {
        return {
          success: false,
          message: 'Data de aprovacao invalida.',
          data: null,
        };
      }

      const expectedCloseDate = this.parseDate(
        dto.expectedCloseDate ?? validUntilDate,
      );

      const statusRaw = String(dto.status ?? 'DRAFT')
        .trim()
        .toUpperCase();
      if (!Object.values(BudgetStatus).includes(statusRaw as BudgetStatus)) {
        return {
          success: false,
          message: 'Status do orcamento invalido.',
          data: null,
        };
      }

      const priorityRaw = String(dto.priority ?? 'MEDIUM')
        .trim()
        .toUpperCase();
      if (
        !Object.values(BudgetPriority).includes(priorityRaw as BudgetPriority)
      ) {
        return {
          success: false,
          message: 'Prioridade do orcamento invalida.',
          data: null,
        };
      }

      const createdById = currentUser.userId ?? currentUser.id ?? null;
      const normalizedStatus = statusRaw as BudgetStatus;
      const normalizedPriority = priorityRaw as BudgetPriority;

      const client = await this.prisma.client.findFirst({
        where: {
          id: clientId,
          organizationId,
          deletedAt: null,
        },
        select: { id: true },
      });

      if (!client) {
        return {
          success: false,
          message: 'Cliente nao encontrado para esta organizacao.',
          data: null,
        };
      }

      const serviceId = dto.serviceId?.trim() || null;
      if (serviceId) {
        const service = await this.prisma.serviceCatalog.findFirst({
          where: {
            id: serviceId,
            OR: [{ organizationId }, { organizationId: null }],
          },
          select: { id: true },
        });

        if (!service) {
          return {
            success: false,
            message: 'Servico selecionado nao encontrado.',
            data: null,
          };
        }
      }

      const providedProductIds = dto.items
        .map((item) => item.productId?.trim() || null)
        .filter((id): id is string => Boolean(id));

      if (providedProductIds.length > 0) {
        const products = await this.prisma.product.findMany({
          where: {
            id: { in: providedProductIds },
            organizationId,
            deletedAt: null,
          },
          select: { id: true },
        });

        const foundIds = new Set(products.map((item) => item.id));
        const hasMissingProduct = providedProductIds.some(
          (productId) => !foundIds.has(productId),
        );

        if (hasMissingProduct) {
          return {
            success: false,
            message:
              'Um ou mais produtos selecionados nao foram encontrados para esta organizacao.',
            data: null,
          };
        }
      }

      const currentYear = new Date().getFullYear();
      const nextCodeNumber = await this.getNextBudgetCodeNumber(
        organizationId,
        currentYear,
      );
      const generatedCode = `ORC-${currentYear}-${String(nextCodeNumber).padStart(3, '0')}`;
      const code = dto.code?.trim() || generatedCode;

      const newBudget = await this.prisma.budget.create({
        data: {
          organizationId,
          createdById,
          code,
          clientId,
          serviceId,
          title: dto.title,
          status: normalizedStatus,
          priority: normalizedPriority,
          owner: dto.owner,
          validUntil: validUntilDate,
          approvalDate,
          expectedCloseDate,
          paymentTerms: dto.paymentTerms ?? null,
          deliveryTerm: dto.deliveryTerm ?? null,
          slaSummary: dto.slaSummary ?? null,
          scopeSummary: dto.scopeSummary ?? null,
          assumptions: dto.assumptions ?? [],
          exclusions: dto.exclusions ?? [],
          attachments: dto.attachments ?? [],
          clientName: dto.clientName ?? null,
          clientSegment: dto.clientSegment ?? null,
          clientDocument: dto.clientDocument ?? null,
          clientCity: dto.clientCity ?? null,
          clientState: dto.clientState ?? null,
          clientContactName: dto.clientContactName ?? null,
          clientContactRole: dto.clientContactRole ?? null,
          clientEmail: dto.clientEmail ?? null,
          clientPhone: dto.clientPhone ?? null,
          serviceCode: dto.serviceCode ?? null,
          serviceName: dto.serviceName ?? null,
          serviceCategory: dto.serviceCategory ?? null,
          serviceBillingModel: dto.serviceBillingModel ?? null,
          serviceDescription: dto.serviceDescription ?? null,
          serviceEstimatedDuration: dto.serviceEstimatedDuration ?? null,
          serviceResponsible: dto.serviceResponsible ?? null,
          serviceStatus: dto.serviceStatus ?? null,
          productsTotalAmount: this.parseDecimal(dto.productsTotalAmount, 0),
          productsCostAmount: this.parseDecimal(dto.productsCostAmount, 0),
          serviceTotalAmount: this.parseDecimal(dto.serviceTotalAmount, 0),
          serviceCostAmount: this.parseDecimal(dto.serviceCostAmount, 0),
          budgetDiscount: this.parseDecimal(dto.budgetDiscount, 0),
          budgetTotalCostAmount: this.parseDecimal(
            dto.budgetTotalCostAmount,
            0,
          ),
          budgetTotalAmount: this.parseDecimal(dto.budgetTotalAmount, 0),
          budgetProfitPercent: this.parseDecimal(dto.budgetProfitPercent, 0),
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId?.trim() || null,
              description: item.description,
              category: item.category ?? null,
              quantity: this.parsePositiveInt(item.quantity, 1),
              unitPrice: this.parseDecimal(item.unitPrice, 0),
              discount: this.parseDecimal(item.discount, 0),
              internalCost: this.parseDecimal(item.internalCost, 0),
              estimatedHours: this.parsePositiveInt(item.estimatedHours, 1),
              deliveryWindow: item.deliveryWindow ?? null,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return {
        success: true,
        message: 'Sucesso ao registrar orçamento',
        data: newBudget,
      };
    } catch (error) {
      console.error('erro ao criar orçamento', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2021') {
          return {
            success: false,
            message:
              'Tabela de orcamentos nao encontrada no banco. Execute as migracoes do Prisma.',
            data: null,
          };
        }

        if (error.code === 'P2003') {
          return {
            success: false,
            message:
              'Falha de relacionamento ao salvar orcamento. Verifique cliente, servico e produtos.',
            data: null,
          };
        }

        if (error.code === 'P2002') {
          return {
            success: false,
            message: 'Ja existe um orcamento com o mesmo codigo.',
            data: null,
          };
        }
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        return {
          success: false,
          message:
            'Nao foi possivel conectar ao banco de dados. Verifique se o PostgreSQL esta ativo.',
          data: null,
        };
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        return {
          success: false,
          message:
            'Dados invalidos para cadastrar orcamento. Revise os campos obrigatorios e datas.',
          data: null,
        };
      }

      return {
        success: false,
        message: 'erro ao cadastrar orçamento',
        data: null,
      };
    }
  }
}
