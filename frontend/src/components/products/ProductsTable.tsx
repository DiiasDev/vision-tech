"use client"

import { useState, useSyncExternalStore } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, MoreHorizontal, PencilLine, Trash2 } from "lucide-react"

import { TableFieldSelector, type TableFieldOption } from "@/components/layout/TableFieldSelector"
import { ProductDetailsDialog } from "@/components/products/ProductDetailsDialog"
import { type Product } from "@/components/products/productsMock"
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
import { formatPriceOrCostBR } from "@/utils/Formatter"

type ProductFieldKey =
  | "image"
  | "id"
  | "name"
  | "code"
  | "description"
  | "category"
  | "brand"
  | "supplier"
  | "price"
  | "cost"
  | "percentage"
  | "stock"
  | "minStock"
  | "unitOfMeasure"
  | "location"
  | "status"
  | "monthlySales"
  | "createdBy"
  | "createdAt"
  | "updatedAt"

const MAX_VISIBLE_FIELDS = 8
const MIN_VISIBLE_FIELDS = 2
const VISIBLE_FIELDS_STORAGE_KEY = "byncode:products:table-visible-fields:v1"
const VISIBLE_FIELDS_STORAGE_EVENT = "byncode:products:table-visible-fields:changed"

const PRODUCT_FIELD_OPTIONS: ReadonlyArray<TableFieldOption<ProductFieldKey>> = [
  { key: "image", label: "Imagem" },
  { key: "id", label: "ID" },
  { key: "name", label: "Nome" },
  { key: "code", label: "Código" },
  { key: "description", label: "Descrição" },
  { key: "category", label: "Categoria" },
  { key: "brand", label: "Marca" },
  { key: "supplier", label: "Fornecedor" },
  { key: "price", label: "Preço de venda" },
  { key: "cost", label: "Custo" },
  { key: "percentage", label: "Margem" },
  { key: "stock", label: "Estoque atual" },
  { key: "minStock", label: "Estoque mínimo" },
  { key: "unitOfMeasure", label: "Unidade" },
  { key: "location", label: "Localização" },
  { key: "status", label: "Status" },
  { key: "monthlySales", label: "Vendas mensais" },
  { key: "createdBy", label: "Criado por" },
  { key: "createdAt", label: "Criado em" },
  { key: "updatedAt", label: "Atualizado em" },
]

const DEFAULT_VISIBLE_FIELDS: ProductFieldKey[] = ["image", "name", "category", "price", "stock", "status"]
const ALLOWED_FIELD_KEYS = new Set<ProductFieldKey>(PRODUCT_FIELD_OPTIONS.map((item) => item.key))
let cachedVisibleFieldsRaw: string | null = null
let cachedVisibleFieldsSnapshot: ProductFieldKey[] = DEFAULT_VISIBLE_FIELDS

type Props = {
  products: Product[]
  deletingProductIds: Set<string>
  selectedProductIds: Set<string>
  onToggleSelection: (productId: string, checked: boolean) => void
  onToggleAll: (checked: boolean) => void
  onDelete: (productId: string) => void
}

function getStatusBadge(product: Product) {
  if (product.status === "out_of_stock" || product.stock <= 0) {
    return {
      label: "Sem estoque",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    }
  }

  if (product.status === "inactive") {
    return {
      label: "Inativo",
      className: "border-zinc-200 bg-zinc-100 text-zinc-700",
    }
  }

  if (product.stock <= product.minStock) {
    return {
      label: "Estoque baixo",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    }
  }

  return {
    label: "Em estoque",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  }
}

function getSafeImageSrc(imageUrl?: string) {
  if (!imageUrl) return "/product.png"
  if (imageUrl.startsWith("/") || imageUrl.startsWith("data:")) return imageUrl
  return "/product.png"
}

