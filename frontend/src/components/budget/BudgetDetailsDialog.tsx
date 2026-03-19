"use client"

import Link from "next/link"
import { type ComponentType } from "react"
import { CalendarClock, CircleAlert, Percent, Target, UserRound, Wallet } from "lucide-react"

import {
  type Budget,
  budgetChannelLabel,
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
  getBudgetItemMarginPercent,
  getBudgetItemNetTotal,
} from "@/components/budget/budget-mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrencyBR } from "@/utils/Formatter"

type BudgetDetailsDialogProps = {
  budget: Budget | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BudgetDetailsDialog({ budget, open, onOpenChange }: BudgetDetailsDialogProps) {
  if (!budget) return null

  const financials = calculateBudgetFinancials(budget)
  const recommendations = buildBudgetRecommendations(budget)
  const remainingDays = daysUntilDate(budget.validUntil)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(calc(100%-1rem),80rem)] max-w-none border-0 bg-transparent p-0 shadow-none">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative max-h-[82vh] overflow-y-auto p-6 md:p-7">
            <DialogHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                  Visao detalhada do orcamento
                </Badge>
                <Badge variant="outline" className={budgetStatusTone(budget.status)}>
                  {budgetStatusLabel(budget.status)}
                </Badge>
                <Badge variant="outline" className={budgetPriorityTone(budget.priority)}>
                  Prioridade {budgetPriorityLabel(budget.priority)}
                </Badge>
              </div>

              <DialogTitle className="break-words text-3xl font-semibold tracking-tight">
                {budget.code} - {budget.title}
              </DialogTitle>

              <DialogDescription className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
                Cliente {budget.client.name} ({budget.client.segment}) - Responsavel {budget.owner}. Validade em{" "}
                {formatBudgetDateLong(budget.validUntil)}.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <SummaryCard icon={Wallet} label="Valor liquido" value={formatCurrencyBR(financials.netTotal)} />
              <SummaryCard icon={Percent} label="Margem prevista" value={`${financials.marginPercent.toFixed(1)}%`} />
              <SummaryCard icon={Target} label="Probabilidade" value={`${budget.probability}%`} />
              <SummaryCard
                icon={CalendarClock}
                label="Validade"
                value={remainingDays >= 0 ? `${remainingDays} dias` : "Vencido"}
              />
              <SummaryCard icon={UserRound} label="Responsavel" value={budget.owner} />
            </div>

            <Tabs defaultValue="executive" className="mt-6 gap-4">
              <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl border border-border/70 bg-card/70 p-2">
                <TabsTrigger value="executive">Resumo executivo</TabsTrigger>
                <TabsTrigger value="financial">Composicao financeira</TabsTrigger>
                <TabsTrigger value="commercial">Historial comercial</TabsTrigger>
                <TabsTrigger value="risk">Riscos e plano</TabsTrigger>
              </TabsList>

              <TabsContent value="executive">
                <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                  <article className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Escopo e condicoes
                    </h3>

                    <div className="space-y-2 text-sm">
                      <p className="leading-relaxed text-foreground">{budget.scopeSummary}</p>
                      <p className="text-muted-foreground">
                        <strong>SLA:</strong> {budget.slaSummary}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Pagamento:</strong> {budget.paymentTerms}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Entrega:</strong> {budget.deliveryTerm}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Premissas
                        </p>
                        <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                          {budget.assumptions.map((assumption) => (
                            <li key={assumption} className="rounded-lg border border-border/60 bg-background/55 px-3 py-2">
                              {assumption}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Exclusoes</p>
                        <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                          {budget.exclusions.map((exclusion) => (
                            <li key={exclusion} className="rounded-lg border border-border/60 bg-background/55 px-3 py-2">
                              {exclusion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>

                  <aside className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Proximas acoes
                    </h3>

                    <div className="space-y-2">
                      {budget.nextSteps.map((step) => (
                        <div key={step.id} className="rounded-xl border border-border/70 bg-background/65 p-3">
                          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{formatBudgetDate(step.dueDate)}</p>
                          <p className="mt-1 text-sm font-semibold">{step.action}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{step.owner}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Objetivo: {step.objective}</p>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="rounded-xl border border-border/70 bg-background/65 p-3 text-sm">
                      <p className="font-semibold">Contato principal</p>
                      <p className="mt-1 text-muted-foreground">{budget.client.contactName}</p>
                      <p className="text-muted-foreground">{budget.client.contactRole}</p>
                      <p className="mt-2 text-muted-foreground">{budget.client.email}</p>
                      <p className="text-muted-foreground">{budget.client.phone}</p>
                    </div>
                  </aside>
                </div>
              </TabsContent>

              <TabsContent value="financial">
                <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
                  <article className="overflow-hidden rounded-2xl border border-border/70 bg-card/70">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/35 hover:bg-muted/35">
                          <TableHead className="pl-4">Item</TableHead>
                          <TableHead>Qtd.</TableHead>
                          <TableHead>Preco unit.</TableHead>
                          <TableHead>Desconto</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead className="pr-4">Margem</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {budget.items.map((item) => {
                          const itemMargin = getBudgetItemMarginPercent(item)

                          return (
                            <TableRow key={item.id}>
                              <TableCell className="pl-4">
                                <p className="font-medium">{item.description}</p>
                                <p className="text-xs text-muted-foreground">{item.category}</p>
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{formatCurrencyBR(item.unitPrice)}</TableCell>
                              <TableCell>{formatCurrencyBR(item.discount)}</TableCell>
                              <TableCell className="font-medium">{formatCurrencyBR(getBudgetItemNetTotal(item))}</TableCell>
                              <TableCell className="pr-4">
                                <Badge
                                  variant="outline"
                                  className={
                                    itemMargin < 20
                                      ? "border-rose-300/70 bg-rose-100/80 text-rose-700"
                                      : itemMargin < 30
                                        ? "border-amber-300/70 bg-amber-100/80 text-amber-700"
                                        : "border-emerald-300/70 bg-emerald-100/80 text-emerald-700"
                                  }
                                >
                                  {itemMargin.toFixed(1)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </article>

                  <aside className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Resumo financeiro
                    </h3>

                    <SummaryLine label="Subtotal bruto" value={formatCurrencyBR(financials.grossTotal)} />
                    <SummaryLine label="Descontos" value={formatCurrencyBR(financials.discountTotal)} />
                    <SummaryLine label="Valor liquido" value={formatCurrencyBR(financials.netTotal)} strong />
                    <SummaryLine label="Custo estimado" value={formatCurrencyBR(financials.costTotal)} />
                    <SummaryLine label="Margem (R$)" value={formatCurrencyBR(financials.marginValue)} />
                    <SummaryLine label="Margem (%)" value={`${financials.marginPercent.toFixed(1)}%`} strong />
                  </aside>
                </div>
              </TabsContent>

              <TabsContent value="commercial">
                <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
                  <article className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Interacoes comerciais
                    </h3>

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
                  </article>

                  <aside className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Recomendacoes
                    </h3>

                    <ul className="space-y-2 text-sm">
                      {recommendations.map((recommendation) => (
                        <li
                          key={recommendation}
                          className="rounded-xl border border-border/70 bg-background/65 px-3 py-2 text-foreground"
                        >
                          {recommendation}
                        </li>
                      ))}
                    </ul>

                    <Separator />

                    <div className="rounded-xl border border-border/70 bg-background/65 p-3 text-sm">
                      <p className="font-semibold">Fechamento esperado</p>
                      <p className="mt-1 text-muted-foreground">{formatBudgetDateLong(budget.expectedCloseDate)}</p>
                    </div>
                  </aside>
                </div>
              </TabsContent>

              <TabsContent value="risk">
                <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
                  <article className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Mapa de riscos
                    </h3>

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
                  </article>

                  <aside className="space-y-4">
                    <article className="rounded-2xl border border-border/70 bg-card/70 p-4">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Alertas de validade
                      </h3>
                      <p className="mt-2 text-sm text-foreground">
                        {remainingDays >= 0
                          ? `Proposta com ${remainingDays} dias restantes antes da expiracao.`
                          : "Proposta expirada. Recomendado clonar orcamento e reenviar com novas condicoes."}
                      </p>
                    </article>

                    <article className="rounded-2xl border border-border/70 bg-card/70 p-4">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Anexos
                      </h3>
                      <ul className="mt-2 space-y-2 text-sm text-foreground">
                        {budget.attachments.map((attachment) => (
                          <li key={attachment} className="rounded-lg border border-border/70 bg-background/65 px-3 py-2">
                            {attachment}
                          </li>
                        ))}
                      </ul>
                    </article>

                    {budget.risks.some((risk) => risk.level === "high") ? (
                      <article className="rounded-2xl border border-rose-300/60 bg-rose-100/60 p-4 text-rose-900">
                        <p className="inline-flex items-center gap-2 text-sm font-semibold">
                          <CircleAlert className="h-4 w-4" />
                          Existe risco alto ativo neste orcamento
                        </p>
                        <p className="mt-1 text-xs">
                          Recomenda-se envolver lideranca comercial antes da rodada final de aprovacao.
                        </p>
                      </article>
                    ) : null}
                  </aside>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="border-t border-border/70 bg-card/95 px-6 py-4 backdrop-blur-sm md:px-7">
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
            <Button asChild>
              <Link href={`/budget/id?budgetId=${budget.id}`}>Abrir pagina completa</Link>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
      <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  )
}

function SummaryLine({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/65 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold text-foreground" : "font-medium text-foreground"}>{value}</span>
    </div>
  )
}
