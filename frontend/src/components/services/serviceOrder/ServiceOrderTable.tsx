"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { CheckCheck, Copy, Eye, MoreHorizontal, Pencil, Play, Trash2 } from "lucide-react"

import { TableFieldSelector, type TableFieldOption } from "@/components/layout/TableFieldSelector"
import { ServiceOrderDetailsDialog } from "@/components/services/serviceOrder/ServiceOrderDetailsDialog"
import {
  type ServiceOrder,
  type ServiceOrderStatus,
  calculateServiceOrderFinancials,
  calculateServiceOrderProgress,
  daysUntilServiceOrderDeadline,
  formatServiceOrderDate,
  formatServiceOrderDateTime,
  serviceOrderPriorityLabel,
  serviceOrderPriorityTone,
  serviceOrderStatusLabel,
  serviceOrderStatusTone,
} from "@/components/services/serviceOrder/service-order-mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatCurrencyBR } from "@/utils/Formatter"

type ServiceOrderFieldKey =
  | "code"
  | "title"
  | "client"
  | "serviceName"
  | "technician"
  | "scheduledAt"
  | "deadlineDate"
  | "status"
  | "priority"
  | "progress"
  | "estimatedValue"
  | "totalCost"
  | "margin"
  | "sourceBudget"
  | "updatedAt"

const MAX_VISIBLE_FIELDS = 12
const MIN_VISIBLE_FIELDS = 3
const VISIBLE_FIELDS_STORAGE_KEY = "byncode:service-order:table-visible-fields:v1"
const VISIBLE_FIELDS_STORAGE_EVENT = "byncode:service-order:table-visible-fields:changed"

const SERVICE_ORDER_FIELD_OPTIONS: ReadonlyArray<TableFieldOption<ServiceOrderFieldKey>> = [
  { key: "code", label: "Codigo" },
  { key: "title", label: "Titulo" },
  { key: "client", label: "Cliente" },
  { key: "serviceName", label: "Servico" },
  { key: "technician", label: "Tecnico" },
  { key: "scheduledAt", label: "Agendamento" },
  { key: "deadlineDate", label: "Prazo" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Prioridade" },
  { key: "progress", label: "Progresso" },
  { key: "estimatedValue", label: "Valor previsto" },
  { key: "totalCost", label: "Custo" },
  { key: "margin", label: "Margem" },
  { key: "sourceBudget", label: "Orcamento origem" },
  { key: "updatedAt", label: "Atualizado" },
]

const DEFAULT_VISIBLE_FIELDS: ServiceOrderFieldKey[] = [
  "code",
  "client",
  "title",
  "technician",
  "deadlineDate",
  "status",
  "priority",
  "estimatedValue",
]

const ALLOWED_FIELD_KEYS = new Set<ServiceOrderFieldKey>(SERVICE_ORDER_FIELD_OPTIONS.map((item) => item.key))
let cachedVisibleFieldsRaw: string | null = null
let cachedVisibleFieldsSnapshot: ServiceOrderFieldKey[] = DEFAULT_VISIBLE_FIELDS

type ServiceOrderTableProps = {
  orders: ServiceOrder[]
  detailsBasePath: string
  selectedOrderIds: Set<string>
  onToggleSelection: (orderId: string, checked: boolean) => void
  onToggleAll: (checked: boolean) => void
  onDeleteOrder: (order: ServiceOrder) => void
  onDeleteOrders?: (orders: ServiceOrder[]) => void
  onDuplicateOrder: (order: ServiceOrder) => void
  onUpdateStatus: (order: ServiceOrder, nextStatus: ServiceOrderStatus) => void
  onToggleServiceChecklistItem: (orderId: string, serviceItemId: string, checked: boolean) => void
}

function normalizeVisibleFields(value: unknown): ServiceOrderFieldKey[] {
  if (!Array.isArray(value)) return DEFAULT_VISIBLE_FIELDS

  const normalized: ServiceOrderFieldKey[] = []
  for (const item of value) {
    if (typeof item !== "string") continue
    const key = item as ServiceOrderFieldKey
    if (!ALLOWED_FIELD_KEYS.has(key)) continue
    if (normalized.includes(key)) continue

    normalized.push(key)
    if (normalized.length >= MAX_VISIBLE_FIELDS) break
  }

  if (normalized.length < MIN_VISIBLE_FIELDS) return DEFAULT_VISIBLE_FIELDS
  return normalized
}

function readStoredVisibleFields() {
  if (typeof window === "undefined") return DEFAULT_VISIBLE_FIELDS

  try {
    const storedFieldsRaw = window.localStorage.getItem(VISIBLE_FIELDS_STORAGE_KEY)
    if (!storedFieldsRaw) {
      cachedVisibleFieldsRaw = null
      cachedVisibleFieldsSnapshot = DEFAULT_VISIBLE_FIELDS
      return DEFAULT_VISIBLE_FIELDS
    }

    if (storedFieldsRaw === cachedVisibleFieldsRaw) return cachedVisibleFieldsSnapshot

    const parsedFields = JSON.parse(storedFieldsRaw) as unknown
    const normalizedFields = normalizeVisibleFields(parsedFields)
    cachedVisibleFieldsRaw = storedFieldsRaw
    cachedVisibleFieldsSnapshot = normalizedFields
    return normalizedFields
  } catch {
    cachedVisibleFieldsRaw = null
    cachedVisibleFieldsSnapshot = DEFAULT_VISIBLE_FIELDS
    return DEFAULT_VISIBLE_FIELDS
  }
}

function subscribeVisibleFields(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined

  const handleStorage = (event: StorageEvent) => {
    if (event.key === VISIBLE_FIELDS_STORAGE_KEY) onStoreChange()
  }

  const handleSameTabChange = () => onStoreChange()

  window.addEventListener("storage", handleStorage)
  window.addEventListener(VISIBLE_FIELDS_STORAGE_EVENT, handleSameTabChange)

  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(VISIBLE_FIELDS_STORAGE_EVENT, handleSameTabChange)
  }
}

