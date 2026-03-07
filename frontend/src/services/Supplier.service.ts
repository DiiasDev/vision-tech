import { clearAuthSession, getAccessToken } from "@/lib/auth-session"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

export type CreateSupplierPayload = {
  supplierCode?: string
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

export type UpdateSupplierPayload = Partial<{
  name: string
  fantasyName: string
  segment: string
  risk: string
  contact: string | null
  city: string
  state: string
  status: string
  categories: string
  lead: string | null
  location: string
  phone: string
  email: string
  minRequest: string
  lastDelivery: string
}>

export type ApiSupplier = {
  id: string
  supplierCode: string
  name: string
  fantasyName: string
  segment: string
  risk: string
  contact?: string | null
  city: string
  state: string
  status: string
  categories: string
  lead?: string | null
  location: string
  phone: string
  email: string
  minRequest: string
  lastDelivery: string
}

type CreateSupplierResponse = {
  success?: boolean
  message?: string | string[]
  data?: ApiSupplier | null
}

type GetSuppliersResponse = {
  success?: boolean
  message?: string | string[]
  data?: ApiSupplier[] | null
}

type GetSupplierByIdResponse = {
  success?: boolean
  message?: string | string[]
  data?: ApiSupplier | null
}

type UpdateSupplierResponse = {
  success?: boolean
  message?: string | string[]
  data?: ApiSupplier | null
}

type DeleteSupplierResponse = {
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

export async function createSupplier(payload: CreateSupplierPayload) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para cadastrar fornecedores.")
  }

  const response = await fetch(`${API_URL}/supplier`, {
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
      throw new Error("Sua sessao expirou. Faca login novamente para cadastrar fornecedores.")
    }

    throw new Error(getApiMessage(responsePayload, "Nao foi possivel cadastrar fornecedor."))
  }

  const dataPayload = responsePayload as CreateSupplierResponse | null
  if (dataPayload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel cadastrar fornecedor."))
  }

  return {
    payload: dataPayload,
    data: dataPayload?.data ?? null,
    message: getApiMessage(responsePayload, "Fornecedor cadastrado com sucesso."),
  }
}

export async function getSuppliers() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para carregar fornecedores.")
  }

  const response = await fetch(`${API_URL}/supplier`, {
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
      throw new Error("Sua sessao expirou. Faca login novamente para carregar fornecedores.")
    }
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar fornecedores."))
  }

  const dataPayload = responsePayload as GetSuppliersResponse | null
  if (dataPayload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar fornecedores."))
  }

  return {
    payload: dataPayload,
    data: Array.isArray(dataPayload?.data) ? dataPayload.data : [],
    message: getApiMessage(responsePayload, "Fornecedores carregados com sucesso."),
  }
}

export async function getSupplierById(supplierId: string) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para carregar o fornecedor.")
  }

  const response = await fetch(`${API_URL}/supplier/${supplierId}`, {
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
      throw new Error("Sua sessao expirou. Faca login novamente para carregar o fornecedor.")
    }
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar o fornecedor."))
  }

  const dataPayload = responsePayload as GetSupplierByIdResponse | null
  if (dataPayload?.success === false || !dataPayload?.data) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar o fornecedor."))
  }

  return {
    payload: dataPayload,
    data: dataPayload.data,
    message: getApiMessage(responsePayload, "Fornecedor carregado com sucesso."),
  }
}

export async function updateSupplier(supplierId: string, payload: UpdateSupplierPayload) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para atualizar fornecedor.")
  }

  const response = await fetch(`${API_URL}/supplier/${supplierId}`, {
    method: "PUT",
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
      throw new Error("Sua sessao expirou. Faca login novamente para atualizar fornecedor.")
    }
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel atualizar fornecedor."))
  }

  const dataPayload = responsePayload as UpdateSupplierResponse | null
  if (dataPayload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel atualizar fornecedor."))
  }

  return {
    payload: dataPayload,
    data: dataPayload?.data ?? null,
    message: getApiMessage(responsePayload, "Fornecedor atualizado com sucesso."),
  }
}

export async function deleteSupplier(supplierId: string) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para excluir fornecedor.")
  }

  const response = await fetch(`${API_URL}/supplier/${supplierId}`, {
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
      throw new Error("Sua sessao expirou. Faca login novamente para excluir fornecedor.")
    }
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel excluir fornecedor."))
  }

  const dataPayload = responsePayload as DeleteSupplierResponse | null
  if (dataPayload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel excluir fornecedor."))
  }

  return {
    payload: dataPayload,
    message: getApiMessage(responsePayload, "Fornecedor excluido com sucesso."),
  }
}
