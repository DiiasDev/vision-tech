import type { ComponentType } from "react"
import { AlertTriangle, Building2, Clock3, ShieldCheck, Wallet } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { formatCompactCurrency, type SupplierSummary } from "@/components/products/Supplier/supplier-models"

type SupplierKpiCardsProps = {
  visibleSuppliers: number
  summary: SupplierSummary
}

type KpiCard = {
  id: string
  label: string
  value: string
  hint: string
  icon: ComponentType<{ className?: string }>
  alert?: boolean
}

export function SupplierKpiCards({ visibleSuppliers, summary }: SupplierKpiCardsProps) {
  const cards: KpiCard[] = [
    {
      id: "visible-suppliers",
      label: "Fornecedores exibidos",
      value: String(visibleSuppliers),
      hint: "Resultado dos filtros aplicados",
      icon: Building2,
    },
    {
      id: "active-suppliers",
      label: "Fornecedores ativos",
      value: String(summary.activeSuppliers),
      hint: "Parceiros em operacao regular",
      icon: ShieldCheck,
    },
    {
      id: "high-risk",
      label: "Risco alto",
      value: String(summary.highRiskSuppliers),
      hint: "Fornecedores com maior risco",
      icon: AlertTriangle,
      alert: summary.highRiskSuppliers > 0,
    },
    {
      id: "lead-time",
      label: "Lead time medio",
      value: `${summary.averageLeadTime.toFixed(1)} dias`,
      hint: "Tempo medio de reposicao",
      icon: Clock3,
    },
    {
      id: "spend",
      label: "Compras anuais",
      value: formatCompactCurrency(summary.totalAnnualSpend),
      hint: "Volume anual dos fornecedores",
      icon: Wallet,
    },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <Card key={card.id} className="overflow-hidden border-border/70 bg-gradient-to-b from-card to-muted/45 py-0">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-semibold leading-none tracking-tight">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.hint}</p>
              </div>

              <div
                className={`rounded-xl border p-3 ${
                  card.alert
                    ? "border-amber-300/60 bg-amber-100/65 text-amber-700"
                    : "border-primary/25 bg-primary/10 text-primary"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
