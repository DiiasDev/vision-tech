import { Activity, CircleCheckBig, ShieldCheck, Wrench } from "lucide-react"

import type { ServiceCatalogItem } from "@/components/services/catalog/catalog-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrencyBR } from "@/utils/Formatter"

type ServicesCatalogStatsProps = {
  services: ServiceCatalogItem[]
}

type StatsIcon = "activity" | "shield" | "check" | "wrench"

function getIcon(icon: StatsIcon) {
  if (icon === "activity") return Activity
  if (icon === "shield") return ShieldCheck
  if (icon === "check") return CircleCheckBig
  return Wrench
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
      label: "Servicos no Catalogo",
      value: String(totalServices),
      helper: `${activeServices} ativo(s) para proposta imediata`,
      tone: "text-sky-300",
      iconTone: "text-sky-200",
      icon: "wrench" as const,
    },
    {
      label: "Contratos Ativos",
      value: String(activeContracts),
      helper: "Volume total consolidado no catalogo atual",
      tone: "text-emerald-300",
      iconTone: "text-emerald-200",
      icon: "activity" as const,
    },
    {
      label: "Ticket Medio Base",
      value: formatCurrencyBR(basePriceAverage || 0),
      helper: "Referencia inicial para negociacao comercial",
      tone: "text-violet-300",
      iconTone: "text-violet-200",
      icon: "shield" as const,
    },
    {
      label: "SLA Critico (<=8h)",
      value: String(criticalSlaServices),
      helper: "Servicos com maior exigencia operacional",
      tone: "text-amber-300",
      iconTone: "text-amber-200",
      icon: "check" as const,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = getIcon(card.icon)

        return (
          <Card
            key={card.label}
            className="gap-4 border-border/70 bg-gradient-to-b from-background/90 to-background/40 shadow-[0_0_0_1px_hsl(var(--background))_inset]"
          >
            <CardHeader className="flex-row items-start justify-between space-y-0 pb-0">
              <div>
                <CardDescription className="text-xs uppercase tracking-[0.18em] text-muted-foreground/80">
                  {card.label}
                </CardDescription>
                <CardTitle className={`mt-3 text-3xl font-semibold tracking-tight ${card.tone}`}>{card.value}</CardTitle>
              </div>
              <div className="rounded-lg border border-border/70 bg-muted/45 p-2.5">
                <Icon className={`h-5 w-5 stroke-[2.2] ${card.iconTone}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">{card.helper}</CardContent>
          </Card>
        )
      })}
    </div>
  )
}
