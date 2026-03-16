"use client"

import { useMemo, useState } from "react"

import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import FormComponent, { type GenericField } from "@/components/layout/formComponent"
import type { ServiceCatalogItem } from "@/components/services/catalog/catalog-types"
import { createService, type CreateServicePayload } from "@/services/services.service"

type FormServicesProps = {
  open: boolean
  onClose: () => void
  onCreated?: (service: ServiceCatalogItem) => void
  onFeedback?: (feedback: ComponentAlertState) => void
}

function normalizeDecimal(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".").trim()
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00"
}

function parseEstimatedDurationToHours(value: string) {
  const normalized = value.replace(",", ".")
  const matches = normalized.match(/(\d+(\.\d+)?)/)
  if (!matches?.[1]) return 0

  const parsed = Number.parseFloat(matches[1])
  return Number.isFinite(parsed) ? parsed : 0
}

function mapApiStatusToUi(status: string): ServiceCatalogItem["status"] {
  if (status === "INACTIVE") return "inactive"
  if (status === "DRAFT") return "draft"
  return "active"
}

function mapApiBillingModelToUi(model: string): ServiceCatalogItem["billingModel"] {
  if (model === "PROJECT") return "project"
  if (model === "RECURRING") return "recurring"
  return "hourly"
}

export function FormServices({ open, onClose, onCreated, onFeedback }: FormServicesProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)

  const fields = useMemo<GenericField[]>(
    () => [
      {
        name: "code",
        label: "Codigo",
        type: "text",
        section: "Identificacao",
        sectionDescription: "Dados principais e classificacao do servico no catalogo.",
        defaultValue: "Gerado automaticamente ao cadastrar",
        readOnly: true,
        disabled: true,
        autoFilled: true,
        colSpan: 2,
      },
      {
        name: "name",
        label: "Nome do servico",
        type: "text",
        required: true,
        section: "Identificacao",
        placeholder: "Ex: Suporte tecnico 24x7",
        colSpan: 2,
      },
      {
        name: "description",
        label: "Descricao",
        type: "textarea",
        required: true,
        section: "Identificacao",
        placeholder: "Descreva o escopo principal do servico.",
        colSpan: 3,
      },
      {
        name: "category",
        label: "Categoria",
        type: "text",
        required: true,
        section: "Identificacao",
        placeholder: "Ex: Suporte, Implantacao, Consultoria",
      },
      {
        name: "service_type",
        label: "Tipo de servico",
        type: "select",
        required: true,
        section: "Identificacao",
        defaultValue: "SUPPORT",
        options: [
          { label: "Suporte", value: "SUPPORT" },
          { label: "Implantacao", value: "IMPLEMENTATION" },
          { label: "Consultoria", value: "CONSULTING" },
          { label: "Treinamento", value: "TRAINING" },
          { label: "Manutencao", value: "MAINTENANCE" },
        ],
      },
      {
        name: "responsible",
        label: "Responsavel",
        type: "text",
        required: true,
        readOnly: true,
        disabled: true,
        autoFilled: true,
        section: "Identificacao",
        defaultValue: "Responsavel padrao",
        description: "Preenchido automaticamente.",
      },
      {
        name: "billing_model",
        label: "Modelo de cobranca",
        type: "select",
        required: true,
        section: "Comercial",
        sectionDescription: "Informacoes comerciais para precificacao e recorrencia.",
        defaultValue: "PROJECT",
        options: [
          { label: "Projeto", value: "PROJECT" },
          { label: "Recorrente", value: "RECURRING" },
          { label: "Hora tecnica", value: "HOURLY" },
        ],
      },
      {
        name: "billing_unit",
        label: "Unidade de cobranca",
        type: "select",
        required: true,
        section: "Comercial",
        defaultValue: "SERVICE",
        options: [
          { label: "Servico", value: "SERVICE" },
          { label: "Hora", value: "HOUR" },
          { label: "Dia", value: "DAY" },
          { label: "Mes", value: "MONTH" },
        ],
      },
      {
        name: "base_price",
        label: "Preco base (R$)",
        type: "number",
        required: true,
        section: "Comercial",
        placeholder: "Ex: 1450.00",
      },
      {
        name: "internal_cost",
        label: "Custo interno (R$)",
        type: "number",
        required: true,
        section: "Comercial",
        placeholder: "Ex: 900.00",
      },
      {
        name: "estimated_duration",
        label: "Duracao estimada",
        type: "text",
        required: true,
        section: "Operacao",
        sectionDescription: "Indicadores operacionais para planejamento de atendimento.",
        placeholder: "Ex: 8h",
      },
      {
        name: "complexity_level",
        label: "Nivel de complexidade",
        type: "select",
        required: true,
        section: "Operacao",
        defaultValue: "MEDIUM",
        options: [
          { label: "Baixa", value: "LOW" },
          { label: "Media", value: "MEDIUM" },
          { label: "Alta", value: "HIGH" },
          { label: "Critica", value: "CRITICAL" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        section: "Operacao",
        defaultValue: "ACTIVE",
        options: [
          { label: "Ativo", value: "ACTIVE" },
          { label: "Inativo", value: "INACTIVE" },
          { label: "Rascunho", value: "DRAFT" },
        ],
      },
      {
        name: "is_recurring",
        label: "Servico recorrente",
        type: "select",
        required: true,
        section: "Operacao",
        defaultValue: "false",
        options: [
          { label: "Nao", value: "false" },
          { label: "Sim", value: "true" },
        ],
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
    const payload: CreateServicePayload = {
      name: values.name.trim(),
      description: values.description.trim(),
      category: values.category.trim(),
      service_type: values.service_type.trim(),
      billing_model: values.billing_model.trim(),
      billing_unit: values.billing_unit.trim(),
      base_price: normalizeDecimal(values.base_price),
      internal_cost: normalizeDecimal(values.internal_cost),
      estimated_duration: values.estimated_duration.trim(),
      complexity_level: values.complexity_level.trim(),
      responsible: values.responsible.trim(),
      status: (values.status?.trim() || "ACTIVE") as "ACTIVE" | "INACTIVE" | "DRAFT",
      is_recurring: values.is_recurring === "true",
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const response = await createService(payload)
      const created = response.payload?.data

      if (!created?.id || !created?.code) {
        throw new Error("A API nao retornou os dados do servico criado.")
      }

      const estimatedHours = parseEstimatedDurationToHours(payload.estimated_duration)

      onCreated?.({
        id: created.id,
        code: created.code,
        name: payload.name,
        description: payload.description,
        category: payload.category,
        billingModel: mapApiBillingModelToUi(payload.billing_model),
        status: mapApiStatusToUi(payload.status ?? "ACTIVE"),
        basePrice: Number.parseFloat(payload.base_price) || 0,
        slaHours: estimatedHours,
        avgExecutionHours: estimatedHours,
        activeContracts: 0,
        responsible: payload.responsible || "Responsavel padrao",
        updatedAt: new Date().toISOString(),
      })

      const successMessage =
        response.message?.trim() || `Servico "${payload.name}" cadastrado com sucesso no catalogo.`

      onFeedback?.(ComponentAlert.Success(successMessage))
      handleClose(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel cadastrar servico."
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
            title="Cadastrar servico"
            description="Preencha os campos para adicionar um novo servico ao catalogo."
            fields={fields}
            submitLabel="Cadastrar servico"
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
