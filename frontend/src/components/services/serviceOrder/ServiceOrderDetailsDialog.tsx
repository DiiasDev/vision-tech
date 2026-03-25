"use client"

import Link from "next/link"
import { CalendarClock, Percent, UserRound, Wallet, Wrench } from "lucide-react"

import {
  type ServiceOrder,
  calculateServiceOrderFinancials,
  calculateServiceOrderProgress,
  daysUntilServiceOrderDeadline,
  formatServiceOrderDate,
  formatServiceOrderDateLong,
  formatServiceOrderDateTime,
  serviceOrderPriorityLabel,
  serviceOrderPriorityTone,
  serviceOrderStatusLabel,
  serviceOrderStatusTone,
} from "@/components/services/serviceOrder/service-order-mock-data"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrencyBR } from "@/utils/Formatter"

type ServiceOrderDetailsDialogProps = {
  order: ServiceOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
  detailsBasePath: string
  onToggleServiceChecklistItem: (orderId: string, serviceItemId: string, checked: boolean) => void
}

function partStatusLabel(status: "planned" | "reserved" | "used") {
  if (status === "reserved") return "Reservada"
  if (status === "used") return "Utilizada"
  return "Planejada"
}

function checklistStatusLabel(status: "pending" | "done") {
  return status === "done" ? "Concluido" : "Pendente"
}

function serviceCatalogStatusLabel(status: string) {
  const normalized = status.trim().toLowerCase()
  if (normalized === "active") return "Ativo"
  if (normalized === "inactive") return "Inativo"
  if (normalized === "draft") return "Rascunho"
  return status
}

function billingModelLabel(value: string) {
  const normalized = value.trim().toLowerCase()
  if (normalized === "project") return "Projeto"
  if (normalized === "recurring") return "Recorrente"
  if (normalized === "hourly") return "Hora tecnica"
  return value
}

