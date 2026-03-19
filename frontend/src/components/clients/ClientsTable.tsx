"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { Eye, MoreHorizontal, PencilLine, Trash2 } from "lucide-react"

import { TableFieldSelector, type TableFieldOption } from "@/components/layout/TableFieldSelector"
import { ClientDetailsDialog } from "@/components/clients/ClientDetailsDialog"
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
import { type ClientsListItem } from "@/services/clients.service"
import { formatCpfCnpj, formatPhoneBR } from "@/utils/Formatter"

type ClientFieldKey =
  | "code"
  | "name"
  | "document"
  | "type"
  | "status"
  | "responsibleName"
  | "email"
  | "telephone"
  | "city"
  | "lastContact"
  | "createdAt"
  | "updatedAt"

const MAX_VISIBLE_FIELDS = 8
const MIN_VISIBLE_FIELDS = 2
const VISIBLE_FIELDS_STORAGE_KEY = "byncode:clients:table-visible-fields:v1"
const VISIBLE_FIELDS_STORAGE_EVENT = "byncode:clients:table-visible-fields:changed"
const EMPTY_IDS = new Set<string>()

const CLIENT_FIELD_OPTIONS: ReadonlyArray<TableFieldOption<ClientFieldKey>> = [
  { key: "code", label: "Código" },
  { key: "name", label: "Cliente" },
  { key: "document", label: "Documento" },
  { key: "type", label: "Tipo" },
  { key: "status", label: "Status" },
  { key: "responsibleName", label: "Responsável" },
  { key: "email", label: "Email" },
  { key: "telephone", label: "Telefone" },
  { key: "city", label: "Cidade / UF" },
  { key: "lastContact", label: "Último contato" },
  { key: "createdAt", label: "Criado em" },
  { key: "updatedAt", label: "Atualizado em" },
]

const DEFAULT_VISIBLE_FIELDS: ClientFieldKey[] = ["name", "document", "type", "status", "city", "lastContact"]
const ALLOWED_FIELD_KEYS = new Set<ClientFieldKey>(CLIENT_FIELD_OPTIONS.map((item) => item.key))
let cachedVisibleFieldsRaw: string | null = null
let cachedVisibleFieldsSnapshot: ClientFieldKey[] = DEFAULT_VISIBLE_FIELDS

type ClientsTableProps = {
  clients: ClientsListItem[]
  detailsBasePath?: string
  detailsRouteMode?: "query" | "path"
  detailsParamKey?: string
  selectedClientIds?: Set<string>
  deletingClientIds?: Set<string>
  onToggleSelection?: (clientId: string, checked: boolean) => void
  onToggleAll?: (checked: boolean) => void
  onDeleteClient?: (clientId: string) => void
}

function statusLabel(status: ClientsListItem["status"]) {
  if (status === "ACTIVE") return "Ativo"
  if (status === "DELINQUENT") return "Inadimplente"
  return "Inativo"
}

function statusClassName(status: ClientsListItem["status"]) {
  if (status === "ACTIVE") return "border-emerald-300/60 bg-emerald-100/65 text-emerald-700"
  if (status === "DELINQUENT") return "border-rose-300/60 bg-rose-100/65 text-rose-700"
  return "border-zinc-300/60 bg-zinc-100/75 text-zinc-700"
}

function typeLabel(type: ClientsListItem["type"]) {
  return type === "PJ" ? "PJ" : "PF"
}

function formatDateTime(value?: string | null) {
  if (!value?.trim()) return "Sem registro"

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    return `${day}/${month}/${year}`
  }

  const dateTimeMatch = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value)
  if (dateTimeMatch) {
    const [, year, month, day, hour, minute] = dateTimeMatch
    return `${day}/${month}/${year} ${hour}:${minute}`
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return "Sem registro"

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate)
}

