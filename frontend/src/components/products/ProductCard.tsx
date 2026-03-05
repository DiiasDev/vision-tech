"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Factory,
  PackageCheck,
  Settings,
  ShoppingBag,
  Tag,
  Trash2,
  TrendingUp,
  User,
  XCircle,
  Loader2,
} from "lucide-react"

import { Product } from "@/components/products/productsMock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { formatPriceOrCostBR } from "@/utils/Formatter"

type Props = {
  product: Product
  onDelete: (productId: string) => void
  isDeleting: boolean
  isSelected: boolean
  onToggleSelection: (productId: string, checked: boolean) => void
}

type MockSaleStatus = "paid" | "pending" | "canceled"

type MockSale = {
  id: string
  date: string
  client: string
  quantity: number
  unitPrice: number
  total: number
  status: MockSaleStatus
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
      month: "short",
      year: "numeric",
    }).format(localDate)
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function createMockSales(product: Product): MockSale[] {
  const baseClients = [
    "Alpha Soluções",
    "Bytecorp",
    "Comercial Nobre",
    "Delta Networks",
    "Escritório Prime",
    "Fast Office",
  ]
  const saleCount = Math.max(3, Math.min(6, product.monthlySales > 0 ? product.monthlySales : 3))
  const now = Date.now()

  return Array.from({ length: saleCount }).map((_, index) => {
    const status: MockSaleStatus =
      index % 5 === 0 ? "pending" : index % 4 === 0 ? "canceled" : "paid"
    const quantity = Math.max(1, ((product.id.length + index) % 4) + 1)
    const unitPrice = Number((product.price * (0.9 + index * 0.03)).toFixed(2))
    const total = Number((unitPrice * quantity).toFixed(2))
    const date = new Date(now - index * 1000 * 60 * 60 * 24 * 2).toISOString()

    return {
      id: `${product.id}-sale-${index + 1}`,
      date,
      client: baseClients[(product.id.charCodeAt(0) + index) % baseClients.length],
      quantity,
      unitPrice,
      total,
      status,
    }
  })
}

