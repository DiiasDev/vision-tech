import { Clock3, HardDrive, MapPin, ShieldCheck, Wrench } from "lucide-react"

import {
  agendaPriorityMeta,
  agendaQueueMeta,
  agendaStatusMeta,
} from "@/components/services/agenda/agenda-mock-data"
import type { AgendaService, AgendaTechnician } from "@/components/services/agenda/agenda-types"
import { formatDuration } from "@/components/services/agenda/agenda-utils"
import { cn } from "@/lib/utils"

type AgendaDayTimelineProps = {
  selectedDateLabel: string
  services: AgendaService[]
  techniciansById: Map<string, AgendaTechnician>
}

export function AgendaDayTimeline({
  selectedDateLabel,
  services,
  techniciansById,
}: AgendaDayTimelineProps) {
  const completedCount = services.filter((service) => service.status === "concluido").length

  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-border/70 bg-card/85 p-4 shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Timeline do dia</p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">{selectedDateLabel}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {services.length} ordens planejadas - {completedCount} concluidas
        </p>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card/85 p-4 shadow-sm">
        {services.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground">
            Sem visitas para este dia no filtro atual. Use a agenda mensal para encaixar novos atendimentos.
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => {
              const technician = techniciansById.get(service.technicianId)
              const status = agendaStatusMeta[service.status]
              const priority = agendaPriorityMeta[service.priority]
              const queue = agendaQueueMeta[service.queue]

              return (
                <article key={service.id} className="rounded-xl border border-border/70 bg-background/70 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{service.title}</p>
                    <span className="rounded-full border border-border/70 bg-muted/20 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {service.startTime} - {service.endTime}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
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
      </section>
    </aside>
  )
}
