"use client"

import { CalendarClock, ClipboardList, Target, TrendingUp, Wallet } from "lucide-react"

import { type Budget, calculateBudgetFinancials, daysUntilDate, isBudgetOpen } from "@/components/budget/budget-mock-data"
import { formatCurrencyBR } from "@/utils/Formatter"

type BudgetStatsProps = {
  budgets: Budget[]
}

export function BudgetStats({ budgets }: BudgetStatsProps) {
  const openBudgets = budgets.filter((budget) => isBudgetOpen(budget.status))
  const closedBudgets = budgets.filter(
    (budget) => budget.status === "approved" || budget.status === "rejected" || budget.status === "expired"
  )
  const approvedBudgets = budgets.filter((budget) => budget.status === "approved")

  const openValue = openBudgets.reduce((acc, budget) => acc + calculateBudgetFinancials(budget).netTotal, 0)
  const approvedValue = approvedBudgets.reduce((acc, budget) => acc + calculateBudgetFinancials(budget).netTotal, 0)
  const averageTicket = budgets.length > 0 ? budgets.reduce((acc, budget) => acc + calculateBudgetFinancials(budget).netTotal, 0) / budgets.length : 0
  const conversionRate = closedBudgets.length > 0 ? (approvedBudgets.length / closedBudgets.length) * 100 : 0
  const expiringSoonCount = openBudgets.filter((budget) => daysUntilDate(budget.validUntil) <= 7).length

  const cards = [
    {
      id: "open",
      title: "Pipeline aberto",
      value: formatCurrencyBR(openValue),
      hint: `${expiringSoonCount} com validade em ate 7 dias`,
      icon: Wallet,
      colorClass: "text-primary",
      bgClass: "from-primary/15 to-primary/5",
    },
    {
      id: "approved",
      title: "Valor aprovado",
      value: formatCurrencyBR(approvedValue),
      hint: "Receita confirmada no periodo",
      icon: TrendingUp,
      colorClass: "text-emerald-600",
      bgClass: "from-emerald-500/15 to-emerald-500/5",
    },
    {
      id: "conversion",
      title: "Taxa de conversao",
      value: `${conversionRate.toFixed(1)}%`,
      hint: "Base: oportunidades encerradas",
      icon: Target,
      colorClass: "text-sky-600",
      bgClass: "from-sky-500/15 to-sky-500/5",
    },
    {
      id: "ticket",
      title: "Ticket medio",
      value: formatCurrencyBR(averageTicket),
      hint: "Media de valor por proposta",
      icon: ClipboardList,
      colorClass: "text-amber-600",
      bgClass: "from-amber-500/15 to-amber-500/5",
    },
    {
      id: "validity",
      title: "Validades proximas",
      value: String(expiringSoonCount),
      hint: "Orcamentos com atencao",
      icon: CalendarClock,
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
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
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
