import { AlertTriangle, CircleCheckBig, Clock3, UsersRound } from "lucide-react"

import { type ClientsListItem } from "@/services/clients.service"

type ClientsKPIsProps = {
  clients: ClientsListItem[]
}

export default function ClientsKPIs({ clients }: ClientsKPIsProps) {
  const totalClients = clients.length
  const activeClients = clients.filter((client) => client.status === "ACTIVE").length
  const delinquentClients = clients.filter((client) => client.status === "DELINQUENT").length
  const withoutContact = clients.filter((client) => !client.lastContact).length

  const cards = [
    {
      id: "total",
      label: "Total de clientes",
      value: String(totalClients),
      helper: "Base cadastrada",
      icon: UsersRound,
      colorClass: "text-primary",
      bgClass: "from-primary/15 to-primary/5",
    },
    {
      id: "active",
      label: "Clientes ativos",
      value: String(activeClients),
      helper: `${totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0}% da carteira`,
      icon: CircleCheckBig,
      colorClass: "text-emerald-600",
      bgClass: "from-emerald-500/15 to-emerald-500/5",
    },
    {
      id: "delinquent",
      label: "Inadimplentes",
      value: String(delinquentClients),
      helper: "Contas com atenção financeira",
      icon: AlertTriangle,
      colorClass: "text-rose-600",
      bgClass: "from-rose-500/15 to-rose-500/5",
    },
    {
      id: "without-contact",
      label: "Sem último contato",
      value: String(withoutContact),
      helper: "Clientes sem follow-up registrado",
      icon: Clock3,
      colorClass: "text-amber-600",
      bgClass: "from-amber-500/15 to-amber-500/5",
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
