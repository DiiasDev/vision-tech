import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export type SupplierTypes = {
  supplierCode?: string;
  name: string;
  fantasyName: string;
  segment: string;
  risk: string;
  contact?: string;
  city: string;
  state: string;
  status: string;
  categories: string;
  lead?: string;
  location: string;
  phone: string;
  email: string;
  minRequest: string;
  lastDelivery: string;
};

export type UpdateSupplierTypes = Partial<{
  name: string;
  fantasyName: string;
  segment: string;
  risk: string;
  contact: string | null;
  city: string;
  state: string;
  status: string;
  categories: string;
  lead: string | null;
  location: string;
  phone: string;
  email: string;
  minRequest: string;
  lastDelivery: string;
}>;

type AuthenticatedUser = {
  userId: string;
  organizationId: string;
};

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateSupplierCode(organizationId: string) {
    const [{ maxSequence }] = await this.prisma.$queryRaw<
      Array<{ maxSequence: number | null }>
    >(Prisma.sql`
      SELECT MAX(CAST(SUBSTRING("supplierCode" FROM 6 FOR 4) AS INTEGER)) AS "maxSequence"
      FROM "Supplier"
      WHERE "organizationId" = ${organizationId}
        AND "supplierCode" ~ '^FORN-[0-9]{4}$'
    `);

    const nextSequence = (maxSequence ?? 0) + 1;

    if (nextSequence > 9999) {
      throw new Error(
        'Limite de códigos de fornecedor atingido para o padrão FORN-XXXX',
      );
    }

    return `FORN-${String(nextSequence).padStart(4, '0')}`;
  }

  async newSupplier(currentUser: AuthenticatedUser, dto: SupplierTypes) {
    try {
      const { organizationId } = currentUser;
      let supplierCode: string | null = null;

      for (let retry = 0; retry < 5; retry++) {
        supplierCode = await this.generateSupplierCode(organizationId);

        const newSupplier = await this.prisma.supplier.create({
          data: {
            organizationId,
            supplierCode,
            name: dto.name,
            fantasyName: dto.fantasyName,
            segment: dto.segment,
            risk: dto.risk,
            contact: dto.contact,
            city: dto.city,
            state: dto.state,
            status: dto.status,
            categories: dto.categories,
            lead: dto.lead,
            location: dto.location,
            phone: dto.phone,
            email: dto.email,
            minRequest: dto.minRequest,
            lastDelivery: dto.lastDelivery,
          },
        });

        return {
          success: true,
          message: 'Novo fornecedor cadastrado',
          data: newSupplier,
        };
      }

      return {
        success: false,
        message: 'Nao foi possivel gerar um codigo unico para o fornecedor.',
        data: null,
      };
    } catch (error: any) {
      console.error('Erro ao cadastrar novo fornecedor: ', error);
      return {
        success: false,
        message: 'Erro ao cadastrar novo fornecedor',
        data: null,
      };
    }
  }

  async getSuppliers(currentUser: { organizationId: string }) {
    try {
      const suppliers = await this.prisma.supplier.findMany({
        where: {
          organizationId: currentUser.organizationId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        message: 'Fornecedores carregados com sucesso.',
        data: suppliers,
      };
    } catch (error) {
      console.error('Erro ao buscar fornecedores: ', error);
      return {
        success: false,
        message: 'Nao foi possivel carregar os fornecedores.',
        data: [],
      };
    }
  }

  async getSupplierById(
    supplierId: string,
    currentUser: { organizationId: string },
  ) {
    try {
      const supplier = await this.prisma.supplier.findFirst({
        where: {
          id: supplierId,
          organizationId: currentUser.organizationId,
          deletedAt: null,
        },
      });

      if (!supplier) {
        return {
          success: false,
          message: 'Fornecedor nao encontrado.',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Fornecedor carregado com sucesso.',
        data: supplier,
      };
    } catch (error) {
      console.error('Erro ao buscar fornecedor por ID: ', error);
      return {
        success: false,
        message: 'Nao foi possivel carregar o fornecedor.',
        data: null,
      };
    }
  }

  async updateSupplier(
    supplierId: string,
    currentUser: { organizationId: string },
    values: UpdateSupplierTypes,
  ) {
    try {
      const data = Object.fromEntries(
        Object.entries(values).filter(([, value]) => value !== undefined),
      ) as Prisma.SupplierUpdateManyMutationInput;

      if (Object.keys(data).length === 0) {
        return {
          success: false,
          message: 'Nenhum campo valido foi informado para atualizacao.',
          data: null,
        };
      }

      const updateResult = await this.prisma.supplier.updateMany({
        where: {
          id: supplierId,
          organizationId: currentUser.organizationId,
          deletedAt: null,
        },
        data,
      });

      if (updateResult.count === 0) {
        return {
          success: false,
          message: 'Fornecedor nao encontrado para atualizacao.',
          data: null,
        };
      }

      const updatedSupplier = await this.prisma.supplier.findFirst({
        where: {
          id: supplierId,
          organizationId: currentUser.organizationId,
          deletedAt: null,
        },
      });

      return {
        success: true,
        message: 'Fornecedor atualizado com sucesso.',
        data: updatedSupplier,
      };
    } catch (error) {
      console.error('Erro ao atualizar fornecedor: ', error);
      return {
        success: false,
        message: 'Nao foi possivel atualizar o fornecedor.',
        data: null,
      };
    }
  }

  async deleteSupplier(
    supplierId: string,
    currentUser: { organizationId: string },
  ) {
    try {
      const deleteResult = await this.prisma.supplier.updateMany({
        where: {
          id: supplierId,
          organizationId: currentUser.organizationId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      if (deleteResult.count === 0) {
        return {
          success: false,
          message: 'Fornecedor nao encontrado para exclusao.',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Fornecedor excluido com sucesso.',
        data: {
          id: supplierId,
        },
      };
    } catch (error) {
      console.error('Erro ao excluir fornecedor: ', error);
      return {
        success: false,
        message: 'Nao foi possivel excluir o fornecedor.',
        data: null,
      };
    }
  }
}
