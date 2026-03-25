"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  CalendarClock,
  CircleAlert,
  Percent,
  UserRound,
  Wallet,
} from "lucide-react"

import {
  type Budget,
  budgetPriorityLabel,
  budgetPriorityTone,
  budgetStatusLabel,
  budgetStatusTone,
  calculateBudgetFinancials,
  daysUntilDate,
  formatBudgetDate,
  formatBudgetDateLong,
  getBudgetItemMarginPercent,
  getBudgetItemNetTotal,
} from "@/components/budget/budget-mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getBudgets } from "@/services/budgets.service"
import { formatCurrencyBR } from "@/utils/Formatter"

export default function BudgetDetailsPage() {
  const searchParams = useSearchParams()
  const budgetId = searchParams.get("budgetId")?.trim() ?? ""
  const budgetCode = searchParams.get("budgetCode")?.trim() ?? ""
  const [budget, setBudget] = useState<Budget | null>(null)
  const [isLoadingBudget, setIsLoadingBudget] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadBudget = async () => {
      if (!budgetId && !budgetCode) {
        if (!isMounted) return
        setBudget(null)
        setLoadError("Orcamento nao informado.")
        setIsLoadingBudget(false)
        return
      }

      try {
        setIsLoadingBudget(true)
        setLoadError(null)

        const response = await getBudgets()
        if (!isMounted) return

        const selectedBudget =
          response.data.find((item) => (budgetId ? item.id === budgetId : item.code === budgetCode)) ?? null
        setBudget(selectedBudget)
        if (!selectedBudget) {
          setLoadError("Orcamento nao encontrado para o identificador informado.")
        }
      } catch (error) {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : "Nao foi possivel carregar o orcamento."
        setBudget(null)
        setLoadError(message)
      } finally {
        if (isMounted) setIsLoadingBudget(false)
      }
    }

    void loadBudget()

    return () => {
      isMounted = false
    }
  }, [budgetCode, budgetId])

  if (isLoadingBudget) {
    return (
      <div className="space-y-6 pb-6">
        <article className="rounded-2xl border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
          Carregando detalhes do orcamento...
        </article>
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="space-y-6 pb-6">
        <article className="rounded-2xl border border-amber-300/60 bg-amber-100/70 p-4 text-amber-900">
          <p className="inline-flex items-center gap-2 text-sm font-semibold">
            <CircleAlert className="h-4 w-4" />
            {loadError || "Orcamento nao encontrado."}
          </p>
        </article>
        <Button asChild variant="outline">
          <Link href="/budget">
            <ArrowLeft className="h-4 w-4" />
            Voltar para orcamentos
          </Link>
        </Button>
      </div>
    )
  }

  const financials = calculateBudgetFinancials(budget)
  const remainingDays = daysUntilDate(budget.validUntil)

  return (
    <div className="space-y-6 pb-6">
      <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/20 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Button asChild variant="ghost" size="sm" className="h-8 px-2">
              <Link href="/budget">
                <ArrowLeft className="h-4 w-4" />
                Voltar para orcamentos
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={budgetStatusTone(budget.status)}>
                {budgetStatusLabel(budget.status)}
              </Badge>
              <Badge variant="outline" className={budgetPriorityTone(budget.priority)}>
                Prioridade {budgetPriorityLabel(budget.priority)}
              </Badge>
              <Badge variant="outline">{budget.code}</Badge>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">{budget.title}</h1>
            <p className="text-sm text-muted-foreground">
              Cliente {budget.client.name} - Responsavel {budget.owner} - Fechamento previsto em{" "}
              {formatBudgetDateLong(budget.expectedCloseDate)}
            </p>
          </div>

          <div className="grid min-w-[260px] gap-2 text-sm">
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Valor liquido</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrencyBR(financials.netTotal)}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Margem prevista</p>
              <p className="mt-1 text-lg font-semibold">{financials.marginPercent.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <QuickCard icon={Wallet} label="Valor liquido" value={formatCurrencyBR(financials.netTotal)} />
        <QuickCard icon={Percent} label="Margem" value={`${financials.marginPercent.toFixed(1)}%`} />
        <QuickCard
          icon={CalendarClock}
          label="Validade"
          value={remainingDays >= 0 ? `${remainingDays} dias restantes` : "Validade expirada"}
        />
        <QuickCard icon={UserRound} label="Responsavel" value={budget.owner} />
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Resumo comercial</h2>

        <div className="grid gap-3 md:grid-cols-2">
          <InfoLine label="Cliente" value={budget.client.name} />
          <InfoLine label="Segmento" value={budget.client.segment} />
          <InfoLine label="Documento" value={budget.client.document} />
          <InfoLine label="Contato" value={`${budget.client.contactName} (${budget.client.contactRole})`} />
          <InfoLine label="E-mail" value={budget.client.email} />
          <InfoLine label="Telefone" value={budget.client.phone} />
          <InfoLine label="Criado em" value={formatBudgetDate(budget.createdAt)} />
          <InfoLine label="Ultima atualizacao" value={formatBudgetDate(budget.updatedAt)} />
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <p className="font-semibold">Escopo</p>
          <p className="text-muted-foreground">{budget.scopeSummary}</p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold">Condicoes comerciais</p>
          <p className="text-muted-foreground">Pagamento: {budget.paymentTerms}</p>
          <p className="text-muted-foreground">Entrega: {budget.deliveryTerm}</p>
          <p className="text-muted-foreground">SLA: {budget.slaSummary}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-sm">
        <div className="border-b border-border/70 px-5 py-4">
          <h2 className="text-lg font-semibold">Itens e custos</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/35 hover:bg-muted/35">
              <TableHead className="pl-6">Item</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Qtd.</TableHead>
              <TableHead>Preco unit.</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Total liquido</TableHead>
              <TableHead>Margem</TableHead>
              <TableHead className="pr-6">Janela de entrega</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {budget.items.map((item) => {
              const marginPercent = getBudgetItemMarginPercent(item)
              return (
                <TableRow key={item.id}>
                  <TableCell className="pl-6 font-medium">{item.description}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrencyBR(item.unitPrice)}</TableCell>
                  <TableCell>{formatCurrencyBR(item.discount)}</TableCell>
                  <TableCell className="font-medium">{formatCurrencyBR(getBudgetItemNetTotal(item))}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        marginPercent < 20
                          ? "border-rose-300/70 bg-rose-100/80 text-rose-700"
                          : marginPercent < 30
                            ? "border-amber-300/70 bg-amber-100/80 text-amber-700"
                            : "border-emerald-300/70 bg-emerald-100/80 text-emerald-700"
                      }
                    >
                      {marginPercent.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6">{item.deliveryWindow}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <div className="grid gap-2 border-t border-border/70 bg-card/90 p-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
          <InfoLine label="Subtotal bruto" value={formatCurrencyBR(financials.grossTotal)} />
          <InfoLine label="Descontos" value={formatCurrencyBR(financials.discountTotal)} />
          <InfoLine label="Valor liquido" value={formatCurrencyBR(financials.netTotal)} strong />
          <InfoLine label="Custo estimado" value={formatCurrencyBR(financials.costTotal)} />
          <InfoLine label="Margem (R$)" value={formatCurrencyBR(financials.marginValue)} />
          <InfoLine label="Margem (%)" value={`${financials.marginPercent.toFixed(1)}%`} strong />
        </div>
      </section>
    </div>
  )
}

function QuickCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card/85 p-4 shadow-sm">
      <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </article>
  )
}

function InfoLine({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/65 px-3 py-2">
      <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <span className={strong ? "text-sm font-semibold" : "text-sm"}>{value}</span>
    </div>
  )
}
