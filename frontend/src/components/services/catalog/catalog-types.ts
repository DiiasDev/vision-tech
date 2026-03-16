export type ServiceCatalogStatus = "active" | "inactive" | "draft"

export type ServiceBillingModel = "project" | "recurring" | "hourly"

export type ServiceCatalogItem = {
  id: string
  code: string
  name: string
  description: string
  category: string
  billingModel: ServiceBillingModel
  status: ServiceCatalogStatus
  basePrice: number
  slaHours: number
  avgExecutionHours: number
  activeContracts: number
  responsible: string
  updatedAt: string
}
