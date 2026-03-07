"use client"

import { useEffect } from "react"
import { Clock3, HardDrive, MapPin, ShieldCheck, Wrench, X } from "lucide-react"

import {
  agendaPriorityMeta,
  agendaQueueMeta,
  agendaStatusMeta,
} from "@/components/services/agenda/agenda-mock-data"
import type { AgendaService, AgendaTechnician } from "@/components/services/agenda/agenda-types"
import { formatDuration } from "@/components/services/agenda/agenda-utils"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AgendaDayServicesModalProps = {
  open: boolean
  onClose: () => void
  selectedDateLabel: string
  services: AgendaService[]
  techniciansById: Map<string, AgendaTechnician>
}

export function AgendaDayServicesModal({
  open,
  onClose,
  selectedDateLabel,
  services,
  techniciansById,
}: AgendaDayServicesModalProps) {
  useEffect(() => {
    if (!open) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [open, onClose])

  if (!open) return null

  const completedCount = services.filter((service) => service.status === "concluido").length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Servicos do dia"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4 md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Servicos do dia</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{selectedDateLabel}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {services.length} ordens planejadas - {completedCount} concluidas
            </p>
          </div>

          <Button type="button" size="icon-sm" variant="outline" onClick={onClose} aria-label="Fechar modal">
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="max-h-[calc(88vh-118px)] overflow-y-auto p-4 md:p-6">
          {services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground">
              Sem visitas para este dia no filtro atual. Escolha outro dia no calendario ou ajuste os filtros.
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
              {services.map((service) => {
                const technician = techniciansById.get(service.technicianId)
                const status = agendaStatusMeta[service.status]
                const priority = agendaPriorityMeta[service.priority]
                const queue = agendaQueueMeta[service.queue]
                const accentColor = technician?.accent ?? "#64748b"

                return (
                  <article
                    key={service.id}
                    className="rounded-xl border border-border/70 bg-background/70 p-3"
                    style={{ borderLeftColor: accentColor, borderLeftWidth: "3px" }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{service.title}</p>
                      <span className="rounded-full border border-border/70 bg-muted/20 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {service.startTime} - {service.endTime}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/90 px-2 py-0.5">
                        <span
                          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-slate-950"
                          style={{ backgroundColor: accentColor }}
                        >
                          {technician?.initials ?? "EQ"}
                        </span>
                        {technician?.name ?? "Equipe"}
                      </span>
                      <span className={cn("rounded-full border px-2 py-0.5", status.chipClassName)}>{status.label}</span>
                      <span className={cn("rounded-full border px-2 py-0.5", priority.chipClassName)}>{priority.label}</span>
                      <span className={cn("rounded-full border px-2 py-0.5", queue.chipClassName)}>{queue.label}</span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5" />
                        SLA: {formatDuration(service.slaMinutes)} - Estimativa: {formatDuration(service.estimateMinutes)}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {service.client} - {service.district}
                      </p>
                      <p className="flex items-center gap-2">
                        <HardDrive className="h-3.5 w-3.5" />
                        {service.equipment}
                      </p>
                      <p className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Tecnico: {technician?.name ?? "Equipe nao definida"}
                      </p>
                    </div>

                    <div className="mt-3 rounded-lg border border-border/70 bg-muted/25 p-2">
                      <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        <Wrench className="h-3 w-3" />
                        Checklist
                      </p>
                      <div className="space-y-1 text-xs text-foreground">
                        {service.checklist.slice(0, 2).map((item) => (
                          <p key={item} className="rounded-md bg-background/70 px-2 py-1">
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
