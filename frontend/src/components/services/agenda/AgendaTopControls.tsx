import { Filter, MoveRight, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AgendaQueueFilter } from "@/components/services/agenda/agenda-types"

type QueueFilterOption = {
  id: AgendaQueueFilter
  label: string
  description: string
}

type AgendaTopControlsProps = {
  filters: QueueFilterOption[]
  selectedFilter: AgendaQueueFilter
  onFilterChange: (filter: AgendaQueueFilter) => void
  selectedTechnicianLabel: string
  visibleServicesCount: number
  onOpenTeamFilter: () => void
  onJumpToToday: () => void
}

export function AgendaTopControls({
  filters,
  selectedFilter,
  onFilterChange,
  selectedTechnicianLabel,
  visibleServicesCount,
  onOpenTeamFilter,
  onJumpToToday,
}: AgendaTopControlsProps) {
  return (
    <section className="rounded-2xl border border-border/80 bg-card/95 p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            Fila Operacional
          </p>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isActive = selectedFilter === filter.id

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onFilterChange(filter.id)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left transition-colors",
                    isActive
                      ? "border-primary/45 bg-primary/10 text-primary shadow-sm"
                      : "border-border/80 bg-background/60 text-muted-foreground hover:border-primary/35 hover:text-foreground"
                  )}
                >
                  <p className="text-sm font-medium">{filter.label}</p>
                  <p className="text-xs">{filter.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid min-w-[230px] gap-2 rounded-xl border border-border/80 bg-muted/25 p-3 text-sm">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Contexto ativo</p>
          <p className="font-medium text-foreground">Equipe: {selectedTechnicianLabel}</p>
          <p className="text-muted-foreground">{visibleServicesCount} ordens visiveis no filtro atual.</p>
          <Button type="button" size="sm" variant="outline" className="justify-between" onClick={onOpenTeamFilter}>
            Filtrar equipe tecnica
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" className="justify-between" onClick={onJumpToToday}>
            Ir para hoje
            <MoveRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
