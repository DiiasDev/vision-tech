export type SupplierSegment = "eletronicos" | "infraestrutura" | "insumos" | "embalagem" | "servicos"
export type SupplierStatus = "ativo" | "avaliacao" | "suspenso"
export type SupplierRiskLevel = "baixo" | "medio" | "alto"

export type Supplier = {
  id: string
  name: string
  tradeName: string
  segment: SupplierSegment
  status: SupplierStatus
  riskLevel: SupplierRiskLevel
  leadTimeDays: number
  onTimeRate: number
  qualityScore: number
  annualSpend: number
  paymentTerm: string
  minimumOrderValue: number
  activeContracts: number
  categories: string[]
  contactName: string
  contactEmail: string
  contactPhone: string
  city: string
  state: string
  lastDeliveryAt: string
  nextReviewAt: string
}

export type SupplierFilters = {
  search: string
  segment: SupplierSegment | "all"
  status: SupplierStatus | "all"
  risk: SupplierRiskLevel | "all"
}

export type SupplierSummary = {
  totalSuppliers: number
  activeSuppliers: number
  highRiskSuppliers: number
  averageLeadTime: number
  averageOnTimeRate: number
  averageQualityScore: number
  totalAnnualSpend: number
}

export const supplierSegmentLabels: Record<SupplierSegment, string> = {
  eletronicos: "Eletronicos",
  infraestrutura: "Infraestrutura",
  insumos: "Insumos",
  embalagem: "Embalagem",
  servicos: "Servicos",
}

export const supplierStatusLabels: Record<SupplierStatus, string> = {
  ativo: "Ativo",
  avaliacao: "Em avaliacao",
  suspenso: "Suspenso",
}

export const supplierRiskLabels: Record<SupplierRiskLevel, string> = {
  baixo: "Risco baixo",
  medio: "Risco medio",
  alto: "Risco alto",
}

const riskPriority: Record<SupplierRiskLevel, number> = {
  alto: 0,
  medio: 1,
  baixo: 2,
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR")
}

export function filterSuppliers(suppliers: Supplier[], filters: SupplierFilters) {
  const normalizedSearch = normalize(filters.search)

  return suppliers.filter((supplier) => {
    if (filters.segment !== "all" && supplier.segment !== filters.segment) {
      return false
    }

    if (filters.status !== "all" && supplier.status !== filters.status) {
      return false
    }

    if (filters.risk !== "all" && supplier.riskLevel !== filters.risk) {
      return false
    }

    if (!normalizedSearch) {
      return true
    }

    const searchableParts = [
      supplier.name,
      supplier.tradeName,
      supplier.contactName,
      supplier.city,
      supplier.state,
      supplier.categories.join(" "),
    ]

    return searchableParts.join(" ").toLocaleLowerCase("pt-BR").includes(normalizedSearch)
  })
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((total, value) => total + value, 0) / values.length
}

export function getRiskSortValue(riskLevel: SupplierRiskLevel) {
  return riskPriority[riskLevel]
}

export function calculateSupplierSummary(suppliers: Supplier[]): SupplierSummary {
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter((supplier) => supplier.status === "ativo").length
  const highRiskSuppliers = suppliers.filter((supplier) => supplier.riskLevel === "alto").length

  return {
    totalSuppliers,
    activeSuppliers,
    highRiskSuppliers,
    averageLeadTime: average(suppliers.map((supplier) => supplier.leadTimeDays)),
    averageOnTimeRate: average(suppliers.map((supplier) => supplier.onTimeRate)),
    averageQualityScore: average(suppliers.map((supplier) => supplier.qualityScore)),
    totalAnnualSpend: suppliers.reduce((total, supplier) => total + supplier.annualSpend, 0),
  }
}

export function formatPercent(value: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}
