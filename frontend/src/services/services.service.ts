import { clearAuthSession, getAccessToken } from "@/lib/auth-session"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

export type ApiServiceCatalogItem = {
  id: string
  organizationId?: string | null
  createdById?: string | null
  code: string
  name: string
  description: string
  category: string
  service_type: string
  billing_model: string
  billing_unit: string
  base_price: string | number
  internal_cost: string | number
  estimated_duration: string
  complexity_level: string
  responsible?: string | null
  status?: string | null
  is_recurring?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export type CreateServicePayload = {
  name: string
  description: string
  category: string
  service_type: string
  billing_model: string
  billing_unit: string
  base_price: string
  internal_cost: string
  estimated_duration: string
  complexity_level: string
  responsible?: string
  status?: "ACTIVE" | "INACTIVE" | "DRAFT"
  is_recurring?: boolean
}

type CreateServiceResponse = {
  success?: boolean
  message?: string | string[]
  data?: {
    id: string
    code: string
  } | null
}

type GetServicesResponse = {
  success?: boolean
  message?: string | string[]
  data?: ApiServiceCatalogItem[] | null
}

type GetServiceByIdResponse = {
  success?: boolean
  message?: string | string[]
  data?: ApiServiceCatalogItem | null
}

function getApiMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback

  const maybeMessage = (payload as { message?: unknown }).message
  if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage
  if (Array.isArray(maybeMessage) && maybeMessage.length > 0) return String(maybeMessage[0])

  return fallback
}

export async function createService(payload: CreateServicePayload) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para cadastrar servicos.")
  }

  const response = await fetch(`${API_URL}/services`, {
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
      throw new Error("Sua sessao expirou. Faca login novamente para cadastrar servicos.")
    }

    throw new Error(getApiMessage(responsePayload, "Nao foi possivel cadastrar servico."))
  }

  const servicePayload = responsePayload as CreateServiceResponse | null
  if (servicePayload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel cadastrar servico."))
  }

  return {
    payload: servicePayload,
    message: getApiMessage(responsePayload, "Servico cadastrado com sucesso."),
  }
}

export async function getServices() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para carregar os servicos.")
  }

  const response = await fetch(`${API_URL}/services`, {
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
      throw new Error("Sua sessao expirou. Faca login novamente para carregar os servicos.")
    }

    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar os servicos."))
  }

  const servicesPayload = responsePayload as GetServicesResponse | null
  if (servicesPayload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar os servicos."))
  }

  return {
    payload: servicesPayload,
    data: Array.isArray(servicesPayload?.data) ? servicesPayload.data : [],
    message: getApiMessage(responsePayload, "Servicos carregados com sucesso."),
  }
}

export async function getServiceById(serviceId: string) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para carregar o servico.")
  }

  const response = await fetch(`${API_URL}/services/${serviceId}`, {
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
      throw new Error("Sua sessao expirou. Faca login novamente para carregar o servico.")
    }

    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar o servico."))
  }

  const servicePayload = responsePayload as GetServiceByIdResponse | null
  if (servicePayload?.success === false || !servicePayload?.data) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar o servico."))
  }

  return {
    payload: servicePayload,
    data: servicePayload.data,
    message: getApiMessage(responsePayload, "Servico carregado com sucesso."),
  }
}
