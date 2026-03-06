import { type ComponentType } from "react"
import { AlertTriangle, CheckCircle2, MinusCircle } from "lucide-react"

import { type StockProduct } from "@/components/products/Stock/stock-models"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StockHealthPanelProps = {
  products: StockProduct[]
}

type HealthStatus = "healthy" | "warning" | "critical" | "out"

type HealthItem = {
  productId: string
  productCode: string
  productName: string
  stock: number
  minStock: number
  ratio: number
  status: HealthStatus
}

const statusStyles: Record<HealthStatus, { label: string; chip: string; bar: string; icon: ComponentType<{ className?: string }> }> = {
  healthy: {
    label: "Saudavel",
    chip: "border-emerald-300/50 bg-emerald-100/60 text-emerald-700",
    bar: "bg-emerald-500",
    icon: CheckCircle2,
  },
  warning: {
    label: "Atencao",
    chip: "border-amber-300/60 bg-amber-100/60 text-amber-700",
    bar: "bg-amber-500",
    icon: AlertTriangle,
  },
  critical: {
    label: "Critico",
    chip: "border-red-300/60 bg-red-100/60 text-red-700",
    bar: "bg-red-500",
    icon: AlertTriangle,
  },
  out: {
    label: "Ruptura",
    chip: "border-slate-300/70 bg-slate-200/70 text-slate-700",
    bar: "bg-slate-500",
    icon: MinusCircle,
  },
}

function getHealthStatus(stock: number, minStock: number): HealthStatus {
  if (stock <= 0) return "out"
  if (minStock <= 0) return "healthy"

  const ratio = stock / minStock
  if (ratio <= 0.5) return "critical"
  if (ratio <= 1) return "warning"
  return "healthy"
}

function buildHealthRows(products: StockProduct[]): HealthItem[] {
  return products
    .map((product) => {
      const safeMinStock = product.minStock > 0 ? product.minStock : 1
      const ratio = product.stock / safeMinStock

      return {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        stock: product.stock,
        minStock: product.minStock,
        ratio,
        status: getHealthStatus(product.stock, product.minStock),
      }
    })
    .sort((left, right) => left.ratio - right.ratio)
}

export function StockHealthPanel({ products }: StockHealthPanelProps) {
  const rows = buildHealthRows(products).slice(0, 7)

  return (
    <Card className="border-border/70 bg-card/85 py-0">
      <CardHeader className="border-b border-border/70 py-4">
        <CardTitle className="text-base">Saude do estoque por produto</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {rows.length === 0 ? (
          <EmptyState message="Cadastre produtos para visualizar os niveis de estoque." />
        ) : (
          rows.map((item) => {
            const style = statusStyles[item.status]
            const fillPercentage = Math.min(Math.max((item.stock / Math.max(item.minStock, 1)) * 100, 0), 130)
            const Icon = style.icon

            return (
              <article key={item.productId} className="space-y-2 rounded-xl border border-border/60 bg-background/70 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium leading-tight">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.productCode}</p>
                  </div>

                  <Badge className={cn("gap-1 rounded-full border px-2.5 py-1 text-[11px]", style.chip)}>
                    <Icon className="h-3.5 w-3.5" /> {style.label}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Atual: <strong className="text-foreground">{item.stock}</strong>
                    </span>
                    <span>
                      Minimo: <strong className="text-foreground">{item.minStock}</strong>
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full transition-[width]", style.bar)} style={{ width: `${fillPercentage}%` }} />
                  </div>
                </div>
              </article>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return <p className="rounded-xl border border-dashed border-border/70 bg-muted/25 px-4 py-6 text-sm text-muted-foreground">{message}</p>
}
