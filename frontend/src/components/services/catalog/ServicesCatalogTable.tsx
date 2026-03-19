"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { Eye, MoreHorizontal, PencilLine, Trash2 } from "lucide-react"

import { TableFieldSelector, type TableFieldOption } from "@/components/layout/TableFieldSelector"
import { ServiceCatalogDetailsDialog } from "@/components/services/catalog/ServiceCatalogDetailsDialog"
import type { ServiceBillingModel, ServiceCatalogItem, ServiceCatalogStatus } from "@/components/services/catalog/catalog-types"
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

type ServiceFieldKey =
  | "code"
  | "name"
  | "description"
  | "category"
  | "billingModel"
  | "slaHours"
  | "avgExecutionHours"
  | "basePrice"
  | "activeContracts"
  | "responsible"
  | "status"
  | "updatedAt"

const MAX_VISIBLE_FIELDS = 8
const MIN_VISIBLE_FIELDS = 2
const VISIBLE_FIELDS_STORAGE_KEY = "byncode:services-catalog:table-visible-fields:v1"
const VISIBLE_FIELDS_STORAGE_EVENT = "byncode:services-catalog:table-visible-fields:changed"

const SERVICE_FIELD_OPTIONS: ReadonlyArray<TableFieldOption<ServiceFieldKey>> = [
  { key: "code", label: "Código" },
  { key: "name", label: "Serviço" },
  { key: "description", label: "Descrição" },
  { key: "category", label: "Categoria" },
  { key: "billingModel", label: "Modelo" },
  { key: "slaHours", label: "SLA" },
  { key: "avgExecutionHours", label: "Execução média" },
  { key: "basePrice", label: "Preço base" },
  { key: "activeContracts", label: "Contratos" },
  { key: "responsible", label: "Responsável" },
  { key: "status", label: "Status" },
  { key: "updatedAt", label: "Atualizado" },
]

const DEFAULT_VISIBLE_FIELDS: ServiceFieldKey[] = ["name", "category", "billingModel", "basePrice", "status", "updatedAt"]
const ALLOWED_FIELD_KEYS = new Set<ServiceFieldKey>(SERVICE_FIELD_OPTIONS.map((item) => item.key))
let cachedVisibleFieldsRaw: string | null = null
let cachedVisibleFieldsSnapshot: ServiceFieldKey[] = DEFAULT_VISIBLE_FIELDS

type ServicesCatalogTableProps = {
  services: ServiceCatalogItem[]
  detailsBasePath: string
  selectedServiceIds: Set<string>
  deletingServiceIds: Set<string>
  onToggleSelection: (serviceId: string, checked: boolean) => void
  onToggleAll: (checked: boolean) => void
  onDeleteService: (serviceId: string) => void
}

function statusLabel(status: ServiceCatalogStatus) {
  if (status === "active") return "Ativo"
  if (status === "inactive") return "Inativo"
  return "Rascunho"
}

function statusClassName(status: ServiceCatalogStatus) {
  if (status === "active") return "border-emerald-300/60 bg-emerald-100/65 text-emerald-700"
  if (status === "inactive") return "border-zinc-300/60 bg-zinc-100/75 text-zinc-700"
  return "border-amber-300/60 bg-amber-100/65 text-amber-700"
}

function billingModelLabel(model: ServiceBillingModel) {
  if (model === "project") return "Projeto"
  if (model === "recurring") return "Recorrente"
  return "Hora técnica"
}

function formatUpdatedAt(value: string) {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return "Sem registro"
  return parsedDate.toLocaleDateString("pt-BR")
}

