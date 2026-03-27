"use client"

import { useEffect, useMemo, useState } from "react"

import type { Budget } from "@/components/budget/budget-mock-data"
import { parseDurationToHours } from "@/components/services/catalog/catalog-mappers"
import { type ServiceOrder } from "@/components/services/serviceOrder/service-order-mock-data"
import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import FormComponent, { type GenericField, type GenericFormStep } from "@/components/layout/formComponent"
import { Button } from "@/components/ui/button"
import { getStoredHeaderUser } from "@/lib/auth-session"
import { getBudgets } from "@/services/budgets.service"
import { getClients, type ClientsListItem } from "@/services/clients.service"
import {
  createOrderService,
  getServiceOrderCodes,
  updateOrderService,
  type CreateOrderServicePayload,
} from "@/services/orderServices.service"
import { getProducts, type ProductsListItem } from "@/services/products.service"
import { getServices, type ApiServiceCatalogItem } from "@/services/services.service"
import { formatCpfCnpj, formatPhoneBR } from "@/utils/Formatter"

type FormServiceOrderProps = {
  open: boolean
  onClose: () => void
  existingCodes: string[]
  initialScheduledAt?: string
  mode?: "create" | "edit"
  orderToEdit?: ServiceOrder | null
  onCreated?: (order: ServiceOrder) => void
  onUpdated?: (order: ServiceOrder) => void
  onFeedback?: (feedback: ComponentAlertState) => void
}

type ProductBlock = {
  id: string
}

