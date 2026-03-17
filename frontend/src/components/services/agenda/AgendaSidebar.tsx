import type { ComponentType } from "react"
import { Activity, CalendarClock, Compass, Gauge, LayoutPanelTop } from "lucide-react"

import { agendaModules, availabilityMeta } from "@/components/services/agenda/agenda-mock-data"
import type { AgendaTechnician } from "@/components/services/agenda/agenda-types"
import { cn } from "@/lib/utils"

type ModuleItem = (typeof agendaModules)[number]

type TechnicianLoadMap = Map<
  string,
  {
    monthCount: number
    todayCount: number
  }
>

type AgendaSidebarProps = {
  modules: ModuleItem[]
  activeModuleId: string
  technicians: AgendaTechnician[]
  selectedTechnicianId: string
  onSelectTechnician: (technicianId: string) => void
  technicianLoad: TechnicianLoadMap
}

const moduleIconMap: Record<string, ComponentType<{ className?: string }>> = {
  painel: LayoutPanelTop,
  agenda: CalendarClock,
  rotas: Compass,
  sla: Gauge,
}

export function AgendaSidebar({
  modules,
  activeModuleId,
  technicians,
  selectedTechnicianId,
  onSelectTechnician,
  technicianLoad,
}: AgendaSidebarProps) {
  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Menu da Central</p>

        <div className="mt-3 space-y-2">
          {modules.map((module) => {
            const Icon = moduleIconMap[module.id] ?? Activity
            const isActive = module.id === activeModuleId

            return (
              <button
                key={module.id}
                type="button"
                className={cn(
                  "w-full rounded-xl border px-3 py-3 text-left transition-colors",
                  isActive
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/70 bg-background/60 text-foreground hover:border-primary/35"
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-4 w-4" />
                  {module.label}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">{module.description}</p>
              </button>
            )
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Equipe tecnica</p>

        <button
          type="button"
          onClick={() => onSelectTechnician("all")}
          className={cn(
            "mt-3 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition-colors",
            selectedTechnicianId === "all"
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border/70 bg-background/60 hover:border-primary/35"
          )}
        >
          <span>Todos os tecnicos</span>
          <span className="text-xs text-muted-foreground">Visao geral</span>
        </button>

        <div className="mt-3 space-y-2">
          {technicians.map((technician) => {
            const load = technicianLoad.get(technician.id)
            const isSelected = selectedTechnicianId === technician.id
            const availability = availabilityMeta[technician.availability]

            return (
              <button
                key={technician.id}
                type="button"
                onClick={() => onSelectTechnician(technician.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-colors",
                  isSelected
                    ? "border-primary/45 bg-primary/10"
                    : "border-border/70 bg-background/60 hover:border-primary/35"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 text-xs font-semibold shadow-sm"
                      style={{
                        backgroundColor: technician.accent,
                        color: technician.accentForeground,
                      }}
                    >
                      {technician.initials}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{technician.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {technician.specialty} - {technician.base}
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      availability.chipClassName
                    )}
                  >
                    {availability.label}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-border/70 bg-muted/30 px-2 py-1.5">
                    <p className="text-muted-foreground">No mes</p>
                    <p className="font-semibold text-foreground">{load?.monthCount ?? 0}</p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-muted/30 px-2 py-1.5">
                    <p className="text-muted-foreground">Hoje</p>
                    <p className="font-semibold text-foreground">{load?.todayCount ?? 0}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </aside>
  )
}
