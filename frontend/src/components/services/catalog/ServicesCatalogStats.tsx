import { Activity, CircleCheckBig, ShieldCheck, Wrench } from "lucide-react"

import { serviceCatalogStatsMockData } from "@/components/services/catalog/catalog-mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
function getIcon(icon: (typeof serviceCatalogStatsMockData)[number]["icon"]) {
  if (icon === "activity") return Activity
  if (icon === "shield") return ShieldCheck
  if (icon === "check") return CircleCheckBig
  return Wrench
}

export function ServicesCatalogStats() {
  const cards = serviceCatalogStatsMockData

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
