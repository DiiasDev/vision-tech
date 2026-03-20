import type { Budget, BudgetItem, BudgetPriority, BudgetStatus } from "@/components/budget/budget-mock-data"
import { clearAuthSession, getAccessToken } from "@/lib/auth-session"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

export type CreateBudgetItemPayload = {
  productId?: string
  code?: string | null
  description: string
  category?: string
  quantity?: number
  unitPrice: number
  discount?: number
  internalCost?: number
  estimatedHours?: number
  deliveryWindow?: string
}

export type CreateBudgetPayload = {
  code?: string
  clientId: string
  serviceId?: string | null
  title: string
  status?: "draft" | "sent" | "negotiation" | "approved" | "rejected" | "expired"
  priority?: "low" | "medium" | "high"
  owner: string
  validUntil: string
  approvalDate?: string | null
  expectedCloseDate?: string | null
  paymentTerms?: string | null
  deliveryTerm?: string | null
  slaSummary?: string | null
  scopeSummary?: string | null
  assumptions?: string[]
  exclusions?: string[]
  attachments?: string[]
  clientName?: string | null
  clientSegment?: string | null
  clientDocument?: string | null
  clientCity?: string | null
  clientState?: string | null
  clientContactName?: string | null
  clientContactRole?: string | null
  clientEmail?: string | null
  clientPhone?: string | null
  serviceCode?: string | null
  serviceName?: string | null
  serviceCategory?: string | null
  serviceBillingModel?: string | null
  serviceDescription?: string | null
  serviceEstimatedDuration?: string | null
  serviceResponsible?: string | null
  serviceStatus?: string | null
  productsTotalAmount?: number
  productsCostAmount?: number
  serviceTotalAmount?: number
  serviceCostAmount?: number
  budgetDiscount?: number
  budgetTotalCostAmount?: number
  budgetTotalAmount?: number
  budgetProfitPercent?: number
  items: CreateBudgetItemPayload[]
}

export type UpdateBudgetPayload = Partial<Omit<CreateBudgetPayload, "items">> & {
  items?: CreateBudgetItemPayload[]
}

type CreateBudgetApiData = {
  id: string
  code: string
}

type CreateBudgetResponse = {
  success?: boolean
  message?: string | string[]
  data?: CreateBudgetApiData | null
}

type ApiBudgetClient = {
  id?: string
  name?: string
  type?: string | null
  document?: string | null
  city?: string | null
  state?: string | null
  responsibleName?: string | null
  responsibleEmail?: string | null
  responsiblePhone?: string | null
  email?: string | null
  telephone?: string | null
}

export type ApiBudgetItem = {
  id?: string
  productId?: string | null
  code?: string | null
  description?: string
  category?: string | null
  quantity?: number | string | null
  unitPrice?: number | string | null
  discount?: number | string | null
  internalCost?: number | string | null
  estimatedHours?: number | string | null
  deliveryWindow?: string | null
  product?: {
    code?: string | null
  } | null
}

export type ApiBudget = {
  id?: string
  code?: string
  title?: string
  status?: string
  priority?: string
  owner?: string
  createdAt?: string | null
  updatedAt?: string | null
  validUntil?: string | null
  approvalDate?: string | null
  expectedCloseDate?: string | null
  paymentTerms?: string | null
  deliveryTerm?: string | null
  slaSummary?: string | null
  scopeSummary?: string | null
  assumptions?: string[] | null
  exclusions?: string[] | null
  attachments?: string[] | null
  clientId?: string | null
  clientName?: string | null
  clientSegment?: string | null
  clientDocument?: string | null
  clientCity?: string | null
  clientState?: string | null
  clientContactName?: string | null
  clientContactRole?: string | null
  clientEmail?: string | null
  clientPhone?: string | null
  serviceId?: string | null
  serviceCode?: string | null
  serviceName?: string | null
  serviceCategory?: string | null
  serviceBillingModel?: string | null
  serviceDescription?: string | null
  serviceEstimatedDuration?: string | null
  serviceResponsible?: string | null
  serviceStatus?: string | null
  productsTotalAmount?: number | string | null
  productsCostAmount?: number | string | null
  serviceTotalAmount?: number | string | null
  serviceCostAmount?: number | string | null
  budgetDiscount?: number | string | null
  budgetTotalCostAmount?: number | string | null
  budgetTotalAmount?: number | string | null
  budgetProfitPercent?: number | string | null
  items?: ApiBudgetItem[] | null
  client?: ApiBudgetClient | null
}

