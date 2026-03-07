"use client"

import { useMemo, useState } from "react"

import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import FormComponent, { type GenericField } from "@/components/layout/formComponent"
import type { Supplier } from "@/components/products/Supplier/supplier-models"
import { createSupplier, type ApiSupplier, type CreateSupplierPayload } from "@/services/Supplier.service"
import { formatCurrencyBR, formatPhoneBR } from "@/utils/Formatter"

type FormSupplierProps = {
  open: boolean
  onClose: () => void
  onCreated?: (supplier: Supplier) => void
  onFeedback?: (feedback: ComponentAlertState) => void
}

const SUPPLIER_CATEGORY_OPTIONS = [
  { label: "Controladoras", value: "controladoras" },
  { label: "Sensores", value: "sensores" },
  { label: "Fontes", value: "fontes" },
  { label: "Cabos e conectores", value: "cabos-conectores" },
  { label: "Displays e touch", value: "displays-touch" },
  { label: "Embalagens tecnicas", value: "embalagens-tecnicas" },
  { label: "Logistica reversa", value: "logistica-reversa" },
  { label: "Resinas e aditivos", value: "resinas-aditivos" },
  { label: "Manutencao", value: "manutencao" },
]

function parseCurrencyToNumber(value: string) {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim()

  if (!normalized) return Number.NaN
  return Number(normalized)
}

function formatCurrencyField(value: string) {
  const numericValue = parseCurrencyToNumber(value)
  if (Number.isNaN(numericValue)) return value
  return formatCurrencyBR(numericValue)
}

function mapApiSupplierToUi(supplier: ApiSupplier): Supplier {
  return {
    id: supplier.id,
    code: supplier.supplierCode,
    name: supplier.name,
    fantasyName: supplier.fantasyName,
    segment: supplier.segment,
    risk: supplier.risk,
    contact: supplier.contact ?? undefined,
    city: supplier.city,
    state: supplier.state,
    status: supplier.status,
    categories: supplier.categories,
    lead: supplier.lead ?? undefined,
    location: supplier.location,
    phone: formatPhoneBR(supplier.phone),
    email: supplier.email,
    minRequest: formatCurrencyField(supplier.minRequest),
    lastDelivery: supplier.lastDelivery,
  }
}

function mapSelectedCategories(rawValue: string) {
  const selectedValues = rawValue
    .split("|")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  const selectedLabels = selectedValues
    .map((value) => SUPPLIER_CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value)
    .filter((label) => label.trim().length > 0)

  return selectedLabels.join(", ")
}

