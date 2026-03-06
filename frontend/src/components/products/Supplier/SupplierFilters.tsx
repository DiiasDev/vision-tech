import { FilterX, Search, SlidersHorizontal } from "lucide-react"

import {
  supplierRiskLabels,
  supplierSegmentLabels,
  supplierStatusLabels,
  type SupplierFilters as SupplierFiltersType,
  type SupplierRiskLevel,
  type SupplierSegment,
  type SupplierStatus,
} from "@/components/products/Supplier/supplier-models"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SupplierFiltersProps = {
  filters: SupplierFiltersType
  segments: SupplierSegment[]
  totalCount: number
  visibleCount: number
  onFiltersChange: (next: SupplierFiltersType) => void
}

export function SupplierFilters({ filters, segments, totalCount, visibleCount, onFiltersChange }: SupplierFiltersProps) {
  const hasActiveFilters = filters.search.length > 0 || filters.segment !== "all" || filters.status !== "all" || filters.risk !== "all"

  return (
    <Card className="gap-3 border-border/70 bg-card/70 py-0">
      <CardHeader className="border-b border-border/70 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            Filtros de fornecedores
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Exibindo {visibleCount} de {totalCount} fornecedores
          </p>
        </div>
      </CardHeader>

      <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
        <div className="relative md:col-span-2 xl:col-span-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
            placeholder="Buscar por nome, categoria, contato ou cidade..."
            className="pl-9"
          />
        </div>

        <Select value={filters.segment} onValueChange={(value) => onFiltersChange({ ...filters, segment: value as SupplierSegment | "all" })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Segmento" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="all">Todos os segmentos</SelectItem>
            {segments.map((segment) => (
              <SelectItem key={segment} value={segment}>
                {supplierSegmentLabels[segment]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value as SupplierStatus | "all" })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="all">Todos os status</SelectItem>
            {(["ativo", "avaliacao", "suspenso"] as SupplierStatus[]).map((status) => (
              <SelectItem key={status} value={status}>
                {supplierStatusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.risk} onValueChange={(value) => onFiltersChange({ ...filters, risk: value as SupplierRiskLevel | "all" })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Risco" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="all">Todos os riscos</SelectItem>
            {(["alto", "medio", "baixo"] as SupplierRiskLevel[]).map((risk) => (
              <SelectItem key={risk} value={risk}>
                {supplierRiskLabels[risk]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="w-full md:w-auto"
          disabled={!hasActiveFilters}
          onClick={() =>
            onFiltersChange({
              search: "",
              segment: "all",
              status: "all",
              risk: "all",
            })
          }
        >
          <FilterX className="h-4 w-4" />
          Limpar
        </Button>
      </CardContent>
    </Card>
  )
}
