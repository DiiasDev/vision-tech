"use client"

import Link from "next/link"
import { type ComponentType } from "react"
import {
  BriefcaseBusiness,
  CalendarClock,
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

  function openItemDetailsInNewTab(productId?: string | null) {
    const normalizedProductId = productId?.trim()
    if (!normalizedProductId) return

    const targetUrl = `/products/id?productId=${encodeURIComponent(normalizedProductId)}`
    const openedTab = globalThis.open(targetUrl, "_blank")
    if (openedTab) openedTab.opener = null
  }

  const financials = calculateBudgetFinancials(budget)
  const remainingDays = daysUntilDate(budget.validUntil)

  const productsTotalAmount = toMoney(budget.productsTotalAmount, financials.netTotal)
  const productsCostAmount = toMoney(budget.productsCostAmount, financials.costTotal)
  const serviceTotalAmount = toMoney(budget.serviceTotalAmount, 0)
  const serviceCostAmount = toMoney(budget.serviceCostAmount, 0)
  const budgetDiscount = toMoney(budget.budgetDiscount, 0)
  const budgetTotalCostAmount = toMoney(budget.budgetTotalCostAmount, Math.max(0, productsCostAmount + serviceCostAmount))
  const budgetTotalAmount = toMoney(
    budget.budgetTotalAmount,
    Math.max(0, productsTotalAmount + serviceTotalAmount - budgetDiscount)
  )
  const budgetProfitPercent = toMoney(
    budget.budgetProfitPercent,
    budgetTotalAmount > 0 ? ((budgetTotalAmount - budgetTotalCostAmount) / budgetTotalAmount) * 100 : 0
  )
  const budgetProfitAmount = budgetTotalAmount - budgetTotalCostAmount

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
              <SummaryCard icon={Wallet} label="Total do orcamento" value={formatCurrencyBR(budgetTotalAmount)} />
              <SummaryCard icon={Percent} label="Margem prevista" value={`${budgetProfitPercent.toFixed(1)}%`} />
              <SummaryCard
                icon={CalendarClock}
                label="Validade"
                value={remainingDays >= 0 ? `${remainingDays} dias` : "Vencido"}
              />
              <SummaryCard icon={BriefcaseBusiness} label="Servico" value={budget.serviceName?.trim() || "Nao informado"} />
              <SummaryCard icon={UserRound} label="Responsavel" value={budget.owner} />
            </div>

            <Tabs defaultValue="executive" className="mt-6 gap-4">
              <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl border border-border/70 bg-card/70 p-2">
                <TabsTrigger value="executive">Resumo executivo</TabsTrigger>
                <TabsTrigger value="financial">Composicao financeira</TabsTrigger>
                <TabsTrigger value="full">Dados completos</TabsTrigger>
              </TabsList>

              <TabsContent value="executive">
                <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                  <article className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Escopo e condicoes
                    </h3>

                    <div className="space-y-2 text-sm">
                      <p className="leading-relaxed text-foreground">{toText(budget.scopeSummary)}</p>
                      <p className="text-muted-foreground">
                        <strong>SLA:</strong> {toText(budget.slaSummary)}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Pagamento:</strong> {toText(budget.paymentTerms)}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Entrega:</strong> {toText(budget.deliveryTerm)}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Aprovacao:</strong> {formatOptionalDate(budget.approvalDate, "Nao informada")}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Premissas</p>
                        <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                          {budget.assumptions.length === 0 ? (
                            <li className="rounded-lg border border-border/60 bg-background/55 px-3 py-2 text-muted-foreground">
                              Nao informado
                            </li>
                          ) : (
                            budget.assumptions.map((assumption) => (
                              <li key={assumption} className="rounded-lg border border-border/60 bg-background/55 px-3 py-2">
                                {assumption}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Exclusoes</p>
                        <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                          {budget.exclusions.length === 0 ? (
                            <li className="rounded-lg border border-border/60 bg-background/55 px-3 py-2 text-muted-foreground">
                              Nao informado
                            </li>
                          ) : (
                            budget.exclusions.map((exclusion) => (
                              <li key={exclusion} className="rounded-lg border border-border/60 bg-background/55 px-3 py-2">
                                {exclusion}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </article>

                  <aside className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Contato principal</h3>

                    <Separator />

                    <div className="rounded-xl border border-border/70 bg-background/65 p-3 text-sm">
                      <p className="font-semibold">{toText(budget.client.name)}</p>
                      <p className="mt-1 text-muted-foreground">{toText(budget.client.contactName)}</p>
                      <p className="text-muted-foreground">{toText(budget.client.contactRole)}</p>
                      <p className="mt-2 text-muted-foreground">{toText(budget.client.email)}</p>
                      <p className="text-muted-foreground">{toText(budget.client.phone)}</p>
                    </div>
                  </aside>
                </div>
              </TabsContent>

              <TabsContent value="financial">
                <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
                  <article className="overflow-hidden rounded-2xl border border-border/70 bg-card/70">
                    <Table className="table-fixed [&_th]:whitespace-normal [&_td]:whitespace-normal">
                      <TableHeader>
                        <TableRow className="bg-muted/35 hover:bg-muted/35">
                          <TableHead className="w-[38%] pl-3 pr-2">Item</TableHead>
                          <TableHead className="w-[10%] px-2">Qtd.</TableHead>
                          <TableHead className="w-[14%] px-2">Preco unit.</TableHead>
                          <TableHead className="w-[14%] px-2">Desconto</TableHead>
                          <TableHead className="w-[14%] px-2">Total</TableHead>
                          <TableHead className="w-[10%] px-2 pr-3">Margem</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {budget.items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                              Nenhum item cadastrado para este orcamento.
                            </TableCell>
                          </TableRow>
                        ) : (
                          budget.items.map((item) => {
                            const itemMargin = getBudgetItemMarginPercent(item)
                            const canOpenItemDetails = Boolean(item.productId?.trim())

                            return (
                              <TableRow
                                key={item.id}
                                className={canOpenItemDetails ? "cursor-pointer hover:bg-muted/35" : undefined}
                                onClick={() => openItemDetailsInNewTab(item.productId)}
                                onKeyDown={(event) => {
                                  if (!canOpenItemDetails) return
                                  if (event.key !== "Enter" && event.key !== " ") return
                                  event.preventDefault()
                                  openItemDetailsInNewTab(item.productId)
                                }}
                                role={canOpenItemDetails ? "button" : undefined}
                                tabIndex={canOpenItemDetails ? 0 : undefined}
                                aria-label={canOpenItemDetails ? `Abrir detalhes do item ${item.description}` : undefined}
                              >
                                <TableCell className="min-w-0 pl-3 pr-2">
                                  <p className="truncate font-medium">{item.description}</p>
                                  <p className="truncate text-xs text-muted-foreground">{item.category}</p>
                                </TableCell>
                                <TableCell className="px-2">{item.quantity}</TableCell>
                                <TableCell className="px-2">{formatCurrencyBR(item.unitPrice)}</TableCell>
                                <TableCell className="px-2">{formatCurrencyBR(item.discount)}</TableCell>
                                <TableCell className="px-2 font-medium">{formatCurrencyBR(getBudgetItemNetTotal(item))}</TableCell>
                                <TableCell className="px-2 pr-3">
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
                          })
                        )}
                      </TableBody>
                    </Table>
                  </article>

                  <aside className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Resumo financeiro
                    </h3>

                    <SummaryLine label="Subtotal bruto (itens)" value={formatCurrencyBR(financials.grossTotal)} />
                    <SummaryLine label="Descontos itens" value={formatCurrencyBR(financials.discountTotal)} />
                    <SummaryLine label="Total produtos" value={formatCurrencyBR(productsTotalAmount)} />
                    <SummaryLine label="Custo produtos" value={formatCurrencyBR(productsCostAmount)} />
                    <SummaryLine label="Total servicos" value={formatCurrencyBR(serviceTotalAmount)} />
                    <SummaryLine label="Custo servicos" value={formatCurrencyBR(serviceCostAmount)} />
                    <SummaryLine label="Desconto do orcamento" value={formatCurrencyBR(budgetDiscount)} />
                    <SummaryLine label="Valor total orcamento" value={formatCurrencyBR(budgetTotalAmount)} strong />
                    <SummaryLine label="Custo total orcamento" value={formatCurrencyBR(budgetTotalCostAmount)} />
                    <SummaryLine label="Margem (R$)" value={formatCurrencyBR(budgetProfitAmount)} />
                    <SummaryLine label="Margem (%)" value={`${budgetProfitPercent.toFixed(1)}%`} strong />
                  </aside>
                </div>
              </TabsContent>

              <TabsContent value="full">
                <div className="grid gap-4 xl:grid-cols-2">
                  <article className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Dados gerais</h3>
                    <DetailLine label="Codigo" value={budget.code} />
                    <DetailLine label="Titulo" value={budget.title} />
                    <DetailLine label="Status" value={budgetStatusLabel(budget.status)} />
                    <DetailLine label="Prioridade" value={budgetPriorityLabel(budget.priority)} />
                    <DetailLine label="Responsavel" value={budget.owner} />
                    <DetailLine label="Criado em" value={formatBudgetDateLong(budget.createdAt)} />
                    <DetailLine label="Atualizado em" value={formatBudgetDateLong(budget.updatedAt)} />
                    <DetailLine label="Validade" value={formatBudgetDateLong(budget.validUntil)} />
                    <DetailLine label="Aprovacao" value={formatOptionalDate(budget.approvalDate, "Nao informada")} />
                    <DetailLine label="Fechamento previsto" value={formatBudgetDateLong(budget.expectedCloseDate)} />
                    <DetailLine label="Pagamento" value={toText(budget.paymentTerms)} />
                    <DetailLine label="Entrega" value={toText(budget.deliveryTerm)} />
                  </article>

                  <article className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Cliente</h3>
                    <DetailLine label="Nome" value={toText(budget.client.name)} />
                    <DetailLine label="Segmento" value={toText(budget.client.segment)} />
                    <DetailLine label="Documento" value={toText(budget.client.document)} />
                    <DetailLine label="Cidade" value={toText(budget.client.city)} />
                    <DetailLine label="UF" value={toText(budget.client.state)} />
                    <DetailLine label="Contato" value={toText(budget.client.contactName)} />
                    <DetailLine label="Cargo" value={toText(budget.client.contactRole)} />
                    <DetailLine label="Email" value={toText(budget.client.email)} />
                    <DetailLine label="Telefone" value={toText(budget.client.phone)} />
                  </article>

                  <article className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Servico</h3>
                    <DetailLine label="Codigo" value={toText(budget.serviceCode)} mono />
                    <DetailLine label="Nome" value={toText(budget.serviceName)} />
                    <DetailLine label="Categoria" value={toText(budget.serviceCategory)} />
                    <DetailLine label="Modelo de cobranca" value={toText(budget.serviceBillingModel)} />
                    <DetailLine label="Duracao estimada" value={toText(budget.serviceEstimatedDuration)} />
                    <DetailLine label="Responsavel" value={toText(budget.serviceResponsible)} />
                    <DetailLine label="Status" value={toText(budget.serviceStatus)} />
                    <DetailLine label="Descricao" value={toText(budget.serviceDescription)} multiline />
                  </article>

                  <article className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Financeiro</h3>
                    <DetailLine label="Total produtos" value={formatCurrencyBR(productsTotalAmount)} />
                    <DetailLine label="Custo produtos" value={formatCurrencyBR(productsCostAmount)} />
                    <DetailLine label="Total servicos" value={formatCurrencyBR(serviceTotalAmount)} />
                    <DetailLine label="Custo servicos" value={formatCurrencyBR(serviceCostAmount)} />
                    <DetailLine label="Desconto" value={formatCurrencyBR(budgetDiscount)} />
                    <DetailLine label="Custo total" value={formatCurrencyBR(budgetTotalCostAmount)} />
                    <DetailLine label="Valor total" value={formatCurrencyBR(budgetTotalAmount)} strong />
                    <DetailLine label="Lucro (R$)" value={formatCurrencyBR(budgetProfitAmount)} />
                    <DetailLine label="Lucro (%)" value={`${budgetProfitPercent.toFixed(2)}%`} strong />
                  </article>

                  <article className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Escopo e condicoes</h3>
                    <DetailLine label="Resumo do escopo" value={toText(budget.scopeSummary)} multiline />
                    <DetailLine label="Resumo de SLA" value={toText(budget.slaSummary)} multiline />
                    <DetailLine label="Data de aprovacao" value={formatOptionalDate(budget.approvalDate, "Nao informada")} />
                    <DetailLine label="Validade" value={formatBudgetDateLong(budget.validUntil)} />
                    <DetailLine label="Fechamento previsto" value={formatBudgetDateLong(budget.expectedCloseDate)} />
                  </article>

                  <article className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4 xl:col-span-2">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Itens detalhados ({budget.items.length})
                    </h3>

                    {budget.items.length === 0 ? (
                      <div className="rounded-xl border border-border/70 bg-background/65 px-3 py-2 text-sm text-muted-foreground">
                        Nenhum item cadastrado para este orcamento.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {budget.items.map((item, index) => {
                          const grossTotal = item.quantity * item.unitPrice
                          const netTotal = getBudgetItemNetTotal(item)
                          const costTotal = item.quantity * item.internalCost
                          const marginPercent = getBudgetItemMarginPercent(item)

                          return (
                            <div key={item.id} className="rounded-xl border border-border/70 bg-background/60 p-3">
                              <p className="text-sm font-semibold text-foreground">Item {index + 1}</p>
                              <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                                <DetailLine label="Codigo do item" value={toText(item.code)} mono />
                                <DetailLine label="Descricao" value={toText(item.description)} />
                                <DetailLine label="Categoria" value={toText(item.category)} />
                                <DetailLine label="Quantidade" value={String(item.quantity)} />
                                <DetailLine label="Horas estimadas" value={String(item.estimatedHours)} />
                                <DetailLine label="Janela de entrega" value={toText(item.deliveryWindow)} />
                                <DetailLine label="Preco unitario" value={formatCurrencyBR(item.unitPrice)} />
                                <DetailLine label="Desconto item" value={formatCurrencyBR(item.discount)} />
                                <DetailLine label="Subtotal bruto" value={formatCurrencyBR(grossTotal)} />
                                <DetailLine label="Subtotal liquido" value={formatCurrencyBR(netTotal)} strong />
                                <DetailLine label="Custo unitario" value={formatCurrencyBR(item.internalCost)} />
                                <DetailLine label="Custo total" value={formatCurrencyBR(costTotal)} />
                                <DetailLine label="Margem (%)" value={`${marginPercent.toFixed(2)}%`} strong />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </article>

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

function DetailLine({
  label,
  value,
  strong = false,
  mono = false,
  multiline = false,
}: {
  label: string
  value: string
  strong?: boolean
  mono?: boolean
  multiline?: boolean
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/65 px-3 py-2 text-sm">
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={`mt-1 ${strong ? "font-semibold" : ""} ${mono ? "font-mono text-xs" : ""} ${multiline ? "whitespace-pre-wrap" : ""}`}>
        {value}
      </p>
    </div>
  )
}

function toMoney(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const compact = value.replace(/[^\d,.-]/g, "")
    const normalized = compact.includes(",") ? compact.replace(/\./g, "").replace(",", ".") : compact
    const parsed = Number.parseFloat(normalized)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function toText(value: string | null | undefined, fallback = "Nao informado") {
  if (typeof value !== "string") return fallback
  const normalized = value.trim()
  return normalized || fallback
}

function formatOptionalDate(value: string | undefined, fallback = "Nao informado") {
  if (!value?.trim()) return fallback
  return formatBudgetDateLong(value)
}
