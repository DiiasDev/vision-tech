import { clearAuthSession, getAccessToken } from "@/lib/auth-session"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

export type CreateOrderServicePayload = {
  organization_id?: string
  budget_id?: string | null
  client_id: string
  service_id?: string | null
  created_by_id?: string | null
  responsible_user_id?: string | null
  code: string
  title: string
  description?: string | null
  status: "DRAFT" | "SCHEDULED" | "IN_PROGRESS" | "AWAITING_PARTS" | "COMPLETED" | "CANCELED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  term: string
  scheduling?: string | null
  responsible: string
  checklist?: string[]
  progress: number
  total_cost: number
  total_value: number
  margin_value: number
  margin_percent: number
  timeline?: Array<{
    author_user_id?: string | null
    author_name?: string | null
    event: string
    notes?: string | null
    event_at?: string
  }>
  services?: Array<{
    service_catalog_id?: string | null
    code: string
    name: string
    category: string
    service_type: string
    billing_model: string
    billing_unit: string
    estimated_duration: string
    complexity_level: string
    responsible: string
    catalog_status: string
    is_completed: boolean
    completed_at?: string | null
    sort_order: number
  }>
  products?: Array<{
    product_id?: string | null
    description: string
    quantity: number
    unit_cost: number
    total_cost: number
    status?: string | null
  }>
}

type CreateOrderServiceResponse = {
  success?: boolean
  message?: string | string[]
  data?: {
    id?: string
    code?: string
  } | null
}

type GetOrderServiceCodesResponse = {
  success?: boolean
  message?: string | string[]
  data?: string[] | null
}

export type ApiServiceOrderStatus = "DRAFT" | "SCHEDULED" | "IN_PROGRESS" | "AWAITING_PARTS" | "COMPLETED" | "CANCELED"

export type ApiServiceOrderPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export type ApiServiceOrder = {
  id: string
  budgetId?: string | null
  clientId: string
  serviceId?: string | null
  createdById?: string | null
  responsibleUserId?: string | null
  code: string
  title: string
  description?: string | null
  status: ApiServiceOrderStatus
  priority: ApiServiceOrderPriority
  term: string
  scheduling?: string | null
  responsible: string
  checklist?: string[]
  progress: number
  totalCost: string | number
  totalValue: string | number
  marginValue: string | number
  marginPercent: string | number
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  budget?: {
    id: string
    code: string
  } | null
  client?: {
    id: string
    code: string
    type?: "PF" | "PJ" | null
    name: string
    document: string
    email?: string | null
    telephone?: string | null
    responsibleName?: string | null
    responsibleEmail?: string | null
    responsiblePhone?: string | null
    city?: string | null
    state?: string | null
    street?: string | null
    number?: string | null
    neighborhood?: string | null
  } | null
  service?: {
    id: string
    code: string
    name: string
  } | null
  createdBy?: {
    id: string
    name: string
  } | null
  responsibleUser?: {
    id: string
    name: string
  } | null
  services?: Array<{
    id: string
    serviceCatalogId?: string | null
    code: string
    name: string
    category: string
    serviceType: string
    billingModel: string
    billingUnit: string
    estimatedDuration: string
    complexityLevel: string
    responsible: string
    catalogStatus: string
    isCompleted: boolean
    completedAt?: string | null
    sortOrder: number
    createdAt?: string
    updatedAt?: string
  }>
  products?: Array<{
    id: string
    productId?: string | null
    description: string
    quantity: number
    unitCost: string | number
    totalCost: string | number
    status?: string | null
    product?: {
      id: string
      code: string
      name: string
    } | null
    createdAt?: string
    updatedAt?: string
  }>
  timeline?: Array<{
    id: string
    authorUserId?: string | null
    authorName?: string | null
    event: string
    notes?: string | null
    eventAt: string
    createdAt?: string
  }>
}

type GetServiceOrdersResponse = {
  success?: boolean
  message?: string | string[]
  data?: ApiServiceOrder[] | null
}

function getApiMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback

  const maybeMessage = (payload as { message?: unknown }).message
  if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage
  if (Array.isArray(maybeMessage) && maybeMessage.length > 0) return String(maybeMessage[0])

  return fallback
}

export async function createOrderService(payload: CreateOrderServicePayload) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para cadastrar a OS.")
  }

  const response = await fetch(`${API_URL}/service-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })

  let responsePayload: unknown = null
  try {
    responsePayload = await response.json()
  } catch {
    responsePayload = null
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession()
      throw new Error("Sua sessao expirou. Faca login novamente para cadastrar a OS.")
    }

    throw new Error(getApiMessage(responsePayload, "Nao foi possivel cadastrar a ordem de servico."))
  }

  const orderPayload = responsePayload as CreateOrderServiceResponse | null
  if (orderPayload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel cadastrar a ordem de servico."))
  }

  return {
    payload: orderPayload,
    data: orderPayload?.data ?? null,
    message: getApiMessage(responsePayload, "Ordem de servico cadastrada com sucesso."),
  }
}

export async function getServiceOrderCodes() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para carregar os codigos de OS.")
  }

  const response = await fetch(`${API_URL}/service-order/codes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  let responsePayload: unknown = null
  try {
    responsePayload = await response.json()
  } catch {
    responsePayload = null
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession()
      throw new Error("Sua sessao expirou. Faca login novamente para carregar os codigos de OS.")
    }

    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar os codigos de OS."))
  }

  const payload = responsePayload as GetOrderServiceCodesResponse | null
  if (payload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar os codigos de OS."))
  }

  return {
    payload,
    data: Array.isArray(payload?.data) ? payload.data : [],
    message: getApiMessage(responsePayload, "Codigos de OS carregados com sucesso."),
  }
}

export async function getServiceOrders() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para carregar as ordens de servico.")
  }

  const response = await fetch(`${API_URL}/service-order`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  let responsePayload: unknown = null
  try {
    responsePayload = await response.json()
  } catch {
    responsePayload = null
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession()
      throw new Error("Sua sessao expirou. Faca login novamente para carregar as ordens de servico.")
    }

    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar as ordens de servico."))
  }

  const payload = responsePayload as GetServiceOrdersResponse | null
  if (payload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar as ordens de servico."))
  }

  return {
    payload,
    data: Array.isArray(payload?.data) ? payload.data : [],
    message: getApiMessage(responsePayload, "Ordens de servico carregadas com sucesso."),
  }
}
