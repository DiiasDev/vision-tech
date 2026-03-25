"use client"

import { useEffect, useMemo, useState } from "react"

import { calculateBudgetFinancials, type Budget, type BudgetPriority, type BudgetStatus } from "@/components/budget/budget-mock-data"
import { parseDurationToHours } from "@/components/services/catalog/catalog-mappers"
import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import FormComponent, { type GenericField, type GenericFormStep } from "@/components/layout/formComponent"
import { Button } from "@/components/ui/button"
import { getStoredHeaderUser } from "@/lib/auth-session"
import { createBudget, type CreateBudgetItemPayload, type CreateBudgetPayload, updateBudget } from "@/services/budgets.service"
import { getClients, type ClientsListItem } from "@/services/clients.service"
import { getProducts, type ProductsListItem } from "@/services/products.service"
import { getServices, type ApiServiceCatalogItem } from "@/services/services.service"
import { formatCpfCnpj, formatCurrencyBR, formatPhoneBR } from "@/utils/Formatter"

type FormBudgetProps = {
  open: boolean
  onClose: () => void
  existingCodes: string[]
  mode?: "create" | "edit"
  budgetToEdit?: Budget | null
  onCreated?: (budget: Budget) => void
  onUpdated?: (budget: Budget) => void
  onFeedback?: (feedback: ComponentAlertState) => void
}

type ItemBlock = {
  id: string
}

type ParsedBudgetItem = {
  index: number
  productId: string | null
  productCode: string
  productName: string
  unitOfMeasure: string
  quantity: number
  discount: number
  estimatedHours: number
  deliveryWindow: string
  unitPrice: number
  internalCost: number
  grossTotal: number
  netTotal: number
  costTotal: number
  margin: number
}

type BudgetFinancialSummary = {
  parsedItems: ParsedBudgetItem[]
  productsGrossTotal: number
  productsDefaultTotal: number
  productsDefaultCost: number
  productsTotal: number
  productsCost: number
  serviceTotal: number
  serviceCost: number
  budgetDiscount: number
  budgetTotalCost: number
  budgetTotal: number
  budgetProfitPercent: number
}

const MANUAL_AMOUNT_FIELDS = [
  "productsTotalAmount",
  "productsCostAmount",
  "serviceTotalAmount",
  "serviceCostAmount",
  "budgetDiscount",
] as const

const EDIT_MANUAL_AMOUNT_OVERRIDES: Partial<Record<(typeof MANUAL_AMOUNT_FIELDS)[number], boolean>> = {
  productsTotalAmount: true,
  productsCostAmount: true,
  serviceTotalAmount: true,
  serviceCostAmount: true,
  budgetDiscount: true,
}

const LOCKED_EDIT_FIELDS = new Set([
  "code",
  "serviceCode",
  "owner",
  "itemsCount",
  "itemsSubtotal",
  "itemsEstimatedCost",
  "itemsEstimatedMargin",
  "itemsPreview",
  "budgetTotalCostAmount",
  "budgetTotalAmount",
  "budgetProfitPercent",
  "reviewSummary",
  "generateMessage",
])

function isLockedItemField(fieldName: string) {
  return /^item_\d+_(code|name|category|brand|supplier|unitOfMeasure|location|unitPrice|internalCost|total|margin)$/.test(
    fieldName
  )
}

function toDateOnly(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function addDays(base: Date, days: number) {
  const next = new Date(base)
  next.setDate(next.getDate() + days)
  return next
}

function parseInteger(value: string, fallback = 0) {
  const parsed = Number.parseInt((value ?? "").trim(), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseCurrencyNumber(value: string, fallback = 0) {
  const raw = (value ?? "").trim()
  if (!raw) return fallback

  const compact = raw.replace(/[^\d,.-]/g, "")
  const normalized = compact.includes(",") ? compact.replace(/\./g, "").replace(",", ".") : compact
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : fallback
}

function formatEditableAmount(value: number) {
  if (!Number.isFinite(value)) return "0.00"
  return value.toFixed(2)
}

function formatCurrencyInputValue(value: string) {
  const raw = (value ?? "").trim()
  if (!raw) return ""

  const parsed = parseCurrencyNumber(raw, Number.NaN)
  if (Number.isNaN(parsed)) return value
  return formatCurrencyBR(parsed)
}

function formatCurrencyValue(value: string | number | null | undefined, fallback = "R$ 0,00") {
  if (typeof value === "number" && Number.isFinite(value)) return formatCurrencyBR(value)
  if (typeof value === "string" && value.trim()) {
    const parsed = parseCurrencyNumber(value, Number.NaN)
    if (!Number.isNaN(parsed)) return formatCurrencyBR(parsed)
  }
  return fallback
}

function formatPercentValue(value: number) {
  if (!Number.isFinite(value)) return "0,00%"
  return `${value.toFixed(2).replace(".", ",")}%`
}

function calculateBudgetFinancialSummary(
  values: Record<string, string>,
  itemBlocks: ItemBlock[],
  products: ProductsListItem[],
  manualAmountOverrides: Partial<Record<(typeof MANUAL_AMOUNT_FIELDS)[number], boolean>> = {}
): BudgetFinancialSummary {
  const parsedItems = buildParsedItems(values, itemBlocks, products)

  const productsGrossTotal = parsedItems.reduce((acc, item) => acc + item.grossTotal, 0)
  const productsDefaultTotal = parsedItems.reduce((acc, item) => acc + item.netTotal, 0)
  const productsDefaultCost = parsedItems.reduce((acc, item) => acc + item.costTotal, 0)
  const productsTotal = manualAmountOverrides.productsTotalAmount
    ? Math.max(0, parseCurrencyNumber(values.productsTotalAmount, productsDefaultTotal))
    : Math.max(0, productsDefaultTotal)
  const productsCost = manualAmountOverrides.productsCostAmount
    ? Math.max(0, parseCurrencyNumber(values.productsCostAmount, productsDefaultCost))
    : Math.max(0, productsDefaultCost)

  const serviceTotalFallback = Math.max(0, parseCurrencyNumber(values.serviceBasePrice, 0))
  const serviceCostFallback = Math.max(0, parseCurrencyNumber(values.serviceInternalCost, 0))
  const serviceTotal = manualAmountOverrides.serviceTotalAmount
    ? Math.max(0, parseCurrencyNumber(values.serviceTotalAmount, serviceTotalFallback))
    : serviceTotalFallback
  const serviceCost = manualAmountOverrides.serviceCostAmount
    ? Math.max(0, parseCurrencyNumber(values.serviceCostAmount, serviceCostFallback))
    : serviceCostFallback

  const budgetDiscount = manualAmountOverrides.budgetDiscount
    ? Math.max(0, parseCurrencyNumber(values.budgetDiscount, 0))
    : 0
  const budgetTotalCost = Math.max(0, productsCost + serviceCost)
  const budgetTotal = Math.max(0, productsTotal + serviceTotal - budgetDiscount)
  const budgetProfitPercent = budgetTotal > 0 ? ((budgetTotal - budgetTotalCost) / budgetTotal) * 100 : 0

  return {
    parsedItems,
    productsGrossTotal,
    productsDefaultTotal,
    productsDefaultCost,
    productsTotal,
    productsCost,
    serviceTotal,
    serviceCost,
    budgetDiscount,
    budgetTotalCost,
    budgetTotal,
    budgetProfitPercent,
  }
}

function parseMultiline(value: string) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function parseAttachments(value: string) {
  return (value ?? "")
    .split(/[\r\n,;]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function getNextBudgetCode(codes: string[]) {
  const maxCodeNumber = codes.reduce((max, current) => {
    const normalized = current.trim()
    const standardMatch = /^ORC-(\d{4})$/i.exec(normalized)
    const legacyMatch = /^ORC-\d{4}-(\d+)$/i.exec(normalized)

    const rawNumber = standardMatch?.[1] ?? legacyMatch?.[1] ?? "0"
    const parsed = Number.parseInt(rawNumber, 10)
    if (!Number.isFinite(parsed)) return max
    return Math.max(max, parsed)
  }, 0)

  const nextNumber = maxCodeNumber + 1
  return `ORC-${String(nextNumber).padStart(4, "0")}`
}

function toDateFieldValue(value: string | null | undefined) {
  if (!value || !value.trim()) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return toDateOnly(parsed)
}

function mapClientTypeToSegment(type: ClientsListItem["type"] | undefined) {
  if (type === "PF") return "Pessoa Fisica"
  if (type === "PJ") return "Pessoa Juridica"
  return ""
}

function mapProductCategoryLabel(category: ProductsListItem["category"]) {
  const labels: Record<ProductsListItem["category"], string> = {
    HARDWARE: "Hardware",
    SOFTWARE: "Software",
    SERVICES: "Servicos",
    PERIPHERALS: "Perifericos",
    LICENSES: "Licencas",
    INFRASTRUCTURE: "Infraestrutura",
    OTHERS: "Outros",
  }
  return labels[category] ?? category
}

function mapServiceBillingModelLabel(value: string | null | undefined) {
  const normalized = value?.trim().toUpperCase()
  if (normalized === "RECURRING") return "Recorrente"
  if (normalized === "HOURLY") return "Hora tecnica"
  return "Projeto"
}

function mapServiceStatusLabel(value: string | null | undefined) {
  const normalized = value?.trim().toUpperCase()
  if (normalized === "INACTIVE") return "Inativo"
  if (normalized === "DRAFT") return "Rascunho"
  return "Ativo"
}

function normalizeLookupText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
}

function findMatchingClientFromBudget(clients: ClientsListItem[], budget: Budget) {
  const budgetClientId = budget.client.id?.trim()
  const budgetClientName = normalizeLookupText(budget.client.name)

  return (
    clients.find((client) => client.id === budgetClientId) ??
    clients.find((client) => normalizeLookupText(client.name) === budgetClientName) ??
    clients.find((client) => normalizeLookupText(client.name).includes(budgetClientName)) ??
    null
  )
}

function findMatchingServiceFromBudget(services: ApiServiceCatalogItem[], budget: Budget) {
  const budgetServiceId = budget.serviceId?.trim()
  const budgetServiceCode = normalizeLookupText(budget.serviceCode)
  const budgetServiceName = normalizeLookupText(budget.serviceName)

  return (
    services.find((service) => service.id === budgetServiceId) ??
    services.find((service) => normalizeLookupText(service.code) === budgetServiceCode) ??
    services.find((service) => normalizeLookupText(service.name) === budgetServiceName) ??
    services.find((service) => normalizeLookupText(service.name).includes(budgetServiceName)) ??
    null
  )
}

function toBudgetStatus(value: string): BudgetStatus {
  if (value === "draft" || value === "sent" || value === "negotiation" || value === "approved" || value === "rejected" || value === "expired") {
    return value
  }
  return "draft"
}

function toBudgetPriority(value: string): BudgetPriority {
  if (value === "low" || value === "medium" || value === "high") return value
  return "medium"
}

function buildInitialValues(fields: GenericField[]) {
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.name] = field.defaultValue ?? ""
    return acc
  }, {})
}

function itemFieldName(index: number, key: string) {
  return `item_${index}_${key}`
}

function createItemBlock(index: number): ItemBlock {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `item-${Date.now()}-${index}`,
  }
}

