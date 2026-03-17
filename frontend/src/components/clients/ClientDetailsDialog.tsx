"use client"

import { type ComponentType } from "react"
import Link from "next/link"
import { Building2, CalendarClock, FileBadge2, Mail, MapPin, Phone, UserRound } from "lucide-react"

import { type ClientsListItem } from "@/services/clients.service"
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
import { formatCpfCnpj, formatPhoneBR } from "@/utils/Formatter"

type ClientDetailsDialogProps = {
  client: ClientsListItem | null
  detailsHref: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function statusLabel(status: ClientsListItem["status"]) {
  if (status === "ACTIVE") return "Ativo"
  if (status === "DELINQUENT") return "Inadimplente"
  return "Inativo"
}

function statusClassName(status: ClientsListItem["status"]) {
  if (status === "ACTIVE") return "border-emerald-300/60 bg-emerald-100/65 text-emerald-700"
  if (status === "DELINQUENT") return "border-rose-300/60 bg-rose-100/65 text-rose-700"
  return "border-zinc-300/60 bg-zinc-100/75 text-zinc-700"
}

function typeLabel(type: ClientsListItem["type"]) {
  return type === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"
}

function formatDate(value?: string | null) {
  if (!value?.trim()) return "Sem registro"

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    return `${day}/${month}/${year}`
  }

  const dateTimeMatch = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value)
  if (dateTimeMatch) {
    const [, year, month, day, hour, minute] = dateTimeMatch
    return `${day}/${month}/${year} ${hour}:${minute}`
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return "Sem registro"

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate)
}

function formatLocation(city?: string | null, state?: string | null) {
  if (city && state) return `${city}, ${state}`
  if (city) return city
  if (state) return state
  return "Não informado"
}

function formatAddress(client: ClientsListItem) {
  const parts = [client.street, client.number, client.neighborhood].filter((part) => Boolean(part?.trim()))
  if (parts.length === 0) return "Não informado"
  return parts.join(", ")
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

export function ClientDetailsDialog({ client, detailsHref, open, onOpenChange }: ClientDetailsDialogProps) {
  if (!client) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(calc(100%-1rem),68rem)] max-w-none border-0 bg-transparent p-0 shadow-none">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card">
          <div className="pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-6 h-44 w-44 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative space-y-5 p-6 md:p-7">
            <DialogHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-primary/30 bg-primary/8 text-primary">
                  Visão completa do cliente
                </Badge>
                <Badge variant="outline" className={statusClassName(client.status)}>
                  {statusLabel(client.status)}
                </Badge>
                <Badge variant="outline">{typeLabel(client.type)}</Badge>
              </div>

              <DialogTitle className="break-words text-3xl font-semibold tracking-tight">{client.name}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Código {client.code} • documento {formatCpfCnpj(client.document)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailCard title="Responsável" value={client.responsibleName?.trim() || "Não informado"} icon={UserRound} />
              <DetailCard title="Email" value={client.email?.trim() || "Não informado"} icon={Mail} />
              <DetailCard
                title="Telefone"
                value={client.telephone?.trim() ? formatPhoneBR(client.telephone) : "Não informado"}
                icon={Phone}
              />
              <DetailCard title="Cidade / UF" value={formatLocation(client.city, client.state)} icon={MapPin} />
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailCard title="Endereço" value={formatAddress(client)} icon={Building2} />
              <DetailCard title="CEP" value={client.zipCode?.trim() || "Não informado"} icon={FileBadge2} />
              <DetailCard title="Último contato" value={formatDate(client.lastContact)} icon={CalendarClock} />
              <DetailCard title="Atualizado em" value={formatDate(client.updatedAt)} icon={CalendarClock} />
            </div>

            <Separator />

            <div className="grid gap-3 md:grid-cols-2">
              <DetailCard title="Criado em" value={formatDate(client.createdAt)} icon={CalendarClock} />
              <DetailCard title="ID interno" value={client.id} icon={FileBadge2} />
            </div>
          </div>

          <DialogFooter className="border-t border-border/70 bg-card/95 px-6 py-4 backdrop-blur-sm md:px-7">
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
            <Button asChild>
              <Link href={detailsHref}>Abrir cadastro</Link>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
