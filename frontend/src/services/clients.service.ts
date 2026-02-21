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