function buildInitialItemBlocks() {
  return [createItemBlock(1)]
}

function buildParsedItems(values: Record<string, string>, itemBlocks: ItemBlock[], products: ProductsListItem[]) {
  const productsById = new Map(products.map((product) => [product.id, product]))

  const parsed: ParsedBudgetItem[] = []

  itemBlocks.forEach((_, index) => {
    const productId = values[itemFieldName(index, "productId")]?.trim() || ""
    const product = productId ? productsById.get(productId) : undefined
    const productCode = values[itemFieldName(index, "code")]?.trim() || product?.code?.trim() || `ITEM-${index + 1}`
    const productName =
      values[itemFieldName(index, "name")]?.trim() ||
      values[itemFieldName(index, "description")]?.trim() ||
      product?.name?.trim() ||
      "Item nao informado"
    const unitOfMeasure =
      values[itemFieldName(index, "unitOfMeasure")]?.trim() ||
      product?.unitOfMeasure?.trim() ||
      "un"
    const hasMeaningfulData = Boolean(
      productId ||
        values[itemFieldName(index, "name")]?.trim() ||
        values[itemFieldName(index, "description")]?.trim() ||
        values[itemFieldName(index, "code")]?.trim() ||
        values[itemFieldName(index, "unitPrice")]?.trim() ||
        values[itemFieldName(index, "internalCost")]?.trim()
    )
    if (!hasMeaningfulData) return

    const quantity = Math.max(1, parseInteger(values[itemFieldName(index, "quantity")], 1))
    const discount = Math.max(0, parseCurrencyNumber(values[itemFieldName(index, "discount")], 0))
    const estimatedHours = Math.max(1, parseInteger(values[itemFieldName(index, "estimatedHours")], 8))
    const deliveryWindow = values[itemFieldName(index, "deliveryWindow")]?.trim() || "A definir"
    const unitPrice = Math.max(
      0,
      parseCurrencyNumber(values[itemFieldName(index, "unitPrice")] ?? "", parseCurrencyNumber(product?.price ?? "", 0))
    )
    const internalCost = Math.max(
      0,
      parseCurrencyNumber(
        values[itemFieldName(index, "internalCost")] ?? "",
        parseCurrencyNumber(product?.cost ?? "0", 0)
      )
    )
    const grossTotal = quantity * unitPrice
    const netTotal = Math.max(0, grossTotal - discount)
    const costTotal = quantity * internalCost
    const margin = netTotal - costTotal

    parsed.push({
      index,
      productId: productId || null,
      productCode,
      productName,
      unitOfMeasure,
      quantity,
      discount,
      estimatedHours,
      deliveryWindow,
      unitPrice,
      internalCost,
      grossTotal,
      netTotal,
      costTotal,
      margin,
    })
  })

  return parsed
}

function buildItemPayloads(values: Record<string, string>, itemBlocks: ItemBlock[], products: ProductsListItem[]) {
  const productsById = new Map(products.map((product) => [product.id, product]))
  const payloadItems: CreateBudgetItemPayload[] = []

  itemBlocks.forEach((_, index) => {
    const productId = values[itemFieldName(index, "productId")]?.trim() || ""
    const fallbackProduct = productId ? productsById.get(productId) : undefined
    const code = values[itemFieldName(index, "code")]?.trim() || fallbackProduct?.code?.trim() || null

    const description =
      values[itemFieldName(index, "name")]?.trim() ||
      values[itemFieldName(index, "description")]?.trim() ||
      fallbackProduct?.name?.trim() ||
      ""
    const category = values[itemFieldName(index, "category")]?.trim() || mapProductCategoryLabel(fallbackProduct?.category ?? "OTHERS")
    const quantity = Math.max(1, parseInteger(values[itemFieldName(index, "quantity")], 1))
    const unitPrice = Math.max(
      0,
      parseCurrencyNumber(
        values[itemFieldName(index, "unitPrice")] ?? "",
        parseCurrencyNumber(fallbackProduct?.price ?? "", 0)
      )
    )
    const discount = Math.max(0, parseCurrencyNumber(values[itemFieldName(index, "discount")], 0))
    const internalCost = Math.max(
      0,
      parseCurrencyNumber(
        values[itemFieldName(index, "internalCost")] ?? "",
        parseCurrencyNumber(fallbackProduct?.cost ?? "0", 0)
      )
    )
    const estimatedHours = Math.max(1, parseInteger(values[itemFieldName(index, "estimatedHours")], 8))
    const deliveryWindow = values[itemFieldName(index, "deliveryWindow")]?.trim() || "A definir"
    const hasMeaningfulData = Boolean(
      productId ||
        description ||
        values[itemFieldName(index, "category")]?.trim() ||
        values[itemFieldName(index, "unitPrice")]?.trim() ||
        values[itemFieldName(index, "internalCost")]?.trim() ||
        values[itemFieldName(index, "quantity")]?.trim()
    )

    if (!hasMeaningfulData) return

    payloadItems.push({
      productId: productId || undefined,
      code,
      description: description || "Item nao informado",
      category: category || undefined,
      quantity,
      unitPrice,
      discount,
      internalCost,
      estimatedHours,
      deliveryWindow,
    })
  })

  return payloadItems
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
      clientContactRole: "",
      clientEmail: "",
      clientPhone: "",
    }
  }

  return {
    ...values,
    clientName: client.name ?? "",
    clientSegment: mapClientTypeToSegment(client.type),
    clientDocument: formatCpfCnpj(client.document ?? ""),
    clientCity: client.city ?? "",
    clientState: client.state ?? "",
    clientContactName: client.responsibleName ?? client.name ?? "",
    clientContactRole: client.responsibleName ? "Responsavel comercial do cliente" : "Contato principal",
    clientEmail: client.responsibleEmail ?? client.email ?? "",
    clientPhone: formatPhoneBR(client.responsiblePhone ?? client.telephone ?? ""),
  }
}

function applyServiceSelection(values: Record<string, string>, service: ApiServiceCatalogItem | null) {
  if (!service) {
    return {
      ...values,
      serviceCode: "",
      serviceName: "",
      serviceDescription: "",
      serviceCategory: "",
      serviceBillingModel: "",
      serviceBasePrice: "",
      serviceInternalCost: "",
      serviceEstimatedDuration: "",
      serviceResponsible: "",
      serviceStatus: "",
    }
  }

  return {
    ...values,
    serviceCode: service.code ?? "",
    serviceName: service.name ?? "",
    serviceDescription: service.description ?? "",
    serviceCategory: service.category ?? "",
    serviceBillingModel: mapServiceBillingModelLabel(service.billing_model),
    serviceBasePrice: formatCurrencyValue(service.base_price),
    serviceInternalCost: formatCurrencyValue(service.internal_cost),
    serviceEstimatedDuration: service.estimated_duration ?? "",
    serviceResponsible: service.responsible?.trim() || "Responsavel padrao",
    serviceStatus: mapServiceStatusLabel(service.status),
    scopeSummary: service.description?.trim() || values.scopeSummary || "",
    slaSummary:
      service.name?.trim() && service.estimated_duration?.trim()
        ? `Execucao do servico ${service.name} com janela estimada de ${service.estimated_duration}.`
        : values.slaSummary || "",
  }
}

