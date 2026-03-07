export type Supplier = {
  id: string
  code: string
  name: string
  fantasyName: string
  segment: string
  risk: string
  contact?: string
  city: string
  state: string
  status: string
  categories: string
  lead?: string
  location: string
  phone: string
  email: string
  minRequest: string
  lastDelivery: string
}

export type SupplierFilters = {
  search: string
  segment: string | "all"
  status: string | "all"
  risk: string | "all"
}

export type SupplierSummary = {
  totalSuppliers: number
  activeSuppliers: number
  highRiskSuppliers: number
  averageLeadDays: number
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR")
}

function parseLeadDays(lead?: string) {
  if (!lead?.trim()) return 0
  const numericMatch = lead.replace(",", ".").match(/\d+(\.\d+)?/)
  if (!numericMatch) return 0
  const parsedValue = Number.parseFloat(numericMatch[0])
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

export function getRiskSortValue(risk: string) {
  const normalizedRisk = normalize(risk)
  if (normalizedRisk === "alto") return 0
  if (normalizedRisk === "medio") return 1
  if (normalizedRisk === "baixo") return 2
  return 3
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

    if (filters.risk !== "all" && supplier.risk !== filters.risk) {
      return false
    }

    if (!normalizedSearch) {
      return true
    }

    const searchableParts = [
      supplier.code,
      supplier.name,
      supplier.fantasyName,
      supplier.segment,
      supplier.risk,
      supplier.contact ?? "",
      supplier.city,
      supplier.state,
      supplier.status,
      supplier.categories,
      supplier.lead ?? "",
      supplier.location,
      supplier.phone,
      supplier.email,
      supplier.minRequest,
      supplier.lastDelivery,
    ]

    return searchableParts.join(" ").toLocaleLowerCase("pt-BR").includes(normalizedSearch)
  })
}

export function calculateSupplierSummary(suppliers: Supplier[]): SupplierSummary {
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter((supplier) => normalize(supplier.status) === "ativo").length
  const highRiskSuppliers = suppliers.filter((supplier) => normalize(supplier.risk) === "alto").length

  const leadValues = suppliers.map((supplier) => parseLeadDays(supplier.lead)).filter((value) => value > 0)
  const averageLeadDays =
    leadValues.length > 0 ? leadValues.reduce((total, value) => total + value, 0) / leadValues.length : 0

  return {
    totalSuppliers,
    activeSuppliers,
    highRiskSuppliers,
    averageLeadDays,
  }
}
