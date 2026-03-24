"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, CircleAlert, Percent, UserRound, Wallet, Wrench } from "lucide-react"

import {
  calculateServiceOrderFinancials,
  calculateServiceOrderProgress,
  daysUntilServiceOrderDeadline,
  formatServiceOrderDate,
  formatServiceOrderDateLong,
  formatServiceOrderDateTime,
  serviceOrderMockData,
  serviceOrderPriorityLabel,
  serviceOrderPriorityTone,
  serviceOrderStatusLabel,
  serviceOrderStatusTone,
} from "@/components/services/serviceOrder/service-order-mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrencyBR } from "@/utils/Formatter"

type ServiceOrderDetailsWorkspaceProps = {
  ordersHref: string
}

function laborStatusLabel(status: "pending" | "done") {
  return status === "done" ? "Concluida" : "Pendente"
}

function partStatusLabel(status: "planned" | "reserved" | "used") {
  if (status === "reserved") return "Reservada"
  if (status === "used") return "Utilizada"
  return "Planejada"
}

export function ServiceOrderDetailsWorkspace({ ordersHref }: ServiceOrderDetailsWorkspaceProps) {
  const searchParams = useSearchParams()
  const serviceOrderId = searchParams.get("serviceOrderId")?.trim() ?? ""
  const selectedOrder = serviceOrderId ? serviceOrderMockData.find((item) => item.id === serviceOrderId) ?? null : null
  const loadError = serviceOrderId
    ? selectedOrder
      ? null
      : "Ordem de servico nao encontrada para o identificador informado."
    : "Ordem de servico nao informada."

  if (!selectedOrder) {
    return (
      <div className="space-y-6 pb-6">
        <article className="rounded-2xl border border-amber-300/60 bg-amber-100/70 p-4 text-amber-900">
          <p className="inline-flex items-center gap-2 text-sm font-semibold">
            <CircleAlert className="h-4 w-4" />
            {loadError || "Ordem de servico nao encontrada."}
          </p>
        </article>

        <Button asChild variant="outline">
          <Link href={ordersHref}>
            <ArrowLeft className="h-4 w-4" />
            Voltar para ordens de servico
          </Link>
        </Button>
      </div>
    )
  }

  const financials = calculateServiceOrderFinancials(selectedOrder)
  const progress = calculateServiceOrderProgress(selectedOrder)
  const remainingDays = daysUntilServiceOrderDeadline(selectedOrder.deadlineDate)

  return (
    <div className="space-y-6 pb-6">
      <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/20 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Button asChild variant="ghost" size="sm" className="h-8 px-2">
              <Link href={ordersHref}>
                <ArrowLeft className="h-4 w-4" />
                Voltar para ordens de servico
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={serviceOrderStatusTone(selectedOrder.status)}>
                {serviceOrderStatusLabel(selectedOrder.status)}
              </Badge>
              <Badge variant="outline" className={serviceOrderPriorityTone(selectedOrder.priority)}>
                Prioridade {serviceOrderPriorityLabel(selectedOrder.priority)}
              </Badge>
              <Badge variant="outline">{selectedOrder.code}</Badge>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">{selectedOrder.title}</h1>
            <p className="text-sm text-muted-foreground">
              Cliente {selectedOrder.client.name} - Tecnico {selectedOrder.technician} - Prazo em{" "}
              {formatServiceOrderDateLong(selectedOrder.deadlineDate)}
            </p>
          </div>

          <div className="grid min-w-[260px] gap-2 text-sm">
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Valor previsto</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrencyBR(selectedOrder.estimatedValue)}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Progresso</p>
              <p className="mt-1 text-lg font-semibold">{progress}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <QuickCard icon={Wallet} label="Valor previsto" value={formatCurrencyBR(selectedOrder.estimatedValue)} />
        <QuickCard icon={Percent} label="Margem" value={`${financials.marginPercent.toFixed(1)}%`} />
        <QuickCard
          icon={Wrench}
          label="Prazo"
          value={remainingDays >= 0 ? `${remainingDays} dia(s) restantes` : `${Math.abs(remainingDays)} dia(s) de atraso`}
        />
        <QuickCard icon={UserRound} label="Tecnico" value={selectedOrder.technician} />
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Resumo operacional</h2>

        <div className="grid gap-3 md:grid-cols-2">
          <InfoLine label="Cliente" value={selectedOrder.client.name} />
          <InfoLine label="Documento" value={selectedOrder.client.document} />
          <InfoLine label="Contato" value={selectedOrder.client.contactName} />
          <InfoLine label="Telefone" value={selectedOrder.client.phone} />
          <InfoLine label="E-mail" value={selectedOrder.client.email} />
          <InfoLine label="Endereco" value={selectedOrder.executionAddress} />
          <InfoLine label="Servico" value={selectedOrder.serviceName} />
          <InfoLine label="Coordenador" value={selectedOrder.coordinator} />
          <InfoLine label="Agendamento" value={formatServiceOrderDateTime(selectedOrder.scheduledAt)} />
          <InfoLine label="Atualizada em" value={formatServiceOrderDate(selectedOrder.updatedAt)} />
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <p className="font-semibold">Escopo tecnico</p>
          <p className="text-muted-foreground">{selectedOrder.description}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-border/70 bg-background/65 p-3 text-sm">
            <p className="font-semibold">Checklist</p>
            {selectedOrder.checklist.length === 0 ? (
              <p className="text-muted-foreground">Sem itens no checklist.</p>
            ) : (
              selectedOrder.checklist.map((item, index) => (
                <p key={`${selectedOrder.id}-check-${index}`} className="text-muted-foreground">
                  - {item}
                </p>
              ))
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-border/70 bg-background/65 p-3 text-sm">
            <p className="font-semibold">Observacoes</p>
            {selectedOrder.notes.length === 0 ? (
              <p className="text-muted-foreground">Sem observacoes registradas.</p>
            ) : (
              selectedOrder.notes.map((item, index) => (
                <p key={`${selectedOrder.id}-note-${index}`} className="text-muted-foreground">
                  - {item}
                </p>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-sm">
        <div className="border-b border-border/70 px-5 py-4">
          <h2 className="text-lg font-semibold">Horas tecnicas</h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/35 hover:bg-muted/35">
              <TableHead className="pl-6">Atividade</TableHead>
              <TableHead>Tecnico</TableHead>
              <TableHead>Horas est.</TableHead>
              <TableHead>Horas exec.</TableHead>
              <TableHead>Custo hora</TableHead>
              <TableHead>Custo total</TableHead>
              <TableHead className="pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {selectedOrder.laborItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="pl-6 font-medium">{item.description}</TableCell>
                <TableCell>{item.technician}</TableCell>
                <TableCell>{item.estimatedHours}</TableCell>
                <TableCell>{item.workedHours}</TableCell>
                <TableCell>{formatCurrencyBR(item.hourlyCost)}</TableCell>
                <TableCell className="font-medium">{formatCurrencyBR(item.workedHours * item.hourlyCost)}</TableCell>
                <TableCell className="pr-6">
                  <Badge
                    variant="outline"
                    className={
                      item.status === "done"
                        ? "border-emerald-300/70 bg-emerald-100/80 text-emerald-700"
                        : "border-amber-300/70 bg-amber-100/80 text-amber-700"
                    }
                  >
                    {laborStatusLabel(item.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-sm">
        <div className="border-b border-border/70 px-5 py-4">
          <h2 className="text-lg font-semibold">Pecas e insumos</h2>
        </div>

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
            {selectedOrder.partItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                  Esta ordem nao possui pecas vinculadas.
                </TableCell>
              </TableRow>
            ) : (
              selectedOrder.partItems.map((item) => (
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
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Timeline da ordem</h2>

        <div className="space-y-3">
          {selectedOrder.timeline.map((event) => (
            <article key={event.id} className="rounded-xl border border-border/70 bg-background/70 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{event.event}</p>
                <p className="text-xs text-muted-foreground">{formatServiceOrderDateTime(event.at)}</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Autor: {event.author}</p>
              <p className="mt-2 text-sm text-muted-foreground">{event.notes}</p>
            </article>
          ))}
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
