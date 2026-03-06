import { AlertTriangle, Boxes, Clock3, Layers3, Plus } from "lucide-react"

import { formatPercent } from "@/components/products/Supplier/supplier-models"
import { Button } from "@/components/ui/button"

type SupplierPageHeaderProps = {
  totalSuppliers: number
  activeSuppliers: number
  averageLeadTime: number
  averageOnTimeRate: number
  highRiskSuppliers: number
  hasSelectedSupplier: boolean
  selectedSupplierName: string | null
  onAddSupplier: () => void
}

export function SupplierPageHeader({
  totalSuppliers,
  activeSuppliers,
  averageLeadTime,
  averageOnTimeRate,
  highRiskSuppliers,
  hasSelectedSupplier,
  selectedSupplierName,
  onAddSupplier,
}: SupplierPageHeaderProps) {
  const metrics = [
    {
      id: "total-suppliers",
      label: "Fornecedores monitorados",
      value: String(totalSuppliers),
      icon: Layers3,
    },
    {
      id: "active-suppliers",
      label: "Fornecedores ativos",
      value: String(activeSuppliers),
      icon: Boxes,
    },
    {
      id: "coverage",
      label: "Lead time medio",
      value: `${averageLeadTime.toFixed(1)} dias`,
      icon: Clock3,
    },
    {
      id: "attention",
      label: "Fornecedores em risco",
      value: String(highRiskSuppliers),
      icon: AlertTriangle,
    },
  ]

  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-5 shadow-sm md:p-7">
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative z-10 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-5">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Painel inteligente de fornecedores
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Controle operacional dos fornecedores em tempo real</h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              Acompanhe saude da base de fornecedores, niveis de risco e status da operacao para manter abastecimento previsivel.
            </p>
            <p className="text-xs text-muted-foreground">
              {hasSelectedSupplier ? `Selecionado: ${selectedSupplierName}` : "Nenhum fornecedor selecionado"} - SLA medio:{" "}
              {formatPercent(averageOnTimeRate)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" className="h-10 rounded-xl px-4" onClick={onAddSupplier}>
              <Plus className="h-4 w-4" />
              Adicionar fornecedor
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/55 p-3">
          <div className="space-y-2">
            {metrics.map((metric) => {
              const Icon = metric.icon

              return (
                <div
                  key={metric.id}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 py-2.5"
                >
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="rounded-full border border-primary/30 bg-primary/10 p-1 text-primary">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {metric.label}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{metric.value}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
