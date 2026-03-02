import { clearAuthSession, getAccessToken } from "@/lib/auth-session"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

export type CreateClientPayload = {
  type: "PF" | "PJ"
  name: string
  document: string
  status?: "ACTIVE" | "INACTIVE" | "DELINQUENT"
  lastContact?: string
  email?: string
  telephone?: string
  responsibleName?: string
  responsibleEmail?: string
  responsiblePhone?: string
  city?: string
  state?: string
  street?: string
  number?: string
  neighborhood?: string
  zipCode?: string
  responsibleUserId?: string
}

export type CreateClientResponse = {
  success?: boolean
  message?: string | string[]
  data?: {
    id: string
    code: string
    name: string
    document: string
    status: string
  } | null
}

export type ApiClientStatus = "ACTIVE" | "INACTIVE" | "DELINQUENT"
export type ApiClientType = "PF" | "PJ"

export type ClientsListItem = {
  id: string
  code: string
  type: ApiClientType
  name: string
  document: string
  status: ApiClientStatus
  lastContact?: string | null
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
  zipCode?: string | null
  responsibleUserId?: string | null
  createdAt: string
  updatedAt: string
}

type GetClientsResponse = {
  success?: boolean
  message?: string | string[]
  data?: ClientsListItem[] | null
}

type GetClientByIdResponse = {
  success?: boolean
  message?: string | string[]
  data?: ClientsListItem | null
}

function getApiMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback

  const maybeMessage = (payload as { message?: unknown }).message
  if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage
  if (Array.isArray(maybeMessage) && maybeMessage.length > 0) return String(maybeMessage[0])

  return fallback
}

export async function createClient(payload: CreateClientPayload) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para cadastrar clientes.")
  }

  const response = await fetch(`${API_URL}/clients`, {
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
      throw new Error("Sua sessao expirou. Faca login novamente para cadastrar clientes.")
    }
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel cadastrar cliente."))
  }

  const clientPayload = responsePayload as CreateClientResponse | null
  if (clientPayload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel cadastrar cliente."))
  }

  return {
    payload: clientPayload,
    message: getApiMessage(responsePayload, "Cliente cadastrado com sucesso."),
  }
}

export async function getClients() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para carregar clientes.")
  }

  const response = await fetch(`${API_URL}/clients`, {
    method: "GET",
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
      throw new Error("Sua sessao expirou. Faca login novamente para carregar clientes.")
    }
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar os clientes."))
  }

  const clientsPayload = responsePayload as GetClientsResponse | null
  if (clientsPayload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar os clientes."))
  }

  return {
    payload: clientsPayload,
    data: Array.isArray(clientsPayload?.data) ? clientsPayload.data : [],
    message: getApiMessage(responsePayload, "Clientes buscados com sucesso."),
  }
}

export async function getClientById(id: string) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para carregar o cliente.")
  }

  const response = await fetch(`${API_URL}/clients/${id}`, {
    method: "GET",
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
      throw new Error("Sua sessao expirou. Faca login novamente para carregar o cliente.")
    }
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar o cliente."))
  }

  const clientPayload = responsePayload as GetClientByIdResponse | null
  if (clientPayload?.success === false || !clientPayload?.data) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar o cliente."))
  }

  return {
    payload: clientPayload,
    data: clientPayload.data,
    message: getApiMessage(responsePayload, "Cliente encontrado com sucesso."),
  }
}