type GetBudgetsResponse = {
  success?: boolean
  message?: string | string[]
  data?: ApiBudget[] | null
}

type UpdateBudgetResponse = {
  success?: boolean
  message?: string | string[]
  data?: ApiBudget | null
}

type DeleteBudgetResponse = {
  success?: boolean
  message?: string | string[]
  data?: {
    id: string
  } | null
}

function getApiMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback

  const maybeMessage = (payload as { message?: unknown }).message
  if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage
  if (Array.isArray(maybeMessage) && maybeMessage.length > 0) return String(maybeMessage[0])

  return fallback
}

function normalizeText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback
  const normalized = value.trim()
  return normalized || fallback
}

function normalizeNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value

  if (typeof value === "string") {
    const compact = value.replace(/[^\d,.-]/g, "")
    const normalized = compact.includes(",") ? compact.replace(/\./g, "").replace(",", ".") : compact
    const parsed = Number.parseFloat(normalized)
    if (Number.isFinite(parsed)) return parsed
  }

  return fallback
}

function normalizePositiveInt(value: unknown, fallback = 1) {
  const parsed = Math.trunc(normalizeNumber(value, fallback))
  return parsed > 0 ? parsed : fallback
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function normalizeDate(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return value
  }
  return fallback
}

function normalizeOptionalDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return undefined
  return value
}

function normalizeStatus(value: unknown): BudgetStatus {
  const normalized = normalizeText(value).toLowerCase()

  if (normalized === "draft") return "draft"
  if (normalized === "sent") return "sent"
  if (normalized === "negotiation") return "negotiation"
  if (normalized === "approved") return "approved"
  if (normalized === "rejected") return "rejected"
  if (normalized === "expired") return "expired"

  const uppercase = normalizeText(value).toUpperCase()
  if (uppercase === "DRAFT") return "draft"
  if (uppercase === "SENT") return "sent"
  if (uppercase === "NEGOTIATION") return "negotiation"
  if (uppercase === "APPROVED") return "approved"
  if (uppercase === "REJECTED") return "rejected"
  if (uppercase === "EXPIRED") return "expired"
  return "draft"
}

function normalizePriority(value: unknown): BudgetPriority {
  const normalized = normalizeText(value).toLowerCase()

  if (normalized === "low") return "low"
  if (normalized === "medium") return "medium"
  if (normalized === "high") return "high"

  const uppercase = normalizeText(value).toUpperCase()
  if (uppercase === "LOW") return "low"
  if (uppercase === "MEDIUM") return "medium"
  if (uppercase === "HIGH") return "high"
  return "medium"
}

function mapClientTypeToSegment(value: unknown) {
  const normalized = normalizeText(value).toUpperCase()
  if (normalized === "PF") return "Pessoa Fisica"
  if (normalized === "PJ") return "Pessoa Juridica"
  return "Nao informado"
}

function mapBudgetItem(rawItem: ApiBudgetItem, budgetId: string, index: number): BudgetItem {
  return {
    id: normalizeText(rawItem.id, `${budgetId}-item-${index + 1}`),
    productId: normalizeText(rawItem.productId, "") || null,
    code: normalizeText(rawItem.code, normalizeText(rawItem.product?.code, "")) || null,
    description: normalizeText(rawItem.description, "Item nao informado"),
    category: normalizeText(rawItem.category, "Nao informado"),
    quantity: normalizePositiveInt(rawItem.quantity, 1),
    unitPrice: normalizeNumber(rawItem.unitPrice, 0),
    discount: Math.max(0, normalizeNumber(rawItem.discount, 0)),
    internalCost: Math.max(0, normalizeNumber(rawItem.internalCost, 0)),
    estimatedHours: Math.max(0, normalizePositiveInt(rawItem.estimatedHours, 0)),
    deliveryWindow: normalizeText(rawItem.deliveryWindow, "A combinar"),
  }
}

