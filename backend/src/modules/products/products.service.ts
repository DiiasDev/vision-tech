import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, ProductCategory, ProductStatus } from '@prisma/client';

export type CreateProductDto = {
  name: string;
  description: string;
  category: ProductCategory;
  price: string;
  cost?: string;
  stock?: number;
  minStock?: number;
  unitOfMeasure: string;
  location: string;
  percentage: string;
  status?: ProductStatus;
  brand: string;
  supplier: string;
  monthlySales?: number;
  imageUrl?: string;
};

export type UpdateProductDto = Partial<{
  name: string;
  description: string;
  category: ProductCategory;
  price: string | number;
  cost: string | number | null;
  stock: number;
  minStock: number;
  unitOfMeasure: string;
  location: string;
  percentage: string | number;
  status: ProductStatus;
  brand: string;
  supplier: string;
  monthlySales: number;
  imageUrl: string | null;
}>;

type AuthenticatedUser = {
  userId: string;
  organizationId: string;
};

@Injectable()
export class ProductsServices {
  constructor(private readonly prisma: PrismaService) {}

  async getProductCodes(currentUser: AuthenticatedUser) {
    try {
      const codes = await this.prisma.product.findMany({
        where: { organizationId: currentUser.organizationId },
        select: { code: true },
        orderBy: { code: 'asc' },
      });

      return {
        success: true,
        message: 'Codigos de produtos carregados com sucesso.',
        data: codes.map((item) => item.code),
      };
    } catch (error) {
      console.error('Erro ao carregar codigos de produtos: ', error);
      return {
        success: false,
        message: 'Nao foi possivel carregar os codigos de produtos.',
        data: [],
      };
    }
  }

  private async getNextProductCodeNumber(organizationId: string) {
    const rows = await this.prisma.$queryRaw<Array<{ next_number: number }>>`
      SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 6) AS INTEGER)), 0) + 1 AS next_number
      FROM "Product"
      WHERE "organizationId" = ${organizationId}
        AND code ~ '^PROD-[0-9]+$'
    `;

    const next = rows[0]?.next_number ?? 1;
    return Number.isFinite(next) && next > 0 ? next : 1;
  }

  async createProduct(currentUser: AuthenticatedUser, dto: CreateProductDto) {
    try {
      const { organizationId, userId } = currentUser;
      const createdByUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      if (!createdByUser) {
        return {
          success: false,
          message: 'Usuario autenticado nao encontrado.',
          data: null,
        };
      }

      const baseCodeNumber =
        await this.getNextProductCodeNumber(organizationId);
      let newProduct: { id: string; code: string } | null = null;
      const maxAttempts = 5;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const codeNumber = baseCodeNumber + (attempt - 1);
        const code = `PROD-${String(codeNumber).padStart(4, '0')}`;

        try {
          newProduct = await this.prisma.product.create({
            data: {
              code,
              organizationId,
              name: dto.name,
              description: dto.description,
              category: dto.category,
              price: dto.price,
              cost: dto.cost ?? null,
              stock: dto.stock ?? 0,
              minStock: dto.minStock ?? 0,
              unitOfMeasure: dto.unitOfMeasure,
              location: dto.location,
              percentage: dto.percentage,
              status: dto.status ?? 'ACTIVE',
              createdBy: createdByUser.name,
              createdById: userId,
              brand: dto.brand,
              supplier: dto.supplier,
              monthlySales: dto.monthlySales ?? 0,
              imageUrl: dto.imageUrl ?? null,
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

            if (
              target.includes('organizationId') &&
              target.includes('code') &&
              attempt < maxAttempts
            ) {
              continue;
            }
          }

          throw error;
        }
      }

      if (!newProduct) {
        return {
          success: false,
          message:
            'Nao foi possivel gerar um codigo unico para o produto. Tente novamente.',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Produto cadastrado com sucesso.',
        data: newProduct,
      };
    } catch (error: any) {
      console.error('Erro ao cadastrar produto: ', error);
      return {
        success: false,
        message: 'Erro ao cadastrar produto.',
        data: null,
      };
    }
  }

  async getProducts(currentUser: { organizationId: string }) {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          organizationId: currentUser.organizationId,
          deletedAt: null,
        },
      });

      return {
        success: true,
        message: 'Sucesso ao buscar produtos.',
        data: products,
      };
    } catch (error: any) {
      console.error('Erro ao buscar produtos', error);
      return {
        success: false,
        message: 'Erro ao buscar produtos',
        data: {},
      };
    }
  }

  async deleteProduct(
    productId: string,
    currentUser: { organizationId: string },
  ) {
    try {
      const deletionResult = await this.prisma.product.updateMany({
        where: {
          id: productId,
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
          message: 'Produto nao encontrado para exclusao.',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Produto deletado com sucesso',
        data: {
          id: productId,
        },
      };
    } catch (error: any) {
      console.error('Erro ao deletar produto:', error);
      return {
        success: false,
        message: 'Nao foi possivel deletar o produto.',
        data: null,
      };
    }
  }

  async updateProduct(
    productId: string,
    currentUser: { organizationId: string },
    values: UpdateProductDto,
  ) {
    try {
      const data = Object.fromEntries(
        Object.entries(values).filter(([, value]) => value !== undefined),
      ) as Prisma.ProductUpdateManyMutationInput;

      if (Object.keys(data).length === 0) {
        return {
          success: false,
          message: 'Nenhum campo valido foi informado para atualizacao.',
          data: null,
        };
      }

      const updateResult = await this.prisma.product.updateMany({
        where: {
          id: productId,
          organizationId: currentUser.organizationId,
          deletedAt: null,
        },
        data,
      });

      if (updateResult.count === 0) {
        return {
          success: false,
          message: 'Produto nao encontrado para atualizacao.',
          data: null,
        };
      }

      const productUpdate = await this.prisma.product.findFirst({
        where: {
          id: productId,
          organizationId: currentUser.organizationId,
          deletedAt: null,
        },
      });

      return {
        success: true,
        message: 'Produto atualizado com sucesso.',
        data: productUpdate,
      };
    } catch (error: any) {
      console.error('Erro ao atualizar produto: ', error);
      return {
        success: false,
        message: 'Nao foi possivel atualizar o produto.',
        data: null,
      };
    }
  }
}