function applyProductToItem(values: Record<string, string>, index: number, product: ProductsListItem | null) {
  if (!product) {
    return {
      ...values,
      [itemFieldName(index, "code")]: "",
      [itemFieldName(index, "name")]: "",
      [itemFieldName(index, "description")]: "",
      [itemFieldName(index, "category")]: "",
      [itemFieldName(index, "brand")]: "",
      [itemFieldName(index, "supplier")]: "",
      [itemFieldName(index, "unitOfMeasure")]: "",
      [itemFieldName(index, "location")]: "",
      [itemFieldName(index, "unitPrice")]: "",
      [itemFieldName(index, "internalCost")]: "",
      [itemFieldName(index, "total")]: "R$ 0,00",
      [itemFieldName(index, "margin")]: "R$ 0,00",
    }
  }

  return {
    ...values,
    [itemFieldName(index, "code")]: product.code ?? "",
    [itemFieldName(index, "name")]: product.name ?? "",
    [itemFieldName(index, "description")]: product.description ?? "",
    [itemFieldName(index, "category")]: mapProductCategoryLabel(product.category),
    [itemFieldName(index, "brand")]: product.brand ?? "",
    [itemFieldName(index, "supplier")]: product.supplier ?? "",
    [itemFieldName(index, "unitOfMeasure")]: product.unitOfMeasure ?? "",
    [itemFieldName(index, "location")]: product.location ?? "",
    [itemFieldName(index, "unitPrice")]: formatCurrencyValue(product.price),
    [itemFieldName(index, "internalCost")]: formatCurrencyValue(product.cost ?? 0),
  }
}

function buildReviewSummary(values: Record<string, string>, parsedItems: ParsedBudgetItem[]) {
  const clientName = values.clientName?.trim() || "Nao informado"
  const serviceName = values.serviceName?.trim() || "Nao informado"
  const owner = values.owner?.trim() || "Nao informado"
  const validUntil = values.validUntil?.trim() || "Nao informado"
  const approvalDate = values.approvalDate?.trim() || "Nao informada"
  const deliveryTerm = values.deliveryTerm?.trim() || "Nao informado"
  const productsTotalLabel = formatCurrencyBR(Math.max(0, parseCurrencyNumber(values.productsTotalAmount, 0)))
  const productsCostLabel = formatCurrencyBR(Math.max(0, parseCurrencyNumber(values.productsCostAmount, 0)))
  const serviceTotalLabel = formatCurrencyBR(Math.max(0, parseCurrencyNumber(values.serviceTotalAmount, 0)))
  const serviceCostLabel = formatCurrencyBR(Math.max(0, parseCurrencyNumber(values.serviceCostAmount, 0)))
  const totalCostLabel = formatCurrencyBR(Math.max(0, parseCurrencyNumber(values.budgetTotalCostAmount, 0)))
  const discountLabel = formatCurrencyBR(Math.max(0, parseCurrencyNumber(values.budgetDiscount, 0)))
  const totalBudgetLabel = formatCurrencyBR(Math.max(0, parseCurrencyNumber(values.budgetTotalAmount, 0)))
  const profitPercentLabel = values.budgetProfitPercent?.trim() || "0,00%"

  const lines = [
    "RESUMO DO ORCAMENTO",
    "===================",
    "",
    "CLIENTE E PRAZO",
    `- Cliente: ${clientName}`,
    `- Servico: ${serviceName}`,
    `- Responsavel: ${owner}`,
    `- Validade: ${validUntil}`,
    `- Data de aprovacao: ${approvalDate}`,
    `- Prazo de entrega: ${deliveryTerm}`,
    "",
    "FINANCEIRO",
    `- Total produtos: ${productsTotalLabel}`,
    `- Custo produtos: ${productsCostLabel}`,
    `- Total servicos: ${serviceTotalLabel}`,
    `- Custo servicos: ${serviceCostLabel}`,
    `- Custo total: ${totalCostLabel}`,
    `- Desconto aplicado: ${discountLabel}`,
    `- Total orcamento: ${totalBudgetLabel}`,
    `- % de lucro: ${profitPercentLabel}`,
    "",
    `ITENS SELECIONADOS (${parsedItems.length})`,
  ]

  if (parsedItems.length === 0) {
    lines.push("- Nenhum item selecionado.")
  } else {
    parsedItems.forEach((item, index) => {
      const unitLabel = item.unitOfMeasure?.trim() || "un"
      lines.push(`${index + 1}. ${item.productCode} - ${item.productName}`)
      lines.push(`   Qtd: ${item.quantity} ${unitLabel} | Total: ${formatCurrencyBR(item.netTotal)}`)
    })
  }

  return lines.join("\n")
}

function applyItemsSummary(
  values: Record<string, string>,
  itemBlocks: ItemBlock[],
  products: ProductsListItem[],
  manualAmountOverrides: Partial<Record<(typeof MANUAL_AMOUNT_FIELDS)[number], boolean>> = {}
) {
  const summary = calculateBudgetFinancialSummary(values, itemBlocks, products, manualAmountOverrides)
  const {
    parsedItems,
    productsGrossTotal,
    productsDefaultTotal,
    productsDefaultCost,
    serviceTotal,
    serviceCost,
    budgetTotalCost,
    budgetTotal,
    budgetProfitPercent,
  } = summary

  let nextValues = { ...values }

  itemBlocks.forEach((_, index) => {
    const parsed = parsedItems.find((item) => item.index === index)
    nextValues[itemFieldName(index, "total")] = formatCurrencyBR(parsed?.netTotal ?? 0)
    nextValues[itemFieldName(index, "margin")] = formatCurrencyBR(parsed?.margin ?? 0)
  })

  const preview = parsedItems
    .map((item, index) => {
      const unitLabel = item.unitOfMeasure?.trim() || "un"
      return `${index + 1}. ${item.productCode} - ${item.productName} | Qtd ${item.quantity} ${unitLabel} | Desconto ${formatCurrencyBR(item.discount)} | Total ${formatCurrencyBR(item.netTotal)}`
    })
    .join("\n")

  const resolvedProductsTotal = manualAmountOverrides.productsTotalAmount
    ? values.productsTotalAmount ?? ""
    : formatEditableAmount(productsDefaultTotal)
  const resolvedProductsCost = manualAmountOverrides.productsCostAmount
    ? values.productsCostAmount ?? ""
    : formatEditableAmount(productsDefaultCost)
  const resolvedServiceTotal = manualAmountOverrides.serviceTotalAmount
    ? values.serviceTotalAmount ?? ""
    : formatEditableAmount(serviceTotal)
  const resolvedServiceCost = manualAmountOverrides.serviceCostAmount
    ? values.serviceCostAmount ?? ""
    : formatEditableAmount(serviceCost)
  const resolvedBudgetDiscount = manualAmountOverrides.budgetDiscount
    ? values.budgetDiscount ?? ""
    : "0.00"

  const summaryValues = {
    ...nextValues,
    itemsCount: String(parsedItems.length),
    itemsSubtotal: formatCurrencyBR(productsGrossTotal),
    itemsEstimatedCost: formatCurrencyBR(productsDefaultCost),
    itemsEstimatedMargin: formatCurrencyBR(productsDefaultTotal - productsDefaultCost),
    itemsPreview: preview,
    productsTotalAmount: resolvedProductsTotal,
    productsCostAmount: resolvedProductsCost,
    serviceTotalAmount: resolvedServiceTotal,
    serviceCostAmount: resolvedServiceCost,
    budgetDiscount: resolvedBudgetDiscount,
    budgetTotalCostAmount: formatCurrencyBR(budgetTotalCost),
    budgetTotalAmount: formatCurrencyBR(budgetTotal),
    budgetProfitPercent: formatPercentValue(budgetProfitPercent),
  }

  nextValues = {
    ...summaryValues,
    reviewSummary: buildReviewSummary(summaryValues, parsedItems),
  }

  return nextValues
}