function mapBudgetFromApi(rawBudget: ApiBudget): Budget {
  const nowIso = new Date().toISOString()
  const id = normalizeText(rawBudget.id, globalThis.crypto?.randomUUID?.() ?? `budget-${Date.now()}`)
  const createdAt = normalizeDate(rawBudget.createdAt, nowIso)
  const updatedAt = normalizeDate(rawBudget.updatedAt, createdAt)
  const validUntil = normalizeDate(rawBudget.validUntil, createdAt)
  const expectedCloseDate = normalizeDate(rawBudget.expectedCloseDate, validUntil)
  const assumptions = normalizeStringArray(rawBudget.assumptions)
  const exclusions = normalizeStringArray(rawBudget.exclusions)
  const attachments = normalizeStringArray(rawBudget.attachments)
  const clientSegmentFallback = mapClientTypeToSegment(rawBudget.client?.type)
  const items = Array.isArray(rawBudget.items) ? rawBudget.items : []

  return {
    id,
    code: normalizeText(rawBudget.code, "ORC-0000"),
    title: normalizeText(rawBudget.title, "Orcamento sem titulo"),
    status: normalizeStatus(rawBudget.status),
    priority: normalizePriority(rawBudget.priority),
    owner: normalizeText(rawBudget.owner, "Equipe Comercial"),
    createdAt,
    updatedAt,
    validUntil,
    approvalDate: normalizeOptionalDate(rawBudget.approvalDate),
    expectedCloseDate,
    paymentTerms: normalizeText(rawBudget.paymentTerms, "A definir"),
    deliveryTerm: normalizeText(rawBudget.deliveryTerm, "A definir"),
    slaSummary: normalizeText(rawBudget.slaSummary, "SLA nao informado."),
    scopeSummary: normalizeText(rawBudget.scopeSummary, "Escopo nao informado."),
    assumptions,
    exclusions,
    attachments,
    client: {
      id: normalizeText(rawBudget.clientId, normalizeText(rawBudget.client?.id, "cliente-nao-informado")),
      name: normalizeText(rawBudget.clientName, normalizeText(rawBudget.client?.name, "Cliente nao informado")),
      segment: normalizeText(rawBudget.clientSegment, clientSegmentFallback),
      document: normalizeText(rawBudget.clientDocument, normalizeText(rawBudget.client?.document, "Nao informado")),
      city: normalizeText(rawBudget.clientCity, normalizeText(rawBudget.client?.city, "Nao informado")),
      state: normalizeText(rawBudget.clientState, normalizeText(rawBudget.client?.state, "NA")),
      contactName: normalizeText(
        rawBudget.clientContactName,
        normalizeText(rawBudget.client?.responsibleName, "Contato nao informado")
      ),
      contactRole: normalizeText(rawBudget.clientContactRole, "Nao informado"),
      email: normalizeText(
        rawBudget.clientEmail,
        normalizeText(rawBudget.client?.responsibleEmail, normalizeText(rawBudget.client?.email, "nao informado"))
      ),
      phone: normalizeText(
        rawBudget.clientPhone,
        normalizeText(rawBudget.client?.responsiblePhone, normalizeText(rawBudget.client?.telephone, "Nao informado"))
      ),
    },
    serviceId: normalizeText(rawBudget.serviceId, "") || null,
    serviceCode: normalizeText(rawBudget.serviceCode, "") || null,
    serviceName: normalizeText(rawBudget.serviceName, "") || null,
    serviceCategory: normalizeText(rawBudget.serviceCategory, "") || null,
    serviceBillingModel: normalizeText(rawBudget.serviceBillingModel, "") || null,
    serviceDescription: normalizeText(rawBudget.serviceDescription, "") || null,
    serviceEstimatedDuration: normalizeText(rawBudget.serviceEstimatedDuration, "") || null,
    serviceResponsible: normalizeText(rawBudget.serviceResponsible, "") || null,
    serviceStatus: normalizeText(rawBudget.serviceStatus, "") || null,
    productsTotalAmount: normalizeNumber(rawBudget.productsTotalAmount, 0),
    productsCostAmount: normalizeNumber(rawBudget.productsCostAmount, 0),
    serviceTotalAmount: normalizeNumber(rawBudget.serviceTotalAmount, 0),
    serviceCostAmount: normalizeNumber(rawBudget.serviceCostAmount, 0),
    budgetDiscount: normalizeNumber(rawBudget.budgetDiscount, 0),
    budgetTotalCostAmount: normalizeNumber(rawBudget.budgetTotalCostAmount, 0),
    budgetTotalAmount: normalizeNumber(rawBudget.budgetTotalAmount, 0),
    budgetProfitPercent: normalizeNumber(rawBudget.budgetProfitPercent, 0),
    items: items.map((item, index) => mapBudgetItem(item, id, index)),
    interactions: [],
    risks: [],
    nextSteps: [],
  }
}