function normalizeServiceType(value: string) {
  const normalized = value.replace(/[_-]/g, " ").trim()
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export function ServiceOrderDetailsDialog({
  order,
  open,
  onOpenChange,
  detailsBasePath,
  onToggleServiceChecklistItem,
}: ServiceOrderDetailsDialogProps) {
  if (!order) return null

  const financials = calculateServiceOrderFinancials(order)
  const progress = calculateServiceOrderProgress(order)
  const remainingDays = daysUntilServiceOrderDeadline(order.deadlineDate)
  const serviceItems = order.serviceItems ?? []
  const completedServiceItems = serviceItems.filter((item) => item.checkStatus === "done").length
  const budgetQuery = order.sourceBudgetCode
    ? [
        order.sourceBudgetId ? `budgetId=${encodeURIComponent(order.sourceBudgetId)}` : null,
        `budgetCode=${encodeURIComponent(order.sourceBudgetCode)}`,
      ]
        .filter((item): item is string => Boolean(item))
        .join("&")
    : ""
  const sourceBudgetHref = budgetQuery ? `/budget/id?${budgetQuery}` : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(calc(100%-1rem),80rem)] max-w-none border-0 bg-transparent p-0 shadow-none">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />

          <div className="modal-scrollbar relative max-h-[82vh] overflow-y-auto p-6 pr-4 md:p-7 md:pr-5">
            <DialogHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                  Visao detalhada da OS
                </Badge>
                <Badge variant="outline" className={serviceOrderStatusTone(order.status)}>
                  {serviceOrderStatusLabel(order.status)}
                </Badge>
                <Badge variant="outline" className={serviceOrderPriorityTone(order.priority)}>
                  Prioridade {serviceOrderPriorityLabel(order.priority)}
                </Badge>
              </div>

              <DialogTitle className="break-words text-3xl font-semibold tracking-tight">
                {order.code} - {order.title}
              </DialogTitle>

              <DialogDescription className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
                Cliente {order.client.name} ({order.client.segment}) - Tecnico {order.technician}. Prazo em{" "}
                {formatServiceOrderDateLong(order.deadlineDate)}.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <SummaryCard icon={Wallet} label="Valor previsto" value={formatCurrencyBR(order.estimatedValue)} />
              <SummaryCard icon={Percent} label="Margem prevista" value={`${financials.marginPercent.toFixed(1)}%`} />
              <SummaryCard icon={CalendarClock} label="Progresso" value={`${progress}%`} />
              <SummaryCard
                icon={Wrench}
                label="Prazo"
                value={remainingDays >= 0 ? `${remainingDays} dia(s)` : `${Math.abs(remainingDays)} em atraso`}
              />
              <SummaryCard icon={UserRound} label="Tecnico" value={order.technician} />
            </div>

            <Tabs defaultValue="overview" className="mt-6 gap-4">
              <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl border border-border/70 bg-card/70 p-2">
                <TabsTrigger value="overview">Resumo</TabsTrigger>
                <TabsTrigger value="costs">Custos</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <article className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoLine label="Cliente" value={order.client.name} />
                    <InfoLine label="Documento" value={order.client.document} />
                    <InfoLine label="Contato" value={order.client.contactName} />
                    <InfoLine label="Telefone" value={order.client.phone} />
                    <InfoLine label="Servico" value={order.serviceName} />
                    <InfoLine label="Coordenador" value={order.coordinator} />
                    <InfoLine
                      label="Orcamento origem"
                      value={
                        sourceBudgetHref && order.sourceBudgetCode ? (
                          <Link
                            href={sourceBudgetHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline-offset-2 hover:underline"
                            onClick={(event) => {
                              event.preventDefault()
                              window.open(sourceBudgetHref, "_blank", "noopener,noreferrer")
                            }}
                          >
                            {order.sourceBudgetCode}
                          </Link>
                        ) : (
                          order.sourceBudgetCode || "-"
                        )
                      }
                    />
                    <InfoLine label="Agendamento" value={formatServiceOrderDateTime(order.scheduledAt)} />
                    <InfoLine label="Atualizada em" value={formatServiceOrderDate(order.updatedAt)} />
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">Escopo tecnico</p>
                    <p className="text-muted-foreground">{order.description}</p>
                  </div>

                  <div className="space-y-2 rounded-xl border border-border/70 bg-background/65 p-3 text-sm">
                    <p className="font-semibold">Observacoes</p>
                    {order.notes.length === 0 ? (
                      <p className="text-muted-foreground">Sem observacoes registradas.</p>
                    ) : (
                      order.notes.map((item, index) => (
                        <p key={`${order.id}-note-${index}`} className="text-muted-foreground">
                          - {item}
                        </p>
                      ))
                    )}
                  </div>
                </article>
              </TabsContent>

              <TabsContent value="costs" className="space-y-4">
                <article className="overflow-hidden rounded-2xl border border-border/70 bg-card/70">
                  <div className="space-y-3 border-b border-border/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Checklist de servicos
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {completedServiceItems}/{serviceItems.length} concluido(s)
                      </p>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/35 hover:bg-muted/35">
                        <TableHead className="pl-6">Realizado</TableHead>
                        <TableHead>Codigo</TableHead>
                        <TableHead>Servico</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Cobranca</TableHead>
                        <TableHead>Duracao</TableHead>
                        <TableHead>Complexidade</TableHead>
                        <TableHead>Responsavel</TableHead>
                        <TableHead>Status catalogo</TableHead>
                        <TableHead className="pr-6">Status</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {serviceItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="px-6 py-8 text-center text-sm text-muted-foreground">
                            Nenhum servico vinculado a esta ordem.
                          </TableCell>
                        </TableRow>
                      ) : (
                        serviceItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="pl-6">
                              <Checkbox
                                checked={item.checkStatus === "done"}
                                onCheckedChange={(checked) =>
                                  onToggleServiceChecklistItem(order.id, item.id, Boolean(checked))
                                }
                                aria-label={`Marcar servico ${item.name} como realizado`}
                                className="size-5 border-2 border-primary/45 bg-background shadow-sm data-[state=checked]:border-primary"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{item.code}</TableCell>
                            <TableCell>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.category}</p>
                            </TableCell>
                            <TableCell>{normalizeServiceType(item.serviceType)}</TableCell>
                            <TableCell>
                              {billingModelLabel(item.billingModel)} / {item.billingUnit}
                            </TableCell>
                            <TableCell>{item.estimatedDuration}</TableCell>
                            <TableCell className="capitalize">{item.complexityLevel}</TableCell>
                            <TableCell>{item.responsible}</TableCell>
                            <TableCell>{serviceCatalogStatusLabel(item.catalogStatus)}</TableCell>
                            <TableCell className="pr-6">
                              <Badge
                                variant="outline"
                                className={
                                  item.checkStatus === "done"
                                    ? "border-emerald-300/70 bg-emerald-100/80 text-emerald-700"
                                    : "border-amber-300/70 bg-amber-100/80 text-amber-700"
                                }
                              >
                                {checklistStatusLabel(item.checkStatus)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </article>

                <article className="overflow-hidden rounded-2xl border border-border/70 bg-card/70">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/35 hover:bg-muted/35">
                        <TableHead className="pl-6">SKU</TableHead>
                        <TableHead>Descricao</TableHead>
                        <TableHead>Qtd.</TableHead>
                        <TableHead>Custo unit.</TableHead>
                        <TableHead>Custo total</TableHead>
                        <TableHead className="pr-6">Status</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {order.partItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                            Esta ordem nao possui pecas vinculadas.
                          </TableCell>
                        </TableRow>
                      ) : (
                        order.partItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="pl-6 font-medium">{item.sku}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrencyBR(item.unitCost)}</TableCell>
                            <TableCell className="font-medium">{formatCurrencyBR(item.quantity * item.unitCost)}</TableCell>
                            <TableCell className="pr-6">
                              <Badge variant="outline">{partStatusLabel(item.status)}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  <div className="grid gap-2 border-t border-border/70 bg-card/90 p-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
                    <InfoLine label="Receita estimada" value={formatCurrencyBR(financials.estimatedRevenue)} />
                    <InfoLine label="Custo mao de obra" value={formatCurrencyBR(financials.laborCost)} />
                    <InfoLine label="Custo pecas" value={formatCurrencyBR(financials.partsCost)} />
                    <InfoLine label="Custo total" value={formatCurrencyBR(financials.totalCost)} />
                    <InfoLine label="Margem (R$)" value={formatCurrencyBR(financials.marginValue)} strong />
                    <InfoLine label="Margem (%)" value={`${financials.marginPercent.toFixed(1)}%`} strong />
                  </div>
                </article>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-3">
                {order.timeline.map((event) => (
                  <article key={event.id} className="rounded-xl border border-border/70 bg-background/70 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{event.event}</p>
                      <p className="text-xs text-muted-foreground">{formatServiceOrderDateTime(event.at)}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Autor: {event.author}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{event.notes}</p>
                  </article>
                ))}
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button asChild variant="outline" className="rounded-xl">
                <Link href={`${detailsBasePath}?serviceOrderId=${order.id}`}>Abrir pagina completa</Link>
              </Button>

              <DialogClose asChild>
                <Button variant="secondary" className="rounded-xl">
                  Fechar
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
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
  value: React.ReactNode
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/65 px-3 py-2">
      <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <span className={strong ? "text-sm font-semibold" : "text-sm"}>{value}</span>
    </div>
  )
}