function formatLocation(client: ClientsListItem) {
  if (client.city && client.state) return `${client.city}, ${client.state}`
  if (client.city) return client.city
  if (client.state) return client.state
  return "Não informado"
}

function normalizeVisibleFields(value: unknown): ClientFieldKey[] {
  if (!Array.isArray(value)) return DEFAULT_VISIBLE_FIELDS

  const normalized: ClientFieldKey[] = []
  for (const item of value) {
    if (typeof item !== "string") continue
    const key = item as ClientFieldKey
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

function persistVisibleFields(fields: ClientFieldKey[]) {
  try {
    window.localStorage.setItem(VISIBLE_FIELDS_STORAGE_KEY, JSON.stringify(fields))
    window.dispatchEvent(new Event(VISIBLE_FIELDS_STORAGE_EVENT))
  } catch {
    // Ignore write failures (private mode, storage disabled, etc.)
  }
}

function buildDetailsHref(basePath: string, clientId: string, routeMode: "query" | "path", detailsParamKey: string) {
  const normalizedBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath

  if (routeMode === "path") {
    return `${normalizedBasePath}/${clientId}`
  }

  const separator = normalizedBasePath.includes("?") ? "&" : "?"
  return `${normalizedBasePath}${separator}${detailsParamKey}=${clientId}`
}

export default function ClientsTable({
  clients,
  detailsBasePath = "/clients/id",
  detailsRouteMode = "query",
  detailsParamKey = "clientId",
  selectedClientIds = EMPTY_IDS,
  deletingClientIds = EMPTY_IDS,
  onToggleSelection,
  onToggleAll,
  onDeleteClient,
}: ClientsTableProps) {
  const [detailsClient, setDetailsClient] = useState<ClientsListItem | null>(null)
  const visibleFields = useSyncExternalStore(
    subscribeVisibleFields,
    readStoredVisibleFields,
    () => DEFAULT_VISIBLE_FIELDS
  )
  const [draggingField, setDraggingField] = useState<ClientFieldKey | null>(null)
  const [dropTargetField, setDropTargetField] = useState<ClientFieldKey | null>(null)
  const canSelect = Boolean(onToggleSelection && onToggleAll)
  const canDelete = Boolean(onDeleteClient)
  const allSelected = clients.length > 0 && clients.every((client) => selectedClientIds.has(client.id))
  const hasSelected = clients.some((client) => selectedClientIds.has(client.id))
  const defaultDetailsHref = buildDetailsHref(detailsBasePath, "", detailsRouteMode, detailsParamKey).replace(/\/$/, "")

  function updateVisibleFields(next: ClientFieldKey[] | ((prev: ClientFieldKey[]) => ClientFieldKey[])) {
    const currentFields = readStoredVisibleFields()
    const nextFields = typeof next === "function" ? next(currentFields) : next
    persistVisibleFields(normalizeVisibleFields(nextFields))
  }

  function moveFieldByDrag(sourceField: ClientFieldKey, targetField: ClientFieldKey) {
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

  function renderFieldCell(client: ClientsListItem, field: ClientFieldKey) {
    switch (field) {
      case "code":
        return (
          <TableCell key={`${client.id}-${field}`} className="font-medium">
            {client.code}
          </TableCell>
        )
      case "name":
        return (
          <TableCell key={`${client.id}-${field}`} className="font-semibold text-foreground">
            {client.name}
          </TableCell>
        )
      case "document":
        return (
          <TableCell key={`${client.id}-${field}`} className="text-muted-foreground">
            {formatCpfCnpj(client.document)}
          </TableCell>
        )
      case "type":
        return (
          <TableCell key={`${client.id}-${field}`}>
            <Badge variant="outline">{typeLabel(client.type)}</Badge>
          </TableCell>
        )
      case "status":
        return (
          <TableCell key={`${client.id}-${field}`}>
            <Badge variant="outline" className={statusClassName(client.status)}>
              {statusLabel(client.status)}
            </Badge>
          </TableCell>
        )
      case "responsibleName":
        return (
          <TableCell key={`${client.id}-${field}`} className="text-muted-foreground">
            {client.responsibleName?.trim() || "Não informado"}
          </TableCell>
        )
      case "email":
        return (
          <TableCell key={`${client.id}-${field}`} className="text-muted-foreground">
            {client.email?.trim() || "Não informado"}
          </TableCell>
        )
      case "telephone":
        return (
          <TableCell key={`${client.id}-${field}`} className="text-muted-foreground">
            {client.telephone?.trim() ? formatPhoneBR(client.telephone) : "Não informado"}
          </TableCell>
        )
      case "city":
        return (
          <TableCell key={`${client.id}-${field}`} className="text-muted-foreground">
            {formatLocation(client)}
          </TableCell>
        )
      case "lastContact":
        return (
          <TableCell key={`${client.id}-${field}`} className="text-muted-foreground">
            {formatDateTime(client.lastContact)}
          </TableCell>
        )
      case "createdAt":
        return (
          <TableCell key={`${client.id}-${field}`} className="text-muted-foreground">
            {formatDateTime(client.createdAt)}
          </TableCell>
        )
      case "updatedAt":
        return (
          <TableCell key={`${client.id}-${field}`} className="text-muted-foreground">
            {formatDateTime(client.updatedAt)}
          </TableCell>
        )
      default:
        return (
          <TableCell key={`${client.id}-${field}`} className="text-muted-foreground">
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
                onCheckedChange={(checked) => {
                  if (onToggleAll) onToggleAll(Boolean(checked))
                }}
                disabled={!canSelect}
                aria-label="Selecionar todos os clientes"
                className="size-5 border-2 border-primary/45 bg-background shadow-sm data-[state=checked]:border-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary"
              />
            </TableHead>

            {visibleFields.map((field) => {
              const fieldLabel = CLIENT_FIELD_OPTIONS.find((item) => item.key === field)?.label ?? field
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
                    fields={CLIENT_FIELD_OPTIONS}
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
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2 + visibleFields.length} className="px-6 py-12 text-center text-sm text-muted-foreground">
                Nenhum cliente encontrado para os filtros atuais.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => {
              const isDeleting = deletingClientIds.has(client.id)

              return (
                <TableRow key={client.id}>
                  <TableCell className="pl-6">
                    <Checkbox
                      checked={selectedClientIds.has(client.id)}
                      onCheckedChange={(checked) => {
                        if (onToggleSelection) onToggleSelection(client.id, Boolean(checked))
                      }}
                      disabled={!canSelect}
                      aria-label={`Selecionar ${client.name}`}
                      className="size-5 border-2 border-primary/45 bg-background shadow-sm data-[state=checked]:border-primary"
                    />
                  </TableCell>

                  {visibleFields.map((field) => renderFieldCell(client, field))}

                  <TableCell className="w-[176px] px-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon-sm" className="mx-auto h-8 w-8 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir ações de {client.name}</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5">
                        <DropdownMenuItem className="rounded-lg" onSelect={() => setDetailsClient(client)}>
                          <Eye className="h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={buildDetailsHref(detailsBasePath, client.id, detailsRouteMode, detailsParamKey)}>
                            <PencilLine className="h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          variant="destructive"
                          className="rounded-lg"
                          disabled={!canDelete || isDeleting}
                          onSelect={() => {
                            if (onDeleteClient) onDeleteClient(client.id)
                          }}
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

      <ClientDetailsDialog
        client={detailsClient}
        detailsHref={
          detailsClient
            ? buildDetailsHref(detailsBasePath, detailsClient.id, detailsRouteMode, detailsParamKey)
            : defaultDetailsHref
        }
        open={Boolean(detailsClient)}
        onOpenChange={(open) => {
          if (!open) setDetailsClient(null)
        }}
      />
    </>
  )
}