function buildCreateBudgetPayload(
  values: Record<string, string>,
  items: CreateBudgetItemPayload[],
  loggedOwner: string
): CreateBudgetPayload {
  const now = new Date()
  const validUntil = values.validUntil?.trim() || toDateOnly(addDays(now, 15))
  const owner = values.owner?.trim() || loggedOwner.trim() || "Equipe Comercial"

  return {
    code: values.code?.trim() || undefined,
    clientId: values.clientId?.trim() || "",
    serviceId: values.serviceId?.trim() || null,
    title: values.title?.trim() || `Orcamento ${values.code?.trim() || ""}`.trim(),
    status: toBudgetStatus(values.status),
    priority: toBudgetPriority(values.priority),
    owner,
    validUntil,
    approvalDate: values.approvalDate?.trim() || null,
    expectedCloseDate: validUntil,
    paymentTerms: "A definir",
    deliveryTerm: values.deliveryTerm?.trim() || null,
    slaSummary: values.slaSummary?.trim() || null,
    scopeSummary: values.scopeSummary?.trim() || null,
    assumptions: parseMultiline(values.assumptions),
    exclusions: parseMultiline(values.exclusions),
    attachments: parseAttachments(values.attachments),
    clientName: values.clientName?.trim() || null,
    clientSegment: values.clientSegment?.trim() || null,
    clientDocument: values.clientDocument?.trim() || null,
    clientCity: values.clientCity?.trim() || null,
    clientState: values.clientState?.trim() || null,
    clientContactName: values.clientContactName?.trim() || null,
    clientContactRole: values.clientContactRole?.trim() || null,
    clientEmail: values.clientEmail?.trim() || null,
    clientPhone: values.clientPhone?.trim() || null,
    serviceCode: values.serviceCode?.trim() || null,
    serviceName: values.serviceName?.trim() || null,
    serviceCategory: values.serviceCategory?.trim() || null,
    serviceBillingModel: values.serviceBillingModel?.trim() || null,
    serviceDescription: values.serviceDescription?.trim() || null,
    serviceEstimatedDuration: values.serviceEstimatedDuration?.trim() || null,
    serviceResponsible: values.serviceResponsible?.trim() || null,
    serviceStatus: values.serviceStatus?.trim() || null,
    productsTotalAmount: Math.max(0, parseCurrencyNumber(values.productsTotalAmount, 0)),
    productsCostAmount: Math.max(0, parseCurrencyNumber(values.productsCostAmount, 0)),
    serviceTotalAmount: Math.max(0, parseCurrencyNumber(values.serviceTotalAmount, 0)),
    serviceCostAmount: Math.max(0, parseCurrencyNumber(values.serviceCostAmount, 0)),
    budgetDiscount: Math.max(0, parseCurrencyNumber(values.budgetDiscount, 0)),
    budgetTotalCostAmount: Math.max(0, parseCurrencyNumber(values.budgetTotalCostAmount, 0)),
    budgetTotalAmount: Math.max(0, parseCurrencyNumber(values.budgetTotalAmount, 0)),
    budgetProfitPercent: Math.max(0, parseCurrencyNumber(values.budgetProfitPercent, 0)),
    items: items.map((item) => ({
      productId: item.productId,
      code: item.code?.trim() || null,
      description: item.description?.trim() || "Item nao informado",
      category: item.category?.trim() || undefined,
      quantity: Math.max(1, item.quantity ?? 1),
      unitPrice: Math.max(0, item.unitPrice ?? 0),
      discount: Math.max(0, item.discount ?? 0),
      internalCost: Math.max(0, item.internalCost ?? 0),
      estimatedHours: Math.max(1, item.estimatedHours ?? 1),
      deliveryWindow: item.deliveryWindow?.trim() || "A definir",
    })),
  }
}

function buildBudgetFromValues(
  values: Record<string, string>,
  code: string,
  items: CreateBudgetItemPayload[],
  loggedOwner: string
) {
  const budgetId = globalThis.crypto?.randomUUID?.() ?? `bud-${Date.now()}`
  const now = new Date()
  const today = toDateOnly(now)

  const owner = loggedOwner.trim() || "Equipe Comercial"
  const validUntil = values.validUntil?.trim() || toDateOnly(addDays(now, 15))
  const approvalDate = values.approvalDate?.trim() || undefined

  const assumptions = parseMultiline(values.assumptions)
  const exclusions = parseMultiline(values.exclusions)
  const attachments = parseAttachments(values.attachments)
  const productsTotalAmount = Math.max(0, parseCurrencyNumber(values.productsTotalAmount, 0))
  const productsCostAmount = Math.max(0, parseCurrencyNumber(values.productsCostAmount, 0))
  const serviceTotalAmount = Math.max(0, parseCurrencyNumber(values.serviceTotalAmount, 0))
  const serviceCostAmount = Math.max(0, parseCurrencyNumber(values.serviceCostAmount, 0))
  const budgetDiscount = Math.max(0, parseCurrencyNumber(values.budgetDiscount, 0))
  const budgetTotalCostAmount = Math.max(0, parseCurrencyNumber(values.budgetTotalCostAmount, 0))
  const budgetTotalAmount = Math.max(0, parseCurrencyNumber(values.budgetTotalAmount, 0))
  const budgetProfitPercent = Math.max(0, parseCurrencyNumber(values.budgetProfitPercent, 0))

  const nextStepDueDate = values.nextStepDueDate?.trim() || toDateOnly(addDays(now, 2))
  const nextStepAction = values.nextStepAction?.trim() || "Realizar follow-up com o decisor"
  const nextStepObjective = values.nextStepObjective?.trim() || "Avancar para aprovacao comercial"

  const budgetItems = items.map((item, index) => ({
    id: `${budgetId}-item-${index + 1}`,
    productId: item.productId ?? null,
    code: item.code?.trim() || null,
    description: item.description?.trim() || "Item nao informado",
    category: item.category?.trim() || "Nao informado",
    quantity: Math.max(1, item.quantity ?? 1),
    unitPrice: Math.max(0, item.unitPrice ?? 0),
    discount: Math.max(0, item.discount ?? 0),
    internalCost: Math.max(0, item.internalCost ?? 0),
    estimatedHours: Math.max(1, item.estimatedHours ?? 1),
    deliveryWindow: item.deliveryWindow?.trim() || "A definir",
  }))

  const budget: Budget = {
    id: budgetId,
    code,
    title: values.title?.trim() || `Orcamento ${code}`,
    status: toBudgetStatus(values.status),
    priority: toBudgetPriority(values.priority),
    owner,
    createdAt: today,
    updatedAt: today,
    validUntil,
    approvalDate,
    expectedCloseDate: validUntil,
    paymentTerms: "A definir",
    deliveryTerm: values.deliveryTerm?.trim() || "A definir",
    slaSummary: values.slaSummary?.trim() || "SLA a definir em proposta comercial.",
    scopeSummary: values.scopeSummary?.trim() || "Escopo a detalhar com o cliente.",
    assumptions: assumptions.length > 0 ? assumptions : ["Escopo sujeito a validacao tecnica final."],
    exclusions: exclusions.length > 0 ? exclusions : ["Nao inclui itens fora do escopo descrito."],
    serviceId: values.serviceId?.trim() || null,
    serviceCode: values.serviceCode?.trim() || null,
    serviceName: values.serviceName?.trim() || null,
    serviceCategory: values.serviceCategory?.trim() || null,
    serviceBillingModel: values.serviceBillingModel?.trim() || null,
    serviceDescription: values.serviceDescription?.trim() || null,
    serviceEstimatedDuration: values.serviceEstimatedDuration?.trim() || null,
    serviceResponsible: values.serviceResponsible?.trim() || null,
    serviceStatus: values.serviceStatus?.trim() || null,
    productsTotalAmount,
    productsCostAmount,
    serviceTotalAmount,
    serviceCostAmount,
    budgetDiscount,
    budgetTotalCostAmount,
    budgetTotalAmount,
    budgetProfitPercent,
    client: {
      id: values.clientId?.trim() || `cli-${budgetId.slice(-6)}`,
      name: values.clientName?.trim() || "Cliente nao informado",
      segment: values.clientSegment?.trim() || "Nao informado",
      document: values.clientDocument?.trim() || "Nao informado",
      city: values.clientCity?.trim() || "Nao informado",
      state: values.clientState?.trim() || "NA",
      contactName: values.clientContactName?.trim() || "Contato nao informado",
      contactRole: values.clientContactRole?.trim() || "Nao informado",
      email: values.clientEmail?.trim() || "nao.informado@cliente.com",
      phone: values.clientPhone?.trim() || "00000000000",
    },
    items: budgetItems,
    interactions: [
      {
        id: `${budgetId}-int-1`,
        date: `${today}T09:00:00`,
        channel: "proposal",
        summary: `Orcamento cadastrado para ${values.clientName?.trim() || "cliente selecionado"}.`,
        author: owner,
      },
    ],
    risks: [],
    nextSteps: [
      {
        id: `${budgetId}-next-1`,
        dueDate: nextStepDueDate,
        action: nextStepAction,
        owner,
        objective: nextStepObjective,
      },
    ],
    attachments,
  }

  return budget
}