function persistVisibleFields(fields: ServiceOrderFieldKey[]) {
  try {
    window.localStorage.setItem(VISIBLE_FIELDS_STORAGE_KEY, JSON.stringify(fields))
    window.dispatchEvent(new Event(VISIBLE_FIELDS_STORAGE_EVENT))
  } catch {
    // Ignore write failures (private mode, storage disabled, etc.)
  }
}

function isStartActionAvailable(status: ServiceOrderStatus) {
  return status === "scheduled" || status === "awaiting_parts"
}

function isCompleteActionAvailable(status: ServiceOrderStatus) {
  return status === "scheduled" || status === "in_progress" || status === "awaiting_parts"
}

export function ServiceOrderTable({
  orders,
  detailsBasePath,
  selectedOrderIds,
  onToggleSelection,
  onToggleAll,
  onDeleteOrder,
  onDeleteOrders,
  onDuplicateOrder,
  onUpdateStatus,
  onToggleServiceChecklistItem,
}: ServiceOrderTableProps) {
  const visibleFields = useSyncExternalStore(
    subscribeVisibleFields,
    readStoredVisibleFields,
    () => DEFAULT_VISIBLE_FIELDS
  )
  const [draggingField, setDraggingField] = useState<ServiceOrderFieldKey | null>(null)
  const [dropTargetField, setDropTargetField] = useState<ServiceOrderFieldKey | null>(null)
  const [detailsOrderId, setDetailsOrderId] = useState<string | null>(null)
  const detailsOrder = detailsOrderId ? orders.find((order) => order.id === detailsOrderId) ?? null : null

  const selectedVisibleOrders = orders.filter((order) => selectedOrderIds.has(order.id))
  const selectedVisibleCount = selectedVisibleOrders.length
  const allSelected = orders.length > 0 && selectedVisibleCount === orders.length
  const hasSelected = selectedVisibleCount > 0 && selectedVisibleCount < orders.length

  function updateVisibleFields(next: ServiceOrderFieldKey[] | ((prev: ServiceOrderFieldKey[]) => ServiceOrderFieldKey[])) {
    const currentFields = readStoredVisibleFields()
    const nextFields = typeof next === "function" ? next(currentFields) : next
    persistVisibleFields(normalizeVisibleFields(nextFields))
  }

  function moveFieldByDrag(sourceField: ServiceOrderFieldKey, targetField: ServiceOrderFieldKey) {
    if (sourceField === targetField) return

    updateVisibleFields((prev) => {
      const sourceIndex = prev.indexOf(sourceField)
      const targetIndex = prev.indexOf(targetField)
      if (sourceIndex === -1 || targetIndex === -1) return prev

      const reordered = [...prev]
      reordered.splice(sourceIndex, 1)
      const nextTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
      reordered.splice(nextTargetIndex, 0, sourceField)
      return reordered
    })
  }

  function handleHeaderDragEnd() {
    setDraggingField(null)
    setDropTargetField(null)
  }

  function renderFieldCell(order: ServiceOrder, field: ServiceOrderFieldKey) {
    const financials = calculateServiceOrderFinancials(order)
    const progress = calculateServiceOrderProgress(order)

    switch (field) {
      case "code":
        return (
          <TableCell key={`${order.id}-${field}`} className="font-semibold text-foreground">
            {order.code}
          </TableCell>
        )
      case "title":
        return (
          <TableCell key={`${order.id}-${field}`}>
            <p className="font-medium text-foreground">{order.title}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{order.description}</p>
          </TableCell>
        )
      case "client":
        return (
          <TableCell key={`${order.id}-${field}`}>
            <p className="font-medium text-foreground">{order.client.name}</p>
            <p className="text-xs text-muted-foreground">{order.client.segment}</p>
          </TableCell>
        )
      case "serviceName":
        return (
          <TableCell key={`${order.id}-${field}`} className="text-muted-foreground">
            {order.serviceName}
          </TableCell>
        )
      case "technician":
        return (
          <TableCell key={`${order.id}-${field}`} className="text-muted-foreground">
            {order.technician}
          </TableCell>
        )
      case "scheduledAt":
        return (
          <TableCell key={`${order.id}-${field}`} className="text-muted-foreground">
            {formatServiceOrderDateTime(order.scheduledAt)}
          </TableCell>
        )
      case "deadlineDate": {
        const remainingDays = daysUntilServiceOrderDeadline(order.deadlineDate)

        return (
          <TableCell key={`${order.id}-${field}`}>
            <p className="text-sm">{formatServiceOrderDate(order.deadlineDate)}</p>
            <p className={cn("text-xs", remainingDays < 0 ? "text-rose-600" : "text-muted-foreground")}>
              {remainingDays < 0 ? `${Math.abs(remainingDays)} dia(s) em atraso` : `${remainingDays} dia(s) restantes`}
            </p>
          </TableCell>
        )
      }
      case "status":
        return (
          <TableCell key={`${order.id}-${field}`}>
            <Badge variant="outline" className={serviceOrderStatusTone(order.status)}>
              {serviceOrderStatusLabel(order.status)}
            </Badge>
          </TableCell>
        )
      case "priority":
        return (
          <TableCell key={`${order.id}-${field}`}>
            <Badge variant="outline" className={serviceOrderPriorityTone(order.priority)}>
              {serviceOrderPriorityLabel(order.priority)}
            </Badge>
          </TableCell>
        )
      case "progress":
        return (
          <TableCell key={`${order.id}-${field}`}>
            <div className="space-y-1">
              <p className="text-sm font-medium">{progress}%</p>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </TableCell>
        )
      case "estimatedValue":
        return (
          <TableCell key={`${order.id}-${field}`} className="font-medium">
            {formatCurrencyBR(order.estimatedValue)}
          </TableCell>
        )
      case "totalCost":
        return (
          <TableCell key={`${order.id}-${field}`} className="font-medium text-muted-foreground">
            {formatCurrencyBR(financials.totalCost)}
          </TableCell>
        )
      case "margin": {
        const toneClassName =
          financials.marginPercent < 20
            ? "border-rose-300/70 bg-rose-100/80 text-rose-700"
            : financials.marginPercent < 35
              ? "border-amber-300/70 bg-amber-100/80 text-amber-700"
              : "border-emerald-300/70 bg-emerald-100/80 text-emerald-700"

        return (
          <TableCell key={`${order.id}-${field}`}>
            <Badge variant="outline" className={toneClassName}>
              {financials.marginPercent.toFixed(1)}%
            </Badge>
          </TableCell>
        )
      }
      case "sourceBudget":
        return (
          <TableCell key={`${order.id}-${field}`} className="text-muted-foreground">
            {order.sourceBudgetCode || "-"}
          </TableCell>
        )
      case "updatedAt":
        return (
          <TableCell key={`${order.id}-${field}`} className="text-muted-foreground">
            {formatServiceOrderDate(order.updatedAt)}
          </TableCell>
        )
      default:
        return (
          <TableCell key={`${order.id}-${field}`} className="text-muted-foreground">
            -
          </TableCell>
        )
    }
  }

  return (
    <>
      {selectedVisibleCount > 0 ? (
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/20 px-6 py-3">
          <p className="text-sm text-muted-foreground">
            {selectedVisibleCount} {selectedVisibleCount === 1 ? "OS selecionada" : "OS selecionadas"}
          </p>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDeleteOrders?.(selectedVisibleOrders)}
            disabled={!onDeleteOrders || selectedVisibleOrders.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Excluir selecionadas
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/35 hover:bg-muted/35">
              <TableHead className="w-[56px] pl-6">
                <Checkbox
                  checked={allSelected ? true : hasSelected ? "indeterminate" : false}
                  onCheckedChange={(checked) => onToggleAll(Boolean(checked))}
                  aria-label="Selecionar todas as ordens"
                  className="size-5 border-2 border-primary/45 bg-background shadow-sm data-[state=checked]:border-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary"
                />
              </TableHead>

              {visibleFields.map((field) => {
                const fieldLabel = SERVICE_ORDER_FIELD_OPTIONS.find((item) => item.key === field)?.label ?? field

                return (
                  <TableHead
                    key={field}
                    draggable
                    onDragStart={() => setDraggingField(field)}
                    onDragOver={(event) => {
                      event.preventDefault()
                      if (draggingField && draggingField !== field) setDropTargetField(field)
                    }}
                    onDrop={(event) => {
                      event.preventDefault()
                      if (draggingField) moveFieldByDrag(draggingField, field)
                      handleHeaderDragEnd()
                    }}
                    onDragEnd={handleHeaderDragEnd}
                    className={cn(
                      "cursor-grab select-none active:cursor-grabbing",
                      draggingField === field && "opacity-45",
                      dropTargetField === field && draggingField !== field && "bg-primary/10 text-primary"
                    )}
                    title="Arraste para reordenar a coluna"
                  >
                    <span className="inline-flex items-center gap-2">
                      {fieldLabel}
                      <span className="text-[10px] text-muted-foreground">↕</span>
                    </span>
                  </TableHead>
                )
              })}

              <TableHead className="w-[176px] min-w-[176px] px-4 text-center whitespace-nowrap">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                  <span className="col-start-2 justify-self-center whitespace-nowrap">Acoes</span>
                  <div className="col-start-3 justify-self-end pl-3">
                    <TableFieldSelector
                      fields={SERVICE_ORDER_FIELD_OPTIONS}
                      selectedFields={visibleFields}
                      onSelectionChange={(fields) => updateVisibleFields(fields)}
                      maxSelected={MAX_VISIBLE_FIELDS}
                      minSelected={MIN_VISIBLE_FIELDS}
                    />
                  </div>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2 + visibleFields.length} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  Nenhuma ordem de servico encontrada para os filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer" onClick={() => setDetailsOrderId(order.id)}>
                  <TableCell className="pl-6" onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={selectedOrderIds.has(order.id)}
                      onCheckedChange={(checked) => onToggleSelection(order.id, Boolean(checked))}
                      aria-label={`Selecionar ${order.code}`}
                      className="size-5 border-2 border-primary/45 bg-background shadow-sm data-[state=checked]:border-primary"
                    />
                  </TableCell>

                  {visibleFields.map((field) => renderFieldCell(order, field))}

                  <TableCell
                    className="w-[176px] min-w-[176px] px-4 text-center whitespace-nowrap"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon-sm" className="mx-auto h-8 w-8 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir acoes de {order.code}</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5">
                        <DropdownMenuItem className="rounded-lg" onSelect={() => setDetailsOrderId(order.id)}>
                          <Eye className="h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={`${detailsBasePath}?serviceOrderId=${order.id}`}>
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>

                        {isStartActionAvailable(order.status) ? (
                          <DropdownMenuItem className="rounded-lg" onSelect={() => onUpdateStatus(order, "in_progress")}>
                            <Play className="h-4 w-4" />
                            Iniciar OS
                          </DropdownMenuItem>
                        ) : null}

                        {isCompleteActionAvailable(order.status) ? (
                          <DropdownMenuItem className="rounded-lg" onSelect={() => onUpdateStatus(order, "completed")}>
                            <CheckCheck className="h-4 w-4" />
                            Marcar concluida
                          </DropdownMenuItem>
                        ) : null}

                        <DropdownMenuItem className="rounded-lg" onSelect={() => onDuplicateOrder(order)}>
                          <Copy className="h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          variant="destructive"
                          className="rounded-lg"
                          onSelect={() => onDeleteOrder(order)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ServiceOrderDetailsDialog
        order={detailsOrder}
        detailsBasePath={detailsBasePath}
        open={Boolean(detailsOrder)}
        onToggleServiceChecklistItem={onToggleServiceChecklistItem}
        onOpenChange={(open) => {
          if (!open) setDetailsOrderId(null)
        }}
      />
    </>
  )
}
