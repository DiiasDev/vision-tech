import { Injectable } from '@nestjs/common';
import { BudgetPriority, BudgetStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  OrderServiceService,
  type orderServiceDto,
} from '../services/orderService/orderServices.service';

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

export type UpdateBudgetDto = Partial<
  Omit<CreateBudgetDto, 'items' | 'clientId' | 'title' | 'owner' | 'validUntil'>
> & {
  clientId?: string;
  title?: string;
  owner?: string;
  validUntil?: string | Date;
  items?: CreateBudgetItemDto[];
};

export type BudgetToOrderDto = {
  budgetId: string;
};

type AuthenticatedUser = {
  id?: string;
  userId?: string;
  organizationId: string;
};

const budgetSelect = {
  id: true,
  code: true,
  title: true,
  status: true,
  priority: true,
  owner: true,
  createdAt: true,
  updatedAt: true,
  validUntil: true,
  approvalDate: true,
  expectedCloseDate: true,
  paymentTerms: true,
  deliveryTerm: true,
  slaSummary: true,
  scopeSummary: true,
  assumptions: true,
  exclusions: true,
  attachments: true,
  clientId: true,
  clientName: true,
  clientSegment: true,
  clientDocument: true,
  clientCity: true,
  clientState: true,
  clientContactName: true,
  clientContactRole: true,
  clientEmail: true,
  clientPhone: true,
  serviceId: true,
  serviceCode: true,
  serviceName: true,
  serviceCategory: true,
  serviceBillingModel: true,
  serviceDescription: true,
  serviceEstimatedDuration: true,
  serviceResponsible: true,
  serviceStatus: true,
  productsTotalAmount: true,
  productsCostAmount: true,
  serviceTotalAmount: true,
  serviceCostAmount: true,
  budgetDiscount: true,
  budgetTotalCostAmount: true,
  budgetTotalAmount: true,
  budgetProfitPercent: true,
  items: {
    select: {
      id: true,
      productId: true,
      description: true,
      category: true,
      quantity: true,
      unitPrice: true,
      discount: true,
      internalCost: true,
      estimatedHours: true,
      deliveryWindow: true,
      product: {
        select: {
          code: true,
        },
      },
    },
  },
  client: {
    select: {
      id: true,
      name: true,
      type: true,
      document: true,
      city: true,
      state: true,
      responsibleName: true,
      responsibleEmail: true,
      responsiblePhone: true,
      email: true,
      telephone: true,
    },
  },
} satisfies Prisma.BudgetSelect;