export async function createBudget(payload: CreateBudgetPayload) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para cadastrar orcamentos.")
  }

  const response = await fetch(`${API_URL}/budget`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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
      throw new Error("Sua sessao expirou. Faca login novamente para cadastrar orcamentos.")
    }

    throw new Error(getApiMessage(responsePayload, "Nao foi possivel cadastrar o orcamento."))
  }

  const budgetPayload = responsePayload as CreateBudgetResponse | null
  if (budgetPayload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel cadastrar o orcamento."))
  }

  return {
    payload: budgetPayload,
    data: budgetPayload?.data ?? null,
    message: getApiMessage(responsePayload, "Orcamento cadastrado com sucesso."),
  }
}

export async function getBudgets() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para carregar os orcamentos.")
  }

  const response = await fetch(`${API_URL}/budget`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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
      throw new Error("Sua sessao expirou. Faca login novamente para carregar os orcamentos.")
    }

    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar os orcamentos."))
  }

  const budgetsPayload = responsePayload as GetBudgetsResponse | null
  if (budgetsPayload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar os orcamentos."))
  }

  const budgets = Array.isArray(budgetsPayload?.data) ? budgetsPayload.data.map(mapBudgetFromApi) : []

  return {
    payload: budgetsPayload,
    data: budgets,
    message: getApiMessage(responsePayload, "Orcamentos carregados com sucesso."),
  }
}

export async function updateBudget(budgetId: string, payload: UpdateBudgetPayload) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para atualizar o orcamento.")
  }

  const response = await fetch(`${API_URL}/budget/${budgetId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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
      throw new Error("Sua sessao expirou. Faca login novamente para atualizar o orcamento.")
    }
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel atualizar o orcamento."))
  }

  const budgetPayload = responsePayload as UpdateBudgetResponse | null
  if (budgetPayload?.success === false || !budgetPayload?.data) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel atualizar o orcamento."))
  }

  return {
    payload: budgetPayload,
    data: mapBudgetFromApi(budgetPayload.data),
    message: getApiMessage(responsePayload, "Orcamento atualizado com sucesso."),
  }
}

export async function deleteBudget(budgetId: string) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para excluir o orcamento.")
  }

  const response = await fetch(`${API_URL}/budget/${budgetId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
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
      throw new Error("Sua sessao expirou. Faca login novamente para excluir o orcamento.")
    }
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel excluir o orcamento."))
  }

  const budgetPayload = responsePayload as DeleteBudgetResponse | null
  if (budgetPayload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel excluir o orcamento."))
  }

  return {
    payload: budgetPayload,
    data: budgetPayload?.data ?? null,
    message: getApiMessage(responsePayload, "Orcamento excluido com sucesso."),
  }
}
