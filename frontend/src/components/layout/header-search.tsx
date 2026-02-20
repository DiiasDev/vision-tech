"use client"

import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

type HeaderSearchProps = {
  placeholder?: string
}

export function HeaderSearch({ placeholder = "Buscar cliente, produto, ordem, documento..." }: HeaderSearchProps) {
  return (
    <div className="relative w-full">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        aria-label="Pesquisa global do sistema"
        placeholder={placeholder}
        className="h-10 rounded-xl border-border/70 bg-background/60 pl-9 pr-4 shadow-sm backdrop-blur-sm"
      />
    </div>
  )
}
