import { type ComponentType } from "react"
import { ArrowRightLeft, Download, Filter, Plus, RefreshCw, TrendingDown, TrendingUp } from "lucide-react"

import { type StockMovement } from "@/components/products/Stock/stock-models"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StockMovementsTimelineProps = {
  movements: StockMovement[]
}

type MovementMeta = {
  badgeClassName: string
  quantityClassName: string
  icon: ComponentType<{ className?: string }>
  label: string
}

const movementTypeMap: Record<StockMovement["type"], MovementMeta> = {
  ENTRADA: {
    badgeClassName: "border-emerald-300/60 bg-emerald-100/60 text-emerald-700",
    quantityClassName: "text-emerald-700",
    icon: TrendingUp,
    label: "Entrada",
  },
  SAIDA: {
    badgeClassName: "border-red-300/60 bg-red-100/60 text-red-700",
    quantityClassName: "text-red-700",
    icon: TrendingDown,
    label: "Saida",
  },
  AJUSTE: {
    badgeClassName: "border-amber-300/60 bg-amber-100/60 text-amber-700",
    quantityClassName: "text-amber-700",
    icon: RefreshCw,
    label: "Ajuste",
  },
  TRANSFERENCIA: {
    badgeClassName: "border-blue-300/60 bg-blue-100/60 text-blue-700",
    quantityClassName: "text-blue-700",
    icon: ArrowRightLeft,
    label: "Transferencia",
  },
}

function getQuantitySignal(movement: StockMovement) {
  if (movement.type === "ENTRADA") return "+"
  if (movement.type === "SAIDA") return "-"
  if (movement.type === "TRANSFERENCIA") return "↔"
  return movement.quantity >= 0 ? "+" : "-"
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function StockMovementsTimeline({ movements }: StockMovementsTimelineProps) {
  return (
    <Card className="border-border/70 bg-card/85 py-0 xl:col-span-2">
      <CardHeader className="border-b border-border/70 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Movimentacoes recentes de estoque</CardTitle>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5" /> Filtrar
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Exportar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        {movements.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/70 bg-muted/25 px-4 py-6 text-sm text-muted-foreground">
            Sem movimentacoes registradas no momento.
          </p>
        ) : (
          movements.map((movement) => {
            const typeMeta = movementTypeMap[movement.type]
            const Icon = typeMeta.icon

            return (
              <article
                key={movement.id}
                className="grid gap-3 rounded-xl border border-border/60 bg-background/75 p-3 md:grid-cols-[1.2fr_1fr_auto] md:items-center"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{movement.productName}</p>
                    <span className="text-xs text-muted-foreground">{movement.productCode}</span>
                    <span className="rounded-md border border-border/70 bg-muted/40 px-1.5 py-0.5 font-mono text-[11px] text-foreground/85">
                      {movement.movementCode}
                    </span>
                    <Badge className={cn("rounded-full border px-2 py-0.5 text-[11px]", typeMeta.badgeClassName)}>
                      <Icon className="mr-1 h-3.5 w-3.5" />
                      {typeMeta.label}
                    </Badge>
                  </div>

                  <p className="text-xs leading-relaxed text-muted-foreground">{movement.notes}</p>
                  <p className="text-xs text-muted-foreground">
                    {movement.source} {"->"} {movement.destination} • {movement.responsible}
                  </p>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Cod. mov:</strong> {movement.movementCode}
                  </p>
                  <p>
                    <strong className="text-foreground">Data:</strong> {formatDateTime(movement.createdAt)}
                  </p>
                  <p>
                    <strong className="text-foreground">Responsavel:</strong> {movement.responsible}
                  </p>
                </div>

                <div className={cn("text-right text-base font-semibold", typeMeta.quantityClassName)}>
                  {getQuantitySignal(movement)}
                  {Math.abs(movement.quantity)}
                </div>
              </article>
            )
          })
        )}

        <Button type="button" variant="ghost" className="w-full justify-center gap-2 rounded-xl border border-dashed border-border/70 text-xs text-muted-foreground hover:text-foreground">
          <Plus className="h-3.5 w-3.5" /> Registrar nova movimentacao
        </Button>
      </CardContent>
    </Card>
  )
}
