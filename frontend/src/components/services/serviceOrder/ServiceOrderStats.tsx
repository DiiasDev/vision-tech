import { AlertTriangle, CircleCheckBig, Clock3, Target, Wallet } from "lucide-react"

import {
  type ServiceOrder,
  daysUntilServiceOrderDeadline,
  isServiceOrderOpen,
} from "@/components/services/serviceOrder/service-order-mock-data"
import { formatCurrencyBR } from "@/utils/Formatter"

type ServiceOrderStatsProps = {
  orders: ServiceOrder[]
}

const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24

function calculateAverageLeadTime(orders: ServiceOrder[]) {
  const completedOrders = orders.filter((order) => order.status === "completed" && order.concludedAt)
  if (completedOrders.length === 0) return 0

  const totalDays = completedOrders.reduce((acc, order) => {
    const start = new Date(order.createdAt)
    const end = new Date(order.concludedAt as string)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return acc

    const diff = Math.max(0, end.getTime() - start.getTime())
    return acc + Math.round(diff / MILLISECONDS_IN_DAY)
  }, 0)

  return totalDays / completedOrders.length
}

export function ServiceOrderStats({ orders }: ServiceOrderStatsProps) {
  const openOrders = orders.filter((order) => isServiceOrderOpen(order.status))
  const completedOrders = orders.filter((order) => order.status === "completed")
  const totalEstimatedValue = orders.reduce((acc, order) => acc + order.estimatedValue, 0)
  const completionRate = orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0
  const overdueOrders = openOrders.filter((order) => daysUntilServiceOrderDeadline(order.deadlineDate) < 0).length
  const slaRiskOrders = openOrders.filter((order) => daysUntilServiceOrderDeadline(order.deadlineDate) <= 2).length
  const averageLeadTime = calculateAverageLeadTime(orders)

  const cards = [
    {
      id: "pipeline",
      label: "Ordens abertas",
      value: String(openOrders.length),
      helper: `${slaRiskOrders} com prazo critico (<= 2 dias)`,
      icon: Clock3,
      colorClass: "text-primary",
      bgClass: "from-primary/15 to-primary/5",
    },
    {
      id: "completed",
      label: "Ordens concluidas",
      value: String(completedOrders.length),
      helper: `${completionRate.toFixed(1)}% de conclusao`,
      icon: CircleCheckBig,
      colorClass: "text-emerald-600",
      bgClass: "from-emerald-500/15 to-emerald-500/5",
    },
    {
      id: "estimated-revenue",
      label: "Valor previsto",
      value: formatCurrencyBR(totalEstimatedValue),
      helper: "Somatorio das OS listadas",
      icon: Wallet,
      colorClass: "text-sky-600",
      bgClass: "from-sky-500/15 to-sky-500/5",
    },
    {
      id: "lead-time",
      label: "Lead time medio",
      value: `${averageLeadTime.toFixed(1)} dias`,
      helper: "Criacao ate conclusao",
      icon: Target,
      colorClass: "text-amber-600",
      bgClass: "from-amber-500/15 to-amber-500/5",
    },
    {
      id: "overdue",
      label: "OS atrasadas",
      value: String(overdueOrders),
      helper: "Abertas com prazo vencido",
      icon: AlertTriangle,
      colorClass: "text-rose-600",
      bgClass: "from-rose-500/15 to-rose-500/5",
    },
  ]

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
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
