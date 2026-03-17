import type { ServiceBillingModel, ServiceCatalogItem, ServiceCatalogStatus } from "@/components/services/catalog/catalog-types"
import type { ApiServiceCatalogItem } from "@/services/services.service"

function parseDecimalNumber(value: string | number | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim()
    const parsed = Number.parseFloat(normalized)
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

export function parseDurationToHours(value: string | null | undefined) {
  if (!value) return 0
  const normalized = value.replace(",", ".")
  const matches = normalized.match(/(\d+(\.\d+)?)/)
  if (!matches?.[1]) return 0

  const parsed = Number.parseFloat(matches[1])
  return Number.isFinite(parsed) ? parsed : 0
}

export function mapApiStatusToUi(status: string | null | undefined): ServiceCatalogStatus {
  const normalized = status?.trim().toUpperCase()
  if (normalized === "INACTIVE") return "inactive"
  if (normalized === "DRAFT") return "draft"
  return "active"
}

export function mapApiBillingModelToUi(model: string | null | undefined): ServiceBillingModel {
  const normalized = model?.trim().toUpperCase()
  if (normalized === "RECURRING") return "recurring"
  if (normalized === "HOURLY") return "hourly"
  return "project"
}

export function mapApiServiceToCatalogItem(service: ApiServiceCatalogItem): ServiceCatalogItem {
  const estimatedDurationHours = parseDurationToHours(service.estimated_duration)

  return {
    id: service.id,
    code: service.code,
    name: service.name,
    description: service.description,
    category: service.category,
    billingModel: mapApiBillingModelToUi(service.billing_model),
    status: mapApiStatusToUi(service.status),
    basePrice: parseDecimalNumber(service.base_price),
    slaHours: estimatedDurationHours,
    avgExecutionHours: estimatedDurationHours,
    activeContracts: 0,
    responsible: service.responsible?.trim() || "Responsavel padrao",
    updatedAt: service.updated_at || service.created_at || new Date().toISOString(),
  }
}
