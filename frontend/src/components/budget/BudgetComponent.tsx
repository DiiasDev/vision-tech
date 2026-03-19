"use client"

import { Search } from "lucide-react"
import { useMemo, useState } from "react"

import { BudgetCatalogHeader } from "@/components/budget/BudgetCatalogHeader"
import { BudgetStats } from "@/components/budget/BudgetStats"
import { BudgetTable } from "@/components/budget/BudgetTable"
import { FormBudget } from "@/components/budget/FormBudget"
import { type Budget, type BudgetStatus, budgetMockData } from "@/components/budget/budget-mock-data"
import { AlertComponent, type ComponentAlertState } from "@/components/layout/AlertComponent"
import { Input } from "@/components/ui/input"

type BudgetStatusFilter = "all" | BudgetStatus

const STATUS_FILTERS: Array<{ value: BudgetStatusFilter; label: string }> = [
  { value: "all", label: "Todos os status" },
  { value: "draft", label: "Rascunho" },
  { value: "sent", label: "Enviado" },
  { value: "negotiation", label: "Em negociacao" },
  { value: "approved", label: "Aprovado" },
  { value: "rejected", label: "Perdido" },
  { value: "expired", label: "Expirado" },
]

export function BudgetComponent() {
  const [budgets, setBudgets] = useState<Budget[]>(budgetMockData)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<BudgetStatusFilter>("all")
  const [ownerFilter, setOwnerFilter] = useState("all")
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)

  const owners = useMemo(() => {
    const uniqueOwners = new Set<string>()
    budgets.forEach((budget) => uniqueOwners.add(budget.owner))
    return Array.from(uniqueOwners).sort((a, b) => a.localeCompare(b, "pt-BR"))
  }, [budgets])

  const filteredBudgets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return budgets.filter((budget) => {
      const matchesStatus = statusFilter === "all" || budget.status === statusFilter
      const matchesOwner = ownerFilter === "all" || budget.owner === ownerFilter
      const matchesSearch =
        normalizedSearch.length === 0 ||
        budget.code.toLowerCase().includes(normalizedSearch) ||
        budget.title.toLowerCase().includes(normalizedSearch) ||
        budget.client.name.toLowerCase().includes(normalizedSearch) ||
        budget.client.segment.toLowerCase().includes(normalizedSearch) ||
        budget.owner.toLowerCase().includes(normalizedSearch)

      return matchesStatus && matchesOwner && matchesSearch
    })
  }, [budgets, ownerFilter, search, statusFilter])

  function handleOpenBudgetForm() {
    setFeedback(null)
    setShowBudgetForm(true)
  }

  return (
    <div className="relative space-y-6 overflow-hidden pb-4">
      <FormBudget
        open={showBudgetForm}
        onClose={() => setShowBudgetForm(false)}
        existingCodes={budgets.map((budget) => budget.code)}
        onCreated={(budget) => {
          setBudgets((prev) => [budget, ...prev])
        }}
        onFeedback={setFeedback}
      />

      <BudgetCatalogHeader onAddBudget={handleOpenBudgetForm} />

      <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

      <BudgetStats budgets={budgets} />

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm">
        <div className="border-b border-border/70 p-5">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_0.9fr_0.9fr_auto] lg:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por codigo, cliente, escopo ou responsavel..."
                className="h-10 rounded-xl border-border/70 bg-background pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as BudgetStatusFilter)}
              className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm"
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={ownerFilter}
              onChange={(event) => setOwnerFilter(event.target.value)}
              className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm"
            >
              <option value="all">Todos os responsaveis</option>
              {owners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>

            <p className="text-right text-sm text-muted-foreground">{filteredBudgets.length} orcamentos</p>
          </div>
        </div>

        <BudgetTable budgets={filteredBudgets} />
      </section>
    </div>
  )
}

export default BudgetComponent
