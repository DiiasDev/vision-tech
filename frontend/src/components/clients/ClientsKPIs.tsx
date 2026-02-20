import { ArrowUpRight, CircleAlert, HandCoins, UsersRound } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { clientsData } from "@/components/clients/mock-data"

export default function ClientsKPIs() {
  const total = clientsData.length
  const ativos = clientsData.filter((client) => client.status === "Ativo").length
  const inadimplentes = clientsData.filter((client) => client.status === "Inadimplente").length
  const mrr = clientsData.reduce((acc, client) => acc + client.mrr, 0)

  const cards = [
    {
      label: "Total de Clientes",
      value: `${total}`,
      helper: "Base ativa + onboarding",
      tone: "text-sky-300",
      icon: UsersRound,
    },
    {
      label: "Clientes Ativos",
      value: `${ativos}`,
      helper: `${Math.round((ativos / total) * 100)}% da carteira`,
      tone: "text-emerald-300",
      icon: ArrowUpRight,
    },
    {
      label: "Inadimplentes",
      value: `${inadimplentes}`,
      helper: "Monitorar risco financeiro",
      tone: "text-rose-300",
      icon: CircleAlert,
    },
    {
      label: "MRR Consolidado",
      value: `R$ ${mrr.toLocaleString("pt-BR")}`,
      helper: "Receita recorrente mensal",
      tone: "text-amber-300",
      icon: HandCoins,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

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
              <div className="rounded-lg border border-border/70 bg-muted/35 p-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">{card.helper}</CardContent>
          </Card>
        )
      })}
    </div>
  )
}