function normalizeVisibleFields(value: unknown): ServiceFieldKey[] {
  if (!Array.isArray(value)) return DEFAULT_VISIBLE_FIELDS

  const normalized: ServiceFieldKey[] = []
  for (const item of value) {
    if (typeof item !== "string") continue
    const key = item as ServiceFieldKey
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

function persistVisibleFields(fields: ServiceFieldKey[]) {
  try {
    window.localStorage.setItem(VISIBLE_FIELDS_STORAGE_KEY, JSON.stringify(fields))
    window.dispatchEvent(new Event(VISIBLE_FIELDS_STORAGE_EVENT))
  } catch {
    // Ignore write failures (private mode, storage disabled, etc.)
  }
}

export function ServicesCatalogTable({
  services,
  detailsBasePath,
  selectedServiceIds,
  deletingServiceIds,
  onToggleSelection,
  onToggleAll,
  onDeleteService,
}: ServicesCatalogTableProps) {
  const [detailsService, setDetailsService] = useState<ServiceCatalogItem | null>(null)
  const visibleFields = useSyncExternalStore(
    subscribeVisibleFields,
    readStoredVisibleFields,
    () => DEFAULT_VISIBLE_FIELDS
  )
  const [draggingField, setDraggingField] = useState<ServiceFieldKey | null>(null)
  const [dropTargetField, setDropTargetField] = useState<ServiceFieldKey | null>(null)
  const allSelected = services.length > 0 && services.every((service) => selectedServiceIds.has(service.id))
  const hasSelected = services.some((service) => selectedServiceIds.has(service.id))

  function updateVisibleFields(next: ServiceFieldKey[] | ((prev: ServiceFieldKey[]) => ServiceFieldKey[])) {
    const currentFields = readStoredVisibleFields()
    const nextFields = typeof next === "function" ? next(currentFields) : next
    persistVisibleFields(normalizeVisibleFields(nextFields))
  }

  function moveFieldByDrag(sourceField: ServiceFieldKey, targetField: ServiceFieldKey) {
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

  function renderFieldCell(service: ServiceCatalogItem, field: ServiceFieldKey) {
    switch (field) {
      case "code":
        return (
          <TableCell key={`${service.id}-${field}`} className="font-medium">
            {service.code}
          </TableCell>
        )
      case "name":
        return (
          <TableCell key={`${service.id}-${field}`} className="font-semibold text-foreground">
            {service.name}
          </TableCell>
        )
      case "description":
        return (
          <TableCell key={`${service.id}-${field}`} className="text-muted-foreground">
            <span className="block max-w-[22rem] whitespace-normal break-words">{service.description || "-"}</span>
          </TableCell>
        )
      case "category":
        return (
          <TableCell key={`${service.id}-${field}`} className="text-muted-foreground">
            {service.category}
          </TableCell>
        )
      case "billingModel":
        return (
          <TableCell key={`${service.id}-${field}`} className="text-muted-foreground">
            {billingModelLabel(service.billingModel)}
          </TableCell>
        )
      case "slaHours":
        return (
          <TableCell key={`${service.id}-${field}`} className="text-muted-foreground">
            Até {service.slaHours}h
          </TableCell>
        )
      case "avgExecutionHours":
        return (
          <TableCell key={`${service.id}-${field}`} className="text-muted-foreground">
            {service.avgExecutionHours}h
          </TableCell>
        )
      case "basePrice":
        return (
          <TableCell key={`${service.id}-${field}`} className="font-medium">
            {formatCurrencyBR(service.basePrice)}
          </TableCell>
        )
      case "activeContracts":
        return (
          <TableCell key={`${service.id}-${field}`} className="font-medium">
            {service.activeContracts}
          </TableCell>
        )
      case "responsible":
        return (
          <TableCell key={`${service.id}-${field}`} className="text-muted-foreground">
            {service.responsible}
          </TableCell>
        )
      case "status":
        return (
          <TableCell key={`${service.id}-${field}`}>
            <Badge variant="outline" className={statusClassName(service.status)}>
              {statusLabel(service.status)}
            </Badge>
          </TableCell>
        )
      case "updatedAt":
        return (
          <TableCell key={`${service.id}-${field}`} className="text-muted-foreground">
            {formatUpdatedAt(service.updatedAt)}
          </TableCell>
        )
      default:
        return (
          <TableCell key={`${service.id}-${field}`} className="text-muted-foreground">
            -
          </TableCell>
        )
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/35 hover:bg-muted/35">
            <TableHead className="w-[56px] pl-6">
              <Checkbox
                checked={allSelected ? true : hasSelected ? "indeterminate" : false}
                onCheckedChange={(checked) => onToggleAll(Boolean(checked))}
                aria-label="Selecionar todos os serviços"
                className="size-5 border-2 border-primary/45 bg-background shadow-sm data-[state=checked]:border-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary"
              />
            </TableHead>

            {visibleFields.map((field) => {
              const fieldLabel = SERVICE_FIELD_OPTIONS.find((item) => item.key === field)?.label ?? field
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

            <TableHead className="w-[176px] px-4 text-center">
              <div className="relative flex items-center justify-center">
                <span className="block w-full pr-2 text-center">Ações</span>
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <TableFieldSelector
                    fields={SERVICE_FIELD_OPTIONS}
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
          {services.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2 + visibleFields.length} className="px-6 py-12 text-center text-sm text-muted-foreground">
                Nenhum serviço encontrado para os filtros atuais.
              </TableCell>
            </TableRow>
          ) : (
            services.map((service) => {
              const isDeleting = deletingServiceIds.has(service.id)

              return (
                <TableRow key={service.id}>
                  <TableCell className="pl-6">
                    <Checkbox
                      checked={selectedServiceIds.has(service.id)}
                      onCheckedChange={(checked) => onToggleSelection(service.id, Boolean(checked))}
                      aria-label={`Selecionar ${service.name}`}
                      className="size-5 border-2 border-primary/45 bg-background shadow-sm data-[state=checked]:border-primary"
                    />
                  </TableCell>

                  {visibleFields.map((field) => renderFieldCell(service, field))}

                  <TableCell className="w-[176px] px-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon-sm" className="mx-auto h-8 w-8 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir ações de {service.name}</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5">
                        <DropdownMenuItem className="rounded-lg" onSelect={() => setDetailsService(service)}>
                          <Eye className="h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={`${detailsBasePath}?serviceId=${service.id}`}>
                            <PencilLine className="h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          variant="destructive"
                          className="rounded-lg"
                          disabled={isDeleting}
                          onSelect={() => onDeleteService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          {isDeleting ? "Excluindo..." : "Excluir"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      <ServiceCatalogDetailsDialog
        service={detailsService}
        detailsBasePath={detailsBasePath}
        open={Boolean(detailsService)}
        onOpenChange={(open) => {
          if (!open) setDetailsService(null)
        }}
      />
    </>
  )
}