function toDateOnly(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function toDateTimeFieldValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function parseDateTimeLocalValue(value: string | null | undefined) {
  if (typeof value !== "string" || !value.trim()) return null

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null

  return parsed
}

function toDateTimeOffset(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return `${toDateTimeFieldValue(new Date())}:00-03:00`

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const day = String(parsed.getDate()).padStart(2, "0")
  const hours = String(parsed.getHours()).padStart(2, "0")
  const minutes = String(parsed.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}:00-03:00`
}

function parseCurrencyNumber(value: string | number | null | undefined, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value

  const raw = typeof value === "string" ? value.trim() : ""
  if (!raw) return fallback

  const compact = raw.replace(/[^\d,.-]/g, "")
  const normalized = compact.includes(",") ? compact.replace(/\./g, "").replace(",", ".") : compact
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseMultiline(value: string) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function buildInitialValues(fields: GenericField[]) {
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.name] = field.defaultValue ?? ""
    return acc
  }, {})
}

function productFieldName(index: number, key: string) {
  return `product_${index}_${key}`
}

function createProductBlock(index: number): ProductBlock {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `product-block-${Date.now()}-${index}`,
  }
}

function buildInitialProductBlocks() {
  return [createProductBlock(1)]
}

function getNextServiceOrderCode(codes: string[]) {
  const maxCodeNumber = codes.reduce((max, current) => {
    const normalized = current.trim()
    const standardMatch = /^OS-(\d+)$/i.exec(normalized)
    const rawNumber = standardMatch?.[1] ?? "0"
    const parsed = Number.parseInt(rawNumber, 10)
    if (!Number.isFinite(parsed)) return max
    return Math.max(max, parsed)
  }, 0)

  const nextNumber = maxCodeNumber + 1
  return `OS-${String(nextNumber).padStart(4, "0")}`
}

function mapClientTypeToSegment(type: ClientsListItem["type"] | undefined) {
  if (type === "PF") return "Pessoa Fisica"
  if (type === "PJ") return "Pessoa Juridica"
  return "Nao informado"
}

function mapOrderClientSegmentToType(segment: string | null | undefined): ClientsListItem["type"] {
  const normalizedSegment = normalizeLookupText(segment)
  if (normalizedSegment.includes("fisic")) return "PF"
  if (normalizedSegment.includes("jurid")) return "PJ"
  return "PJ"
}

function buildFallbackClientFromOrder(order: ServiceOrder): ClientsListItem {
  const nowIso = new Date().toISOString()
  const fallbackClientId = order.client.id?.trim() || `order-client-${order.id}`

  return {
    id: fallbackClientId,
    code: "CLI-LEGADO",
    type: mapOrderClientSegmentToType(order.client.segment),
    name: order.client.name?.trim() || "Cliente da OS",
    document: order.client.document?.trim() || "",
    status: "ACTIVE",
    lastContact: null,
    email: order.client.email?.trim() || null,
    telephone: order.client.phone?.trim() || null,
    responsibleName: order.client.contactName?.trim() || null,
    responsibleEmail: order.client.email?.trim() || null,
    responsiblePhone: order.client.phone?.trim() || null,
    city: order.client.city?.trim() || null,
    state: order.client.state?.trim() || null,
    street: null,
    number: null,
    neighborhood: null,
    zipCode: null,
    responsibleUserId: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  }
}

function normalizeLookupText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
}

function toDateFieldValue(value: string | null | undefined) {
  if (!value || !value.trim()) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return toDateOnly(parsed)
}

function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value || !value.trim()) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return toDateTimeFieldValue(parsed)
}

function findMatchingClient(clients: ClientsListItem[], order: ServiceOrder) {
  const orderClientId = order.client.id?.trim()
  const orderClientName = normalizeLookupText(order.client.name)

  return (
    clients.find((client) => client.id === orderClientId) ??
    clients.find((client) => normalizeLookupText(client.name) === orderClientName) ??
    clients.find((client) => normalizeLookupText(client.name).includes(orderClientName)) ??
    null
  )
}

function findMatchingService(services: ApiServiceCatalogItem[], order: ServiceOrder) {
  const serviceName = normalizeLookupText(order.serviceName)
  const serviceCode = normalizeLookupText(order.serviceItems?.[0]?.code ?? "")

  return (
    services.find((service) => normalizeLookupText(service.code) === serviceCode) ??
    services.find((service) => normalizeLookupText(service.name) === serviceName) ??
    services.find((service) => normalizeLookupText(service.name).includes(serviceName)) ??
    null
  )
}

function findMatchingProductId(
  products: ProductsListItem[],
  item: ServiceOrder["partItems"][number]
) {
  const itemSku = normalizeLookupText(item.sku)
  const itemDescription = normalizeLookupText(item.description)

  const matchedBySku = products.find((product) => normalizeLookupText(product.code) === itemSku)
  if (matchedBySku) return matchedBySku.id

  const matchedByName = products.find((product) => normalizeLookupText(product.name) === itemDescription)
  if (matchedByName) return matchedByName.id

  const matchedByDescription = products.find((product) => normalizeLookupText(product.description) === itemDescription)
  if (matchedByDescription) return matchedByDescription.id

  return ""
}

function buildFields(params: {
  nextCode: string
  responsibleDefault: string
  initialScheduledAt?: string
  clients: ClientsListItem[]
  budgets: Budget[]
  services: ApiServiceCatalogItem[]
  products: ProductsListItem[]
  productBlocks: ProductBlock[]
}): GenericField[] {
  const { nextCode, responsibleDefault, initialScheduledAt, clients, budgets, services, products, productBlocks } = params

  const now = new Date()
  const prefilledScheduledDate = parseDateTimeLocalValue(initialScheduledAt)
  const scheduledDate = prefilledScheduledDate ? new Date(prefilledScheduledDate) : new Date(now)
  if (!prefilledScheduledDate) {
    scheduledDate.setDate(scheduledDate.getDate() + 1)
    scheduledDate.setHours(9, 0, 0, 0)
  }

  const deadlineDate = new Date(scheduledDate)
  deadlineDate.setDate(deadlineDate.getDate() + 5)
  deadlineDate.setHours(12, 0, 0, 0)

  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: `${client.code} - ${client.name}`,
  }))

  const budgetOptions = budgets.map((budget) => ({
    value: budget.id,
    label: `${budget.code} - ${budget.title}`,
  }))

  const serviceOptions = services.map((service) => ({
    value: service.id,
    label: `${service.code} - ${service.name}`,
  }))

  const productOptions = products.map((product) => ({
    value: product.id,
    label: `${product.code} - ${product.name}`,
  }))

  const productFields = productBlocks.flatMap<GenericField>((_, index) => {
    const productNumber = index + 1
    const section = `Produtos - ${productNumber}`
    const sectionDescription =
      "Selecione um produto real no cadastro. Adicione mais linhas para vincular mais produtos."

    return [
      {
        name: productFieldName(index, "id"),
        label: `Produto ${productNumber}`,
        type: "select",
        section,
        sectionDescription,
        required: index === 0 && productOptions.length > 0,
        placeholder: productOptions.length > 0 ? "Selecione um produto" : "Nenhum produto cadastrado",
        options: productOptions,
        description: productOptions.length > 0 ? "Origem: tabela de produtos." : "Cadastre produtos para habilitar esta selecao.",
        colSpan: 2,
      },
      {
        name: productFieldName(index, "code"),
        label: "Codigo do produto",
        type: "text",
        section,
        defaultValue: "",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: productFieldName(index, "name"),
        label: "Produto selecionado",
        type: "text",
        section,
        defaultValue: "",
        readOnly: true,
        autoFilled: true,
        colSpan: 2,
      },
      {
        name: productFieldName(index, "cost"),
        label: "Custo estimado (R$)",
        type: "text",
        section,
        defaultValue: "",
        readOnly: true,
        autoFilled: true,
      },
    ]
  })

  return [
    {
      name: "clientId",
      label: "Cliente",
      type: "select",
      section: "Cliente",
      sectionDescription: "Selecione um cliente real cadastrado para preencher os dados automaticamente.",
      required: clientOptions.length > 0,
      placeholder: clientOptions.length > 0 ? "Selecione um cliente" : "Nenhum cliente cadastrado",
      options: clientOptions,
      description: clientOptions.length > 0 ? "Origem: tabela de clientes." : "Cadastre clientes para habilitar esta selecao.",
      colSpan: 2,
    },
    {
      name: "clientName",
      label: "Nome do cliente",
      type: "text",
      section: "Cliente",
      readOnly: true,
      autoFilled: true,
    },
    {
      name: "clientSegment",
      label: "Segmento",
      type: "text",
      section: "Cliente",
      readOnly: true,
      autoFilled: true,
    },
    {
      name: "clientDocument",
      label: "Documento",
      type: "text",
      section: "Cliente",
      readOnly: true,
      autoFilled: true,
    },
    {
      name: "clientCity",
      label: "Cidade",
      type: "text",
      section: "Cliente",
      readOnly: true,
      autoFilled: true,
    },
    {
      name: "clientState",
      label: "UF",
      type: "text",
      section: "Cliente",
      readOnly: true,
      autoFilled: true,
    },
    {
      name: "clientContactName",
      label: "Contato",
      type: "text",
      section: "Cliente",
      readOnly: true,
      autoFilled: true,
    },
    {
      name: "clientEmail",
      label: "Email",
      type: "email",
      section: "Cliente",
      readOnly: true,
      autoFilled: true,
    },
    {
      name: "clientPhone",
      label: "Telefone",
      type: "tel",
      section: "Cliente",
      readOnly: true,
      autoFilled: true,
    },
    {
      name: "code",
      label: "Codigo da OS",
      type: "text",
      section: "Identificacao",
      sectionDescription: "Dados principais da ordem de servico.",
      defaultValue: nextCode,
      required: true,
      readOnly: true,
      disabled: true,
      autoFilled: true,
    },
    {
      name: "budgetId",
      label: "Orcamento",
      type: "select",
      section: "Identificacao",
      placeholder: budgetOptions.length > 0 ? "Selecione um orcamento" : "Nenhum orcamento cadastrado",
      options: budgetOptions,
      description: budgetOptions.length > 0 ? "Origem: tabela de orcamentos." : "Cadastre orcamentos para habilitar esta selecao.",
      colSpan: 2,
    },
    {
      name: "title",
      label: "Titulo",
      type: "text",
      section: "Identificacao",
      placeholder: "Ex: Reorganizacao de cabeamento rack 04",
      colSpan: 2,
    },
    {
      name: "description",
      label: "Descricao tecnica",
      type: "textarea",
      section: "Identificacao",
      placeholder: "Descreva escopo, restricoes e criterios de aceite.",
      colSpan: 3,
    },
    {
      name: "serviceId",
      label: "Servico",
      type: "select",
      section: "Planejamento",
      sectionDescription: "Selecione o servico real e configure os dados de execucao da OS.",
      required: serviceOptions.length > 0,
      placeholder: serviceOptions.length > 0 ? "Selecione um servico" : "Nenhum servico cadastrado",
      options: serviceOptions,
      description: serviceOptions.length > 0 ? "Origem: catalogo de servicos." : "Cadastre servicos para habilitar esta selecao.",
      colSpan: 2,
    },
    {
      name: "serviceName",
      label: "Servico selecionado",
      type: "text",
      section: "Planejamento",
      readOnly: true,
      autoFilled: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      section: "Planejamento",
      defaultValue: "scheduled",
      required: true,
      options: [
        { label: "Agendada", value: "scheduled" },
        { label: "Em andamento", value: "in_progress" },
        { label: "Aguardando pecas", value: "awaiting_parts" },
        { label: "Concluida", value: "completed" },
        { label: "Cancelada", value: "cancelled" },
      ],
    },
    {
      name: "priority",
      label: "Prioridade",
      type: "select",
      section: "Planejamento",
      defaultValue: "medium",
      required: true,
      options: [
        { label: "Baixa", value: "low" },
        { label: "Media", value: "medium" },
        { label: "Alta", value: "high" },
        { label: "Critica", value: "critical" },
      ],
    },
    {
      name: "scheduledAt",
      label: "Data e hora de agendamento",
      type: "datetime-local",
      section: "Planejamento",
      defaultValue: toDateTimeFieldValue(scheduledDate),
      required: true,
    },
    {
      name: "deadlineDate",
      label: "Prazo final",
      type: "date",
      section: "Planejamento",
      defaultValue: toDateOnly(deadlineDate),
      required: true,
    },
    {
      name: "responsible",
      label: "Responsavel",
      type: "text",
      section: "Planejamento",
      defaultValue: responsibleDefault,
      required: true,
      readOnly: true,
      disabled: true,
      autoFilled: true,
    },
    {
      name: "executionAddress",
      label: "Endereco de execucao",
      type: "text",
      section: "Planejamento",
      placeholder: "Ex: Rua das Flores, 120 - Curitiba/PR",
      required: true,
      colSpan: 2,
    },
    ...productFields,
    {
      name: "selectedProductsPreview",
      label: "Resumo dos produtos",
      type: "textarea",
      section: "Produtos - Resumo",
      sectionDescription: "Consolidado automatico dos produtos vinculados na ordem.",
      defaultValue: "",
      readOnly: true,
      autoFilled: true,
      colSpan: 3,
    },
    {
      name: "estimatedValue",
      label: "Valor previsto (R$)",
      type: "number",
      section: "Financeiro",
      sectionDescription: "Custos e apontamentos iniciais da ordem.",
      defaultValue: "0",
      required: true,
    },
    {
      name: "notes",
      label: "Observacoes internas",
      type: "textarea",
      section: "Financeiro",
      placeholder: "Anotacoes para a equipe tecnica.",
      colSpan: 3,
    },
  ]
}

function applyClientSelection(values: Record<string, string>, client: ClientsListItem | null) {
  if (!client) {
    return {
      ...values,
      clientName: "",
      clientSegment: "",
      clientDocument: "",
      clientCity: "",
      clientState: "",
      clientContactName: "",
      clientEmail: "",
      clientPhone: "",
    }
  }

  return {
    ...values,
    clientName: client.name?.trim() || "",
    clientSegment: mapClientTypeToSegment(client.type),
    clientDocument: formatCpfCnpj(client.document?.trim() || ""),
    clientCity: client.city?.trim() || "",
    clientState: client.state?.trim() || "",
    clientContactName: client.responsibleName?.trim() || "",
    clientEmail: client.responsibleEmail?.trim() || client.email?.trim() || "",
    clientPhone: formatPhoneBR(client.responsiblePhone?.trim() || client.telephone?.trim() || ""),
  }
}

function applyServiceSelection(values: Record<string, string>, service: ApiServiceCatalogItem | null) {
  if (!service) {
    return {
      ...values,
      serviceName: "",
    }
  }

  return {
    ...values,
    serviceName: service.name?.trim() || "",
    description: values.description?.trim() || service.description?.trim() || "",
  }
}

function applyProductsSelection(
  values: Record<string, string>,
  products: ProductsListItem[],
  productBlocks: ProductBlock[]
) {
  const nextValues = { ...values }
  const selectedProducts: ProductsListItem[] = []

  productBlocks.forEach((_, index) => {
    const selectedProductId = nextValues[productFieldName(index, "id")] ?? ""
    const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null

    nextValues[productFieldName(index, "code")] = selectedProduct?.code ?? ""
    nextValues[productFieldName(index, "name")] = selectedProduct?.name ?? ""
    nextValues[productFieldName(index, "cost")] = selectedProduct
      ? parseCurrencyNumber(selectedProduct.cost ?? selectedProduct.price, 0).toFixed(2)
      : ""

    if (selectedProduct) selectedProducts.push(selectedProduct)
  })

  const summary = selectedProducts.map((product) => `${product.code} - ${product.name}`).join("\n")
  const productsEstimatedValue = selectedProducts.reduce((acc, product) => {
    return acc + parseCurrencyNumber(product.price, 0)
  }, 0)
  const currentEstimatedValue = parseCurrencyNumber(values.estimatedValue, 0)

  return {
    ...nextValues,
    selectedProductsPreview: summary,
    estimatedValue:
      currentEstimatedValue <= 0 && productsEstimatedValue > 0
        ? productsEstimatedValue.toFixed(2)
        : values.estimatedValue,
  }
}

function applyBudgetSelection(values: Record<string, string>, budget: Budget | null) {
  if (!budget) {
    return values
  }

  const budgetTotalAmount = typeof budget.budgetTotalAmount === "number" ? budget.budgetTotalAmount : 0
  const suggestedAddress = [budget.client.city, budget.client.state].filter(Boolean).join(" - ")
  const serviceId = budget.serviceId?.trim() ?? ""

  return {
    ...values,
    title: budget.title?.trim() || values.title,
    description: budget.scopeSummary?.trim() || values.description,
    clientId: budget.client.id?.trim() || values.clientId,
    serviceId: serviceId || values.serviceId,
    executionAddress: values.executionAddress?.trim() || suggestedAddress,
    estimatedValue: budgetTotalAmount > 0 ? budgetTotalAmount.toFixed(2) : values.estimatedValue,
  }
}

function extractBudgetProductIds(budget: Budget | null) {
  if (!budget) return []
  return Array.from(
    new Set(
      budget.items
        .map((item) => item.productId?.trim() ?? "")
        .filter((productId) => productId.length > 0)
      )
  )
}

function applyProductIdsToValues(values: Record<string, string>, productIds: string[], blocksCount: number) {
  const nextValues = { ...values }

  for (let index = 0; index < blocksCount; index += 1) {
    nextValues[productFieldName(index, "id")] = productIds[index] ?? ""
  }

  return nextValues
}

function buildEditInitialValues(params: {
  defaults: Record<string, string>
  order: ServiceOrder
  clients: ClientsListItem[]
  services: ApiServiceCatalogItem[]
  products: ProductsListItem[]
  productBlocks: ProductBlock[]
  responsibleDefault: string
}) {
  const { defaults, order, clients, services, products, productBlocks, responsibleDefault } = params
  const nextValues = { ...defaults }

  const matchedClient = findMatchingClient(clients, order)
  const matchedService = findMatchingService(services, order)
  const productIds = order.partItems.map((item) => findMatchingProductId(products, item)).filter((id) => id.length > 0)

  nextValues.code = order.code?.trim() || defaults.code
  nextValues.budgetId = order.sourceBudgetId?.trim() || ""
  nextValues.title = order.title?.trim() || ""
  nextValues.description = order.description?.trim() || ""
  nextValues.serviceId = matchedService?.id ?? ""
  nextValues.serviceName = matchedService?.name?.trim() || order.serviceName?.trim() || ""
  nextValues.status = order.status
  nextValues.priority = order.priority
  nextValues.scheduledAt = toDateTimeLocalValue(order.scheduledAt) || defaults.scheduledAt
  nextValues.deadlineDate = toDateFieldValue(order.deadlineDate) || defaults.deadlineDate
  nextValues.responsible = order.technician?.trim() || responsibleDefault
  nextValues.executionAddress = order.executionAddress?.trim() || ""
  nextValues.estimatedValue = String(Number.isFinite(order.estimatedValue) ? order.estimatedValue : 0)
  nextValues.notes = order.notes.join("\n")
  nextValues.clientId = matchedClient?.id ?? order.client.id?.trim() ?? ""
  nextValues.clientName = matchedClient?.name?.trim() || order.client.name?.trim() || ""
  nextValues.clientSegment =
    mapClientTypeToSegment(matchedClient?.type) || order.client.segment?.trim() || ""
  nextValues.clientDocument = formatCpfCnpj(matchedClient?.document?.trim() || order.client.document?.trim() || "")
  nextValues.clientCity = matchedClient?.city?.trim() || order.client.city?.trim() || ""
  nextValues.clientState = matchedClient?.state?.trim() || order.client.state?.trim() || ""
  nextValues.clientContactName =
    matchedClient?.responsibleName?.trim() || order.client.contactName?.trim() || ""
  nextValues.clientEmail =
    matchedClient?.responsibleEmail?.trim() ||
    matchedClient?.email?.trim() ||
    order.client.email?.trim() ||
    ""
  nextValues.clientPhone = formatPhoneBR(
    matchedClient?.responsiblePhone?.trim() ||
      matchedClient?.telephone?.trim() ||
      order.client.phone?.trim() ||
      ""
  )

  const blocksCount = Math.max(1, productBlocks.length)
  const valuesWithProducts = applyProductIdsToValues(nextValues, productIds, blocksCount)
  return applyProductsSelection(valuesWithProducts, products, productBlocks)
}

function toDeadlineDateTimeOffset(value: string) {
  if (typeof value !== "string" || !value.trim()) return `${toDateOnly(new Date())}T23:59:00-03:00`

  const parsed = new Date(`${value}T23:59`)
  if (Number.isNaN(parsed.getTime())) return `${toDateOnly(new Date())}T23:59:00-03:00`

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const day = String(parsed.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}T23:59:00-03:00`
}

function mapOrderStatusToApi(status: string): CreateOrderServicePayload["status"] {
  if (status === "in_progress") return "IN_PROGRESS"
  if (status === "awaiting_parts") return "AWAITING_PARTS"
  if (status === "completed") return "COMPLETED"
  if (status === "cancelled") return "CANCELED"
  return "SCHEDULED"
}

function mapOrderPriorityToApi(priority: string): CreateOrderServicePayload["priority"] {
  if (priority === "low") return "LOW"
  if (priority === "high") return "HIGH"
  if (priority === "critical") return "CRITICAL"
  return "MEDIUM"
}

function mapProgressByStatus(status: string) {
  if (status === "completed") return 100
  if (status === "awaiting_parts") return 65
  if (status === "in_progress") return 40
  if (status === "cancelled") return 0
  return 10
}

export function FormServiceOrder({
  open,
  onClose,
  existingCodes,
  initialScheduledAt,
  mode = "create",
  orderToEdit = null,
  onCreated,
  onUpdated,
  onFeedback,
}: FormServiceOrderProps) {
  const isEditMode = mode === "edit" && Boolean(orderToEdit)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingReferences, setIsLoadingReferences] = useState(false)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)
  const [clients, setClients] = useState<ClientsListItem[]>([])
  const [products, setProducts] = useState<ProductsListItem[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [services, setServices] = useState<ApiServiceCatalogItem[]>([])
  const [apiCodes, setApiCodes] = useState<string[]>([])
  const [productBlocks, setProductBlocks] = useState<ProductBlock[]>(() => buildInitialProductBlocks())
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [isFormInitialized, setIsFormInitialized] = useState(false)
  const [hasLoadedReferences, setHasLoadedReferences] = useState(false)

  const nextCode = useMemo(() => {
    if (isEditMode && orderToEdit?.code) return orderToEdit.code
    const mergedCodes = Array.from(new Set([...existingCodes, ...apiCodes]))
    return getNextServiceOrderCode(mergedCodes)
  }, [apiCodes, existingCodes, isEditMode, orderToEdit?.code])
  const responsibleDefault = useMemo(() => getStoredHeaderUser()?.fullName?.trim() || "Usuario logado", [])
  const fields = useMemo(
    () =>
      buildFields({
        nextCode,
        responsibleDefault,
        initialScheduledAt,
        clients,
        budgets,
        services,
        products,
        productBlocks,
      }),
    [budgets, clients, initialScheduledAt, nextCode, productBlocks, products, responsibleDefault, services]
  )

  const orderSteps = useMemo<GenericFormStep[]>(
    () => [
      {
        key: "cliente",
        title: "Cliente",
        description: "Selecione o cliente real e confira os dados preenchidos automaticamente.",
        sections: ["Cliente"],
      },
      {
        key: "identificacao",
        title: "Identificacao",
        description: "Dados podem ser preenchidos automaticamente ao vincular um orcamento real.",
        sections: ["Identificacao"],
      },
      {
        key: "planejamento",
        title: "Planejamento",
        description: "Selecione servico e configure a agenda de execucao.",
        sections: ["Planejamento"],
      },
      {
        key: "produtos",
        title: "Produtos",
        description: "Selecione um ou mais produtos reais que serao vinculados na ordem de servico.",
        sectionPrefixes: ["Produtos -"],
      },
      {
        key: "financeiro",
        title: "Financeiro",
        description: "Revise valor previsto e apontamentos iniciais da ordem de servico.",
        sections: ["Financeiro"],
        submitLabel: isEditMode ? "Salvar alteracoes" : "Criar ordem",
      },
    ],
    [isEditMode]
  )

  useEffect(() => {
    if (!open) return

    let isMounted = true
    setIsLoadingReferences(true)
    setHasLoadedReferences(false)
    const orderCodesPromise = getServiceOrderCodes().catch(() => ({ data: [] as string[] }))

    void Promise.all([getClients(), getProducts(), getBudgets(), getServices(), orderCodesPromise])
      .then(([clientsResponse, productsResponse, budgetsResponse, servicesResponse, orderCodesResponse]) => {
        if (!isMounted) return
        const fetchedClients = Array.isArray(clientsResponse.data) ? clientsResponse.data : []
        const orderClientId = orderToEdit?.client.id?.trim() ?? ""
        const hasOrderClientInList = fetchedClients.some((client) => client.id === orderClientId)
        const normalizedClients =
          isEditMode && orderToEdit && orderClientId && !hasOrderClientInList
            ? [buildFallbackClientFromOrder(orderToEdit), ...fetchedClients]
            : fetchedClients

        setClients(normalizedClients)
        setProducts(productsResponse.data)
        setBudgets(budgetsResponse.data)
        setServices(servicesResponse.data)
        setApiCodes(orderCodesResponse.data)
      })
      .catch((error) => {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : "Nao foi possivel carregar os dados para a OS."
        const errorAlert = ComponentAlert.Error(message)
        setFeedback(errorAlert)
        onFeedback?.(errorAlert)
        setClients([])
        setProducts([])
        setBudgets([])
        setServices([])
        setApiCodes([])
      })
      .finally(() => {
        if (!isMounted) return
        setIsLoadingReferences(false)
        setHasLoadedReferences(true)
      })

    return () => {
      isMounted = false
    }
  }, [isEditMode, onFeedback, open, orderToEdit])

  useEffect(() => {
    if (!open) {
      setProductBlocks(buildInitialProductBlocks())
      setFormValues((prev) => {
        if (Object.keys(prev).length === 0) return prev
        return {}
      })
      setFeedback((prev) => (prev ? null : prev))
      setApiCodes((prev) => (prev.length > 0 ? [] : prev))
      setIsFormInitialized(false)
      setHasLoadedReferences(false)
      return
    }
  }, [open])

  useEffect(() => {
    if (!open || !isEditMode || !orderToEdit || isFormInitialized) return

    const blocksCount = Math.max(1, orderToEdit.partItems.length)
    setProductBlocks(Array.from({ length: blocksCount }, (_, index) => createProductBlock(index + 1)))
  }, [isEditMode, isFormInitialized, open, orderToEdit])

  useEffect(() => {
    if (!open || isFormInitialized) return

    const defaults = buildInitialValues(fields)

    if (isEditMode && orderToEdit) {
      if (isLoadingReferences || !hasLoadedReferences) return

      const initialEditValues = buildEditInitialValues({
        defaults,
        order: orderToEdit,
        clients,
        services,
        products,
        productBlocks,
        responsibleDefault,
      })
      setFormValues(initialEditValues)
      setIsFormInitialized(true)
      return
    }

    setFormValues(defaults)
    setIsFormInitialized(true)
  }, [
    clients,
    fields,
    hasLoadedReferences,
    isLoadingReferences,
    isEditMode,
    isFormInitialized,
    open,
    orderToEdit,
    productBlocks,
    products,
    responsibleDefault,
    services,
  ])

  useEffect(() => {
    if (!open || !isFormInitialized) return
    setFormValues((prev) => applyProductsSelection(prev, products, productBlocks))
  }, [isFormInitialized, open, productBlocks, products])

  useEffect(() => {
    if (!open || !isFormInitialized || isEditMode) return

    setFormValues((prev) => {
      if (prev.code === nextCode) return prev
      return {
        ...prev,
        code: nextCode,
      }
    })
  }, [isEditMode, isFormInitialized, nextCode, open])

  useEffect(() => {
    if (!open || typeof window === "undefined") return

    const previousBodyOverflow = document.body.style.overflow
    const previousBodyPaddingRight = document.body.style.paddingRight
    const previousHtmlOverflow = document.documentElement.style.overflow
    const scrollContainer =
      document.querySelector<HTMLElement>("[data-app-scroll-container]") ??
      document.querySelector<HTMLElement>("main.overflow-y-auto")
    const previousContainerOverflow = scrollContainer?.style.overflow ?? ""
    const previousContainerOverflowX = scrollContainer?.style.overflowX ?? ""
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"
    document.body.classList.add("modal-open")
    if (scrollContainer) {
      scrollContainer.style.overflow = "hidden"
      scrollContainer.style.overflowX = "hidden"
    }
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.body.style.paddingRight = previousBodyPaddingRight
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.classList.remove("modal-open")
      if (scrollContainer) {
        scrollContainer.style.overflow = previousContainerOverflow
        scrollContainer.style.overflowX = previousContainerOverflowX
      }
    }
  }, [open])

  if (!open) return null

  function handleClose(force = false) {
    if ((isSubmitting || isLoadingReferences) && !force) return
    setFeedback(null)
    onClose()
  }

  function handleAddProductBlock() {
    setProductBlocks((prev) => [...prev, createProductBlock(prev.length + 1)])
  }

  function handleRemoveLastProductBlock() {
    setProductBlocks((prev) => {
      if (prev.length <= 1) return prev
      return prev.slice(0, -1)
    })
  }

  function handleValuesChange(nextValues: Record<string, string>) {
    let normalizedValues = { ...nextValues }
    let nextProductBlocks = productBlocks
    const budgetChanged = (nextValues.budgetId ?? "") !== (formValues.budgetId ?? "")
    const clientChanged = (nextValues.clientId ?? "") !== (formValues.clientId ?? "")
    const serviceChanged = (nextValues.serviceId ?? "") !== (formValues.serviceId ?? "")
    const productsChanged = productBlocks.some(
      (_, index) =>
        (nextValues[productFieldName(index, "id")] ?? "") !== (formValues[productFieldName(index, "id")] ?? "")
    )

    if (budgetChanged) {
      const selectedBudget = budgets.find((budget) => budget.id === nextValues.budgetId) ?? null
      normalizedValues = applyBudgetSelection(normalizedValues, selectedBudget)

      const budgetProductIds = extractBudgetProductIds(selectedBudget)
      if (budgetProductIds.length > 0) {
        const nextBlocksCount = Math.max(1, budgetProductIds.length)
        if (nextBlocksCount !== productBlocks.length) {
          nextProductBlocks = Array.from({ length: nextBlocksCount }, (_, index) => createProductBlock(index + 1))
          setProductBlocks(nextProductBlocks)
        }

        normalizedValues = applyProductIdsToValues(normalizedValues, budgetProductIds, nextBlocksCount)
      }
    }

    if (clientChanged || budgetChanged) {
      const selectedClient = clients.find((client) => client.id === normalizedValues.clientId) ?? null
      normalizedValues = applyClientSelection(normalizedValues, selectedClient)
    }

    if (serviceChanged || budgetChanged) {
      const selectedService = services.find((service) => service.id === normalizedValues.serviceId) ?? null
      normalizedValues = applyServiceSelection(normalizedValues, selectedService)
    }

    if (productsChanged || budgetChanged) {
      normalizedValues = applyProductsSelection(normalizedValues, products, nextProductBlocks)
    }

    setFormValues(normalizedValues)
  }

  async function handleSubmit(values: Record<string, string>) {
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const selectedClient = clients.find((client) => client.id === values.clientId) ?? null
      const selectedService = services.find((service) => service.id === values.serviceId) ?? null
      const selectedBudget = budgets.find((budget) => budget.id === values.budgetId) ?? null
      const selectedProducts = productBlocks
        .map((_, index) => values[productFieldName(index, "id")] ?? "")
        .map((productId) => products.find((product) => product.id === productId) ?? null)
        .filter((product): product is ProductsListItem => Boolean(product))

      const now = new Date()
      const nowDate = toDateOnly(now)
      const orderId = globalThis.crypto?.randomUUID?.() ?? `so-${Date.now()}`
      const timelineId = globalThis.crypto?.randomUUID?.() ?? `timeline-${Date.now()}`
      const laborId = globalThis.crypto?.randomUUID?.() ?? `labor-${Date.now()}`
      const code = values.code?.trim()
      if (!code) throw new Error("Codigo da OS e obrigatorio.")

      const clientId = selectedClient?.id ?? values.clientId?.trim()
      if (!clientId) throw new Error("Selecione um cliente para criar a OS.")

      const checklist = parseMultiline(values.checklist)
      const notes = parseMultiline(values.notes)
      const estimatedValue = Math.max(0, parseCurrencyNumber(values.estimatedValue, 0))
      const safeEstimatedValue = Number(estimatedValue.toFixed(2))
      const serviceName = selectedService?.name?.trim() || values.serviceName?.trim() || "Servico tecnico"
      const responsibleName = values.responsible?.trim() || responsibleDefault
      const orderTitle =
        values.title?.trim() ||
        selectedBudget?.title?.trim() ||
        `OS ${code} - ${serviceName}`
      const orderDescription =
        values.description?.trim() ||
        selectedBudget?.scopeSummary?.trim() ||
        selectedService?.description?.trim() ||
        `Execucao do servico ${serviceName}.`
      const serviceDurationHours = parseDurationToHours(selectedService?.estimated_duration ?? "")
      const estimatedHours = serviceDurationHours > 0 ? Math.max(1, Math.round(serviceDurationHours)) : 4
      const serviceInternalCost = parseCurrencyNumber(selectedService?.internal_cost, 0)
      const hourlyCost =
        serviceInternalCost > 0 ? Number((serviceInternalCost / estimatedHours).toFixed(2)) : 140

      const orderProductsPayload = selectedProducts.map((product) => {
        const unitCost = Math.max(0, parseCurrencyNumber(product.cost ?? product.price, 0))
        const quantity = 1
        return {
          product_id: product.id,
          description: product.name,
          quantity,
          unit_cost: unitCost,
          total_cost: Number((unitCost * quantity).toFixed(2)),
          status: "planned",
        }
      })

      const partItems = selectedProducts.map((product, index) => ({
        id: globalThis.crypto?.randomUUID?.() ?? `part-${Date.now()}-${index}`,
        sku: product.code,
        description: product.name,
        quantity: 1,
        unitCost: Math.max(0, parseCurrencyNumber(product.cost ?? product.price, 0)),
        status: "planned" as const,
      }))

      const fallbackClientSegment = selectedClient ? mapClientTypeToSegment(selectedClient.type) : ""
      const fallbackExecutionAddress = selectedClient
        ? [selectedClient.city, selectedClient.state].filter(Boolean).join(" - ")
        : ""

      const productsTotalCost = orderProductsPayload.reduce((acc, product) => acc + product.total_cost, 0)
      const estimatedLaborCost = serviceInternalCost > 0 ? serviceInternalCost : hourlyCost * estimatedHours
      const totalCost = Number((productsTotalCost + estimatedLaborCost).toFixed(2))
      const marginValue = Number((safeEstimatedValue - totalCost).toFixed(2))
      const marginPercent = safeEstimatedValue > 0 ? Number(((marginValue / safeEstimatedValue) * 100).toFixed(2)) : 0
      const scheduleAt = toDateTimeOffset(values.scheduledAt)
      const orderStatus = values.status?.trim() || "scheduled"
      const timelineAction = isEditMode ? "atualizada" : "cadastrada"
      const timelineEvent = isEditMode ? "OS atualizada" : "OS criada"
      const timelineNotes = `Ordem ${code} ${timelineAction} com status ${orderStatus}.${
        selectedService ? ` Servico: ${selectedService.name}.` : ""
      }`

      const serviceCodeFallback = `SVC-${code.replace("OS-", "") || Date.now()}-01`
      const serviceCatalogStatus =
        typeof selectedService?.status === "string" && selectedService.status.trim()
          ? selectedService.status.trim()
          : "ACTIVE"

      const orderServicesPayload = selectedService
        ? [
            {
              service_catalog_id: selectedService.id,
              code: selectedService.code?.trim() || serviceCodeFallback,
              name: serviceName,
              category: selectedService.category?.trim() || "Servico tecnico",
              service_type: selectedService.service_type?.trim() || "tecnico",
              billing_model: selectedService.billing_model?.trim() || "project",
              billing_unit: selectedService.billing_unit?.trim() || "unidade",
              estimated_duration: selectedService.estimated_duration?.trim() || `${estimatedHours}h`,
              complexity_level: selectedService.complexity_level?.trim() || "media",
              responsible: responsibleName,
              catalog_status: serviceCatalogStatus,
              is_completed: orderStatus === "completed",
              completed_at: orderStatus === "completed" ? now.toISOString() : null,
              sort_order: 1,
            },
          ]
        : []

      const budgetId = selectedBudget?.id ?? values.budgetId?.trim() ?? ""
      const serviceId = selectedService?.id ?? values.serviceId?.trim() ?? ""

      const payload: CreateOrderServicePayload = {
        budget_id: budgetId || null,
        client_id: clientId,
        service_id: serviceId || null,
        code,
        title: orderTitle,
        description: orderDescription,
        status: mapOrderStatusToApi(orderStatus),
        priority: mapOrderPriorityToApi(values.priority),
        term: toDeadlineDateTimeOffset(values.deadlineDate),
        scheduling: scheduleAt,
        responsible: responsibleName,
        checklist,
        progress: mapProgressByStatus(orderStatus),
        total_cost: totalCost,
        total_value: safeEstimatedValue,
        margin_value: marginValue,
        margin_percent: marginPercent,
        services: orderServicesPayload,
        products: orderProductsPayload,
        timeline: [
          {
            author_name: responsibleName,
            event: timelineEvent,
            notes: timelineNotes,
            event_at: now.toISOString(),
          },
        ],
      }

      if (isEditMode && orderToEdit) {
        const updateResponse = await updateOrderService(orderToEdit.id, payload)

        const updatedOrder: ServiceOrder = {
          ...orderToEdit,
          code,
          title: orderTitle,
          description: orderDescription,
          status: values.status as ServiceOrder["status"],
          priority: values.priority as ServiceOrder["priority"],
          updatedAt: nowDate,
          scheduledAt: scheduleAt,
          deadlineDate: values.deadlineDate,
          concludedAt: values.status === "completed" ? nowDate : null,
          technician: responsibleName,
          serviceName,
          sourceBudgetId: selectedBudget?.id?.trim() || null,
          sourceBudgetCode: selectedBudget?.code?.trim() || null,
          executionAddress: values.executionAddress?.trim() || fallbackExecutionAddress,
          estimatedValue: safeEstimatedValue,
          checklist,
          notes,
          client: {
            id: clientId,
            name: selectedClient?.name?.trim() || values.clientName.trim(),
            segment: values.clientSegment.trim() || fallbackClientSegment || "Nao informado",
            document: formatCpfCnpj(selectedClient?.document?.trim() || values.clientDocument.trim()),
            city: selectedClient?.city?.trim() || values.clientCity.trim(),
            state: selectedClient?.state?.trim() || values.clientState.trim().toUpperCase(),
            contactName: selectedClient?.responsibleName?.trim() || values.clientContactName.trim(),
            email:
              selectedClient?.responsibleEmail?.trim() ||
              selectedClient?.email?.trim() ||
              values.clientEmail.trim(),
            phone: formatPhoneBR(
              selectedClient?.responsiblePhone?.trim() ||
                selectedClient?.telephone?.trim() ||
                values.clientPhone.trim()
            ),
          },
          laborItems: [
            {
              id: orderToEdit.laborItems[0]?.id || laborId,
              description: `Execucao tecnica - ${serviceName}`,
              technician: responsibleName,
              estimatedHours,
              workedHours: orderToEdit.laborItems[0]?.workedHours ?? 0,
              hourlyCost,
              status: values.status === "completed" ? "done" : "pending",
            },
          ],
          partItems,
          timeline: [
            ...orderToEdit.timeline,
            {
              id: timelineId,
              at: scheduleAt,
              author: "Sistema",
              event: timelineEvent,
              notes: timelineNotes,
            },
          ],
        }

        onUpdated?.(updatedOrder)

        const successMessage = updateResponse.message?.trim()
          ? updateResponse.message
          : `Ordem ${updatedOrder.code} atualizada com sucesso.`
        const successAlert = ComponentAlert.Success(successMessage)
        onFeedback?.(successAlert)
        handleClose(true)
      } else {
        const createResponse = await createOrderService(payload)
        const persistedOrderId =
          typeof createResponse.data?.id === "string" && createResponse.data.id.trim() ? createResponse.data.id : orderId

        const createdOrder: ServiceOrder = {
          id: persistedOrderId,
          code,
          title: orderTitle,
          description: orderDescription,
          status: values.status as ServiceOrder["status"],
          priority: values.priority as ServiceOrder["priority"],
          createdAt: nowDate,
          updatedAt: nowDate,
          scheduledAt: scheduleAt,
          deadlineDate: values.deadlineDate,
          concludedAt: values.status === "completed" ? nowDate : null,
          coordinator: responsibleName,
          technician: responsibleName,
          serviceName,
          sourceBudgetId: selectedBudget?.id?.trim() || null,
          sourceBudgetCode: selectedBudget?.code?.trim() || null,
          executionAddress: values.executionAddress?.trim() || fallbackExecutionAddress,
          estimatedValue: safeEstimatedValue,
          checklist,
          notes,
          client: {
            id: clientId,
            name: selectedClient?.name?.trim() || values.clientName.trim(),
            segment: values.clientSegment.trim() || fallbackClientSegment || "Nao informado",
            document: formatCpfCnpj(selectedClient?.document?.trim() || values.clientDocument.trim()),
            city: selectedClient?.city?.trim() || values.clientCity.trim(),
            state: selectedClient?.state?.trim() || values.clientState.trim().toUpperCase(),
            contactName: selectedClient?.responsibleName?.trim() || values.clientContactName.trim(),
            email:
              selectedClient?.responsibleEmail?.trim() ||
              selectedClient?.email?.trim() ||
              values.clientEmail.trim(),
            phone: formatPhoneBR(
              selectedClient?.responsiblePhone?.trim() ||
                selectedClient?.telephone?.trim() ||
                values.clientPhone.trim()
            ),
          },
          laborItems: [
            {
              id: laborId,
              description: `Execucao tecnica - ${serviceName}`,
              technician: responsibleName,
              estimatedHours,
              workedHours: 0,
              hourlyCost,
              status: "pending",
            },
          ],
          partItems,
          timeline: [
            {
              id: timelineId,
              at: scheduleAt,
              author: "Sistema",
              event: timelineEvent,
              notes: timelineNotes,
            },
          ],
        }

        onCreated?.(createdOrder)

        const successMessage = createResponse.message?.trim()
          ? createResponse.message
          : `Ordem ${createdOrder.code} criada com sucesso.`
        const successAlert = ComponentAlert.Success(successMessage)
        onFeedback?.(successAlert)
        setApiCodes((prev) => (prev.includes(createdOrder.code) ? prev : [...prev, createdOrder.code]))
        handleClose(true)
      }
    } catch (error) {
      const fallbackMessage = isEditMode
        ? "Nao foi possivel atualizar a ordem de servico."
        : "Nao foi possivel criar a ordem de servico."
      const message = error instanceof Error ? error.message : fallbackMessage
      const errorAlert = ComponentAlert.Error(message)
      setFeedback(errorAlert)
      onFeedback?.(errorAlert)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-background/60 p-3 backdrop-blur-sm sm:p-6">
      <div className="absolute inset-0" onClick={() => handleClose()} aria-hidden="true" />

      <div className="relative z-10 flex min-h-full items-start justify-center overflow-x-hidden py-1 sm:items-center sm:py-3">
        <div className="flex h-[calc(100dvh-1.25rem)] w-full max-w-[calc(100vw-1.5rem)] flex-col gap-3 sm:h-[calc(100dvh-2rem)] sm:max-w-5xl">
          <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

          <FormComponent
            title={isEditMode ? "Editar ordem de servico" : "Cadastrar ordem de servico"}
            description={
              isEditMode
                ? "Atualize os campos da ordem de servico e salve as alteracoes."
                : "Preencha os dados por etapas para concluir a criacao da ordem de servico."
            }
            fields={fields}
            steps={orderSteps}
            renderStepHeaderActions={({ step }) =>
              step.key === "produtos" ? (
                <>
                  <Button
                    type="button"
                    className="rounded-xl"
                    onClick={handleAddProductBlock}
                    disabled={isLoadingReferences}
                  >
                    Adicionar produto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={handleRemoveLastProductBlock}
                    disabled={productBlocks.length <= 1 || isLoadingReferences}
                  >
                    Remover ultimo produto
                  </Button>
                </>
              ) : null
            }
            values={formValues}
            onValuesChange={handleValuesChange}
            submitLabel={isLoadingReferences ? "Carregando dados..." : isEditMode ? "Salvar alteracoes" : "Criar ordem"}
            cancelLabel="Fechar"
            scrollable
            className="h-full min-h-0 flex-1"
            loading={isSubmitting || isLoadingReferences}
            onHeaderClose={() => handleClose()}
            onCancel={() => handleClose()}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}
