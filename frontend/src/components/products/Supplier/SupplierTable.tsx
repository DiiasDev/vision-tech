"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { Eye, MoreHorizontal, PencilLine, Trash2 } from "lucide-react"

import { TableFieldSelector, type TableFieldOption } from "@/components/layout/TableFieldSelector"
import { SupplierDetailsDialog } from "@/components/products/Supplier/SupplierDetailsDialog"
import { type Supplier } from "@/components/products/Supplier/supplier-models"
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

type SupplierFieldKey =
  | "code"
  | "name"
  | "fantasyName"
  | "segment"
  | "categories"
  | "status"
  | "risk"
  | "lead"
  | "city"
  | "state"
  | "location"
  | "contact"
  | "phone"
  | "email"
  | "minRequest"
  | "lastDelivery"

const MAX_VISIBLE_FIELDS = 8
const MIN_VISIBLE_FIELDS = 2
const VISIBLE_FIELDS_STORAGE_KEY = "byncode:suppliers:table-visible-fields:v1"
const VISIBLE_FIELDS_STORAGE_EVENT = "byncode:suppliers:table-visible-fields:changed"

const SUPPLIER_FIELD_OPTIONS: ReadonlyArray<TableFieldOption<SupplierFieldKey>> = [
  { key: "code", label: "Código" },
  { key: "name", label: "Nome" },
  { key: "fantasyName", label: "Nome fantasia" },
  { key: "segment", label: "Segmento" },
  { key: "categories", label: "Categoria" },
  { key: "status", label: "Status" },
  { key: "risk", label: "Risco" },
  { key: "lead", label: "Lead time" },
  { key: "city", label: "Cidade" },
  { key: "state", label: "UF" },
  { key: "location", label: "Localização" },
  { key: "contact", label: "Contato" },
  { key: "phone", label: "Telefone" },
  { key: "email", label: "Email" },
  { key: "minRequest", label: "Pedido mínimo" },
  { key: "lastDelivery", label: "Última entrega" },
]

const DEFAULT_VISIBLE_FIELDS: SupplierFieldKey[] = ["name", "segment", "city", "status", "risk", "lead"]
const ALLOWED_FIELD_KEYS = new Set<SupplierFieldKey>(SUPPLIER_FIELD_OPTIONS.map((item) => item.key))
let cachedVisibleFieldsRaw: string | null = null
let cachedVisibleFieldsSnapshot: SupplierFieldKey[] = DEFAULT_VISIBLE_FIELDS

type SupplierTableProps = {
  suppliers: Supplier[]
  deletingSupplierIds: Set<string>
  selectedSupplierIds: Set<string>
  onToggleSelection: (supplierId: string, checked: boolean) => void
  onToggleAll: (checked: boolean) => void
  onDeleteSupplier: (supplierId: string) => void
}

function normalizeValue(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR")
}

function buildRiskStyle(risk: string) {
  const normalizedRisk = normalizeValue(risk)
  if (normalizedRisk === "alto") return "border-red-300/60 bg-red-100/65 text-red-700"
  if (normalizedRisk === "medio") return "border-amber-300/60 bg-amber-100/65 text-amber-700"
  return "border-emerald-300/60 bg-emerald-100/65 text-emerald-700"
}

function buildStatusStyle(status: string) {
  const normalizedStatus = normalizeValue(status)
  if (normalizedStatus === "ativo") return "border-sky-300/60 bg-sky-100/65 text-sky-700"
  if (normalizedStatus === "avaliacao") return "border-violet-300/60 bg-violet-100/65 text-violet-700"
  return "border-slate-300/60 bg-slate-200/75 text-slate-700"
}