function buildEditInitialValues(
  defaults: Record<string, string>,
  budget: Budget,
  itemBlocks: ItemBlock[],
  products: ProductsListItem[],
  clients: ClientsListItem[],
  services: ApiServiceCatalogItem[]
) {
  const financials = calculateBudgetFinancials(budget)
  const matchedClient = findMatchingClientFromBudget(clients, budget)
  const resolvedClientId = matchedClient?.id ?? budget.client.id ?? ""
  const resolvedClient = matchedClient
    ? {
        id: matchedClient.id,
        name: matchedClient.name ?? budget.client.name,
        segment: mapClientTypeToSegment(matchedClient.type) || budget.client.segment,
        document: formatCpfCnpj(matchedClient.document ?? budget.client.document),
        city: matchedClient.city ?? budget.client.city,
        state: matchedClient.state ?? budget.client.state,
        contactName: matchedClient.responsibleName ?? budget.client.contactName,
        contactRole: matchedClient.responsibleName ? "Responsavel comercial do cliente" : budget.client.contactRole,
        email: matchedClient.responsibleEmail ?? matchedClient.email ?? budget.client.email,
        phone: formatPhoneBR(matchedClient.responsiblePhone ?? matchedClient.telephone ?? budget.client.phone),
      }
    : budget.client
  const matchedService = findMatchingServiceFromBudget(services, budget)
  const resolvedServiceId = matchedService?.id ?? budget.serviceId ?? ""
  const resolvedService = matchedService
    ? {
        code: matchedService.code ?? budget.serviceCode ?? "",
        name: matchedService.name ?? budget.serviceName ?? "",
        category: matchedService.category ?? budget.serviceCategory ?? "",
        billingModel: mapServiceBillingModelLabel(matchedService.billing_model ?? budget.serviceBillingModel),
        description: matchedService.description ?? budget.serviceDescription ?? "",
        estimatedDuration: matchedService.estimated_duration ?? budget.serviceEstimatedDuration ?? "",
        responsible: matchedService.responsible?.trim() || budget.serviceResponsible || "",
        status: mapServiceStatusLabel(matchedService.status ?? budget.serviceStatus),
        basePrice: formatCurrencyValue(matchedService.base_price, formatCurrencyValue(budget.serviceTotalAmount)),
        internalCost: formatCurrencyValue(matchedService.internal_cost, formatCurrencyValue(budget.serviceCostAmount)),
      }
    : {
        code: budget.serviceCode ?? "",
        name: budget.serviceName ?? "",
        category: budget.serviceCategory ?? "",
        billingModel: budget.serviceBillingModel ?? "",
        description: budget.serviceDescription ?? "",
        estimatedDuration: budget.serviceEstimatedDuration ?? "",
        responsible: budget.serviceResponsible ?? "",
        status: budget.serviceStatus ?? "",
        basePrice: formatCurrencyValue(budget.serviceTotalAmount),
        internalCost: formatCurrencyValue(budget.serviceCostAmount),
      }

  let values: Record<string, string> = {
    ...defaults,
    code: budget.code,
    title: budget.title,
    status: budget.status,
    priority: budget.priority,
    owner: budget.owner,
    validUntil: toDateFieldValue(budget.validUntil),
    approvalDate: toDateFieldValue(budget.approvalDate),
    deliveryTerm: budget.deliveryTerm,
    slaSummary: budget.slaSummary,
    scopeSummary: budget.scopeSummary,
    assumptions: budget.assumptions.join("\n"),
    exclusions: budget.exclusions.join("\n"),
    attachments: budget.attachments.join("\n"),
    clientId: resolvedClientId,
    clientName: resolvedClient.name,
    clientSegment: resolvedClient.segment,
    clientDocument: resolvedClient.document,
    clientCity: resolvedClient.city,
    clientState: resolvedClient.state,
    clientContactName: resolvedClient.contactName,
    clientContactRole: resolvedClient.contactRole,
    clientEmail: resolvedClient.email,
    clientPhone: resolvedClient.phone,
    serviceId: resolvedServiceId,
    serviceCode: resolvedService.code,
    serviceName: resolvedService.name,
    serviceCategory: resolvedService.category,
    serviceBillingModel: resolvedService.billingModel,
    serviceDescription: resolvedService.description,
    serviceEstimatedDuration: resolvedService.estimatedDuration,
    serviceResponsible: resolvedService.responsible,
    serviceStatus: resolvedService.status,
    serviceBasePrice: resolvedService.basePrice,
    serviceInternalCost: resolvedService.internalCost,
    productsTotalAmount: formatEditableAmount(budget.productsTotalAmount ?? financials.netTotal),
    productsCostAmount: formatEditableAmount(budget.productsCostAmount ?? financials.costTotal),
    serviceTotalAmount: formatEditableAmount(budget.serviceTotalAmount ?? 0),
    serviceCostAmount: formatEditableAmount(budget.serviceCostAmount ?? 0),
    budgetDiscount: formatEditableAmount(budget.budgetDiscount ?? 0),
    budgetTotalCostAmount: formatCurrencyBR(budget.budgetTotalCostAmount ?? financials.costTotal),
    budgetTotalAmount: formatCurrencyBR(budget.budgetTotalAmount ?? financials.netTotal),
    budgetProfitPercent: formatPercentValue(budget.budgetProfitPercent ?? financials.marginPercent),
    nextStepDueDate: budget.nextSteps[0]?.dueDate ? toDateFieldValue(budget.nextSteps[0].dueDate) : defaults.nextStepDueDate ?? "",
    nextStepAction: budget.nextSteps[0]?.action ?? defaults.nextStepAction ?? "",
    nextStepObjective: budget.nextSteps[0]?.objective ?? defaults.nextStepObjective ?? "",
  }

  itemBlocks.forEach((_, index) => {
    const item = budget.items[index]
    if (!item) return

    const productId = item.productId?.trim() || ""
    values[itemFieldName(index, "productId")] = productId
    values[itemFieldName(index, "quantity")] = String(item.quantity)
    values[itemFieldName(index, "discount")] = formatCurrencyBR(item.discount)
    values[itemFieldName(index, "estimatedHours")] = String(item.estimatedHours || 8)
    values[itemFieldName(index, "deliveryWindow")] = item.deliveryWindow || "A definir"

    const selectedProduct = productId ? products.find((product) => product.id === productId) ?? null : null
    values = applyProductToItem(values, index, selectedProduct)

    if (!selectedProduct) {
      values[itemFieldName(index, "name")] = item.description
      values[itemFieldName(index, "category")] = item.category
      values[itemFieldName(index, "unitPrice")] = formatCurrencyBR(item.unitPrice)
      values[itemFieldName(index, "internalCost")] = formatCurrencyBR(item.internalCost)
    }
  })

  return applyItemsSummary(values, itemBlocks, products, {
    productsTotalAmount: true,
    productsCostAmount: true,
    serviceTotalAmount: true,
    serviceCostAmount: true,
    budgetDiscount: true,
  })
}

