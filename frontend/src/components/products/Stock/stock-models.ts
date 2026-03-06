import { type ProductsListItem } from "@/services/products.service"

export type StockProductStatus = "active" | "inactive" | "out_of_stock"

export type StockProduct = {
  id: string
  code: string
  name: string
  category: string
  stock: number
  minStock: number
  monthlySales: number
  price: number
  cost: number
  location: string
  supplier: string
  updatedAt: string
  status: StockProductStatus
}

export type StockMovementType = "ENTRADA" | "SAIDA" | "AJUSTE" | "TRANSFERENCIA"

export type StockMovement = {
  id: string
  movementCode: string
  productId: string
  productName: string
  productCode: string
  type: StockMovementType
  quantity: number
  createdAt: string
  responsible: string
  source: string
  destination: string
  notes: string
}

function parseNumericValue(value: string | number | null | undefined) {
  if (typeof value === "number") return value
  if (typeof value !== "string" || !value.trim()) return 0

  const parsedValue = Number.parseFloat(value.replace(",", "."))
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function mapApiStatus(status: ProductsListItem["status"]): StockProductStatus {
  if (status === "INACTIVE") return "inactive"
  if (status === "OUT_OF_STOCK") return "out_of_stock"
  return "active"
}

function mapApiCategory(category: ProductsListItem["category"]) {
  const categories: Record<ProductsListItem["category"], string> = {
    HARDWARE: "Hardware",
    SOFTWARE: "Software",
    SERVICES: "Servicos",
    PERIPHERALS: "Perifericos",
    LICENSES: "Licencas",
    INFRASTRUCTURE: "Infraestrutura",
    OTHERS: "Outros",
  }

  return categories[category] ?? category
}

export function mapApiProductToStockProduct(product: ProductsListItem): StockProduct {
  return {
    id: product.id,
    code: product.code,
    name: product.name,
    category: mapApiCategory(product.category),
    stock: Number.isFinite(product.stock) ? product.stock : 0,
    minStock: Number.isFinite(product.minStock) ? product.minStock : 0,
    monthlySales: Number.isFinite(product.monthlySales) ? product.monthlySales : 0,
    price: parseNumericValue(product.price),
    cost: parseNumericValue(product.cost),
    location: product.location || "Sem local definido",
    supplier: product.supplier || "Sem fornecedor",
    updatedAt: product.updatedAt || new Date().toISOString(),
    status: mapApiStatus(product.status),
  }
}

export type InventoryOverview = {
  totalProducts: number
  totalUnits: number
  stockValueAtCost: number
  potentialRevenue: number
  lowStockCount: number
  outOfStockCount: number
  healthyCount: number
  averageCoverageDays: number
}

export type CategoryStockSummary = {
  category: string
  productsCount: number
  units: number
  valueAtCost: number
}

export type ReplenishmentSuggestion = {
  productId: string
  productCode: string
  productName: string
  supplier: string
  currentStock: number
  minimumStock: number
  recommendedPurchase: number
  estimatedCost: number
  coverageDays: number
}

export function calculateInventoryOverview(products: StockProduct[]): InventoryOverview {
  const totalProducts = products.length
  const totalUnits = products.reduce((sum, product) => sum + product.stock, 0)
  const stockValueAtCost = products.reduce((sum, product) => sum + product.stock * (product.cost || 0), 0)
  const potentialRevenue = products.reduce((sum, product) => sum + product.stock * (product.price || 0), 0)

  const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= product.minStock).length
  const outOfStockCount = products.filter((product) => product.stock <= 0 || product.status === "out_of_stock").length
  const healthyCount = Math.max(totalProducts - lowStockCount - outOfStockCount, 0)

  const stockCoverageByProduct = products
    .filter((product) => product.monthlySales > 0)
    .map((product) => (product.stock / product.monthlySales) * 30)

  const averageCoverageDays =
    stockCoverageByProduct.length > 0
      ? stockCoverageByProduct.reduce((sum, value) => sum + value, 0) / stockCoverageByProduct.length
      : 0

  return {
    totalProducts,
    totalUnits,
    stockValueAtCost,
    potentialRevenue,
    lowStockCount,
    outOfStockCount,
    healthyCount,
    averageCoverageDays,
  }
}

export function summarizeByCategory(products: StockProduct[]): CategoryStockSummary[] {
  const grouped = new Map<string, CategoryStockSummary>()

  for (const product of products) {
    const existing = grouped.get(product.category)

    if (existing) {
      existing.productsCount += 1
      existing.units += product.stock
      existing.valueAtCost += product.stock * product.cost
      continue
    }

    grouped.set(product.category, {
      category: product.category,
      productsCount: 1,
      units: product.stock,
      valueAtCost: product.stock * product.cost,
    })
  }

  return Array.from(grouped.values()).sort((left, right) => right.units - left.units)
}

export function buildReplenishmentSuggestions(products: StockProduct[]): ReplenishmentSuggestion[] {
  return products
    .filter((product) => product.stock <= product.minStock)
    .map((product) => {
      const safetyTarget = Math.ceil(product.minStock * 1.5)
      const recommendedPurchase = Math.max(safetyTarget - product.stock, 0)
      const estimatedCost = recommendedPurchase * (product.cost || 0)
      const coverageDays = product.monthlySales > 0 ? (product.stock / product.monthlySales) * 30 : 0

      return {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        supplier: product.supplier,
        currentStock: product.stock,
        minimumStock: product.minStock,
        recommendedPurchase,
        estimatedCost,
        coverageDays,
      }
    })
    .sort((left, right) => {
      const leftPriority = left.currentStock - left.minimumStock
      const rightPriority = right.currentStock - right.minimumStock
      return leftPriority - rightPriority
    })
    .slice(0, 8)
}
