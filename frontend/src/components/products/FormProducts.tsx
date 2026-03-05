"use client"

import { useEffect, useMemo, useState } from "react"

import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import FormComponent, { type GenericField } from "@/components/layout/formComponent"
import { clearAuthSession, getAccessToken, getStoredHeaderUser } from "@/lib/auth-session"
import type { Product } from "@/components/products/productsMock"
import { PRODUCT_BASE_FIELDS } from "@/components/products/productsFields"
import { createProduct } from "@/services/products.service"

type FormProductsProps = {
  open: boolean
  onClose: () => void
  productCodes: string[]
  onCreated?: (product: Product) => void
  onFeedback?: (feedback: ComponentAlertState) => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

function getNextProductCode(codes: string[]) {
  const maxCodeNumber = codes.reduce((max, current) => {
    const match = /^PROD-(\d+)$/i.exec(current)
    if (!match) return max
    const numericCode = Number.parseInt(match[1] ?? "0", 10)
    if (!Number.isFinite(numericCode)) return max
    return Math.max(max, numericCode)
  }, 0)

  const next = maxCodeNumber + 1
  return `PROD-${String(next).padStart(4, "0")}`
}

function mapApiStatusToUi(status: string): Product["status"] {
  if (status === "INACTIVE") return "inactive"
  if (status === "OUT_OF_STOCK") return "out_of_stock"
  return "active"
}

function mapCategoryLabel(category: string) {
  const categoryMap: Record<string, string> = {
    HARDWARE: "Hardware",
    SOFTWARE: "Software",
    SERVICES: "Servicos",
    PERIPHERALS: "Perifericos",
    LICENSES: "Licencas",
    INFRASTRUCTURE: "Infraestrutura",
    OTHERS: "Outros",
  }

  return categoryMap[category] ?? category
}

function buildInitialValues(fields: GenericField[]) {
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.name] = field.defaultValue ?? ""
    return acc
  }, {})
}

function parseCurrency(value: string) {
  const numericValue = Number.parseFloat((value ?? "").replace(",", "."))
  return Number.isFinite(numericValue) ? numericValue : 0
}

function calculateMarginPercentage(priceValue: string, costValue: string) {
  const price = parseCurrency(priceValue)
  if (price <= 0) return "0.00"

  const cost = parseCurrency(costValue)
  const margin = ((price - cost) / price) * 100
  return Number.isFinite(margin) ? margin.toFixed(2) : "0.00"
}

export function FormProducts({ open, onClose, productCodes, onCreated, onFeedback }: FormProductsProps) {
  const nextCode = useMemo(() => getNextProductCode(productCodes), [productCodes])
  const [createdByName, setCreatedByName] = useState(() => {
    const storedUser = getStoredHeaderUser()
    if (storedUser?.fullName?.trim()) return storedUser.fullName
    return "Usuario logado"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const accessToken = getAccessToken()
    if (!accessToken) return

    let isMounted = true

    void fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    })
      .then(async (response) => {
        if (response.status === 401) {
          clearAuthSession()
          return null
        }

        if (!response.ok) return null

        return response.json() as Promise<{ name?: string }>
      })
      .then((payload) => {
        if (!isMounted) return
        if (!payload?.name?.trim()) return
        setCreatedByName(payload.name)
      })
      .catch(() => null)

    return () => {
      isMounted = false
    }
  }, [])

  const fields = useMemo(
    () =>
      PRODUCT_BASE_FIELDS.map((field) => {
        if (field.name === "code") return { ...field, defaultValue: nextCode }
        if (field.name === "createdBy") return { ...field, defaultValue: createdByName }
        return field
      }),
    [nextCode, createdByName]
  )

  useEffect(() => {
    setFormValues(buildInitialValues(fields))
    setFeedback(null)
  }, [fields, open])

  if (!open) return null

  function handleValuesChange(nextValues: Record<string, string>) {
    const normalizedValues = { ...nextValues, monthlySales: "0" }
    const shouldRecalculate =
      normalizedValues.price !== formValues.price || normalizedValues.cost !== formValues.cost

    if (!shouldRecalculate) {
      setFormValues(normalizedValues)
      return
    }

    const percentage = calculateMarginPercentage(normalizedValues.price ?? "", normalizedValues.cost ?? "")
    setFormValues({ ...normalizedValues, percentage })
  }

  async function handleSubmit(values: Record<string, string>) {
    const payload = {
      name: values.name?.trim() ?? "",
      description: values.description?.trim() ?? "",
      category: (values.category?.trim() || "HARDWARE") as
        | "HARDWARE"
        | "SOFTWARE"
        | "SERVICES"
        | "PERIPHERALS"
        | "LICENSES"
        | "INFRASTRUCTURE"
        | "OTHERS",
      price: values.price?.trim() ?? "0",
      cost: values.cost?.trim() || undefined,
      stock: Number.parseInt(values.stock ?? "0", 10) || 0,
      minStock: Number.parseInt(values.minStock ?? "0", 10) || 0,
      unitOfMeasure: values.unitOfMeasure?.trim() ?? "",
      location: values.location?.trim() ?? "",
      percentage: values.percentage?.trim() ?? "0",
      status: (values.status?.trim() || "ACTIVE") as "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK",
      brand: values.brand?.trim() ?? "",
      supplier: values.supplier?.trim() ?? "",
      monthlySales: 0,
      imageUrl: values.imageUrl?.trim() || undefined,
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const response = await createProduct(payload)
      const created = response.payload?.data
      const today = new Date().toISOString().slice(0, 10)

      onCreated?.({
        id: created?.id ?? (globalThis.crypto?.randomUUID?.() ?? String(Date.now())),
        code: created?.code ?? nextCode,
        name: payload.name,
        description: payload.description,
        category: mapCategoryLabel(payload.category),
        price: Number.parseFloat(payload.price) || 0,
        cost: Number.parseFloat(payload.cost ?? "0") || 0,
        stock: payload.stock,
        minStock: payload.minStock,
        unitOfMeasure: payload.unitOfMeasure,
        location: payload.location,
        percentage: Number.parseFloat(payload.percentage) || 0,
        status: mapApiStatusToUi(payload.status),
        createdAt: today,
        updatedAt: today,
        createdBy: createdByName,
        brand: payload.brand,
        supplier: payload.supplier,
        monthlySales: payload.monthlySales,
        imageUrl: payload.imageUrl,
      })

      onFeedback?.(ComponentAlert.Success(`Produto "${payload.name}" cadastrado com sucesso.`))
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel cadastrar produto."
      const errorAlert = ComponentAlert.Error(message)
      setFeedback(errorAlert)
      onFeedback?.(errorAlert)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/60 p-3 backdrop-blur-sm sm:p-6">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 flex min-h-full items-start justify-center py-1 sm:items-center sm:py-3">
        <div className="flex h-[calc(100dvh-1.25rem)] w-full max-w-5xl flex-col gap-3 sm:h-[calc(100dvh-2rem)]">
          <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

          <FormComponent
            title="Cadastrar produto"
            description="Preencha os dados principais para adicionar um novo item ao catalogo."
            fields={fields}
            key={`${nextCode}-${createdByName}`}
            values={formValues}
            onValuesChange={handleValuesChange}
            submitLabel="Cadastrar produto"
            cancelLabel="Fechar"
            scrollable
            className="h-full min-h-0 flex-1"
            loading={isSubmitting}
            onHeaderClose={onClose}
            onCancel={onClose}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}
