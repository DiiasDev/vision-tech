import { clearAuthSession, getAccessToken } from "@/lib/auth-session"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

export type CreateBudgetItemPayload = {
  productId?: string
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

type CreateBudgetApiData = {
  id: string
  code: string
}

type CreateBudgetResponse = {
  success?: boolean
  message?: string | string[]
  data?: CreateBudgetApiData | null
}

function getApiMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback

  const maybeMessage = (payload as { message?: unknown }).message
  if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage
  if (Array.isArray(maybeMessage) && maybeMessage.length > 0) return String(maybeMessage[0])

  return fallback
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