function formatDate(value: string) {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnlyMatch) {
    const year = Number.parseInt(dateOnlyMatch[1], 10)
    const month = Number.parseInt(dateOnlyMatch[2], 10)
    const day = Number.parseInt(dateOnlyMatch[3], 10)
    const localDate = new Date(year, month - 1, day, 12, 0, 0)

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(localDate)
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return value

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate)
}

function normalizeVisibleFields(value: unknown): ProductFieldKey[] {
  if (!Array.isArray(value)) return DEFAULT_VISIBLE_FIELDS

  const normalized: ProductFieldKey[] = []

  for (const item of value) {
    if (typeof item !== "string") continue
    const key = item as ProductFieldKey
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

function persistVisibleFields(fields: ProductFieldKey[]) {
  try {
    window.localStorage.setItem(VISIBLE_FIELDS_STORAGE_KEY, JSON.stringify(fields))
    window.dispatchEvent(new Event(VISIBLE_FIELDS_STORAGE_EVENT))
  } catch {
    // Ignore write failures (private mode, storage disabled, etc.)
  }
}

export function ProductsTable({
  products,
  deletingProductIds,
  selectedProductIds,
  onToggleSelection,
  onToggleAll,
  onDelete,
}: Props) {
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null)
  const visibleFields = useSyncExternalStore(
    subscribeVisibleFields,
    readStoredVisibleFields,
    () => DEFAULT_VISIBLE_FIELDS
  )
  const [draggingField, setDraggingField] = useState<ProductFieldKey | null>(null)
  const [dropTargetField, setDropTargetField] = useState<ProductFieldKey | null>(null)
  const allSelected = products.length > 0 && products.every((product) => selectedProductIds.has(product.id))
  const hasSelected = products.some((product) => selectedProductIds.has(product.id))

  function updateVisibleFields(next: ProductFieldKey[] | ((prev: ProductFieldKey[]) => ProductFieldKey[])) {
    const currentFields = readStoredVisibleFields()
    const nextFields = typeof next === "function" ? next(currentFields) : next
    persistVisibleFields(normalizeVisibleFields(nextFields))
  }

  function moveFieldByDrag(sourceField: ProductFieldKey, targetField: ProductFieldKey) {
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

  function renderFieldCell(product: Product, field: ProductFieldKey) {
    const status = getStatusBadge(product)

    switch (field) {
      case "image":
        return (
          <TableCell key={`${product.id}-${field}`}>
            <div className="h-10 w-10 overflow-hidden rounded-lg border border-border/70 bg-background">
              <Image
                src={getSafeImageSrc(product.imageUrl)}
                alt={product.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
          </TableCell>
        )

      case "id":
        return (
          <TableCell key={`${product.id}-${field}`}>
            <span className="block max-w-[14rem] break-all text-sm text-muted-foreground">{product.id}</span>
          </TableCell>
        )

      case "name":
        return (
          <TableCell key={`${product.id}-${field}`} className="font-semibold text-foreground">
            {product.name}
          </TableCell>
        )

      case "code":
        return (
          <TableCell key={`${product.id}-${field}`} className="font-medium text-foreground">
            {product.code}
          </TableCell>
        )

      case "description":
        return (
          <TableCell key={`${product.id}-${field}`}>
            <span className="block max-w-[18rem] whitespace-normal break-words text-sm text-muted-foreground">
              {product.description || "-"}
            </span>
          </TableCell>
        )

      case "category":
        return (
          <TableCell key={`${product.id}-${field}`} className="text-muted-foreground">
            {product.category}
          </TableCell>
        )

      case "brand":
        return (
          <TableCell key={`${product.id}-${field}`} className="text-muted-foreground">
            {product.brand || "-"}
          </TableCell>
        )

      case "supplier":
        return (
          <TableCell key={`${product.id}-${field}`} className="text-muted-foreground">
            {product.supplier || "-"}
          </TableCell>
        )

      case "price":
        return (
          <TableCell key={`${product.id}-${field}`} className="font-medium">
            {formatPriceOrCostBR(product.price)}
          </TableCell>
        )

      case "cost":
        return (
          <TableCell key={`${product.id}-${field}`} className="font-medium">
            {formatPriceOrCostBR(product.cost)}
          </TableCell>
        )

      case "percentage":
        return (
          <TableCell key={`${product.id}-${field}`} className="font-medium">
            {product.percentage}%
          </TableCell>
        )

      case "stock":
        return (
          <TableCell key={`${product.id}-${field}`} className="font-medium">
            {product.stock}
          </TableCell>
        )

      case "minStock":
        return (
          <TableCell key={`${product.id}-${field}`} className="font-medium">
            {product.minStock}
          </TableCell>
        )

      case "unitOfMeasure":
        return (
          <TableCell key={`${product.id}-${field}`} className="font-medium">
            {product.unitOfMeasure || "-"}
          </TableCell>
        )

      case "location":
        return (
          <TableCell key={`${product.id}-${field}`} className="text-muted-foreground">
            {product.location || "-"}
          </TableCell>
        )

      case "status":
        return (
          <TableCell key={`${product.id}-${field}`}>
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
          </TableCell>
        )

      case "monthlySales":
        return (
          <TableCell key={`${product.id}-${field}`} className="font-medium">
            {product.monthlySales}
          </TableCell>
        )

      case "createdBy":
        return (
          <TableCell key={`${product.id}-${field}`} className="text-muted-foreground">
            {product.createdBy || "-"}
          </TableCell>
        )

      case "createdAt":
        return (
          <TableCell key={`${product.id}-${field}`} className="text-muted-foreground">
            {formatDate(product.createdAt)}
          </TableCell>
        )

      case "updatedAt":
        return (
          <TableCell key={`${product.id}-${field}`} className="text-muted-foreground">
            {formatDate(product.updatedAt)}
          </TableCell>
        )

      default:
        return (
          <TableCell key={`${product.id}-${field}`} className="text-muted-foreground">
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
                aria-label="Selecionar todos os produtos"
                className="size-5 border-2 border-primary/45 bg-background shadow-sm data-[state=checked]:border-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary"
              />
            </TableHead>
            {visibleFields.map((field) => {
              const fieldLabel = PRODUCT_FIELD_OPTIONS.find((item) => item.key === field)?.label ?? field
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
                    fields={PRODUCT_FIELD_OPTIONS}
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
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2 + visibleFields.length} className="px-6 py-12 text-center text-sm text-muted-foreground">
                Nenhum produto encontrado para os filtros atuais.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const isDeleting = deletingProductIds.has(product.id)

              return (
                <TableRow key={product.id}>
                  <TableCell className="pl-6">
                    <Checkbox
                      checked={selectedProductIds.has(product.id)}
                      onCheckedChange={(checked) => onToggleSelection(product.id, Boolean(checked))}
                      aria-label={`Selecionar ${product.name}`}
                      className="size-5 border-2 border-primary/45 bg-background shadow-sm data-[state=checked]:border-primary"
                    />
                  </TableCell>

                  {visibleFields.map((field) => renderFieldCell(product, field))}

                  <TableCell className="w-[156px] px-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon-sm" className="mx-auto h-8 w-8 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir ações de {product.name}</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5">
                        <DropdownMenuItem className="rounded-lg" onSelect={() => setDetailsProduct(product)}>
                          <Eye className="h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={`/products/id?productId=${product.id}&mode=edit`}>
                            <PencilLine className="h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          variant="destructive"
                          className="rounded-lg"
                          disabled={isDeleting}
                          onSelect={() => onDelete(product.id)}
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

      <ProductDetailsDialog
        product={detailsProduct}
        open={Boolean(detailsProduct)}
        onOpenChange={(open) => {
          if (!open) setDetailsProduct(null)
        }}
      />
    </>
  )
}