export function FormBudget({
  open,
  onClose,
  existingCodes,
  mode = "create",
  budgetToEdit = null,
  onCreated,
  onUpdated,
  onFeedback,
}: FormBudgetProps) {
  const isEditMode = mode === "edit" && Boolean(budgetToEdit)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingReferences, setIsLoadingReferences] = useState(false)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)
  const [clients, setClients] = useState<ClientsListItem[]>([])
  const [products, setProducts] = useState<ProductsListItem[]>([])
  const [services, setServices] = useState<ApiServiceCatalogItem[]>([])
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [isFormInitialized, setIsFormInitialized] = useState(false)
  const [itemBlocks, setItemBlocks] = useState<ItemBlock[]>(() => buildInitialItemBlocks())
  const [manualAmountOverrides, setManualAmountOverrides] = useState<
    Partial<Record<(typeof MANUAL_AMOUNT_FIELDS)[number], boolean>>
  >({})

  const nextCode = useMemo(() => {
    if (isEditMode && budgetToEdit?.code) return budgetToEdit.code
    return getNextBudgetCode(existingCodes)
  }, [budgetToEdit?.code, existingCodes, isEditMode])
  const ownerDefault = useMemo(() => getStoredHeaderUser()?.fullName?.trim() || "Equipe Comercial", [])

  const budgetSteps = useMemo<GenericFormStep[]>(
    () => [
      {
        key: "clientes",
        title: "Cliente",
        description: "Selecione o cliente e confira os dados preenchidos automaticamente.",
        sections: ["Cliente"],
      },
      {
        key: "servicos",
        title: "Servico",
        description: "Escolha o servico de catalogo para preencher os dados tecnicos e comerciais.",
        sections: ["Servico"],
      },
      {
        key: "itens",
        title: "Itens",
        description: "Adicione os itens do orcamento e ajuste quantidade, desconto e prazo de entrega.",
        sectionPrefixes: ["Itens -"],
      },
      {
        key: "calculo",
        title: "Calculo",
        description: "Defina os dados comerciais do orcamento.",
        sections: ["Calculo de orcamento"],
      },
      {
        key: "review",
        title: "Review",
        description: "Revise o resumo final antes de gerar o orcamento.",
        sections: ["Review"],
      },
      {
        key: "gerar",
        title: isEditMode ? "Concluir edição" : "Gerar orcamento",
        description: isEditMode ? "Conclua o processo e salve as alteracoes." : "Conclua o processo e gere o orcamento.",
        sections: ["Gerar orcamento"],
        submitLabel: isEditMode ? "Concluir edição" : "Gerar orcamento",
      },
    ],
    [isEditMode]
  )

  useEffect(() => {
    if (!open) return

    const totalItems = isEditMode && budgetToEdit ? Math.max(1, budgetToEdit.items.length) : 1
    const nextBlocks = Array.from({ length: totalItems }, (_, index) => createItemBlock(index + 1))

    setItemBlocks(nextBlocks)
    setManualAmountOverrides(isEditMode ? EDIT_MANUAL_AMOUNT_OVERRIDES : {})
    setIsFormInitialized(false)
    setFeedback(null)
  }, [budgetToEdit, isEditMode, open])

  useEffect(() => {
    if (!open) return

    let isMounted = true
    setIsLoadingReferences(true)

    void Promise.all([getClients(), getProducts(), getServices()])
      .then(([clientsResponse, productsResponse, servicesResponse]) => {
        if (!isMounted) return
        setClients(clientsResponse.data)
        setProducts(productsResponse.data)
        setServices(servicesResponse.data)
      })
      .catch((error) => {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : "Nao foi possivel carregar clientes, produtos e servicos."
        const errorAlert = ComponentAlert.Error(message)
        setFeedback(errorAlert)
        onFeedback?.(errorAlert)
        setClients([])
        setProducts([])
        setServices([])
      })
      .finally(() => {
        if (!isMounted) return
        setIsLoadingReferences(false)
      })

    return () => {
      isMounted = false
    }
  }, [open, onFeedback])

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

  const fields = useMemo<GenericField[]>(() => {
    const now = new Date()
    const defaultValidUntil = toDateOnly(addDays(now, 15))
    const currentEditClientId = (formValues.clientId ?? "").trim() || budgetToEdit?.client?.id?.trim() || ""
    const currentEditClientLabel = (formValues.clientName ?? "").trim() || budgetToEdit?.client?.name?.trim() || "Cliente do orcamento"
    const currentEditServiceId = (formValues.serviceId ?? "").trim() || budgetToEdit?.serviceId?.trim() || ""
    const currentEditServiceLabel =
      (formValues.serviceCode ?? "").trim() && (formValues.serviceName ?? "").trim()
        ? `${formValues.serviceCode} - ${formValues.serviceName}`
        : (formValues.serviceName ?? "").trim() ||
          ((budgetToEdit?.serviceCode ?? "").trim() && (budgetToEdit?.serviceName ?? "").trim()
            ? `${budgetToEdit?.serviceCode} - ${budgetToEdit?.serviceName}`
            : budgetToEdit?.serviceName?.trim() || "Servico do orcamento")

    const clientOptions = clients.map((client) => ({
      label: `${client.code} - ${client.name}`,
      value: client.id,
    }))
    if (isEditMode && currentEditClientId) {
      const alreadyExists = clientOptions.some((option) => option.value === currentEditClientId)
      if (!alreadyExists) {
        clientOptions.unshift({
          label: `${currentEditClientLabel} (cliente do orcamento)`,
          value: currentEditClientId,
        })
      }
    }

    const serviceOptions = services.map((service) => ({
      label: `${service.code} - ${service.name}`,
      value: service.id,
    }))
    if (isEditMode && currentEditServiceId) {
      const alreadyExists = serviceOptions.some((option) => option.value === currentEditServiceId)
      if (!alreadyExists) {
        serviceOptions.unshift({
          label: `${currentEditServiceLabel} (servico do orcamento)`,
          value: currentEditServiceId,
        })
      }
    }

    const productOptions = products.map((product) => ({
      label: `${product.code} - ${product.name}`,
      value: product.id,
    }))
    if (isEditMode && budgetToEdit?.items?.length) {
      budgetToEdit.items.forEach((item) => {
        const productId = item.productId?.trim()
        if (!productId) return
        const alreadyExists = productOptions.some((option) => option.value === productId)
        if (alreadyExists) return

        productOptions.push({
          label: `${item.description} (item do orcamento)`,
          value: productId,
        })
      })
    }

    const itemFields = itemBlocks.flatMap<GenericField>((_, index) => {
      const itemNumber = index + 1
      const section = `Itens - ${itemNumber}`
      const sectionDescription = "Selecione um produto e os dados do item serao preenchidos automaticamente."

      return [
        {
          name: itemFieldName(index, "productId"),
          label: `Produto do item ${itemNumber}`,
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
          name: itemFieldName(index, "code"),
          label: "Codigo do item",
          type: "text",
          section,
          readOnly: true,
          autoFilled: true,
        },
        {
          name: itemFieldName(index, "name"),
          label: "Nome do item",
          type: "text",
          section,
          readOnly: true,
          autoFilled: true,
          colSpan: 2,
        },
        {
          name: itemFieldName(index, "category"),
          label: "Categoria",
          type: "text",
          section,
          readOnly: true,
          autoFilled: true,
        },
        {
          name: itemFieldName(index, "brand"),
          label: "Marca",
          type: "text",
          section,
          readOnly: true,
          autoFilled: true,
        },
        {
          name: itemFieldName(index, "supplier"),
          label: "Fornecedor",
          type: "text",
          section,
          readOnly: true,
          autoFilled: true,
        },
        {
          name: itemFieldName(index, "unitOfMeasure"),
          label: "Unidade",
          type: "text",
          section,
          readOnly: true,
          autoFilled: true,
        },
        {
          name: itemFieldName(index, "location"),
          label: "Localizacao",
          type: "text",
          section,
          readOnly: true,
          autoFilled: true,
        },
        {
          name: itemFieldName(index, "quantity"),
          label: "Quantidade",
          type: "number",
          section,
          defaultValue: "1",
        },
        {
          name: itemFieldName(index, "discount"),
          label: "Desconto do item (R$)",
          type: "text",
          section,
          defaultValue: "R$ 0,00",
        },
        {
          name: itemFieldName(index, "estimatedHours"),
          label: "Horas estimadas",
          type: "number",
          section,
          defaultValue: "8",
        },
        {
          name: itemFieldName(index, "deliveryWindow"),
          label: "Janela de entrega",
          type: "text",
          section,
          defaultValue: "Entrega em ate 15 dias",
          colSpan: 2,
        },
        {
          name: itemFieldName(index, "unitPrice"),
          label: "Preco unitario (R$)",
          type: "text",
          section,
          readOnly: true,
          autoFilled: true,
        },
        {
          name: itemFieldName(index, "internalCost"),
          label: "Custo unitario (R$)",
          type: "text",
          section,
          readOnly: true,
          autoFilled: true,
        },
        {
          name: itemFieldName(index, "total"),
          label: "Subtotal liquido (R$)",
          type: "text",
          section,
          defaultValue: "R$ 0,00",
          readOnly: true,
          autoFilled: true,
        },
        {
          name: itemFieldName(index, "margin"),
          label: "Margem do item (R$)",
          type: "text",
          section,
          defaultValue: "R$ 0,00",
          readOnly: true,
          autoFilled: true,
        },
      ]
    })

    const baseFields: GenericField[] = [
      {
        name: "clientId",
        label: "Cliente",
        type: "select",
        section: "Cliente",
        sectionDescription: "Selecione um cliente cadastrado no banco e os dados serao preenchidos automaticamente.",
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
        label: "Contato do cliente",
        type: "text",
        section: "Cliente",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: "clientContactRole",
        label: "Cargo do contato",
        type: "text",
        section: "Cliente",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: "clientEmail",
        label: "E-mail do contato",
        type: "email",
        section: "Cliente",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: "clientPhone",
        label: "Telefone do contato",
        type: "tel",
        section: "Cliente",
        autoFilled: true,
      },
      {
        name: "serviceId",
        label: "Servico (catalogo)",
        type: "select",
        section: "Servico",
        sectionDescription: "Selecione um servico do catalogo para preencher dados tecnicos e comerciais.",
        required: serviceOptions.length > 0,
        placeholder: serviceOptions.length > 0 ? "Selecione um servico" : "Nenhum servico cadastrado",
        options: serviceOptions,
        description: serviceOptions.length > 0 ? "Origem: catalogo de servicos." : "Cadastre servicos para habilitar esta selecao.",
        colSpan: 2,
      },
      {
        name: "serviceCode",
        label: "Codigo do servico",
        type: "text",
        section: "Servico",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: "serviceName",
        label: "Nome do servico",
        type: "text",
        section: "Servico",
        readOnly: true,
        autoFilled: true,
        colSpan: 2,
      },
      {
        name: "serviceCategory",
        label: "Categoria",
        type: "text",
        section: "Servico",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: "serviceBillingModel",
        label: "Modelo de cobranca",
        type: "text",
        section: "Servico",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: "serviceBasePrice",
        label: "Preco base (R$)",
        type: "text",
        section: "Servico",
        description: "Campo editavel para ajuste comercial.",
      },
      {
        name: "serviceInternalCost",
        label: "Custo interno (R$)",
        type: "text",
        section: "Servico",
        description: "Campo editavel para ajuste de custo.",
      },
      {
        name: "serviceEstimatedDuration",
        label: "Duracao estimada",
        type: "text",
        section: "Servico",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: "serviceResponsible",
        label: "Responsavel",
        type: "text",
        section: "Servico",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: "serviceStatus",
        label: "Status do servico",
        type: "text",
        section: "Servico",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: "serviceDescription",
        label: "Descricao do servico",
        type: "textarea",
        section: "Servico",
        readOnly: true,
        autoFilled: true,
        colSpan: 3,
      },
      ...itemFields,
      {
        name: "itemsCount",
        label: "Total de itens selecionados",
        type: "text",
        section: "Itens - Resumo",
        sectionDescription: "Resumo automatico dos itens selecionados.",
        defaultValue: "0",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: "itemsSubtotal",
        label: "Subtotal bruto",
        type: "text",
        section: "Itens - Resumo",
        defaultValue: "R$ 0,00",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: "itemsEstimatedCost",
        label: "Custo estimado",
        type: "text",
        section: "Itens - Resumo",
        defaultValue: "R$ 0,00",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: "itemsEstimatedMargin",
        label: "Margem estimada",
        type: "text",
        section: "Itens - Resumo",
        defaultValue: "R$ 0,00",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: "itemsPreview",
        label: "Resumo dos itens selecionados",
        type: "textarea",
        section: "Itens - Resumo",
        defaultValue: "",
        readOnly: true,
        autoFilled: true,
        colSpan: 3,
      },
      {
        name: "code",
        label: "Codigo",
        type: "text",
        section: "Calculo de orcamento",
        sectionDescription: "Dados centrais e condicoes comerciais do novo orcamento.",
        defaultValue: nextCode,
        readOnly: true,
        disabled: true,
        autoFilled: true,
      },
      {
        name: "title",
        label: "Titulo do orcamento",
        type: "text",
        section: "Calculo de orcamento",
        required: true,
        placeholder: "Ex: Implantacao de monitoramento e seguranca",
        colSpan: 2,
      },
      {
        name: "status",
        label: "Status inicial",
        type: "select",
        section: "Calculo de orcamento",
        required: true,
        defaultValue: "draft",
        options: [
          { label: "Rascunho", value: "draft" },
          { label: "Enviado", value: "sent" },
          { label: "Em negociacao", value: "negotiation" },
          { label: "Aprovado", value: "approved" },
          { label: "Perdido", value: "rejected" },
          { label: "Expirado", value: "expired" },
        ],
      },
      {
        name: "priority",
        label: "Prioridade",
        type: "select",
        section: "Calculo de orcamento",
        required: true,
        defaultValue: "medium",
        options: [
          { label: "Baixa", value: "low" },
          { label: "Media", value: "medium" },
          { label: "Alta", value: "high" },
        ],
      },
      {
        name: "owner",
        label: "Responsavel",
        type: "text",
        section: "Calculo de orcamento",
        required: true,
        defaultValue: ownerDefault,
        readOnly: true,
        disabled: true,
        autoFilled: true,
      },
      {
        name: "validUntil",
        label: "Validade do orcamento",
        type: "date",
        section: "Calculo de orcamento",
        required: true,
        defaultValue: defaultValidUntil,
      },
      {
        name: "approvalDate",
        label: "Data de aprovacao",
        type: "date",
        section: "Calculo de orcamento",
      },
      {
        name: "productsTotalAmount",
        label: "Valor total de produtos (R$)",
        type: "number",
        section: "Calculo de orcamento",
        defaultValue: "0.00",
      },
      {
        name: "productsCostAmount",
        label: "Custo de produtos (R$)",
        type: "number",
        section: "Calculo de orcamento",
        defaultValue: "0.00",
      },
      {
        name: "serviceTotalAmount",
        label: "Valor total de servicos (R$)",
        type: "number",
        section: "Calculo de orcamento",
        defaultValue: "0.00",
      },
      {
        name: "serviceCostAmount",
        label: "Custo de servicos (R$)",
        type: "number",
        section: "Calculo de orcamento",
        defaultValue: "0.00",
      },
      {
        name: "budgetDiscount",
        label: "Desconto do orcamento (R$)",
        type: "number",
        section: "Calculo de orcamento",
        defaultValue: "0.00",
        placeholder: "Ex: 150.00",
      },
      {
        name: "budgetTotalCostAmount",
        label: "Custo total do orcamento (R$)",
        type: "text",
        section: "Calculo de orcamento",
        defaultValue: "R$ 0,00",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: "budgetTotalAmount",
        label: "Valor total do orcamento (R$)",
        type: "text",
        section: "Calculo de orcamento",
        defaultValue: "R$ 0,00",
        readOnly: true,
        autoFilled: true,
        colSpan: 2,
      },
      {
        name: "budgetProfitPercent",
        label: "% de lucro",
        type: "text",
        section: "Calculo de orcamento",
        defaultValue: "0,00%",
        readOnly: true,
        autoFilled: true,
      },
      {
        name: "deliveryTerm",
        label: "Prazo de entrega",
        type: "text",
        section: "Calculo de orcamento",
        required: true,
        placeholder: "Ex: 3 dias apos a aprovacao",
      },
      {
        name: "slaSummary",
        label: "Resumo de SLA",
        type: "textarea",
        section: "Calculo de orcamento",
        required: true,
        placeholder: "SLA preenchido automaticamente pelo servico selecionado.",
        colSpan: 3,
      },
      {
        name: "scopeSummary",
        label: "Resumo do escopo",
        type: "textarea",
        section: "Calculo de orcamento",
        required: true,
        placeholder: "Escopo preenchido automaticamente pelo servico selecionado.",
        colSpan: 3,
      },
      {
        name: "reviewSummary",
        label: "Resumo geral",
        type: "textarea",
        section: "Review",
        sectionDescription: "Conferencia final consolidada do orcamento.",
        readOnly: true,
        autoFilled: true,
        colSpan: 3,
      },
      {
        name: "generateMessage",
        label: isEditMode ? "Pronto para concluir" : "Pronto para gerar",
        type: "textarea",
        section: "Gerar orcamento",
        sectionDescription: isEditMode
          ? "Clique em concluir para salvar as alteracoes do orcamento."
          : "Clique em gerar para concluir o cadastro do orcamento.",
        defaultValue: isEditMode
          ? "Revise as etapas anteriores e clique em Concluir edição para salvar."
          : "Revise as etapas anteriores e clique em Gerar orcamento para salvar.",
        readOnly: true,
        autoFilled: true,
        colSpan: 3,
      },
    ]

    if (!isEditMode) return baseFields

    return baseFields.map((field) => {
      if (LOCKED_EDIT_FIELDS.has(field.name) || isLockedItemField(field.name)) {
        return field
      }

      return {
        ...field,
        readOnly: false,
        disabled: false,
        autoFilled: false,
      }
    })
  }, [
    budgetToEdit,
    clients,
    formValues.clientId,
    formValues.clientName,
    formValues.serviceCode,
    formValues.serviceId,
    formValues.serviceName,
    isEditMode,
    itemBlocks,
    nextCode,
    ownerDefault,
    products,
    services,
  ])

  useEffect(() => {
    if (!open) {
      if (isFormInitialized) {
        setIsFormInitialized(false)
      }
      if (itemBlocks.length !== 1) {
        setItemBlocks(buildInitialItemBlocks())
      }
      if (Object.keys(manualAmountOverrides).length > 0) {
        setManualAmountOverrides({})
      }
      return
    }

    if (isFormInitialized) return
    const defaults = buildInitialValues(fields)
    const initialValues =
      isEditMode && budgetToEdit
        ? buildEditInitialValues(defaults, budgetToEdit, itemBlocks, products, clients, services)
        : applyItemsSummary(defaults, itemBlocks, products, manualAmountOverrides)
    setFormValues(initialValues)
    setIsFormInitialized(true)
  }, [budgetToEdit, clients, fields, isEditMode, isFormInitialized, itemBlocks, manualAmountOverrides, open, products, services])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = "hidden"
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
    }
  }, [open])

  useEffect(() => {
    if (!open || !isFormInitialized) return

    const defaults = buildInitialValues(fields)

    setFormValues((prev) => {
      let changed = false
      const nextValues: Record<string, string> = {}

      for (const [key, defaultValue] of Object.entries(defaults)) {
        if (Object.prototype.hasOwnProperty.call(prev, key)) {
          nextValues[key] = prev[key] ?? ""
          continue
        }
        nextValues[key] = defaultValue
        changed = true
      }

      for (const key of Object.keys(prev)) {
        if (Object.prototype.hasOwnProperty.call(defaults, key)) continue
        changed = true
        break
      }

      if (!changed) return prev
      if (isEditMode) return nextValues
      return applyItemsSummary(nextValues, itemBlocks, products, manualAmountOverrides)
    })
  }, [fields, isEditMode, isFormInitialized, itemBlocks, manualAmountOverrides, open, products])

  useEffect(() => {
    if (!open || !isEditMode || !budgetToEdit || !isFormInitialized) return
    if ((formValues.clientId ?? "").trim()) return

    const budgetWithCurrentSnapshot: Budget = {
      ...budgetToEdit,
      client: {
        ...budgetToEdit.client,
        id: (formValues.clientId ?? "").trim() || budgetToEdit.client.id,
        name: (formValues.clientName ?? "").trim() || budgetToEdit.client.name,
      },
    }
    const matchedClient = findMatchingClientFromBudget(clients, budgetWithCurrentSnapshot)
    const fallbackClientId = matchedClient?.id?.trim() || budgetToEdit.client.id?.trim() || ""

    if (!fallbackClientId) return
    setFormValues((prev) => ({ ...prev, clientId: fallbackClientId }))
  }, [budgetToEdit, clients, formValues.clientId, formValues.clientName, isEditMode, isFormInitialized, open])

  useEffect(() => {
    if (!open || !isEditMode || !budgetToEdit || !isFormInitialized) return
    if ((formValues.serviceId ?? "").trim()) return

    const budgetWithCurrentSnapshot: Budget = {
      ...budgetToEdit,
      serviceId: (formValues.serviceId ?? "").trim() || budgetToEdit.serviceId,
      serviceCode: (formValues.serviceCode ?? "").trim() || budgetToEdit.serviceCode,
      serviceName: (formValues.serviceName ?? "").trim() || budgetToEdit.serviceName,
    }
    const matchedService = findMatchingServiceFromBudget(services, budgetWithCurrentSnapshot)
    const fallbackServiceId = matchedService?.id?.trim() || budgetToEdit.serviceId?.trim() || ""

    if (!fallbackServiceId) return
    setFormValues((prev) => ({ ...prev, serviceId: fallbackServiceId }))
  }, [
    budgetToEdit,
    formValues.serviceCode,
    formValues.serviceId,
    formValues.serviceName,
    isEditMode,
    isFormInitialized,
    open,
    services,
  ])

  useEffect(() => {
    if (!open || !isEditMode || !isFormInitialized || products.length === 0) return

    setFormValues((prev) => {
      let nextValues = prev

      itemBlocks.forEach((_, index) => {
        const productId = (nextValues[itemFieldName(index, "productId")] ?? "").trim()
        if (!productId) return

        const currentItemCode = (nextValues[itemFieldName(index, "code")] ?? "").trim()
        if (currentItemCode) return

        const selectedProduct = products.find((product) => product.id === productId) ?? null
        if (!selectedProduct) return

        nextValues = applyProductToItem(nextValues, index, selectedProduct)
      })

      return applyItemsSummary(nextValues, itemBlocks, products, {
        productsTotalAmount: true,
        productsCostAmount: true,
        serviceTotalAmount: true,
        serviceCostAmount: true,
        budgetDiscount: true,
      })
    })
  }, [isEditMode, isFormInitialized, itemBlocks, open, products])

  if (!open) return null

  function handleAddItemBlock() {
    setItemBlocks((prev) => [...prev, createItemBlock(prev.length + 1)])
  }

  function handleRemoveLastItemBlock() {
    setItemBlocks((prev) => {
      if (prev.length <= 1) return prev
      return prev.slice(0, -1)
    })
  }

  function handleValuesChange(nextValues: Record<string, string>) {
    let normalizedValues = { ...nextValues }
    let nextManualAmountOverrides = manualAmountOverrides
    const loggedOwner = ownerDefault.trim() || "Equipe Comercial"

    if ((nextValues.clientId ?? "") !== (formValues.clientId ?? "")) {
      const selectedClient = clients.find((client) => client.id === nextValues.clientId) ?? null
      if (selectedClient) {
        normalizedValues = applyClientSelection(normalizedValues, selectedClient)
      } else if (!isEditMode) {
        normalizedValues = applyClientSelection(normalizedValues, null)
      }
    }

    if ((nextValues.serviceId ?? "") !== (formValues.serviceId ?? "")) {
      const selectedService = services.find((service) => service.id === nextValues.serviceId) ?? null
      if (selectedService) {
        normalizedValues = applyServiceSelection(normalizedValues, selectedService)
      } else if (!isEditMode) {
        normalizedValues = applyServiceSelection(normalizedValues, null)
      }

      if (selectedService) {
        const estimatedHours = parseDurationToHours(selectedService.estimated_duration)
        if (estimatedHours > 0) {
          const nextEstimatedHours = String(Math.round(estimatedHours))
          itemBlocks.forEach((_, index) => {
            const fieldName = itemFieldName(index, "estimatedHours")
            const currentValue = normalizedValues[fieldName]?.trim() || ""
            if (!currentValue || currentValue === "8") {
              normalizedValues[fieldName] = nextEstimatedHours
            }
          })
        }
      }
    }

    itemBlocks.forEach((_, index) => {
      const productField = itemFieldName(index, "productId")
      if ((nextValues[productField] ?? "") === (formValues[productField] ?? "")) return
      const selectedProduct = products.find((product) => product.id === nextValues[productField]) ?? null
      normalizedValues = applyProductToItem(normalizedValues, index, selectedProduct)
    })

    if ((normalizedValues.clientDocument ?? "") !== (formValues.clientDocument ?? "")) {
      normalizedValues.clientDocument = formatCpfCnpj(normalizedValues.clientDocument)
    }

    if ((normalizedValues.clientPhone ?? "") !== (formValues.clientPhone ?? "")) {
      normalizedValues.clientPhone = formatPhoneBR(normalizedValues.clientPhone)
    }

    if (!isEditMode && (normalizedValues.owner ?? "") !== loggedOwner) {
      normalizedValues.owner = loggedOwner
    }

    for (const fieldName of MANUAL_AMOUNT_FIELDS) {
      if ((normalizedValues[fieldName] ?? "") === (formValues[fieldName] ?? "")) continue
      if (nextManualAmountOverrides[fieldName]) continue
      nextManualAmountOverrides = { ...nextManualAmountOverrides, [fieldName]: true }
    }

    const dynamicCurrencyFields = itemBlocks.map((_, index) => itemFieldName(index, "discount"))
    const currencyFields = [...dynamicCurrencyFields]

    for (const fieldName of currencyFields) {
      if ((normalizedValues[fieldName] ?? "") === (formValues[fieldName] ?? "")) continue
      normalizedValues[fieldName] = formatCurrencyInputValue(normalizedValues[fieldName] ?? "")
    }

    if (nextManualAmountOverrides !== manualAmountOverrides) {
      setManualAmountOverrides(nextManualAmountOverrides)
    }

    normalizedValues = applyItemsSummary(normalizedValues, itemBlocks, products, nextManualAmountOverrides)
    setFormValues(normalizedValues)
  }

  function handleClose(force = false) {
    if ((isSubmitting || isLoadingReferences) && !force) return
    setFeedback(null)
    onClose()
  }

  async function handleSubmit(values: Record<string, string>) {
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const payloadItems = buildItemPayloads(values, itemBlocks, products)
      if (payloadItems.length === 0) {
        const warningAlert = ComponentAlert.Warning("Selecione ao menos um item antes de gerar o orcamento.")
        setFeedback(warningAlert)
        onFeedback?.(warningAlert)
        return
      }

      const payload = buildCreateBudgetPayload(values, payloadItems, ownerDefault)
      if (!payload.clientId) {
        const warningAlert = ComponentAlert.Warning("Selecione um cliente antes de gerar o orcamento.")
        setFeedback(warningAlert)
        onFeedback?.(warningAlert)
        return
      }

      let successMessage = ""

      if (isEditMode && budgetToEdit) {
        const response = await updateBudget(budgetToEdit.id, payload)
        onUpdated?.(response.data)
        successMessage = response.message?.trim() || `Orcamento ${response.data.code} atualizado com sucesso.`
      } else {
        const response = await createBudget(payload)
        const generatedCode = response.data?.code?.trim() || nextCode
        const localBudget = buildBudgetFromValues(values, generatedCode, payloadItems, ownerDefault)
        const budgetForList: Budget = {
          ...localBudget,
          id: response.data?.id ?? localBudget.id,
          code: generatedCode,
        }

        onCreated?.(budgetForList)
        successMessage = response.message?.trim() || `Orcamento ${budgetForList.code} cadastrado com sucesso.`
      }

      const successAlert = ComponentAlert.Success(successMessage)
      onFeedback?.(successAlert)
      handleClose(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel salvar o orcamento."
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

      <div className="relative z-10 flex h-full items-center justify-center overflow-x-hidden">
        <div className="flex h-full min-h-0 w-full max-w-[calc(100vw-1.5rem)] flex-col gap-3 sm:h-[88dvh] sm:max-w-5xl">
          <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

          <FormComponent
            title={isEditMode ? "Edição de orcamento" : "Cadastro de orcamento"}
            description={
              isEditMode
                ? "Atualize os dados do orcamento e salve as alteracoes."
                : "Preencha os dados por etapas ate concluir a geracao do orcamento."
            }
            fields={fields}
            steps={budgetSteps}
            renderStepHeaderActions={({ step }) =>
              step.key === "itens" ? (
                <>
                  <Button
                    type="button"
                    className="rounded-xl"
                    onClick={handleAddItemBlock}
                    disabled={isLoadingReferences}
                  >
                    Adicionar item
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={handleRemoveLastItemBlock}
                    disabled={itemBlocks.length <= 1 || isLoadingReferences}
                  >
                    Remover ultimo item
                  </Button>
                </>
              ) : null
            }
            values={formValues}
            onValuesChange={handleValuesChange}
            submitLabel={isLoadingReferences ? "Carregando dados..." : isEditMode ? "Salvar alteracoes" : "Gerar orcamento"}
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

export default FormBudget
