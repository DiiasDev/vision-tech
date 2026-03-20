"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { ClipboardList, Copy, Eye, ExternalLink, FileCog, MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react"

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

type BudgetFieldKey =
  | "id"
  | "code"
  | "title"
  | "client"
  | "clientDocument"
  | "clientContact"
  | "owner"
  | "items"
  | "value"
  | "validUntil"
  | "status"
  | "priority"
  | "createdAt"
  | "updatedAt"
  | "approvalDate"
  | "expectedCloseDate"
  | "paymentTerms"
  | "deliveryTerm"
  | "slaSummary"
  | "scopeSummary"
  | "assumptions"
  | "exclusions"
  | "interactions"
  | "risks"
  | "nextSteps"
  | "attachments"

const MAX_VISIBLE_FIELDS = 26
const MIN_VISIBLE_FIELDS = 2
const VISIBLE_FIELDS_STORAGE_KEY = "byncode:budget:table-visible-fields:v2"
const VISIBLE_FIELDS_STORAGE_EVENT = "byncode:budget:table-visible-fields:changed"

const BUDGET_FIELD_OPTIONS: ReadonlyArray<TableFieldOption<BudgetFieldKey>> = [
  { key: "id", label: "ID" },
  { key: "code", label: "Codigo" },
  { key: "title", label: "Escopo" },
  { key: "client", label: "Cliente" },
  { key: "clientDocument", label: "Documento" },
  { key: "clientContact", label: "Contato" },
  { key: "owner", label: "Responsavel" },
  { key: "items", label: "Itens" },
  { key: "value", label: "Valor" },
  { key: "validUntil", label: "Validade" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Prioridade" },
  { key: "createdAt", label: "Criado em" },
  { key: "updatedAt", label: "Atualizado" },
  { key: "approvalDate", label: "Aprovacao" },
  { key: "expectedCloseDate", label: "Fechamento previsto" },
  { key: "paymentTerms", label: "Pagamento" },
  { key: "deliveryTerm", label: "Entrega" },
  { key: "slaSummary", label: "SLA" },
  { key: "scopeSummary", label: "Resumo do escopo" },
  { key: "assumptions", label: "Premissas" },
  { key: "exclusions", label: "Exclusoes" },
  { key: "interactions", label: "Interacoes" },
  { key: "risks", label: "Riscos" },
  { key: "nextSteps", label: "Proximas acoes" },
  { key: "attachments", label: "Anexos" },
]

const DEFAULT_VISIBLE_FIELDS: BudgetFieldKey[] = ["code", "client", "owner", "items", "value", "status", "priority", "updatedAt"]
const ALLOWED_FIELD_KEYS = new Set<BudgetFieldKey>(BUDGET_FIELD_OPTIONS.map((item) => item.key))
let cachedVisibleFieldsRaw: string | null = null
let cachedVisibleFieldsSnapshot: BudgetFieldKey[] = DEFAULT_VISIBLE_FIELDS

type BudgetTableProps = {
  budgets: Budget[]
  onEditBudget?: (budget: Budget) => void
  onDeleteBudget?: (budget: Budget) => void
  onDeleteBudgets?: (budgets: Budget[]) => void
  onCopyBudget?: (budget: Budget) => void
  onSendBudget?: (budget: Budget) => void
  onGenerateOrder?: (budget: Budget) => void
  onGenerateRequest?: (budget: Budget) => void
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

function summarizeList(values: string[]) {
  if (values.length === 0) return "Nao informado"
  if (values.length === 1) return values[0]
  return `${values[0]} +${values.length - 1}`
}

export function BudgetTable({
  budgets,
  onEditBudget,
  onDeleteBudget,
  onDeleteBudgets,
  onCopyBudget,
  onSendBudget,
  onGenerateOrder,
  onGenerateRequest,
}: BudgetTableProps) {
  const [detailsBudget, setDetailsBudget] = useState<Budget | null>(null)
  const [selectedBudgetIds, setSelectedBudgetIds] = useState<Set<string>>(new Set())
  const visibleFields = useSyncExternalStore(
    subscribeVisibleFields,
    readStoredVisibleFields,
    () => DEFAULT_VISIBLE_FIELDS
  )
  const [draggingField, setDraggingField] = useState<BudgetFieldKey | null>(null)
  const [dropTargetField, setDropTargetField] = useState<BudgetFieldKey | null>(null)
  const selectedVisibleBudgets = budgets.filter((budget) => selectedBudgetIds.has(budget.id))
  const selectedVisibleCount = budgets.reduce((acc, budget) => (selectedBudgetIds.has(budget.id) ? acc + 1 : acc), 0)
  const allSelected = budgets.length > 0 && selectedVisibleCount === budgets.length
  const hasSelected = selectedVisibleCount > 0 && selectedVisibleCount < budgets.length

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

  function toggleAllVisibleBudgets(checked: boolean) {
    setSelectedBudgetIds((prev) => {
      const next = new Set(prev)

      if (checked) {
        budgets.forEach((budget) => next.add(budget.id))
      } else {
        budgets.forEach((budget) => next.delete(budget.id))
      }

      return next
    })
  }

  function toggleBudgetSelection(budgetId: string, checked: boolean) {
    setSelectedBudgetIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(budgetId)
      else next.delete(budgetId)
      return next
    })
  }

  function renderFieldCell(budget: Budget, field: BudgetFieldKey) {
    const financials = calculateBudgetFinancials(budget)
    const remainingDays = daysUntilDate(budget.validUntil)

    switch (field) {
      case "id":
        return (
          <TableCell key={`${budget.id}-${field}`} className="font-mono text-xs text-muted-foreground">
            {budget.id}
          </TableCell>
        )
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
      case "clientDocument":
        return (
          <TableCell key={`${budget.id}-${field}`}>
            <p className="text-sm text-foreground">{budget.client.document}</p>
            <p className="text-xs text-muted-foreground">
              {budget.client.city} / {budget.client.state}
            </p>
          </TableCell>
        )
      case "clientContact":
        return (
          <TableCell key={`${budget.id}-${field}`}>
            <p className="text-sm text-foreground">{budget.client.contactName}</p>
            <p className="text-xs text-muted-foreground">{budget.client.phone}</p>
          </TableCell>
        )
      case "owner":
        return (
          <TableCell key={`${budget.id}-${field}`} className="text-muted-foreground">
            {budget.owner}
          </TableCell>
        )
      case "items":
        return (
          <TableCell key={`${budget.id}-${field}`}>
            <p className="text-sm font-medium text-foreground">{budget.items.length} itens</p>
            <p className="text-xs text-muted-foreground">{summarizeList(budget.items.map((item) => item.description))}</p>
          </TableCell>
        )
      case "value":
        return (
          <TableCell key={`${budget.id}-${field}`} className="font-medium">
            {formatCurrencyBR(financials.netTotal)}
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
      case "createdAt":
        return (
          <TableCell key={`${budget.id}-${field}`} className="text-muted-foreground">
            {formatBudgetDate(budget.createdAt)}
          </TableCell>
        )
      case "updatedAt":
        return (
          <TableCell key={`${budget.id}-${field}`} className="text-muted-foreground">
            {formatBudgetDate(budget.updatedAt)}
          </TableCell>
        )
      case "approvalDate":
        return (
          <TableCell key={`${budget.id}-${field}`} className="text-muted-foreground">
            {budget.approvalDate ? formatBudgetDate(budget.approvalDate) : "Nao informado"}
          </TableCell>
        )
      case "expectedCloseDate":
        return (
          <TableCell key={`${budget.id}-${field}`} className="text-muted-foreground">
            {formatBudgetDate(budget.expectedCloseDate)}
          </TableCell>
        )
      case "paymentTerms":
        return (
          <TableCell key={`${budget.id}-${field}`}>
            <span className="block max-w-[18rem] whitespace-normal break-words text-sm text-muted-foreground">
              {budget.paymentTerms}
            </span>
          </TableCell>
        )
      case "deliveryTerm":
        return (
          <TableCell key={`${budget.id}-${field}`}>
            <span className="block max-w-[18rem] whitespace-normal break-words text-sm text-muted-foreground">
              {budget.deliveryTerm}
            </span>
          </TableCell>
        )
      case "slaSummary":
        return (
          <TableCell key={`${budget.id}-${field}`}>
            <span className="block max-w-[20rem] whitespace-normal break-words text-sm text-muted-foreground">
              {budget.slaSummary}
            </span>
          </TableCell>
        )
      case "scopeSummary":
        return (
          <TableCell key={`${budget.id}-${field}`}>
            <span className="block max-w-[24rem] whitespace-normal break-words text-sm text-muted-foreground">
              {budget.scopeSummary}
            </span>
          </TableCell>
        )
      case "assumptions":
        return (
          <TableCell key={`${budget.id}-${field}`} className="text-muted-foreground">
            {summarizeList(budget.assumptions)}
          </TableCell>
        )
      case "exclusions":
        return (
          <TableCell key={`${budget.id}-${field}`} className="text-muted-foreground">
            {summarizeList(budget.exclusions)}
          </TableCell>
        )
      case "attachments":
        return (
          <TableCell key={`${budget.id}-${field}`} className="text-muted-foreground">
            {summarizeList(budget.attachments)}
          </TableCell>
        )
      case "interactions":
        return (
          <TableCell key={`${budget.id}-${field}`} className="text-muted-foreground">
            {summarizeList(budget.interactions.map((interaction) => interaction.summary))}
          </TableCell>
        )
      case "risks":
        return (
          <TableCell key={`${budget.id}-${field}`} className="text-muted-foreground">
            {summarizeList(budget.risks.map((risk) => risk.title))}
          </TableCell>
        )
      case "nextSteps":
        return (
          <TableCell key={`${budget.id}-${field}`} className="text-muted-foreground">
            {summarizeList(budget.nextSteps.map((step) => step.action))}
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
      {selectedVisibleCount > 0 ? (
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/20 px-6 py-3">
          <p className="text-sm text-muted-foreground">
            {selectedVisibleCount} {selectedVisibleCount === 1 ? "orcamento selecionado" : "orcamentos selecionados"}
          </p>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDeleteBudgets?.(selectedVisibleBudgets)}
            disabled={!onDeleteBudgets || selectedVisibleBudgets.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Excluir selecionados
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
                  onCheckedChange={(checked) => toggleAllVisibleBudgets(Boolean(checked))}
                  aria-label="Selecionar todos os orcamentos"
                  className="size-5 border-2 border-primary/45 bg-background shadow-sm data-[state=checked]:border-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary"
                />
              </TableHead>

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
                <TableCell colSpan={2 + visibleFields.length} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  Nenhum orcamento encontrado para os filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              budgets.map((budget) => (
                <TableRow key={budget.id} className="cursor-pointer" onClick={() => setDetailsBudget(budget)}>
                  <TableCell className="pl-6" onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={selectedBudgetIds.has(budget.id)}
                      onCheckedChange={(checked) => toggleBudgetSelection(budget.id, Boolean(checked))}
                      aria-label={`Selecionar ${budget.code}`}
                      className="size-5 border-2 border-primary/45 bg-background shadow-sm data-[state=checked]:border-primary"
                    />
                  </TableCell>

                  {visibleFields.map((field) => renderFieldCell(budget, field))}

                  <TableCell className="w-[156px] px-4 text-center" onClick={(event) => event.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon-sm" className="mx-auto h-8 w-8 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir ações de {budget.code}</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
                        <DropdownMenuItem className="rounded-lg" onSelect={() => setDetailsBudget(budget)}>
                          <Eye className="h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>

                        <DropdownMenuItem className="rounded-lg" onSelect={() => onEditBudget?.(budget)}>
                          <Pencil className="h-4 w-4" />
                          Editar
                        </DropdownMenuItem>

                        <DropdownMenuItem className="rounded-lg" onSelect={() => onCopyBudget?.(budget)}>
                          <Copy className="h-4 w-4" />
                          Copiar orçamento
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={`/budget/id?budgetId=${budget.id}`}>
                            <ExternalLink className="h-4 w-4" />
                            Abrir página completa
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem className="rounded-lg" onSelect={() => onSendBudget?.(budget)}>
                          <Send className="h-4 w-4" />
                          Enviar orçamento
                        </DropdownMenuItem>

                        <DropdownMenuItem className="rounded-lg" onSelect={() => onGenerateOrder?.(budget)}>
                          <FileCog className="h-4 w-4" />
                          Gerar OS
                        </DropdownMenuItem>

                        <DropdownMenuItem className="rounded-lg" onSelect={() => onGenerateRequest?.(budget)}>
                          <ClipboardList className="h-4 w-4" />
                          Gerar pedido
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="rounded-lg text-rose-600 focus:text-rose-600"
                          onSelect={() => onDeleteBudget?.(budget)}
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
