import { AlertTriangle, CircleCheckBig, Clock3, Wrench } from "lucide-react"

import type { ServiceCatalogItem } from "@/components/services/catalog/catalog-types"
import { formatCurrencyBR } from "@/utils/Formatter"

type ServicesCatalogStatsProps = {
  services: ServiceCatalogItem[]
}

export function ServicesCatalogStats({ services }: ServicesCatalogStatsProps) {
  const totalServices = services.length
  const activeServices = services.filter((service) => service.status === "active").length
  const activeContracts = services.reduce((sum, service) => sum + (service.activeContracts ?? 0), 0)
  const basePriceAverage =
    totalServices > 0
      ? services.reduce((sum, service) => sum + (service.basePrice ?? 0), 0) / totalServices
      : 0
  const criticalSlaServices = services.filter(
    (service) => Number.isFinite(service.slaHours) && service.slaHours > 0 && service.slaHours <= 8
  ).length

  const cards = [
    {
      id: "total",
      label: "Serviços no catálogo",
      value: String(totalServices),
      helper: "Total cadastrado",
      icon: Wrench,
      colorClass: "text-primary",
      bgClass: "from-primary/15 to-primary/5",
    },
    {
      id: "active",
      label: "Serviços ativos",
      value: String(activeServices),
      helper: `${totalServices > 0 ? Math.round((activeServices / totalServices) * 100) : 0}% do total`,
      icon: CircleCheckBig,
      colorClass: "text-emerald-600",
      bgClass: "from-emerald-500/15 to-emerald-500/5",
    },
    {
      id: "ticket",
      label: "Ticket médio base",
      value: formatCurrencyBR(basePriceAverage || 0),
      helper: "Referência comercial",
      icon: Clock3,
      colorClass: "text-amber-600",
      bgClass: "from-amber-500/15 to-amber-500/5",
    },
    {
      id: "critical-sla",
      label: "SLA crítico (<= 8h)",
      value: String(criticalSlaServices),
      helper: `${activeContracts} contrato(s) ativos`,
      icon: AlertTriangle,
      colorClass: "text-rose-600",
      bgClass: "from-rose-500/15 to-rose-500/5",
    },
  ]

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.id} className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
            </div>

            <div className={`rounded-xl bg-gradient-to-br p-2.5 ${card.bgClass}`}>
              <card.icon className={`h-4 w-4 ${card.colorClass}`} />
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
