"use client"

import { Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { BudgetCatalogHeader } from "@/components/budget/BudgetCatalogHeader"
import { BudgetStats } from "@/components/budget/BudgetStats"
import { BudgetTable } from "@/components/budget/BudgetTable"
import { FormBudget } from "@/components/budget/FormBudget"
import { type Budget, type BudgetStatus } from "@/components/budget/budget-mock-data"
import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBudget, deleteBudget, getBudgets, updateBudget } from "@/services/budgets.service"
import { sendBudgetToWhatsapp } from "@/services/budget-whatsapp.service"

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
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<BudgetStatusFilter>("all")
  const [ownerFilter, setOwnerFilter] = useState("all")
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadBudgets = async () => {
      try {
        setIsLoadingBudgets(true)
        const response = await getBudgets()
        if (!isMounted) return
        setBudgets(response.data)
      } catch (error) {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : "Nao foi possivel carregar os orcamentos."
        setFeedback(ComponentAlert.Error(message))
        setBudgets([])
      } finally {
        if (isMounted) setIsLoadingBudgets(false)
      }
    }

    void loadBudgets()

    return () => {
      isMounted = false
    }
  }, [])

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
    setEditingBudget(null)
    setShowBudgetForm(true)
  }

  async function handleDeleteBudget(targetBudget: Budget) {
    const confirmed = globalThis.confirm(`Deseja realmente excluir o orcamento ${targetBudget.code}?`)
    if (!confirmed) return

    try {
      const response = await deleteBudget(targetBudget.id)
      setBudgets((prev) => prev.filter((budget) => budget.id !== targetBudget.id))
      setFeedback(ComponentAlert.Success(response.message || `Orcamento ${targetBudget.code} excluido com sucesso.`))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel excluir o orcamento."
      setFeedback(ComponentAlert.Error(message))
    }
  }

  async function handleDeleteBudgets(targetBudgets: Budget[]) {
    if (targetBudgets.length === 0) return

    const confirmed = globalThis.confirm(
      targetBudgets.length === 1
        ? `Deseja realmente excluir o orcamento ${targetBudgets[0].code}?`
        : `Deseja realmente excluir ${targetBudgets.length} orcamentos selecionados?`
    )
    if (!confirmed) return

    setFeedback(ComponentAlert.Info("Excluindo orcamentos selecionados..."))

    const results = await Promise.allSettled(
      targetBudgets.map(async (budget) => {
        await deleteBudget(budget.id)
        return budget
      })
    )

    const deletedIds = new Set<string>()
    const failedMessages: string[] = []

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        deletedIds.add(result.value.id)
        return
      }

      const reasonMessage =
        result.reason instanceof Error ? result.reason.message : "Nao foi possivel excluir um dos orcamentos selecionados."
      failedMessages.push(reasonMessage)
    })

    if (deletedIds.size > 0) {
      setBudgets((prev) => prev.filter((budget) => !deletedIds.has(budget.id)))
    }

    if (failedMessages.length === 0) {
      setFeedback(
        ComponentAlert.Success(
          deletedIds.size === 1
            ? "1 orcamento excluido com sucesso."
            : `${deletedIds.size} orcamentos excluidos com sucesso.`
        )
      )
      return
    }

    if (deletedIds.size === 0) {
      setFeedback(ComponentAlert.Error(failedMessages[0]))
      return
    }

    setFeedback(
      ComponentAlert.Warning(
        `${deletedIds.size} orcamentos excluidos e ${failedMessages.length} falharam. Primeiro erro: ${failedMessages[0]}`
      )
    )
  }

  async function handleCopyBudget(sourceBudget: Budget) {
    try {
      setFeedback(ComponentAlert.Info(`Copiando o orcamento ${sourceBudget.code}...`))

      const payload = {
        clientId: sourceBudget.client.id,
        serviceId: sourceBudget.serviceId ?? null,
        title: `${sourceBudget.title} (copia)`,
        status: sourceBudget.status,
        priority: sourceBudget.priority,
        owner: sourceBudget.owner,
        validUntil: sourceBudget.validUntil,
        approvalDate: sourceBudget.approvalDate ?? null,
        expectedCloseDate: sourceBudget.expectedCloseDate ?? null,
        paymentTerms: sourceBudget.paymentTerms ?? null,
        deliveryTerm: sourceBudget.deliveryTerm ?? null,
        slaSummary: sourceBudget.slaSummary ?? null,
        scopeSummary: sourceBudget.scopeSummary ?? null,
        assumptions: sourceBudget.assumptions,
        exclusions: sourceBudget.exclusions,
        attachments: sourceBudget.attachments,
        clientName: sourceBudget.client.name ?? null,
        clientSegment: sourceBudget.client.segment ?? null,
        clientDocument: sourceBudget.client.document ?? null,
        clientCity: sourceBudget.client.city ?? null,
        clientState: sourceBudget.client.state ?? null,
        clientContactName: sourceBudget.client.contactName ?? null,
        clientContactRole: sourceBudget.client.contactRole ?? null,
        clientEmail: sourceBudget.client.email ?? null,
        clientPhone: sourceBudget.client.phone ?? null,
        serviceCode: sourceBudget.serviceCode ?? null,
        serviceName: sourceBudget.serviceName ?? null,
        serviceCategory: sourceBudget.serviceCategory ?? null,
        serviceBillingModel: sourceBudget.serviceBillingModel ?? null,
        serviceDescription: sourceBudget.serviceDescription ?? null,
        serviceEstimatedDuration: sourceBudget.serviceEstimatedDuration ?? null,
        serviceResponsible: sourceBudget.serviceResponsible ?? null,
        serviceStatus: sourceBudget.serviceStatus ?? null,
        productsTotalAmount: sourceBudget.productsTotalAmount ?? 0,
        productsCostAmount: sourceBudget.productsCostAmount ?? 0,
        serviceTotalAmount: sourceBudget.serviceTotalAmount ?? 0,
        serviceCostAmount: sourceBudget.serviceCostAmount ?? 0,
        budgetDiscount: sourceBudget.budgetDiscount ?? 0,
        budgetTotalCostAmount: sourceBudget.budgetTotalCostAmount ?? 0,
        budgetTotalAmount: sourceBudget.budgetTotalAmount ?? 0,
        budgetProfitPercent: sourceBudget.budgetProfitPercent ?? 0,
        items: sourceBudget.items.map((item) => ({
          productId: item.productId ?? undefined,
          code: item.code ?? null,
          description: item.description,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          internalCost: item.internalCost,
          estimatedHours: item.estimatedHours,
          deliveryWindow: item.deliveryWindow,
        })),
      }

      const createResponse = await createBudget(payload)
      const budgetsResponse = await getBudgets()
      setBudgets(budgetsResponse.data)
      setFeedback(
        ComponentAlert.Success(createResponse.message || `Orcamento copiado com sucesso para ${createResponse.data?.code ?? "novo codigo"}.`)
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel copiar o orcamento."
      setFeedback(ComponentAlert.Error(message))
    }
  }

  async function handleSendBudget(targetBudget: Budget) {
    try {
      setFeedback(ComponentAlert.Info(`Preparando envio do orçamento ${targetBudget.code} no WhatsApp...`))
      const result = await sendBudgetToWhatsapp(targetBudget)

      const updatedResponse = await updateBudget(targetBudget.id, { status: "sent" })
      setBudgets((prev) => prev.map((budget) => (budget.id === targetBudget.id ? updatedResponse.data : budget)))

      if (result.mode === "shared") {
        setFeedback(ComponentAlert.Success(`Orçamento ${targetBudget.code} compartilhado para envio via WhatsApp.`))
        return
      }

      setFeedback(
        ComponentAlert.Warning(
          `PDF do orçamento ${targetBudget.code} baixado e conversa do WhatsApp aberta para ${result.phone}.`
        )
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível enviar o orçamento por WhatsApp."
      setFeedback(ComponentAlert.Error(message))
    }
  }

  return (
    <div className="relative space-y-6 overflow-hidden pb-4">
      <FormBudget
        open={showBudgetForm || Boolean(editingBudget)}
        mode={editingBudget ? "edit" : "create"}
        budgetToEdit={editingBudget}
        onClose={() => {
          setShowBudgetForm(false)
          setEditingBudget(null)
        }}
        existingCodes={budgets.filter((budget) => budget.id !== editingBudget?.id).map((budget) => budget.code)}
        onCreated={(budget) => {
          setBudgets((prev) => [budget, ...prev])
        }}
        onUpdated={(updatedBudget) => {
          setBudgets((prev) => prev.map((budget) => (budget.id === updatedBudget.id ? updatedBudget : budget)))
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

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BudgetStatusFilter)}>
              <SelectTrigger className="h-10 w-full rounded-xl border-border/70 bg-background text-sm">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent align="start">
                {STATUS_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="h-10 w-full rounded-xl border-border/70 bg-background text-sm">
                <SelectValue placeholder="Todos os responsaveis" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="all">Todos os responsaveis</SelectItem>
                {owners.map((owner) => (
                  <SelectItem key={owner} value={owner}>
                    {owner}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-right text-sm text-muted-foreground">
              {isLoadingBudgets ? "Carregando..." : `${filteredBudgets.length} orcamentos`}
            </p>
          </div>
        </div>

        {isLoadingBudgets ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">Carregando orcamentos...</div>
        ) : (
          <BudgetTable
            budgets={filteredBudgets}
            onEditBudget={(budget) => {
              setFeedback(null)
              setShowBudgetForm(false)
              setEditingBudget(budget)
            }}
            onDeleteBudgets={(selectedBudgets) => {
              void handleDeleteBudgets(selectedBudgets)
            }}
            onCopyBudget={(budget) => {
              void handleCopyBudget(budget)
            }}
            onSendBudget={(budget) => {
              void handleSendBudget(budget)
            }}
            onGenerateOrder={(budget) => {
              setFeedback(ComponentAlert.Info(`Geração de OS para ${budget.code} em desenvolvimento.`))
            }}
            onGenerateRequest={(budget) => {
              setFeedback(ComponentAlert.Info(`Geração de pedido para ${budget.code} em desenvolvimento.`))
            }}
            onDeleteBudget={(budget) => {
              void handleDeleteBudget(budget)
            }}
          />
        )}
      </section>
    </div>
  )
}

export default BudgetComponent
