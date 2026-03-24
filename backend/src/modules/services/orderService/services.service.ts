import { PrismaService } from 'prisma/prisma.service';

export type orderServiceDto = {
  id?: string;
  organization_id: string;
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

export class OrderServiceService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrderService(dto: orderServiceDto) {
    try {
      const os = await this.prisma.serviceOrder.create({
        data: {
          organizationId: dto.organization_id,
          budgetId: dto.budget_id,
          clientId: dto.client_id,
          serviceId: dto.service_id,
          createdById: dto.created_by_id,
          responsibleUserId: dto.responsible_user_id,
          code: dto.code,
          title: dto.title,
          description: dto.description,
          status: dto.status,
          priority: dto.priority,
          term: dto.term,
          scheduling: dto.scheduling,
          responsible: dto.responsible,
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
              authorUserId: item.author_user_id,
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
        data: [],
      };
    }
  }
}