export function ProductCard({ product, onDelete, isDeleting, isSelected, onToggleSelection }: Props) {
  const [isSalesHistoryOpen, setIsSalesHistoryOpen] = useState(false)
  const statusConfig = {
    active: {
      label: "Ativo",
      pill: "border-emerald-300/60 bg-emerald-500/15 text-emerald-700",
      dot: "bg-emerald-500",
    },
    inactive: {
      label: "Inativo",
      pill: "border-rose-300/60 bg-rose-500/15 text-rose-700",
      dot: "bg-rose-500",
    },
    out_of_stock: {
      label: "Sem estoque",
      pill: "border-amber-300/60 bg-amber-500/15 text-amber-700",
      dot: "bg-amber-500",
    },
  }

  const stockHealth = Math.min(100, Math.round((product.stock / Math.max(product.minStock, 1)) * 100))
  const status = statusConfig[product.status]
  const salesHistory = useMemo(() => createMockSales(product), [product])
  const salesStatusConfig: Record<MockSaleStatus, { label: string; className: string }> = {
    paid: {
      label: "Pago",
      className: "border-emerald-300/60 bg-emerald-500/15 text-emerald-700",
    },
    pending: {
      label: "Pendente",
      className: "border-amber-300/60 bg-amber-500/15 text-amber-700",
    },
    canceled: {
      label: "Cancelado",
      className: "border-rose-300/60 bg-rose-500/15 text-rose-700",
    },
  }

  return (
    <>
      <article
        className={cn(
          "group relative overflow-hidden rounded-3xl border bg-card/95 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-2xl lg:p-5",
          isSelected
            ? "border-primary/55 ring-2 ring-primary/20 shadow-lg shadow-primary/10"
            : "border-border/70"
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/12 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div
          className={cn(
            "absolute left-3 top-3 z-20 rounded-xl border bg-background/95 p-1.5 shadow-md backdrop-blur-sm transition-all",
            isSelected ? "border-primary/45" : "border-border/80"
          )}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onToggleSelection(product.id, Boolean(checked))}
            aria-label={`Selecionar ${product.name}`}
            className={cn(
              "size-5 rounded-md border-2",
              isSelected
                ? "border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                : "border-border"
            )}
          />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-muted/35 to-muted/5 p-3">
          <div className="absolute right-3 top-3 z-10 rounded-full border border-primary/25 bg-background/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            {product.brand}
          </div>

          <div className="relative h-44 overflow-hidden rounded-xl bg-gradient-to-br from-background to-muted/35 md:h-48">
            <Image
              src={product.imageUrl || "/product.png"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.04]"
            />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">
              {product.category}
            </Badge>

            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                status.pill
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
              {status.label}
            </div>
          </div>

          <div>
            <h3 className="line-clamp-1 text-2xl font-semibold tracking-tight">{product.name}</h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{product.code}</p>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-3">
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Preço</p>
              <p className="mt-1 text-base font-semibold">{formatPriceOrCostBR(product.price)}</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Custo</p>
              <p className="mt-1 text-base font-semibold">{formatPriceOrCostBR(product.cost)}</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Estoque</p>
              <p className="mt-1 text-base font-semibold">
                {product.stock} {product.unitOfMeasure}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-background/75 p-3">
            <div className="flex items-center justify-between text-xs">
              <p className="text-muted-foreground">Saúde de estoque</p>
              <p className="font-medium text-foreground">{stockHealth}%</p>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  stockHealth >= 100 ? "bg-emerald-500" : stockHealth >= 70 ? "bg-amber-500" : "bg-rose-500"
                )}
                style={{ width: `${Math.max(8, stockHealth)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <div className="inline-flex items-center gap-1.5 rounded-lg border bg-background/60 px-2.5 py-2">
              <Factory className="h-3.5 w-3.5 text-primary" />
              {product.supplier}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border bg-background/60 px-2.5 py-2">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              {product.monthlySales} vendas/mês
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border bg-background/60 px-2.5 py-2">
              <PackageCheck className="h-3.5 w-3.5 text-primary" />
              Min: {product.minStock} {product.unitOfMeasure}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border bg-background/60 px-2.5 py-2">
              <Tag className="h-3.5 w-3.5 text-primary" />
              {product.percentage}% de margem
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border bg-background/60 px-2.5 py-2">
              <Factory className="h-3.5 w-3.5 text-primary" />
              Local: {product.location}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border bg-background/60 px-2.5 py-2">
              <User className="h-3.5 w-3.5 text-primary" />
              Criado por: {product.createdBy}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border bg-background/60 px-2.5 py-2">
              <CalendarClock className="h-3.5 w-3.5 text-primary" />
              Criado: {formatDate(product.createdAt)}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border bg-background/60 px-2.5 py-2">
              <CalendarClock className="h-3.5 w-3.5 text-primary" />
              Atualizado: {formatDate(product.updatedAt)}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button asChild className="h-11 flex-1 rounded-xl">
              <Link href={`/products/id?productId=${product.id}`}>
                <Settings className="mr-1 h-4 w-4" />
                Configurar
              </Link>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
            className="h-11 w-11 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            aria-label={`Excluir ${product.name}`}
            disabled={isDeleting}
            onClick={() => onDelete(product.id)}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl"
              aria-label="Histórico de vendas"
              onClick={() => setIsSalesHistoryOpen(true)}
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </article>

      {isSalesHistoryOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setIsSalesHistoryOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b p-5">
              <div>
                <h3 className="text-lg font-semibold">Histórico de Vendas</h3>
                <p className="text-sm text-muted-foreground">
                  {product.name} ({product.code}) - dados mockados
                </p>
              </div>
              <Button type="button" variant="outline" size="icon-sm" onClick={() => setIsSalesHistoryOpen(false)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5">
              {salesHistory.map((sale) => (
                <div key={sale.id} className="rounded-xl border bg-card/70 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{sale.client}</p>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                        salesStatusConfig[sale.status].className
                      )}
                    >
                      {sale.status === "paid" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                      {sale.status === "pending" ? <Clock3 className="h-3.5 w-3.5" /> : null}
                      {sale.status === "canceled" ? <XCircle className="h-3.5 w-3.5" /> : null}
                      {salesStatusConfig[sale.status].label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground md:grid-cols-4">
                    <span>Data: {formatDateTime(sale.date)}</span>
                    <span>Qtd: {sale.quantity}</span>
                    <span>Unitário: {formatPriceOrCostBR(sale.unitPrice)}</span>
                    <span>Total: {formatPriceOrCostBR(sale.total)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end border-t p-4">
              <Button type="button" variant="outline" onClick={() => setIsSalesHistoryOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
