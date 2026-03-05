import { clearAuthSession, getAccessToken } from "@/lib/auth-session"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

export type CreateProductPayload = {
  name: string
  description: string
  category: "HARDWARE" | "SOFTWARE" | "SERVICES" | "PERIPHERALS" | "LICENSES" | "INFRASTRUCTURE" | "OTHERS"
  price: string
  cost?: string
  stock?: number
  minStock?: number
  unitOfMeasure: string
  location: string
  percentage: string
  status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK"
  brand: string
  supplier: string
  monthlySales?: number
  imageUrl?: string
}

type CreateProductResponse = {
  success?: boolean
  message?: string | string[]
  data?: {
    id: string
    code: string
  } | null
}

type GetProductCodesResponse = {
  success?: boolean
  message?: string | string[]
  data?: string[] | null
}

export type ApiProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK"
export type ApiProductCategory =
  | "HARDWARE"
  | "SOFTWARE"
  | "SERVICES"
  | "PERIPHERALS"
  | "LICENSES"
  | "INFRASTRUCTURE"
  | "OTHERS"

export type ProductsListItem = {
  id: string
  code: string
  name: string
  description: string
  category: ApiProductCategory
  price: string
  cost?: string | null
  stock: number
  minStock: number
  unitOfMeasure: string
  location: string
  percentage: string
  status: ApiProductStatus
  createdAt: string
  updatedAt: string
  createdBy: string
  brand: string
  supplier: string
  monthlySales: number
  imageUrl?: string | null
}

type GetProductsResponse = {
  success?: boolean
  message?: string | string[]
  data?: ProductsListItem[] | null
}

function getApiMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback

  const maybeMessage = (payload as { message?: unknown }).message
  if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage
  if (Array.isArray(maybeMessage) && maybeMessage.length > 0) return String(maybeMessage[0])

  return fallback
}

export async function createProduct(payload: CreateProductPayload) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para cadastrar produtos.")
  }

  const response = await fetch(`${API_URL}/products`, {
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
      throw new Error("Sua sessao expirou. Faca login novamente para cadastrar produtos.")
    }
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel cadastrar produto."))
  }

  const productPayload = responsePayload as CreateProductResponse | null
  if (productPayload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel cadastrar produto."))
  }

  return {
    payload: productPayload,
    message: getApiMessage(responsePayload, "Produto cadastrado com sucesso."),
  }
}

export async function getProductCodes() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para carregar os codigos de produtos.")
  }

  const response = await fetch(`${API_URL}/products/codes`, {
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
      throw new Error("Sua sessao expirou. Faca login novamente para carregar os codigos de produtos.")
    }
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar os codigos de produtos."))
  }

  const payload = responsePayload as GetProductCodesResponse | null
  if (payload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar os codigos de produtos."))
  }

  return {
    payload,
    data: Array.isArray(payload?.data) ? payload.data : [],
    message: getApiMessage(responsePayload, "Codigos de produtos carregados com sucesso."),
  }
}

export async function getProducts() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error("Sua sessao expirou. Faca login novamente para carregar os produtos.")
  }

  const response = await fetch(`${API_URL}/products`, {
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
      throw new Error("Sua sessao expirou. Faca login novamente para carregar os produtos.")
    }
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar os produtos."))
  }

  const payload = responsePayload as GetProductsResponse | null
  if (payload?.success === false) {
    throw new Error(getApiMessage(responsePayload, "Nao foi possivel carregar os produtos."))
  }

  return {
    payload,
    data: Array.isArray(payload?.data) ? payload.data : [],
    message: getApiMessage(responsePayload, "Produtos carregados com sucesso."),
  }
}
