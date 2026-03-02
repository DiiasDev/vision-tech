import { ArrowUpRight, CircleAlert, HandCoins, UsersRound } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClientsListItem } from "@/services/clients.service"

type ClientsKPIsProps = {
  clients: ClientsListItem[]
}

export default function ClientsKPIs({ clients }: ClientsKPIsProps) {
  const total = clients.length
  const ativos = clients.filter((client) => client.status === "ACTIVE").length
  const inadimplentes = clients.filter((client) => client.status === "DELINQUENT").length
  const semContato = clients.filter((client) => !client.lastContact).length

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
      helper: total > 0 ? `${Math.round((ativos / total) * 100)}% da carteira` : "Sem clientes cadastrados",
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
      label: "Sem Contato",
      value: `${semContato}`,
      helper: "Sem ultimo contato registrado",
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