function normalizeVisibleFields(value: unknown): SupplierFieldKey[] {
  if (!Array.isArray(value)) return DEFAULT_VISIBLE_FIELDS

  const normalized: SupplierFieldKey[] = []
  for (const item of value) {
    if (typeof item !== "string") continue
    const key = item as SupplierFieldKey
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

function persistVisibleFields(fields: SupplierFieldKey[]) {
  try {
    window.localStorage.setItem(VISIBLE_FIELDS_STORAGE_KEY, JSON.stringify(fields))
    window.dispatchEvent(new Event(VISIBLE_FIELDS_STORAGE_EVENT))
  } catch {
    // Ignore write failures (private mode, storage disabled, etc.)
  }
}

export function SupplierTable({
  suppliers,
  deletingSupplierIds,
  selectedSupplierIds,
  onToggleSelection,
  onToggleAll,
  onDeleteSupplier,
}: SupplierTableProps) {
  const [detailsSupplier, setDetailsSupplier] = useState<Supplier | null>(null)
  const visibleFields = useSyncExternalStore(
    subscribeVisibleFields,
    readStoredVisibleFields,
    () => DEFAULT_VISIBLE_FIELDS
  )
  const [draggingField, setDraggingField] = useState<SupplierFieldKey | null>(null)
  const [dropTargetField, setDropTargetField] = useState<SupplierFieldKey | null>(null)
  const allSelected = suppliers.length > 0 && suppliers.every((supplier) => selectedSupplierIds.has(supplier.id))
  const hasSelected = suppliers.some((supplier) => selectedSupplierIds.has(supplier.id))

  function updateVisibleFields(next: SupplierFieldKey[] | ((prev: SupplierFieldKey[]) => SupplierFieldKey[])) {
    const currentFields = readStoredVisibleFields()
    const nextFields = typeof next === "function" ? next(currentFields) : next
    persistVisibleFields(normalizeVisibleFields(nextFields))
  }

  function moveFieldByDrag(sourceField: SupplierFieldKey, targetField: SupplierFieldKey) {
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

  function renderFieldCell(supplier: Supplier, field: SupplierFieldKey) {
    switch (field) {
      case "code":
        return (
          <TableCell key={`${supplier.id}-${field}`} className="font-medium">
            {supplier.code}
          </TableCell>
        )
      case "name":
        return (
          <TableCell key={`${supplier.id}-${field}`} className="font-semibold text-foreground">
            {supplier.name}
          </TableCell>
        )
      case "fantasyName":
        return (
          <TableCell key={`${supplier.id}-${field}`} className="text-muted-foreground">
            {supplier.fantasyName}
          </TableCell>
        )
      case "segment":
        return (
          <TableCell key={`${supplier.id}-${field}`} className="text-muted-foreground">
            {supplier.segment}
          </TableCell>
        )
      case "categories":
        return (
          <TableCell key={`${supplier.id}-${field}`} className="text-muted-foreground">
            <span className="block max-w-[18rem] whitespace-normal break-words">{supplier.categories || "-"}</span>
          </TableCell>
        )
      case "status":
        return (
          <TableCell key={`${supplier.id}-${field}`}>
            <Badge variant="outline" className={buildStatusStyle(supplier.status)}>
              {supplier.status}
            </Badge>
          </TableCell>
        )
      case "risk":
        return (
          <TableCell key={`${supplier.id}-${field}`}>
            <Badge variant="outline" className={buildRiskStyle(supplier.risk)}>
              {supplier.risk}
            </Badge>
          </TableCell>
        )
      case "lead":
        return (
          <TableCell key={`${supplier.id}-${field}`} className="text-muted-foreground">
            {supplier.lead || "-"}
          </TableCell>
        )
      case "city":
        return (
          <TableCell key={`${supplier.id}-${field}`} className="text-muted-foreground">
            {supplier.city}
          </TableCell>
        )
      case "state":
        return (
          <TableCell key={`${supplier.id}-${field}`} className="text-muted-foreground">
            {supplier.state}
          </TableCell>
        )
      case "location":
        return (
          <TableCell key={`${supplier.id}-${field}`} className="text-muted-foreground">
            <span className="block max-w-[16rem] whitespace-normal break-words">{supplier.location || "-"}</span>
          </TableCell>
        )
      case "contact":
        return (
          <TableCell key={`${supplier.id}-${field}`} className="text-muted-foreground">
            {supplier.contact || "-"}
          </TableCell>
        )
      case "phone":
        return (
          <TableCell key={`${supplier.id}-${field}`} className="text-muted-foreground">
            {supplier.phone || "-"}
          </TableCell>
        )
      case "email":
        return (
          <TableCell key={`${supplier.id}-${field}`} className="text-muted-foreground">
            {supplier.email || "-"}
          </TableCell>
        )
      case "minRequest":
        return (
          <TableCell key={`${supplier.id}-${field}`} className="text-muted-foreground">
            {supplier.minRequest || "-"}
          </TableCell>
        )
      case "lastDelivery":
        return (
          <TableCell key={`${supplier.id}-${field}`} className="text-muted-foreground">
            {supplier.lastDelivery || "-"}
          </TableCell>
        )
      default:
        return (
          <TableCell key={`${supplier.id}-${field}`} className="text-muted-foreground">
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
                aria-label="Selecionar todos os fornecedores"
                className="size-5 border-2 border-primary/45 bg-background shadow-sm data-[state=checked]:border-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary"
              />
            </TableHead>

            {visibleFields.map((field) => {
              const fieldLabel = SUPPLIER_FIELD_OPTIONS.find((item) => item.key === field)?.label ?? field
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

            <TableHead className="w-[156px] px-3 text-center">
              <div className="relative flex items-center justify-center">
                <span className="block w-full text-center">Ações</span>
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <TableFieldSelector
                    fields={SUPPLIER_FIELD_OPTIONS}
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
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2 + visibleFields.length} className="px-6 py-12 text-center text-sm text-muted-foreground">
                Nenhum fornecedor encontrado para os filtros atuais.
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => {
              const isDeleting = deletingSupplierIds.has(supplier.id)

              return (
                <TableRow key={supplier.id}>
                  <TableCell className="pl-6">
                    <Checkbox
                      checked={selectedSupplierIds.has(supplier.id)}
                      onCheckedChange={(checked) => onToggleSelection(supplier.id, Boolean(checked))}
                      aria-label={`Selecionar ${supplier.name}`}
                      className="size-5 border-2 border-primary/45 bg-background shadow-sm data-[state=checked]:border-primary"
                    />
                  </TableCell>

                  {visibleFields.map((field) => renderFieldCell(supplier, field))}

                  <TableCell className="w-[156px] px-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon-sm" className="mx-auto h-8 w-8 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir ações de {supplier.name}</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5">
                        <DropdownMenuItem className="rounded-lg" onSelect={() => setDetailsSupplier(supplier)}>
                          <Eye className="h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={`/dashboard/produtos/fornecedores/id?supplierId=${supplier.id}`}>
                            <PencilLine className="h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          variant="destructive"
                          className="rounded-lg"
                          disabled={isDeleting}
                          onSelect={() => onDeleteSupplier(supplier.id)}
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

      <SupplierDetailsDialog
        supplier={detailsSupplier}
        open={Boolean(detailsSupplier)}
        onOpenChange={(open) => {
          if (!open) setDetailsSupplier(null)
        }}
      />
    </>
  )
}
