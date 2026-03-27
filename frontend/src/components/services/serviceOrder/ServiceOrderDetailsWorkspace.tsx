"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, CircleAlert, Pencil, Percent, UserRound, Wallet, Wrench } from "lucide-react"

import { AlertComponent, type ComponentAlertState } from "@/components/layout/AlertComponent"
import { FormServiceOrder } from "@/components/services/serviceOrder/FormServiceOrder"
import {
  type ServiceOrder,
  type ServiceOrderPriority,
  type ServiceOrderServiceItem,
  type ServiceOrderStatus,
  calculateServiceOrderFinancials,
  calculateServiceOrderProgress,
  daysUntilServiceOrderDeadline,
  formatServiceOrderDate,
  formatServiceOrderDateLong,
  formatServiceOrderDateTime,
  serviceOrderPriorityLabel,
  serviceOrderPriorityTone,
  serviceOrderStatusLabel,
  serviceOrderStatusTone,
} from "@/components/services/serviceOrder/service-order-mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getServiceOrders, type ApiServiceOrder } from "@/services/orderServices.service"
import { formatCpfCnpj, formatCurrencyBR, formatPhoneBR } from "@/utils/Formatter"

type ServiceOrderDetailsWorkspaceProps = {
  ordersHref: string
}

function formatDateOnly(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDateTimeOffset(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}:00-03:00`
}

function complexityByPriority(priority: ServiceOrderPriority) {
  if (priority === "critical") return "alta"
  if (priority === "high") return "alta"
  if (priority === "medium") return "media"
  return "baixa"
}

function defaultDoneCountByStatus(status: ServiceOrderStatus) {
  if (status === "completed") return 3
  if (status === "awaiting_parts") return 2
  if (status === "in_progress") return 1
  return 0
}

function buildDefaultServiceItems(order: ServiceOrder): ServiceOrderServiceItem[] {
  const doneCount = defaultDoneCountByStatus(order.status)
  const complexity = complexityByPriority(order.priority)
  const baseCode = order.code.replace("OS-", "")
  const defaultCatalogStatus = order.status === "cancelled" ? "inactive" : "active"

  const templates = [
    {
      suffix: "01",
      name: `Diagnostico - ${order.serviceName}`,
      serviceType: "diagnostico",
      billingModel: "hourly",
      billingUnit: "hora",
      estimatedDuration: "2h",
    },
    {
      suffix: "02",
      name: `Execucao tecnica - ${order.serviceName}`,
      serviceType: "implantacao",
      billingModel: "project",
      billingUnit: "projeto",
      estimatedDuration: "4h",
    },
    {
      suffix: "03",
      name: `Validacao final - ${order.serviceName}`,
      serviceType: "validacao",
      billingModel: "hourly",
      billingUnit: "hora",
      estimatedDuration: "1h",
    },
  ] as const

  return templates.map((template, index) => ({
    id: `svc-${order.id}-${template.suffix}`,
    code: `SVC-${baseCode}-${template.suffix}`,
    name: template.name,
    category: order.serviceName,
    serviceType: template.serviceType,
    billingModel: template.billingModel,
    billingUnit: template.billingUnit,
    estimatedDuration: template.estimatedDuration,
    complexityLevel: complexity,
    responsible: order.technician,
    catalogStatus: defaultCatalogStatus,
    checkStatus: index < doneCount ? "done" : "pending",
  }))
}

function ensureOrderServiceItems(order: ServiceOrder): ServiceOrder {
  if (order.serviceItems && order.serviceItems.length > 0) return order
  return {
    ...order,
    serviceItems: buildDefaultServiceItems(order),
  }
}

function parseNumberValue(value: string | number | null | undefined, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value !== "string") return fallback

  const normalized = value.trim().replace(/\s/g, "").replace(",", ".")
  if (!normalized) return fallback

  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toDateOnlyFromValue(value: string | null | undefined) {
  if (!value) return formatDateOnly()
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return formatDateOnly()
  return formatDateOnly(parsed)
}

function toDateTimeFromValue(value: string | null | undefined) {
  if (!value) return formatDateTimeOffset(new Date())
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return formatDateTimeOffset(new Date())
  return formatDateTimeOffset(parsed)
}

function mapStatusFromApi(status: ApiServiceOrder["status"]): ServiceOrderStatus {
  if (status === "IN_PROGRESS") return "in_progress"
  if (status === "AWAITING_PARTS") return "awaiting_parts"
  if (status === "COMPLETED") return "completed"
  if (status === "CANCELED") return "cancelled"
  return "scheduled"
}

function mapPriorityFromApi(priority: ApiServiceOrder["priority"]): ServiceOrderPriority {
  if (priority === "LOW") return "low"
  if (priority === "HIGH") return "high"
  if (priority === "CRITICAL") return "critical"
  return "medium"
}

function mapClientSegment(clientType: "PF" | "PJ" | null | undefined) {
  if (clientType === "PF") return "Pessoa Fisica"
  if (clientType === "PJ") return "Pessoa Juridica"
  return "Nao informado"
}

function mapPartStatusFromApi(status: string | null | undefined): "planned" | "reserved" | "used" {
  const normalized = (status ?? "").trim().toLowerCase()
  if (!normalized) return "planned"
  if (normalized.includes("reserv")) return "reserved"
  if (normalized.includes("used") || normalized.includes("utiliz")) return "used"
  return "planned"
}

function mapServiceOrderFromApi(order: ApiServiceOrder): ServiceOrder {
  const status = mapStatusFromApi(order.status)
  const priority = mapPriorityFromApi(order.priority)
  const serviceItems =
    order.services?.map((item, index) => ({
      id: item.id ?? `${order.id}-service-${index + 1}`,
      code: item.code?.trim() || `SVC-${order.code.replace("OS-", "")}-${String(index + 1).padStart(2, "0")}`,
      name: item.name?.trim() || "Servico tecnico",
      category: item.category?.trim() || "Servico tecnico",
      serviceType: item.serviceType?.trim() || "tecnico",
      billingModel: item.billingModel?.trim() || "project",
      billingUnit: item.billingUnit?.trim() || "unidade",
      estimatedDuration: item.estimatedDuration?.trim() || "1h",
      complexityLevel: item.complexityLevel?.trim() || "media",
      responsible: item.responsible?.trim() || order.responsible?.trim() || "Nao informado",
      catalogStatus: item.catalogStatus?.trim() || "ACTIVE",
      checkStatus: item.isCompleted ? ("done" as const) : ("pending" as const),
    })) ?? []

  const partItems =
    order.products?.map((item, index) => ({
      id: item.id ?? `${order.id}-part-${index + 1}`,
      sku: item.product?.code?.trim() || `ITEM-${String(index + 1).padStart(2, "0")}`,
      description: item.description?.trim() || item.product?.name?.trim() || "Item sem descricao",
      quantity: Number.isFinite(item.quantity) ? item.quantity : 1,
      unitCost: parseNumberValue(item.unitCost, 0),
      status: mapPartStatusFromApi(item.status),
    })) ?? []

  const timeline =
    order.timeline?.map((item, index) => ({
      id: item.id ?? `${order.id}-timeline-${index + 1}`,
      at: toDateTimeFromValue(item.eventAt),
      author: item.authorName?.trim() || order.createdBy?.name?.trim() || "Sistema",
      event: item.event?.trim() || "Atualizacao",
      notes: item.notes?.trim() || "",
    })) ?? []

  const fallbackTimeline =
    timeline.length > 0
      ? timeline
      : [
          {
            id: `${order.id}-timeline-created`,
            at: toDateTimeFromValue(order.createdAt),
            author: order.createdBy?.name?.trim() || "Sistema",
            event: "OS criada",
            notes: "Ordem registrada no sistema.",
          },
        ]

  const checklist = Array.isArray(order.checklist)
    ? order.checklist.map((item) => item.trim()).filter((item) => item.length > 0)
    : []

  const notes = fallbackTimeline.map((item) => item.notes.trim()).filter((item) => item.length > 0)

  const serviceName =
    serviceItems[0]?.name?.trim() || order.service?.name?.trim() || order.title?.trim() || "Servico tecnico"
  const responsibleName =
    order.responsible?.trim() ||
    order.responsibleUser?.name?.trim() ||
    order.createdBy?.name?.trim() ||
    "Nao informado"

  const clientName = order.client?.name?.trim() || "Cliente nao informado"
  const clientCity = order.client?.city?.trim() || ""
  const clientState = order.client?.state?.trim() || ""
  const locationLabel = [clientCity, clientState].filter((item) => item.length > 0).join("/")
  const streetLabel = [order.client?.street?.trim(), order.client?.number?.trim()].filter(Boolean).join(", ")
  const neighborhoodLabel = order.client?.neighborhood?.trim() || ""
  const executionAddress = [streetLabel, neighborhoodLabel, locationLabel]
    .map((value) => (value ?? "").trim())
    .filter((value) => value.length > 0)
    .join(" - ")

  const partsTotal = partItems.reduce((acc, item) => acc + item.quantity * item.unitCost, 0)
  const totalCost = parseNumberValue(order.totalCost, 0)
  const estimatedLaborCost = Math.max(0, totalCost - partsTotal)
  const laborItems =
    estimatedLaborCost > 0
      ? [
          {
            id: `${order.id}-labor-01`,
            description: `Mao de obra - ${serviceName}`,
            technician: responsibleName,
            estimatedHours: 1,
            workedHours: 1,
            hourlyCost: Number(estimatedLaborCost.toFixed(2)),
            status: status === "completed" ? ("done" as const) : ("pending" as const),
          },
        ]
      : []

  const fallbackCodeToken = order.id.replace(/\W/g, "").slice(-4).toUpperCase() || "0000"

  return {
    id: order.id,
    code: order.code?.trim() || `OS-${fallbackCodeToken}`,
    title: order.title?.trim() || `Ordem ${order.code?.trim() || order.id}`,
    description: order.description?.trim() || "Sem descricao tecnica.",
    status,
    priority,
    createdAt: toDateOnlyFromValue(order.createdAt),
    updatedAt: toDateOnlyFromValue(order.updatedAt),
    scheduledAt: toDateTimeFromValue(order.scheduling ?? order.createdAt),
    deadlineDate: toDateOnlyFromValue(order.term),
    concludedAt: status === "completed" ? toDateOnlyFromValue(order.updatedAt ?? order.term) : null,
    coordinator: order.createdBy?.name?.trim() || responsibleName,
    technician: responsibleName,
    serviceName,
    sourceBudgetId: order.budget?.id?.trim() || order.budgetId?.trim() || null,
    sourceBudgetCode: order.budget?.code?.trim() || null,
    executionAddress: executionAddress || locationLabel || "Endereco nao informado",
    estimatedValue: parseNumberValue(order.totalValue, 0),
    checklist,
    notes,
    client: {
      id: order.client?.id ?? order.clientId,
      name: clientName,
      segment: mapClientSegment(order.client?.type),
      document: formatCpfCnpj(order.client?.document?.trim() || "-"),
      city: clientCity || "-",
      state: clientState || "-",
      contactName: order.client?.responsibleName?.trim() || clientName,
      email: order.client?.responsibleEmail?.trim() || order.client?.email?.trim() || "-",
      phone: formatPhoneBR(order.client?.responsiblePhone?.trim() || order.client?.telephone?.trim() || "-"),
    },
    serviceItems,
    laborItems,
    partItems,
    timeline: fallbackTimeline,
  }
}

function laborStatusLabel(status: "pending" | "done") {
  return status === "done" ? "Concluida" : "Pendente"
}

function partStatusLabel(status: "planned" | "reserved" | "used") {
  if (status === "reserved") return "Reservada"
  if (status === "used") return "Utilizada"
  return "Planejada"
}

export function ServiceOrderDetailsWorkspace({ ordersHref }: ServiceOrderDetailsWorkspaceProps) {
  const searchParams = useSearchParams()
  const serviceOrderId = searchParams.get("serviceOrderId")?.trim() ?? ""
  const requestedMode = searchParams.get("mode")?.trim().toLowerCase() ?? ""

  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)
  const [hasAutoOpenedEdit, setHasAutoOpenedEdit] = useState(false)

  useEffect(() => {
    setIsEditFormOpen(false)
    setHasAutoOpenedEdit(false)
  }, [serviceOrderId])

  useEffect(() => {
    let isMounted = true

    if (!serviceOrderId) {
      setSelectedOrder(null)
      setLoadError("Ordem de servico nao informada.")
      return () => {
        isMounted = false
      }
    }

    const loadOrder = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)

        const response = await getServiceOrders()
        if (!isMounted) return

        const mappedOrders = response.data.map((item) => ensureOrderServiceItems(mapServiceOrderFromApi(item)))
        const foundOrder = mappedOrders.find((item) => item.id === serviceOrderId) ?? null

        if (!foundOrder) {
          setSelectedOrder(null)
          setLoadError("Ordem de servico nao encontrada para o identificador informado.")
          return
        }

        setSelectedOrder(foundOrder)
      } catch (error) {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : "Nao foi possivel carregar a ordem de servico."
        setSelectedOrder(null)
        setLoadError(message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadOrder()

    return () => {
      isMounted = false
    }
  }, [serviceOrderId])

  useEffect(() => {
    if (requestedMode !== "edit" || !selectedOrder || hasAutoOpenedEdit) return
    setIsEditFormOpen(true)
    setHasAutoOpenedEdit(true)
  }, [hasAutoOpenedEdit, requestedMode, selectedOrder])

  if (isLoading) {
    return (
      <div className="space-y-6 pb-6">
        <article className="rounded-2xl border border-border/70 bg-card/80 p-4 text-foreground">
          <p className="inline-flex items-center gap-2 text-sm font-semibold">Carregando ordem de servico...</p>
        </article>

        <Button asChild variant="outline">
          <Link href={ordersHref}>
            <ArrowLeft className="h-4 w-4" />
            Voltar para ordens de servico
          </Link>
        </Button>
      </div>
    )
  }

  if (!selectedOrder) {
    return (
      <div className="space-y-6 pb-6">
        <article className="rounded-2xl border border-amber-300/60 bg-amber-100/70 p-4 text-amber-900">
          <p className="inline-flex items-center gap-2 text-sm font-semibold">
            <CircleAlert className="h-4 w-4" />
            {loadError || "Ordem de servico nao encontrada."}
          </p>
        </article>

        <Button asChild variant="outline">
          <Link href={ordersHref}>
            <ArrowLeft className="h-4 w-4" />
            Voltar para ordens de servico
          </Link>
        </Button>
      </div>
    )
  }

  const financials = calculateServiceOrderFinancials(selectedOrder)
  const progress = calculateServiceOrderProgress(selectedOrder)
  const remainingDays = daysUntilServiceOrderDeadline(selectedOrder.deadlineDate)
  const budgetQuery = selectedOrder.sourceBudgetCode
    ? [
        selectedOrder.sourceBudgetId ? `budgetId=${encodeURIComponent(selectedOrder.sourceBudgetId)}` : null,
        `budgetCode=${encodeURIComponent(selectedOrder.sourceBudgetCode)}`,
      ]
        .filter((item): item is string => Boolean(item))
        .join("&")
    : ""
  const sourceBudgetHref = budgetQuery ? `/budget/id?${budgetQuery}` : null

  return (
    <div className="space-y-6 pb-6">
      <FormServiceOrder
        open={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        existingCodes={[selectedOrder.code]}
        mode="edit"
        orderToEdit={selectedOrder}
        onUpdated={(updatedOrder) => {
          setSelectedOrder(ensureOrderServiceItems(updatedOrder))
          setIsEditFormOpen(false)
        }}
        onFeedback={setFeedback}
      />

      <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

      <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/20 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Button asChild variant="ghost" size="sm" className="h-8 px-2">
              <Link href={ordersHref}>
                <ArrowLeft className="h-4 w-4" />
                Voltar para ordens de servico
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={serviceOrderStatusTone(selectedOrder.status)}>
                {serviceOrderStatusLabel(selectedOrder.status)}
              </Badge>
              <Badge variant="outline" className={serviceOrderPriorityTone(selectedOrder.priority)}>
                Prioridade {serviceOrderPriorityLabel(selectedOrder.priority)}
              </Badge>
              <Badge variant="outline">{selectedOrder.code}</Badge>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">{selectedOrder.title}</h1>
            <p className="text-sm text-muted-foreground">
              Cliente {selectedOrder.client.name} - Tecnico {selectedOrder.technician} - Prazo em{" "}
              {formatServiceOrderDateLong(selectedOrder.deadlineDate)}
            </p>

            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditFormOpen(true)}>
              <Pencil className="h-4 w-4" />
              Editar OS
            </Button>
          </div>

          <div className="grid min-w-[260px] gap-2 text-sm">
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Valor previsto</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrencyBR(selectedOrder.estimatedValue)}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Progresso</p>
              <p className="mt-1 text-lg font-semibold">{progress}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <QuickCard icon={Wallet} label="Valor previsto" value={formatCurrencyBR(selectedOrder.estimatedValue)} />
        <QuickCard icon={Percent} label="Margem" value={`${financials.marginPercent.toFixed(1)}%`} />
        <QuickCard
          icon={Wrench}
          label="Prazo"
          value={remainingDays >= 0 ? `${remainingDays} dia(s) restantes` : `${Math.abs(remainingDays)} dia(s) de atraso`}
        />
        <QuickCard icon={UserRound} label="Tecnico" value={selectedOrder.technician} />
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Resumo operacional</h2>

        <div className="grid gap-3 md:grid-cols-2">
          <InfoLine label="Cliente" value={selectedOrder.client.name} />
          <InfoLine label="Documento" value={selectedOrder.client.document} />
          <InfoLine label="Contato" value={selectedOrder.client.contactName} />
          <InfoLine label="Telefone" value={selectedOrder.client.phone} />
          <InfoLine label="E-mail" value={selectedOrder.client.email} />
          <InfoLine label="Endereco" value={selectedOrder.executionAddress} />
          <InfoLine label="Servico" value={selectedOrder.serviceName} />
          <InfoLine label="Coordenador" value={selectedOrder.coordinator} />
          <InfoLine
            label="Orcamento origem"
            value={
              sourceBudgetHref && selectedOrder.sourceBudgetCode ? (
                <Link
                  href={sourceBudgetHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={(event) => {
                    event.preventDefault()
                    window.open(sourceBudgetHref, "_blank", "noopener,noreferrer")
                  }}
                >
                  {selectedOrder.sourceBudgetCode}
                </Link>
              ) : (
                selectedOrder.sourceBudgetCode || "-"
              )
            }
          />
          <InfoLine label="Agendamento" value={formatServiceOrderDateTime(selectedOrder.scheduledAt)} />
          <InfoLine label="Atualizada em" value={formatServiceOrderDate(selectedOrder.updatedAt)} />
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <p className="font-semibold">Escopo tecnico</p>
          <p className="text-muted-foreground">{selectedOrder.description}</p>
        </div>

        <div className="space-y-2 rounded-xl border border-border/70 bg-background/65 p-3 text-sm">
          <p className="font-semibold">Observacoes</p>
          {selectedOrder.notes.length === 0 ? (
            <p className="text-muted-foreground">Sem observacoes registradas.</p>
          ) : (
            selectedOrder.notes.map((item, index) => (
              <p key={`${selectedOrder.id}-note-${index}`} className="text-muted-foreground">
                - {item}
              </p>
            ))
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-sm">
        <div className="border-b border-border/70 px-5 py-4">
          <h2 className="text-lg font-semibold">Horas tecnicas</h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/35 hover:bg-muted/35">
              <TableHead className="pl-6">Atividade</TableHead>
              <TableHead>Tecnico</TableHead>
              <TableHead>Horas est.</TableHead>
              <TableHead>Horas exec.</TableHead>
              <TableHead>Custo hora</TableHead>
              <TableHead>Custo total</TableHead>
              <TableHead className="pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {selectedOrder.laborItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="pl-6 font-medium">{item.description}</TableCell>
                <TableCell>{item.technician}</TableCell>
                <TableCell>{item.estimatedHours}</TableCell>
                <TableCell>{item.workedHours}</TableCell>
                <TableCell>{formatCurrencyBR(item.hourlyCost)}</TableCell>
                <TableCell className="font-medium">{formatCurrencyBR(item.workedHours * item.hourlyCost)}</TableCell>
                <TableCell className="pr-6">
                  <Badge
                    variant="outline"
                    className={
                      item.status === "done"
                        ? "border-emerald-300/70 bg-emerald-100/80 text-emerald-700"
                        : "border-amber-300/70 bg-amber-100/80 text-amber-700"
                    }
                  >
                    {laborStatusLabel(item.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-sm">
        <div className="border-b border-border/70 px-5 py-4">
          <h2 className="text-lg font-semibold">Pecas e insumos</h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/35 hover:bg-muted/35">
              <TableHead className="pl-6">SKU</TableHead>
              <TableHead>Descricao</TableHead>
              <TableHead>Qtd.</TableHead>
              <TableHead>Custo unit.</TableHead>
              <TableHead>Custo total</TableHead>
              <TableHead className="pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {selectedOrder.partItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                  Esta ordem nao possui pecas vinculadas.
                </TableCell>
              </TableRow>
            ) : (
              selectedOrder.partItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="pl-6 font-medium">{item.sku}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrencyBR(item.unitCost)}</TableCell>
                  <TableCell className="font-medium">{formatCurrencyBR(item.quantity * item.unitCost)}</TableCell>
                  <TableCell className="pr-6">
                    <Badge variant="outline">{partStatusLabel(item.status)}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="grid gap-2 border-t border-border/70 bg-card/90 p-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
          <InfoLine label="Receita estimada" value={formatCurrencyBR(financials.estimatedRevenue)} />
          <InfoLine label="Custo mao de obra" value={formatCurrencyBR(financials.laborCost)} />
          <InfoLine label="Custo pecas" value={formatCurrencyBR(financials.partsCost)} />
          <InfoLine label="Custo total" value={formatCurrencyBR(financials.totalCost)} />
          <InfoLine label="Margem (R$)" value={formatCurrencyBR(financials.marginValue)} strong />
          <InfoLine label="Margem (%)" value={`${financials.marginPercent.toFixed(1)}%`} strong />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Timeline da ordem</h2>

        <div className="space-y-3">
          {selectedOrder.timeline.map((event) => (
            <article key={event.id} className="rounded-xl border border-border/70 bg-background/70 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{event.event}</p>
                <p className="text-xs text-muted-foreground">{formatServiceOrderDateTime(event.at)}</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Autor: {event.author}</p>
              <p className="mt-2 text-sm text-muted-foreground">{event.notes}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function QuickCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card/85 p-4 shadow-sm">
      <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </article>
  )
}

function InfoLine({
  label,
  value,
  strong = false,
}: {
  label: string
  value: React.ReactNode
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/65 px-3 py-2">
      <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <span className={strong ? "text-sm font-semibold" : "text-sm"}>{value}</span>
    </div>
  )
}
