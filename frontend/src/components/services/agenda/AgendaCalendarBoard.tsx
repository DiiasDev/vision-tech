import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { AgendaService, AgendaTechnician } from "@/components/services/agenda/agenda-types"
import type { AgendaCalendarCell } from "@/components/services/agenda/agenda-utils"
import { cn } from "@/lib/utils"

type AgendaCalendarBoardProps = {
  monthLabel: string
  cells: AgendaCalendarCell[]
  selectedDateKey: string
  onSelectDate: (dateKey: string) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
  servicesByDate: Map<string, AgendaService[]>
  techniciansById: Map<string, AgendaTechnician>
  activeTechnicians: AgendaTechnician[]
}

const weekDayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"]

const activityColorMap = {
  instalacao: "var(--primary)",
  manutencao: "var(--chart-2)",
  suporte: "var(--muted-foreground)",
  garantia: "var(--chart-5)",
}

export function AgendaCalendarBoard({
  monthLabel,
  cells,
  selectedDateKey,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
  servicesByDate,
  techniciansById,
  activeTechnicians,
}: AgendaCalendarBoardProps) {
  return (
    <section className="rounded-3xl border border-border/80 bg-card/95 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-muted/20 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Calendario de campo</p>
          <h2 className="text-3xl font-semibold tracking-tight">{monthLabel}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon-sm" onClick={onPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="overflow-x-auto">
        <div className="min-w-[940px] px-4 pb-4 pt-3 lg:min-w-0">
          <section className="mb-3 rounded-xl border border-border/70 bg-background/70 p-3">
            <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Colaboradores</p>
                {activeTechnicians.map((technician) => (
                  <span
                    key={technician.id}
                    className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2 py-1 text-xs font-medium text-foreground"
                  >
                    <span
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/25 text-[10px] font-semibold"
                      style={{
                        backgroundColor: technician.accent,
                        color: technician.accentForeground,
                      }}
                    >
                      {technician.initials}
                    </span>
                    {technician.name}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <p className="uppercase tracking-[0.16em] text-muted-foreground">Atividades</p>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2 py-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activityColorMap.instalacao }} />
                  Instalacao
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2 py-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activityColorMap.manutencao }} />
                  Manutencao
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2 py-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activityColorMap.suporte }} />
                  Suporte
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2 py-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activityColorMap.garantia }} />
                  Garantia
                </span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-7 gap-3 pb-3">
            {weekDayLabels.map((label) => (
              <p
                key={label}
                className="rounded-lg border border-border/70 bg-muted/30 px-2 py-1.5 text-center text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground"
              >
                {label}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {cells.map((cell) => {
              const dayServices = servicesByDate.get(cell.dateKey) ?? []
              const hasCritical = dayServices.some((service) => service.priority === "alta")
              const isBusy = dayServices.length >= 3
              const isSelected = cell.dateKey === selectedDateKey

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  onClick={() => onSelectDate(cell.dateKey)}
                  className={cn(
                    "group min-h-[184px] rounded-2xl border p-3 text-left transition-all",
                    cell.isCurrentMonth
                      ? "border-border/80 bg-background/80"
                      : "border-border/55 bg-muted/20 text-muted-foreground",
                    isSelected && "border-primary/45 bg-primary/10 shadow-sm",
                    !isSelected && isBusy && "border-primary/30",
                    !isSelected && hasCritical && "ring-1 ring-destructive/30"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/70 text-muted-foreground group-hover:bg-muted"
                      )}
                    >
                      {cell.date.getDate()}
                    </span>

                    {dayServices.length > 0 ? (
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          hasCritical
                            ? "border-destructive/35 bg-destructive/10 text-destructive"
                            : "border-primary/35 bg-primary/10 text-primary"
                        )}
                      >
                        {dayServices.length} OS
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 space-y-2">
                    {dayServices.slice(0, 4).map((service) => {
                      const technician = techniciansById.get(service.technicianId)
                      const accentColor = technician?.accent ?? "var(--muted-foreground)"
                      const activityColor = activityColorMap[service.queue]

                      return (
                        <div
                          key={service.id}
                          className="truncate rounded-md border border-border/70 bg-background/85 px-2 py-1.5 text-xs font-medium text-foreground"
                          style={{
                            borderLeftColor: accentColor,
                            borderLeftWidth: "3px",
                          }}
                        >
                          <span
                            className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/25 text-[10px] font-semibold"
                            style={{
                              backgroundColor: accentColor,
                              color: technician?.accentForeground ?? "var(--primary-foreground)",
                            }}
                          >
                            {technician?.initials ?? "EQ"}
                          </span>
                          <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: activityColor }} />
                          {service.startTime} - {service.client}
                        </div>
                      )
                    })}

                    {dayServices.length > 4 ? (
                      <p className="text-xs text-muted-foreground">+{dayServices.length - 4} atendimentos no dia</p>
                    ) : null}
                    {dayServices.length === 0 ? (
                      <p className="pt-1 text-xs text-muted-foreground">Janela livre para encaixe.</p>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
