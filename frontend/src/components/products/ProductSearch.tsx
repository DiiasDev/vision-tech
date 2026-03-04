"use client"

import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type StatusFilter = "all" | "active" | "inactive" | "out_of_stock"

type Props = {
  onSearch: (value: string) => void
  statusFilter: StatusFilter
  onStatusChange: (status: StatusFilter) => void
  resultCount: number
}

export function ProductSearch({ onSearch, statusFilter, onStatusChange, resultCount }: Props) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onSearch(event.target.value)
  }

  const filters: Array<{ label: string; value: StatusFilter }> = [
    { label: "Todos", value: "all" },
    { label: "Ativos", value: "active" },
    { label: "Inativos", value: "inactive" },
    { label: "Sem estoque", value: "out_of_stock" },
  ]

  return (
    <section className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Busque por nome, código ou fornecedor..."
          className="h-12 rounded-xl border-border/70 bg-card pl-10 shadow-sm"
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              variant={statusFilter === filter.value ? "default" : "outline"}
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => onStatusChange(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          {resultCount} item(ns) encontrado(s)
        </p>
      </div>
    </section>
  )
}
