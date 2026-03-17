"use client"

import { type ComponentType } from "react"
import Link from "next/link"
import { CalendarClock, Clock3, Hash, Layers3, ShieldCheck, UserRound, Wallet, Wrench } from "lucide-react"

import type { ServiceBillingModel, ServiceCatalogItem, ServiceCatalogStatus } from "@/components/services/catalog/catalog-types"
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
import { formatCurrencyBR } from "@/utils/Formatter"

type ServiceCatalogDetailsDialogProps = {
  service: ServiceCatalogItem | null
  detailsBasePath: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function billingModelLabel(model: ServiceBillingModel) {
  if (model === "project") return "Projeto"
  if (model === "recurring") return "Recorrente"
  return "Hora técnica"
}

function statusLabel(status: ServiceCatalogStatus) {
  if (status === "active") return "Ativo"
  if (status === "inactive") return "Inativo"
  return "Rascunho"
}

function statusClassName(status: ServiceCatalogStatus) {
  if (status === "active") return "border-emerald-300/60 bg-emerald-100/65 text-emerald-700"
  if (status === "inactive") return "border-zinc-300/60 bg-zinc-100/75 text-zinc-700"
  return "border-amber-300/60 bg-amber-100/65 text-amber-700"
}

function formatUpdatedAt(value: string) {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return "Sem registro"
  return parsedDate.toLocaleDateString("pt-BR")
}

function DetailCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border/70 bg-background/70 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{title}</span>
      </div>
      <p className="mt-2 whitespace-normal break-all text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

export function ServiceCatalogDetailsDialog({
  service,
  detailsBasePath,
  open,
  onOpenChange,
}: ServiceCatalogDetailsDialogProps) {
  if (!service) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(calc(100%-1rem),70rem)] max-w-none border-0 bg-transparent p-0 shadow-none">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-8 h-52 w-52 rounded-full bg-accent/35 blur-3xl" />

          <div className="relative space-y-6 p-6 md:p-7">
            <DialogHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-primary/30 bg-primary/8 text-primary">
                  Visão completa do serviço
                </Badge>
                <Badge variant="outline" className={statusClassName(service.status)}>
                  {statusLabel(service.status)}
                </Badge>
              </div>

              <DialogTitle className="break-words text-3xl font-semibold tracking-tight">{service.name}</DialogTitle>
              <DialogDescription className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {service.description || "Serviço sem descrição cadastrada."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailCard title="Código" value={service.code} icon={Hash} />
              <DetailCard title="Categoria" value={service.category} icon={Layers3} />
              <DetailCard title="Modelo" value={billingModelLabel(service.billingModel)} icon={ShieldCheck} />
              <DetailCard title="Responsável" value={service.responsible || "-"} icon={UserRound} />
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailCard title="Preço base" value={formatCurrencyBR(service.basePrice)} icon={Wallet} />
              <DetailCard title="SLA" value={`Até ${service.slaHours}h`} icon={Clock3} />
              <DetailCard title="Execução média" value={`${service.avgExecutionHours}h`} icon={Clock3} />
              <DetailCard title="Contratos ativos" value={String(service.activeContracts)} icon={Wrench} />
            </div>

            <Separator />

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailCard title="Atualizado em" value={formatUpdatedAt(service.updatedAt)} icon={CalendarClock} />
            </div>
          </div>

          <DialogFooter className="border-t border-border/70 bg-card/95 px-6 py-4 backdrop-blur-sm md:px-7">
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
            <Button asChild>
              <Link href={`${detailsBasePath}?serviceId=${service.id}`}>Editar serviço</Link>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
