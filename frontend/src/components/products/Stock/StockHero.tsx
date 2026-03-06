import { type ComponentType } from "react"
import { Activity, Layers3, ShieldCheck, TimerReset } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { type InventoryOverview } from "@/components/products/Stock/stock-models"

type StockHeroProps = {
  overview: InventoryOverview
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value)
}

export function StockHero({ overview }: StockHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/14 via-card to-muted/70 p-6 shadow-sm md:p-8">
      <div className="pointer-events-none absolute -left-8 -top-10 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 top-0 h-36 w-36 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-end">
        <div className="space-y-4">
          <Badge className="rounded-full bg-primary/15 px-3 py-1 text-primary hover:bg-primary/15">
            Painel inteligente de estoque
          </Badge>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Controle operacional do estoque em tempo real</h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              Acompanhe saude do inventario, movimentacoes recentes e prioridades de reposicao para manter seu
              abastecimento previsivel.
            </p>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-border/65 bg-background/75 p-4 backdrop-blur-sm">
          <MetricPill icon={Layers3} label="Itens monitorados" value={formatNumber(overview.totalProducts)} />
          <MetricPill icon={Activity} label="Unidades disponiveis" value={formatNumber(overview.totalUnits)} />
          <MetricPill
            icon={TimerReset}
            label="Cobertura media"
            value={`${Math.max(overview.averageCoverageDays, 0).toFixed(1)} dias`}
          />
          <MetricPill
            icon={ShieldCheck}
            label="Pontos de atencao"
            value={formatNumber(overview.lowStockCount + overview.outOfStockCount)}
          />
        </div>
      </div>
    </section>
  )
}

type MetricPillProps = {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}

function MetricPill({ icon: Icon, label, value }: MetricPillProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/65 bg-background/85 px-3 py-2">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-md border border-primary/20 bg-primary/10 p-1 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}
