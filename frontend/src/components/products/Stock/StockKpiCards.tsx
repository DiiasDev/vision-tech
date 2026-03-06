"use client"

import { useState, type ComponentType, type ReactNode } from "react"
import { CircleHelp, DollarSign, Gauge, ShieldAlert, TrendingUp } from "lucide-react"

import { InfoStock } from "@/components/products/Modals/InfoStock"
import { type InventoryOverview } from "@/components/products/Stock/stock-models"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrencyBR } from "@/utils/Formatter"

type StockKpiCardsProps = {
  overview: InventoryOverview
}

type KpiCardData = {
  id: string
  title: string
  value: string
  hint: string
  icon: ComponentType<{ className?: string }>
  alert?: boolean
  modalDescription: string
  modalDetails: string[]
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value)
}

export function StockKpiCards({ overview }: StockKpiCardsProps) {
  const [activeInfoCard, setActiveInfoCard] = useState<string | null>(null)

  const stockRiskCount = overview.lowStockCount + overview.outOfStockCount

  const cards: KpiCardData[] = [
    {
      id: "stock-cost-value",
      title: "Valor em custo",
      value: formatCurrencyBR(overview.stockValueAtCost),
      hint: "Capital imobilizado no inventario atual",
      icon: DollarSign,
      modalDescription: "Mostra quanto do capital da empresa esta aplicado no estoque atual.",
      modalDetails: [
        "Calculo: custo unitario x quantidade em estoque para cada produto.",
        "Ajuda no controle de caixa e planejamento de compras.",
        "Use para identificar excesso de capital preso em itens de baixo giro.",
      ],
    },
    {
      id: "stock-potential-revenue",
      title: "Potencial de faturamento",
      value: formatCurrencyBR(overview.potentialRevenue),
      hint: "Receita potencial com o estoque disponivel",
      icon: TrendingUp,
      modalDescription: "Estimativa de receita se o estoque atual for vendido.",
      modalDetails: [
        "Calculo: preco de venda x quantidade em estoque para cada item.",
        "Indica teto de faturamento possivel com o inventario atual.",
        "Compare com valor em custo para acompanhar margem potencial.",
      ],
    },
    {
      id: "stock-average-coverage",
      title: "Cobertura media",
      value: `${overview.averageCoverageDays.toFixed(1)} dias`,
      hint: "Media de dias de autonomia por item com giro",
      icon: Gauge,
      modalDescription: "Mostra por quantos dias o estoque sustenta a demanda media.",
      modalDetails: [
        "Baseado no giro mensal dos produtos com vendas registradas.",
        "Cobertura baixa sugere risco de ruptura e necessidade de reposicao.",
        "Cobertura muito alta pode indicar sobre-estoque.",
      ],
    },
    {
      id: "stock-items-at-risk",
      title: "Itens sob risco",
      value: formatInteger(stockRiskCount),
      hint: "Produtos com ruptura ou abaixo do minimo",
      icon: ShieldAlert,
      alert: stockRiskCount > 0,
      modalDescription: "Quantidade de itens que exigem acao imediata ou planejamento de compra.",
      modalDetails: [
        "Inclui produtos zerados e produtos com estoque no limite minimo.",
        "Use como prioridade para evitar perda de vendas e atrasos.",
        "Cruze esta informacao com fornecedores e prazo de entrega.",
      ],
    },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <KpiCard key={card.id} {...card} onOpenInfo={() => setActiveInfoCard(card.id)}>
          <InfoStock
            open={activeInfoCard === card.id}
            onClose={() => setActiveInfoCard(null)}
            title={card.title}
            description={card.modalDescription}
            details={card.modalDetails}
          />
        </KpiCard>
      ))}
    </section>
  )
}

type KpiCardProps = KpiCardData & {
  onOpenInfo: () => void
  children: ReactNode
}

function KpiCard({ title, value, hint, icon: Icon, alert = false, onOpenInfo, children }: KpiCardProps) {
  return (
    <Card className="overflow-hidden border-border/70 bg-gradient-to-b from-card to-muted/45 py-0">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold leading-none tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-xl"
            aria-label={`Entender indicador ${title}`}
            onClick={onOpenInfo}
          >
            <CircleHelp className="h-4 w-4 text-muted-foreground" />
          </Button>

          <div
            className={`rounded-xl border p-3 ${
              alert
                ? "border-amber-300/60 bg-amber-100/65 text-amber-700"
                : "border-primary/25 bg-primary/10 text-primary"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {children}
      </CardContent>
    </Card>
  )
}
