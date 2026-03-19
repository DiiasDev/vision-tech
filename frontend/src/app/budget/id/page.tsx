"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  CalendarClock,
  CircleAlert,
  Percent,
  Target,
  Wallet,
} from "lucide-react"

import {
  budgetChannelLabel,
  budgetMockData,
  budgetPriorityLabel,
  budgetPriorityTone,
  budgetRiskLevelLabel,
  budgetRiskLevelTone,
  budgetStatusLabel,
  budgetStatusTone,
  buildBudgetRecommendations,
  calculateBudgetFinancials,
  daysUntilDate,
  formatBudgetDate,
  formatBudgetDateLong,
  getBudgetById,
  getBudgetItemMarginPercent,
  getBudgetItemNetTotal,
} from "@/components/budget/budget-mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrencyBR } from "@/utils/Formatter"

export default function BudgetDetailsPage() {
  const searchParams = useSearchParams()
  const budgetId = searchParams.get("budgetId")
  const budgetFromQuery = getBudgetById(budgetId)
  const budget = budgetFromQuery ?? budgetMockData[0]
  const isFallback = !budgetFromQuery

  const financials = useMemo(() => calculateBudgetFinancials(budget), [budget])
  const recommendations = useMemo(() => buildBudgetRecommendations(budget), [budget])
  const remainingDays = daysUntilDate(budget.validUntil)

  return (
    <div className="space-y-6 pb-6">
      {isFallback ? (
        <article className="rounded-2xl border border-amber-300/60 bg-amber-100/70 p-4 text-amber-900">
          <p className="inline-flex items-center gap-2 text-sm font-semibold">
            <CircleAlert className="h-4 w-4" />
            Orcamento nao informado ou nao encontrado. Exibindo um modelo para referencia.
          </p>
        </article>
      ) : null}

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
        <QuickCard icon={Target} label="Probabilidade" value={`${budget.probability}%`} />
        <QuickCard
          icon={CalendarClock}
          label="Validade"
          value={remainingDays >= 0 ? `${remainingDays} dias restantes` : "Validade expirada"}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
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

        <aside className="space-y-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Plano de acao</h2>

          <div className="space-y-2">
            {budget.nextSteps.map((step) => (
              <div key={step.id} className="rounded-xl border border-border/70 bg-background/65 p-3 text-sm">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{formatBudgetDate(step.dueDate)}</p>
                <p className="mt-1 font-semibold">{step.action}</p>
                <p className="mt-1 text-muted-foreground">{step.owner}</p>
                <p className="mt-1 text-xs text-muted-foreground">Objetivo: {step.objective}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <p className="font-semibold">Recomendacoes imediatas</p>
            <ul className="space-y-2">
              {recommendations.map((recommendation) => (
                <li key={recommendation} className="rounded-lg border border-border/70 bg-background/65 px-3 py-2">
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <Tabs defaultValue="items" className="gap-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl border border-border/70 bg-card/70 p-2">
          <TabsTrigger value="items">Itens e custos</TabsTrigger>
          <TabsTrigger value="timeline">Timeline comercial</TabsTrigger>
          <TabsTrigger value="risks">Riscos e anexos</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-sm">
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
        </TabsContent>

        <TabsContent value="timeline">
          <div className="grid gap-4 xl:grid-cols-2">
            <section className="space-y-3 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm">
              <h3 className="text-base font-semibold">Interacoes registradas</h3>
              {budget.interactions.map((interaction) => (
                <div key={interaction.id} className="rounded-xl border border-border/70 bg-background/65 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline">{budgetChannelLabel(interaction.channel)}</Badge>
                    <p className="text-xs text-muted-foreground">{formatBudgetDateLong(interaction.date)}</p>
                  </div>
                  <p className="mt-2 text-sm">{interaction.summary}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Responsavel: {interaction.author}</p>
                </div>
              ))}
            </section>

            <section className="space-y-3 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm">
              <h3 className="text-base font-semibold">Marcos planejados</h3>
              {budget.nextSteps.map((step) => (
                <div key={step.id} className="rounded-xl border border-border/70 bg-background/65 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{formatBudgetDate(step.dueDate)}</p>
                  <p className="mt-1 text-sm font-semibold">{step.action}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{step.objective}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Responsavel: {step.owner}</p>
                </div>
              ))}
            </section>
          </div>
        </TabsContent>

        <TabsContent value="risks">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <section className="space-y-3 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm">
              <h3 className="text-base font-semibold">Riscos e mitigacoes</h3>
              {budget.risks.map((risk) => (
                <div key={risk.id} className="rounded-xl border border-border/70 bg-background/65 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{risk.title}</p>
                    <Badge variant="outline" className={budgetRiskLevelTone(risk.level)}>
                      {budgetRiskLevelLabel(risk.level)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Impacto: {risk.impact}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Mitigacao: {risk.mitigation}</p>
                </div>
              ))}

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Premissas</p>
                  <ul className="mt-2 space-y-2 text-sm">
                    {budget.assumptions.map((assumption) => (
                      <li key={assumption} className="rounded-lg border border-border/70 bg-background/65 px-3 py-2">
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Exclusoes</p>
                  <ul className="mt-2 space-y-2 text-sm">
                    {budget.exclusions.map((exclusion) => (
                      <li key={exclusion} className="rounded-lg border border-border/70 bg-background/65 px-3 py-2">
                        {exclusion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <aside className="space-y-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm">
              <h3 className="text-base font-semibold">Documentacao</h3>

              <div className="space-y-2">
                {budget.attachments.map((attachment) => (
                  <div key={attachment} className="rounded-lg border border-border/70 bg-background/65 px-3 py-2 text-sm">
                    {attachment}
                  </div>
                ))}
              </div>

              <Separator />

              <div className="rounded-xl border border-border/70 bg-background/65 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Resumo de acompanhamento</p>
                <p className="mt-2 text-sm text-foreground">{budget.code}</p>
                <p className="text-sm text-muted-foreground">{budgetStatusLabel(budget.status)}</p>
                <p className="text-sm text-muted-foreground">Atualizado em {formatBudgetDate(budget.updatedAt)}</p>
              </div>
            </aside>
          </div>
        </TabsContent>
      </Tabs>
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
