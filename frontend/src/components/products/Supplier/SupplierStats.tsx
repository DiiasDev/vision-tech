"use client"

import { AlertTriangle, Building2, Clock3, ShieldCheck } from "lucide-react"

import { type Supplier } from "@/components/products/Supplier/supplier-models"

type SupplierStatsProps = {
  suppliers: Supplier[]
}

function normalizeValue(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR")
}

function parseLeadDays(lead?: string) {
  if (!lead?.trim()) return 0
  const numericMatch = lead.replace(",", ".").match(/\d+(\.\d+)?/)
  if (!numericMatch) return 0

  const parsedValue = Number.parseFloat(numericMatch[0])
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

export function SupplierStats({ suppliers }: SupplierStatsProps) {
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter((supplier) => normalizeValue(supplier.status) === "ativo").length
  const highRiskSuppliers = suppliers.filter((supplier) => normalizeValue(supplier.risk) === "alto").length
  const leadValues = suppliers.map((supplier) => parseLeadDays(supplier.lead)).filter((value) => value > 0)
  const averageLeadDays = leadValues.length > 0 ? leadValues.reduce((acc, value) => acc + value, 0) / leadValues.length : 0

  const cards = [
    {
      id: "total",
      title: "Total de fornecedores",
      value: String(totalSuppliers),
      hint: "Base cadastrada",
      icon: Building2,
      colorClass: "text-primary",
      bgClass: "from-primary/15 to-primary/5",
    },
    {
      id: "active",
      title: "Fornecedores ativos",
      value: String(activeSuppliers),
      hint: `${totalSuppliers > 0 ? Math.round((activeSuppliers / totalSuppliers) * 100) : 0}% do total`,
      icon: ShieldCheck,
      colorClass: "text-emerald-600",
      bgClass: "from-emerald-500/15 to-emerald-500/5",
    },
    {
      id: "lead",
      title: "Lead médio",
      value: `${averageLeadDays.toFixed(1)} dias`,
      hint: "Tempo estimado de entrega",
      icon: Clock3,
      colorClass: "text-amber-600",
      bgClass: "from-amber-500/15 to-amber-500/5",
    },
    {
      id: "risk",
      title: "Risco alto",
      value: String(highRiskSuppliers),
      hint: "Fornecedores com atenção",
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
