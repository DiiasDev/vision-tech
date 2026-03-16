import { Search } from "lucide-react"

import type { ServiceCatalogStatus } from "@/components/services/catalog/catalog-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ServiceCatalogStatusFilter = "all" | ServiceCatalogStatus

type ServicesCatalogFiltersProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  statusFilter: ServiceCatalogStatusFilter
  onStatusFilterChange: (value: ServiceCatalogStatusFilter) => void
  categoryFilter: string
  onCategoryFilterChange: (value: string) => void
  categories: string[]
  resultCount: number
}

export function ServicesCatalogFilters({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  resultCount,
}: ServicesCatalogFiltersProps) {
  const statusFilters = [
    { label: "Todos", value: "all" },
    { label: "Ativos", value: "active" },
    { label: "Inativos", value: "inactive" },
    { label: "Rascunhos", value: "draft" },
  ] as const

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[280px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nome, codigo, categoria ou time..."
            className="h-11 rounded-xl border-border/70 bg-background/60 pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="h-11 w-[220px] rounded-xl border-border/70 bg-background/60">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
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

        <p className="text-sm text-muted-foreground">{resultCount} servico(s) encontrado(s)</p>
      </div>
    </section>
  )
}
