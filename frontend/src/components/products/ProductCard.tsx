import Image from "next/image"
import Link from "next/link"
import { CalendarClock, Factory, PackageCheck, Settings, ShoppingBag, Tag, Trash2, TrendingUp, User } from "lucide-react"

import { Product } from "@/components/products/productsMock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  product: Product
  onDelete: (productId: string) => void
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export function ProductCard({ product, onDelete }: Props) {
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

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card/95 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-2xl lg:p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/12 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

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

        <div className="grid grid-cols-2 gap-2.5 text-sm">
          <div className="rounded-xl border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Preço</p>
            <p className="mt-1 text-base font-semibold">{formatCurrency(product.price)}</p>
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
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl"
            aria-label="Histórico de vendas"
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  )
}
