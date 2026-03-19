"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { Eye, MoreHorizontal } from "lucide-react"

import { TableFieldSelector, type TableFieldOption } from "@/components/layout/TableFieldSelector"
import { BudgetDetailsDialog } from "@/components/budget/BudgetDetailsDialog"
import {
  type Budget,
  budgetPriorityLabel,
  budgetPriorityTone,
  budgetStatusLabel,
  budgetStatusTone,
  calculateBudgetFinancials,
  daysUntilDate,
  formatBudgetDate,
} from "@/components/budget/budget-mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatCurrencyBR } from "@/utils/Formatter"

type BudgetFieldKey =
  | "code"
  | "title"
  | "client"
  | "owner"
  | "value"
  | "probability"
  | "validUntil"
  | "status"
  | "priority"
  | "updatedAt"

const MAX_VISIBLE_FIELDS = 8
const MIN_VISIBLE_FIELDS = 2
const VISIBLE_FIELDS_STORAGE_KEY = "byncode:budget:table-visible-fields:v1"
const VISIBLE_FIELDS_STORAGE_EVENT = "byncode:budget:table-visible-fields:changed"

const BUDGET_FIELD_OPTIONS: ReadonlyArray<TableFieldOption<BudgetFieldKey>> = [
  { key: "code", label: "Codigo" },
  { key: "title", label: "Escopo" },
  { key: "client", label: "Cliente" },
  { key: "owner", label: "Responsavel" },
  { key: "value", label: "Valor" },
  { key: "probability", label: "Probabilidade" },
  { key: "validUntil", label: "Validade" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Prioridade" },
  { key: "updatedAt", label: "Atualizado" },
]

const DEFAULT_VISIBLE_FIELDS: BudgetFieldKey[] = ["code", "client", "owner", "value", "probability", "status"]
const ALLOWED_FIELD_KEYS = new Set<BudgetFieldKey>(BUDGET_FIELD_OPTIONS.map((item) => item.key))
let cachedVisibleFieldsRaw: string | null = null
let cachedVisibleFieldsSnapshot: BudgetFieldKey[] = DEFAULT_VISIBLE_FIELDS

type BudgetTableProps = {
  budgets: Budget[]
}

function normalizeVisibleFields(value: unknown): BudgetFieldKey[] {
  if (!Array.isArray(value)) return DEFAULT_VISIBLE_FIELDS

  const normalized: BudgetFieldKey[] = []
  for (const item of value) {
    if (typeof item !== "string") continue
    const key = item as BudgetFieldKey
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

function persistVisibleFields(fields: BudgetFieldKey[]) {
  try {
    window.localStorage.setItem(VISIBLE_FIELDS_STORAGE_KEY, JSON.stringify(fields))
    window.dispatchEvent(new Event(VISIBLE_FIELDS_STORAGE_EVENT))
  } catch {
    // Ignore write failures (private mode, storage disabled, etc.)
  }
}

function probabilityClass(value: number) {
  if (value >= 70) return "bg-emerald-500"
  if (value >= 45) return "bg-amber-500"
  return "bg-rose-500"
}

export function BudgetTable({ budgets }: BudgetTableProps) {
  const [detailsBudget, setDetailsBudget] = useState<Budget | null>(null)
  const visibleFields = useSyncExternalStore(
    subscribeVisibleFields,
    readStoredVisibleFields,
    () => DEFAULT_VISIBLE_FIELDS
  )
  const [draggingField, setDraggingField] = useState<BudgetFieldKey | null>(null)
  const [dropTargetField, setDropTargetField] = useState<BudgetFieldKey | null>(null)

  function updateVisibleFields(next: BudgetFieldKey[] | ((prev: BudgetFieldKey[]) => BudgetFieldKey[])) {
    const currentFields = readStoredVisibleFields()
    const nextFields = typeof next === "function" ? next(currentFields) : next
    persistVisibleFields(normalizeVisibleFields(nextFields))
  }

  function moveFieldByDrag(sourceField: BudgetFieldKey, targetField: BudgetFieldKey) {
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

  function renderFieldCell(budget: Budget, field: BudgetFieldKey) {
    const financials = calculateBudgetFinancials(budget)
    const remainingDays = daysUntilDate(budget.validUntil)

    switch (field) {
      case "code":
        return (
          <TableCell key={`${budget.id}-${field}`} className="font-semibold text-foreground">
            {budget.code}
          </TableCell>
        )
      case "title":
        return (
          <TableCell key={`${budget.id}-${field}`} className="text-muted-foreground">
            <span className="block max-w-[24rem] whitespace-normal break-words">{budget.title}</span>
          </TableCell>
        )
      case "client":
        return (
          <TableCell key={`${budget.id}-${field}`}>
            <p className="font-medium text-foreground">{budget.client.name}</p>
            <p className="text-xs text-muted-foreground">{budget.client.segment}</p>
          </TableCell>
        )
      case "owner":
        return (
          <TableCell key={`${budget.id}-${field}`} className="text-muted-foreground">
            {budget.owner}
          </TableCell>
        )
      case "value":
        return (
          <TableCell key={`${budget.id}-${field}`} className="font-medium">
            {formatCurrencyBR(financials.netTotal)}
          </TableCell>
        )
      case "probability":
        return (
          <TableCell key={`${budget.id}-${field}`}>
            <div className="min-w-[8.5rem] space-y-1">
              <p className="text-sm font-medium">{budget.probability}%</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", probabilityClass(budget.probability))}
                  style={{ width: `${Math.max(0, Math.min(100, budget.probability))}%` }}
                />
              </div>
            </div>
          </TableCell>
        )
      case "validUntil":
        return (
          <TableCell key={`${budget.id}-${field}`}>
            <p className="text-sm">{formatBudgetDate(budget.validUntil)}</p>
            <p className="text-xs text-muted-foreground">
              {remainingDays >= 0 ? `${remainingDays} dias restantes` : "Validade vencida"}
            </p>
          </TableCell>
        )
      case "status":
        return (
          <TableCell key={`${budget.id}-${field}`}>
            <Badge variant="outline" className={budgetStatusTone(budget.status)}>
              {budgetStatusLabel(budget.status)}
            </Badge>
          </TableCell>
        )
      case "priority":
        return (
          <TableCell key={`${budget.id}-${field}`}>
            <Badge variant="outline" className={budgetPriorityTone(budget.priority)}>
              {budgetPriorityLabel(budget.priority)}
            </Badge>
          </TableCell>
        )
      case "updatedAt":
        return (
          <TableCell key={`${budget.id}-${field}`} className="text-muted-foreground">
            {formatBudgetDate(budget.updatedAt)}
          </TableCell>
        )
      default:
        return (
          <TableCell key={`${budget.id}-${field}`} className="text-muted-foreground">
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
            {visibleFields.map((field) => {
              const fieldLabel = BUDGET_FIELD_OPTIONS.find((item) => item.key === field)?.label ?? field

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

            <TableHead className="w-[156px] px-4 text-center">
              <div className="relative flex items-center justify-center">
                <span className="block w-full text-center">Acoes</span>
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <TableFieldSelector
                    fields={BUDGET_FIELD_OPTIONS}
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
          {budgets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={1 + visibleFields.length} className="px-6 py-12 text-center text-sm text-muted-foreground">
                Nenhum orcamento encontrado para os filtros atuais.
              </TableCell>
            </TableRow>
          ) : (
            budgets.map((budget) => (
              <TableRow key={budget.id} className="cursor-pointer" onClick={() => setDetailsBudget(budget)}>
                {visibleFields.map((field) => renderFieldCell(budget, field))}

                <TableCell className="w-[156px] px-4 text-center" onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon-sm" className="mx-auto h-8 w-8 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir acoes de {budget.code}</span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
                      <DropdownMenuItem className="rounded-lg" onSelect={() => setDetailsBudget(budget)}>
                        <Eye className="h-4 w-4" />
                        Ver detalhes
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link href={`/budget/id?budgetId=${budget.id}`}>Abrir pagina completa</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <BudgetDetailsDialog
        budget={detailsBudget}
        open={Boolean(detailsBudget)}
        onOpenChange={(open) => {
          if (!open) setDetailsBudget(null)
        }}
      />
    </>
  )
}
