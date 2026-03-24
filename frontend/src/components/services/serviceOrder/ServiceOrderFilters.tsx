import { Search } from "lucide-react"

import {
  type ServiceOrderPriority,
  type ServiceOrderStatus,
  serviceOrderPriorityLabel,
} from "@/components/services/serviceOrder/service-order-mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ServiceOrderStatusFilter = "all" | ServiceOrderStatus

type ServiceOrderPriorityFilter = "all" | ServiceOrderPriority

type ServiceOrderFiltersProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  statusFilter: ServiceOrderStatusFilter
  onStatusFilterChange: (value: ServiceOrderStatusFilter) => void
  priorityFilter: ServiceOrderPriorityFilter
  onPriorityFilterChange: (value: ServiceOrderPriorityFilter) => void
  technicianFilter: string
  onTechnicianFilterChange: (value: string) => void
  technicians: string[]
  resultCount: number
}

const STATUS_FILTER_OPTIONS: Array<{ label: string; value: ServiceOrderStatusFilter }> = [
  { label: "Todas", value: "all" },
  { label: "Agendadas", value: "scheduled" },
  { label: "Em andamento", value: "in_progress" },
  { label: "Aguardando pecas", value: "awaiting_parts" },
  { label: "Concluidas", value: "completed" },
  { label: "Canceladas", value: "cancelled" },
]

export function ServiceOrderFilters({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  technicianFilter,
  onTechnicianFilterChange,
  technicians,
  resultCount,
}: ServiceOrderFiltersProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[280px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por codigo, cliente, servico ou tecnico..."
            className="h-11 rounded-xl border-border/70 bg-background/60 pl-9"
          />
        </div>

        <Select value={priorityFilter} onValueChange={(value) => onPriorityFilterChange(value as ServiceOrderPriorityFilter)}>
          <SelectTrigger className="h-11 w-[200px] rounded-xl border-border/70 bg-background/60">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as prioridades</SelectItem>
            <SelectItem value="critical">Critica</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
          </SelectContent>
        </Select>

        <Select value={technicianFilter} onValueChange={onTechnicianFilterChange}>
          <SelectTrigger className="h-11 w-[220px] rounded-xl border-border/70 bg-background/60">
            <SelectValue placeholder="Tecnico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tecnicos</SelectItem>
            {technicians.map((technician) => (
              <SelectItem key={technician} value={technician}>
                {technician}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTER_OPTIONS.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              variant={statusFilter === filter.value ? "default" : "outline"}
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => onStatusFilterChange(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          {resultCount} OS(s) encontrada(s)
          {priorityFilter !== "all" ? ` | prioridade ${serviceOrderPriorityLabel(priorityFilter)}` : ""}
        </p>
      </div>
    </section>
  )
}