@Injectable()
export class BudgetService {
  createBudget(currentUser: AuthenticatedUser, body: CreateBudgetDto) {
    return this.newBudget(currentUser, body);
  }
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderServiceService: OrderServiceService,
  ) {}

  private parseDecimal(
    value: Prisma.Decimal | number | string | undefined | null,
    fallback = 0,
  ) {
    if (value instanceof Prisma.Decimal) return value.toNumber();

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

  private async getNextBudgetCodeNumber(organizationId: string) {
    const rows = await this.prisma.$queryRaw<Array<{ next_number: number }>>`
      SELECT COALESCE(MAX(CAST(SPLIT_PART(code, '-', 2) AS INTEGER)), 0) + 1 AS next_number
      FROM "Budget"
      WHERE "organizationId" = ${organizationId}
        AND code ~ ${`^ORC-[0-9]{4}$`}
    `;

    const next = rows[0]?.next_number ?? 1;
    return Number.isFinite(next) && next > 0 ? next : 1;
  }

  private async getNextServiceOrderCodeNumber(organizationId: string) {
    const rows = await this.prisma.$queryRaw<Array<{ next_number: number }>>`
      SELECT COALESCE(MAX(CAST(SPLIT_PART(code, '-', 2) AS INTEGER)), 0) + 1 AS next_number
      FROM "ServiceOrder"
      WHERE "organizationId" = ${organizationId}
        AND code ~ ${`^OS-[0-9]{4}$`}
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

      const nextCodeNumber = await this.getNextBudgetCodeNumber(organizationId);
      const generatedCode = `ORC-${String(nextCodeNumber).padStart(4, '0')}`;
      const providedCode = dto.code?.trim() || null;
      if (providedCode && !/^ORC-\d{4}$/i.test(providedCode)) {
        return {
          success: false,
          message: 'Codigo invalido. Use o formato ORC-XXXX.',
          data: null,
        };
      }
      const code = providedCode ? providedCode.toUpperCase() : generatedCode;

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
        select: {
          id: true,
          code: true,
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

  async updateBudget(
    budgetId: string,
    currentUser: AuthenticatedUser,
    dto: UpdateBudgetDto,
  ) {
    try {
      const { organizationId } = currentUser;
      if (!organizationId?.trim()) {
        return {
          success: false,
          message: 'Sessao invalida. Faca login novamente.',
          data: null,
        };
      }

      const existingBudget = await this.prisma.budget.findFirst({
        where: {
          id: budgetId,
          organizationId,
          deletedAt: null,
        },
        select: { id: true },
      });

      if (!existingBudget) {
        return {
          success: false,
          message: 'Orcamento nao encontrado para atualizacao.',
          data: null,
        };
      }

      const updateData: Prisma.BudgetUpdateInput = {};

      if (dto.code !== undefined) {
        const code = dto.code?.trim() || '';
        if (!code || !/^ORC-\d{4}$/i.test(code)) {
          return {
            success: false,
            message: 'Codigo invalido. Use o formato ORC-XXXX.',
            data: null,
          };
        }
        updateData.code = code.toUpperCase();
      }

      if (dto.clientId !== undefined) {
        const clientId = dto.clientId?.trim();
        if (!clientId) {
          return {
            success: false,
            message: 'Cliente e obrigatorio para atualizar orcamento.',
            data: null,
          };
        }

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

        updateData.client = { connect: { id: clientId } };
      }

      if (dto.serviceId !== undefined) {
        const serviceId = dto.serviceId?.trim() || null;

        if (!serviceId) {
          updateData.service = { disconnect: true };
        } else {
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

          updateData.service = { connect: { id: serviceId } };
        }
      }

      if (dto.items !== undefined) {
        if (!Array.isArray(dto.items) || dto.items.length === 0) {
          return {
            success: false,
            message: 'Adicione ao menos um item ao orcamento.',
            data: null,
          };
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

        updateData.items = {
          deleteMany: {},
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
        };
      }

      if (dto.title !== undefined) {
        const title = dto.title?.trim();
        if (!title) {
          return {
            success: false,
            message: 'Titulo do orcamento e obrigatorio.',
            data: null,
          };
        }
        updateData.title = title;
      }

      if (dto.owner !== undefined) {
        const owner = dto.owner?.trim();
        if (!owner) {
          return {
            success: false,
            message: 'Responsavel do orcamento e obrigatorio.',
            data: null,
          };
        }
        updateData.owner = owner;
      }

      if (dto.status !== undefined) {
        const statusRaw = String(dto.status).trim().toUpperCase();
        if (!Object.values(BudgetStatus).includes(statusRaw as BudgetStatus)) {
          return {
            success: false,
            message: 'Status do orcamento invalido.',
            data: null,
          };
        }
        updateData.status = statusRaw as BudgetStatus;
      }

      if (dto.priority !== undefined) {
        const priorityRaw = String(dto.priority).trim().toUpperCase();
        if (
          !Object.values(BudgetPriority).includes(priorityRaw as BudgetPriority)
        ) {
          return {
            success: false,
            message: 'Prioridade do orcamento invalida.',
            data: null,
          };
        }
        updateData.priority = priorityRaw as BudgetPriority;
      }

      if (dto.validUntil !== undefined) {
        const validUntilDate = this.parseDate(dto.validUntil);
        if (!validUntilDate) {
          return {
            success: false,
            message: 'Data de validade invalida.',
            data: null,
          };
        }
        updateData.validUntil = validUntilDate;
      }

      if (dto.approvalDate !== undefined) {
        if (!dto.approvalDate) {
          updateData.approvalDate = null;
        } else {
          const approvalDate = this.parseDate(dto.approvalDate);
          if (!approvalDate) {
            return {
              success: false,
              message: 'Data de aprovacao invalida.',
              data: null,
            };
          }
          updateData.approvalDate = approvalDate;
        }
      }

      if (dto.expectedCloseDate !== undefined) {
        if (!dto.expectedCloseDate) {
          updateData.expectedCloseDate = null;
        } else {
          const expectedCloseDate = this.parseDate(dto.expectedCloseDate);
          if (!expectedCloseDate) {
            return {
              success: false,
              message: 'Data de fechamento prevista invalida.',
              data: null,
            };
          }
          updateData.expectedCloseDate = expectedCloseDate;
        }
      }

      if (dto.paymentTerms !== undefined) {
        updateData.paymentTerms = dto.paymentTerms ?? null;
      }
      if (dto.deliveryTerm !== undefined) {
        updateData.deliveryTerm = dto.deliveryTerm ?? null;
      }
      if (dto.slaSummary !== undefined) {
        updateData.slaSummary = dto.slaSummary ?? null;
      }
      if (dto.scopeSummary !== undefined) {
        updateData.scopeSummary = dto.scopeSummary ?? null;
      }
      if (dto.assumptions !== undefined) {
        updateData.assumptions = dto.assumptions ?? [];
      }
      if (dto.exclusions !== undefined) {
        updateData.exclusions = dto.exclusions ?? [];
      }
      if (dto.attachments !== undefined) {
        updateData.attachments = dto.attachments ?? [];
      }

      if (dto.clientName !== undefined)
        updateData.clientName = dto.clientName ?? null;
      if (dto.clientSegment !== undefined)
        updateData.clientSegment = dto.clientSegment ?? null;
      if (dto.clientDocument !== undefined)
        updateData.clientDocument = dto.clientDocument ?? null;
      if (dto.clientCity !== undefined)
        updateData.clientCity = dto.clientCity ?? null;
      if (dto.clientState !== undefined)
        updateData.clientState = dto.clientState ?? null;
      if (dto.clientContactName !== undefined)
        updateData.clientContactName = dto.clientContactName ?? null;
      if (dto.clientContactRole !== undefined)
        updateData.clientContactRole = dto.clientContactRole ?? null;
      if (dto.clientEmail !== undefined)
        updateData.clientEmail = dto.clientEmail ?? null;
      if (dto.clientPhone !== undefined)
        updateData.clientPhone = dto.clientPhone ?? null;

      if (dto.serviceCode !== undefined)
        updateData.serviceCode = dto.serviceCode ?? null;
      if (dto.serviceName !== undefined)
        updateData.serviceName = dto.serviceName ?? null;
      if (dto.serviceCategory !== undefined)
        updateData.serviceCategory = dto.serviceCategory ?? null;
      if (dto.serviceBillingModel !== undefined)
        updateData.serviceBillingModel = dto.serviceBillingModel ?? null;
      if (dto.serviceDescription !== undefined)
        updateData.serviceDescription = dto.serviceDescription ?? null;
      if (dto.serviceEstimatedDuration !== undefined) {
        updateData.serviceEstimatedDuration =
          dto.serviceEstimatedDuration ?? null;
      }
      if (dto.serviceResponsible !== undefined)
        updateData.serviceResponsible = dto.serviceResponsible ?? null;
      if (dto.serviceStatus !== undefined)
        updateData.serviceStatus = dto.serviceStatus ?? null;

      if (dto.productsTotalAmount !== undefined) {
        updateData.productsTotalAmount = this.parseDecimal(
          dto.productsTotalAmount,
          0,
        );
      }
      if (dto.productsCostAmount !== undefined) {
        updateData.productsCostAmount = this.parseDecimal(
          dto.productsCostAmount,
          0,
        );
      }
      if (dto.serviceTotalAmount !== undefined) {
        updateData.serviceTotalAmount = this.parseDecimal(
          dto.serviceTotalAmount,
          0,
        );
      }
      if (dto.serviceCostAmount !== undefined) {
        updateData.serviceCostAmount = this.parseDecimal(
          dto.serviceCostAmount,
          0,
        );
      }
      if (dto.budgetDiscount !== undefined) {
        updateData.budgetDiscount = this.parseDecimal(dto.budgetDiscount, 0);
      }
      if (dto.budgetTotalCostAmount !== undefined) {
        updateData.budgetTotalCostAmount = this.parseDecimal(
          dto.budgetTotalCostAmount,
          0,
        );
      }
      if (dto.budgetTotalAmount !== undefined) {
        updateData.budgetTotalAmount = this.parseDecimal(
          dto.budgetTotalAmount,
          0,
        );
      }
      if (dto.budgetProfitPercent !== undefined) {
        updateData.budgetProfitPercent = this.parseDecimal(
          dto.budgetProfitPercent,
          0,
        );
      }

      if (Object.keys(updateData).length === 0) {
        return {
          success: false,
          message: 'Nenhum campo valido foi informado para atualizacao.',
          data: null,
        };
      }

      const updatedBudget = await this.prisma.budget.update({
        where: {
          id: budgetId,
        },
        data: updateData,
        select: budgetSelect,
      });

      return {
        success: true,
        message: 'Orcamento atualizado com sucesso.',
        data: updatedBudget,
      };
    } catch (error: any) {
      console.error('Erro ao atualizar orcamento: ', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return {
            success: false,
            message: 'Ja existe um orcamento com o mesmo codigo.',
            data: null,
          };
        }

        if (error.code === 'P2003') {
          return {
            success: false,
            message:
              'Falha de relacionamento ao atualizar orcamento. Verifique cliente, servico e produtos.',
            data: null,
          };
        }
      }

      return {
        success: false,
        message: 'Nao foi possivel atualizar o orcamento.',
        data: null,
      };
    }
  }

  async deleteBudget(budgetId: string, currentUser: AuthenticatedUser) {
    try {
      const deletionResult = await this.prisma.budget.updateMany({
        where: {
          id: budgetId,
          organizationId: currentUser.organizationId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      if (deletionResult.count === 0) {
        return {
          success: false,
          message: 'Orcamento nao encontrado para exclusao.',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Orcamento excluido com sucesso.',
        data: {
          id: budgetId,
        },
      };
    } catch (error: any) {
      console.error('Erro ao excluir orcamento: ', error);
      return {
        success: false,
        message: 'Nao foi possivel excluir o orcamento.',
        data: null,
      };
    }
  }

  async getBudget(currentUser: AuthenticatedUser) {
    try {
      const budgets = await this.prisma.budget.findMany({
        where: {
          organizationId: currentUser.organizationId,
          deletedAt: null,
        },
        select: budgetSelect,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        message: 'Sucesso ao buscar orcamentos',
        data: budgets,
      };
    } catch (error: any) {
      console.error('Erro ao pegar orcamentos: ', error);

      return {
        success: false,
        message: 'Erro ao pegar orcamentos',
        data: [],
      };
    }
  }

  async budgetToOrder(currentUser: AuthenticatedUser, dto: BudgetToOrderDto) {
    try {
      const organizationId = currentUser.organizationId?.trim();
      const budgetId = dto.budgetId?.trim();

      if (!organizationId || !budgetId) {
        return {
          success: false,
          message: 'Sessao invalida ou orcamento nao informado.',
          data: null,
        };
      }

      const budget = await this.prisma.budget.findFirst({
        where: {
          id: budgetId,
          organizationId,
          deletedAt: null,
        },
        select: {
          id: true,
          code: true,
          title: true,
          scopeSummary: true,
          owner: true,
          validUntil: true,
          clientId: true,
          serviceId: true,
          serviceCode: true,
          serviceName: true,
          serviceCategory: true,
          serviceBillingModel: true,
          serviceEstimatedDuration: true,
          serviceStatus: true,
          budgetTotalCostAmount: true,
          budgetTotalAmount: true,
          priority: true,
          items: {
            select: {
              productId: true,
              description: true,
              quantity: true,
              unitPrice: true,
              internalCost: true,
            },
          },
        },
      });

      if (!budget) {
        return {
          success: false,
          message: 'Orcamento nao encontrado para esta organizacao.',
          data: null,
        };
      }

      const existingOrder = await this.prisma.serviceOrder.findFirst({
        where: {
          organizationId,
          budgetId: budget.id,
          deletedAt: null,
        },
        select: {
          id: true,
          code: true,
        },
      });

      if (existingOrder) {
        return {
          success: false,
          message: `Este orcamento ja possui OS vinculada (${existingOrder.code}).`,
          data: existingOrder,
        };
      }

      const nextCodeNumber = await this.getNextServiceOrderCodeNumber(
        organizationId,
      );
      const generatedOrderCode = `OS-${String(nextCodeNumber).padStart(4, '0')}`;
      const responsible =
        budget.owner?.trim() || 'Responsavel da OS';

      const totalCost = this.parseDecimal(budget.budgetTotalCostAmount, 0);
      const totalValue = this.parseDecimal(budget.budgetTotalAmount, 0);
      const marginValue = Number((totalValue - totalCost).toFixed(2));
      const resolvedMarginPercent =
        totalValue > 0
          ? Number(((marginValue / totalValue) * 100).toFixed(2))
          : 0;

      const servicesPayload: orderServiceDto['services'] =
        budget.serviceId || budget.serviceName
          ? [
              {
                service_catalog_id: budget.serviceId?.trim() || null,
                code:
                  budget.serviceCode?.trim() ||
                  `SVC-${generatedOrderCode.replace('OS-', '')}-01`,
                name: budget.serviceName?.trim() || 'Servico tecnico',
                category: budget.serviceCategory?.trim() || 'Servico tecnico',
                service_type: 'tecnico',
                billing_model:
                  budget.serviceBillingModel?.trim().toLowerCase() ||
                  'project',
                billing_unit: 'unidade',
                estimated_duration:
                  budget.serviceEstimatedDuration?.trim() || '1h',
                complexity_level: 'media',
                responsible,
                catalog_status: budget.serviceStatus?.trim() || 'ACTIVE',
                is_completed: false,
                completed_at: null,
                sort_order: 1,
              },
            ]
          : [];

      const productsPayload: orderServiceDto['products'] = budget.items.map(
        (item) => {
          const quantity = this.parsePositiveInt(item.quantity, 1);
          const internalCost = this.parseDecimal(item.internalCost, Number.NaN);
          const unitPrice = this.parseDecimal(item.unitPrice, 0);
          const unitCost = Number(
            Math.max(0, Number.isFinite(internalCost) ? internalCost : unitPrice).toFixed(2),
          );
          const lineTotalCost = Number((unitCost * quantity).toFixed(2));

          return {
            product_id: item.productId?.trim() || null,
            description: item.description?.trim() || 'Item do orcamento',
            quantity,
            unit_cost: unitCost,
            total_cost: lineTotalCost,
            status: 'planned',
          };
        },
      );

      const orderPayload: orderServiceDto = {
        budget_id: budget.id,
        client_id: budget.clientId,
        service_id: budget.serviceId?.trim() || null,
        code: generatedOrderCode,
        title: budget.title?.trim() || `OS gerada de ${budget.code}`,
        description:
          budget.scopeSummary?.trim() ||
          `Ordem gerada a partir do orcamento ${budget.code}.`,
        status: 'SCHEDULED',
        priority: budget.priority as orderServiceDto['priority'],
        term: budget.validUntil.toISOString(),
        scheduling: null,
        responsible,
        checklist: [],
        progress: 10,
        total_cost: Number(totalCost.toFixed(2)),
        total_value: Number(totalValue.toFixed(2)),
        margin_value: marginValue,
        margin_percent: Number(resolvedMarginPercent.toFixed(2)),
        services: servicesPayload,
        products: productsPayload,
        timeline: [
          {
            author_user_id: currentUser.userId ?? currentUser.id ?? null,
            author_name: responsible,
            event: 'OS criada',
            notes: `Gerada automaticamente a partir do orcamento ${budget.code}.`,
            event_at: new Date().toISOString(),
          },
        ],
      };

      const orderResponse = await this.orderServiceService.createOrderService(
        orderPayload,
        {
          userId: currentUser.userId ?? currentUser.id ?? '',
          organizationId,
        },
      );

      if (!orderResponse.success) {
        return {
          success: false,
          message:
            orderResponse.message ||
            'Nao foi possivel gerar a OS a partir do orcamento.',
          data: orderResponse.data ?? null,
        };
      }

      return {
        success: true,
        message: `OS gerada com sucesso a partir do orcamento ${budget.code}.`,
        data: orderResponse.data,
      };
    } catch (error: any) {
      console.error('Erro ao gerar OS por orcamento: ', error);
      return {
        success: false,
        message: 'Nao foi possivel gerar a OS a partir do orcamento.',
        data: null,
      };
    }
  }
}