export default function FormSupplier({ open, onClose, onCreated, onFeedback }: FormSupplierProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)

  const fields = useMemo<GenericField[]>(
    () => [
      {
        name: "name",
        label: "Nome do fornecedor",
        type: "text",
        required: true,
        placeholder: "Ex: Alpha Circuitos Industriais",
        section: "Identificacao",
        sectionDescription: "Informacoes principais para identificar o fornecedor.",
        colSpan: 2,
      },
      {
        name: "fantasyName",
        label: "Nome fantasia",
        type: "text",
        required: true,
        placeholder: "Ex: Alpha Circuitos",
        section: "Identificacao",
      },
      {
        name: "segment",
        label: "Segmento",
        type: "select",
        required: true,
        placeholder: "Selecione o segmento",
        section: "Identificacao",
        options: [
          { label: "Eletronicos", value: "eletronicos" },
          { label: "Infraestrutura", value: "infraestrutura" },
          { label: "Embalagem", value: "embalagem" },
          { label: "Servicos", value: "servicos" },
          { label: "Insumos", value: "insumos" },
          { label: "Outros", value: "outros" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        placeholder: "Selecione o status",
        section: "Identificacao",
        defaultValue: "ativo",
        options: [
          { label: "Ativo", value: "ativo" },
          { label: "Avaliacao", value: "avaliacao" },
          { label: "Suspenso", value: "suspenso" },
        ],
      },
      {
        name: "risk",
        label: "Risco",
        type: "select",
        required: true,
        placeholder: "Selecione o risco",
        section: "Classificacao",
        sectionDescription: "Classificacao operacional para tomada de decisao.",
        defaultValue: "medio",
        options: [
          { label: "Baixo", value: "baixo" },
          { label: "Medio", value: "medio" },
          { label: "Alto", value: "alto" },
        ],
      },
      {
        name: "categories",
        label: "Categorias atendidas",
        type: "multiselect",
        required: true,
        placeholder: "Selecione uma ou mais categorias",
        section: "Classificacao",
        colSpan: 2,
        options: SUPPLIER_CATEGORY_OPTIONS,
      },
      {
        name: "lead",
        label: "Lead time",
        type: "text",
        placeholder: "Ex: 8 dias",
        section: "Classificacao",
      },
      {
        name: "minRequest",
        label: "Pedido minimo",
        type: "text",
        required: true,
        placeholder: "Ex: R$ 4.500,00",
        section: "Classificacao",
      },
      {
        name: "contact",
        label: "Contato principal",
        type: "text",
        placeholder: "Ex: Luciana Barros",
        section: "Contato e Logistica",
        sectionDescription: "Canal de contato e dados de operacao do fornecedor.",
      },
      {
        name: "phone",
        label: "Telefone",
        type: "tel",
        required: true,
        placeholder: "Ex: (11) 99999-0000",
        section: "Contato e Logistica",
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "contato@fornecedor.com",
        section: "Contato e Logistica",
      },
      {
        name: "city",
        label: "Cidade",
        type: "text",
        required: true,
        placeholder: "Ex: Sao Paulo",
        section: "Contato e Logistica",
      },
      {
        name: "state",
        label: "UF",
        type: "text",
        required: true,
        placeholder: "Ex: SP",
        section: "Contato e Logistica",
      },
      {
        name: "location",
        label: "Localizacao",
        type: "text",
        required: true,
        placeholder: "Ex: Centro de distribuicao Sudeste",
        section: "Contato e Logistica",
        colSpan: 2,
      },
      {
        name: "lastDelivery",
        label: "Ultima entrega",
        type: "date",
        readOnly: true,
        disabled: true,
        autoFilled: true,
        description: "Preenchimento automatico desativado no momento. Campo permanece vazio.",
        section: "Contato e Logistica",
        defaultValue: "",
      },
    ],
    []
  )

  if (!open) return null

  function handleClose(force = false) {
    if (isSubmitting && !force) return
    setFeedback(null)
    onClose()
  }

  async function handleSubmit(values: Record<string, string>) {
    const payload: CreateSupplierPayload = {
      name: values.name.trim(),
      fantasyName: values.fantasyName.trim(),
      segment: values.segment.trim(),
      risk: values.risk.trim(),
      contact: values.contact?.trim() || undefined,
      city: values.city.trim(),
      state: values.state.trim().toUpperCase(),
      status: values.status.trim(),
      categories: mapSelectedCategories(values.categories),
      lead: values.lead?.trim() || undefined,
      location: values.location.trim(),
      phone: formatPhoneBR(values.phone.trim()),
      email: values.email.trim(),
      minRequest: formatCurrencyField(values.minRequest.trim()),
      lastDelivery: "",
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const response = await createSupplier(payload)
      if (!response.data) {
        throw new Error("A API nao retornou os dados do fornecedor cadastrado.")
      }

      onFeedback?.(ComponentAlert.Success(response.message))
      onCreated?.(mapApiSupplierToUi(response.data))
      handleClose(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel cadastrar fornecedor."
      const errorAlert = ComponentAlert.Error(message)
      setFeedback(errorAlert)
      onFeedback?.(errorAlert)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/60 p-3 backdrop-blur-sm sm:p-6">
      <div className="absolute inset-0" onClick={handleClose} aria-hidden="true" />

      <div className="relative z-10 flex min-h-full items-start justify-center py-1 sm:items-center sm:py-3">
        <div className="flex h-[calc(100dvh-1.25rem)] w-full max-w-5xl flex-col gap-3 sm:h-[calc(100dvh-2rem)]">
          <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

          <FormComponent
            title="Cadastrar fornecedor"
            description="Preencha os dados principais para cadastrar um novo fornecedor."
            fields={fields}
            submitLabel="Cadastrar fornecedor"
            cancelLabel="Fechar"
            scrollable
            className="h-full min-h-0 flex-1"
            loading={isSubmitting}
            onHeaderClose={handleClose}
            onCancel={handleClose}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}
