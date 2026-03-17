"use client"

import { type ComponentType } from "react"
import Link from "next/link"
import { Building2, CalendarClock, Clock3, Hash, Mail, MapPin, Phone, ShieldAlert, UserRound, Wallet } from "lucide-react"

import { type Supplier } from "@/components/products/Supplier/supplier-models"
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

type SupplierDetailsDialogProps = {
  supplier: Supplier | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function normalizeValue(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR")
}

function buildRiskStyle(risk: string) {
  const normalizedRisk = normalizeValue(risk)
  if (normalizedRisk === "alto") return "border-red-300/60 bg-red-100/65 text-red-700"
  if (normalizedRisk === "medio") return "border-amber-300/60 bg-amber-100/65 text-amber-700"
  return "border-emerald-300/60 bg-emerald-100/65 text-emerald-700"
}

function buildStatusStyle(status: string) {
  const normalizedStatus = normalizeValue(status)
  if (normalizedStatus === "ativo") return "border-sky-300/60 bg-sky-100/65 text-sky-700"
  if (normalizedStatus === "avaliacao") return "border-violet-300/60 bg-violet-100/65 text-violet-700"
  return "border-slate-300/60 bg-slate-200/75 text-slate-700"
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

export function SupplierDetailsDialog({ supplier, open, onOpenChange }: SupplierDetailsDialogProps) {
  if (!supplier) return null

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
                  Visão completa do fornecedor
                </Badge>
                <Badge variant="outline" className={buildStatusStyle(supplier.status)}>
                  {supplier.status}
                </Badge>
                <Badge variant="outline" className={buildRiskStyle(supplier.risk)}>
                  Risco {supplier.risk}
                </Badge>
              </div>

              <DialogTitle className="break-words text-3xl font-semibold tracking-tight">{supplier.name}</DialogTitle>
              <DialogDescription className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {supplier.fantasyName} - Segmento {supplier.segment}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailCard title="Código" value={supplier.code} icon={Hash} />
              <DetailCard title="Segmento" value={supplier.segment} icon={Building2} />
              <DetailCard title="Categoria" value={supplier.categories || "-"} icon={Building2} />
              <DetailCard title="Lead time" value={supplier.lead || "-"} icon={Clock3} />
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailCard title="Cidade / UF" value={`${supplier.city} - ${supplier.state}`} icon={MapPin} />
              <DetailCard title="Localização" value={supplier.location || "-"} icon={MapPin} />
              <DetailCard title="Contato" value={supplier.contact || "-"} icon={UserRound} />
              <DetailCard title="Telefone" value={supplier.phone || "-"} icon={Phone} />
            </div>

            <Separator />

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailCard title="Email" value={supplier.email || "-"} icon={Mail} />
              <DetailCard title="Pedido mínimo" value={supplier.minRequest || "-"} icon={Wallet} />
              <DetailCard title="Última entrega" value={supplier.lastDelivery || "-"} icon={CalendarClock} />
              <DetailCard title="Risco operacional" value={supplier.risk} icon={ShieldAlert} />
            </div>
          </div>

          <DialogFooter className="border-t border-border/70 bg-card/95 px-6 py-4 backdrop-blur-sm md:px-7">
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
            <Button asChild>
              <Link href={`/dashboard/produtos/fornecedores/id?supplierId=${supplier.id}`}>Editar fornecedor</Link>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
