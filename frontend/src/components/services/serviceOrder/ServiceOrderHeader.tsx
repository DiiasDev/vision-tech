import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

type ServiceOrderHeaderProps = {
  onAddOrder?: () => void
}

export function ServiceOrderHeader({ onAddOrder }: ServiceOrderHeaderProps) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Ordens de Servico</h1>
        <p className="mt-1 text-lg text-muted-foreground">Planeje, acompanhe e conclua execucoes tecnicas</p>
      </div>

      <Button type="button" className="h-11 rounded-xl px-5 text-sm shadow-sm" onClick={onAddOrder}>
        <Plus className="h-4 w-4" />
        Nova Ordem
      </Button>
    </section>
  )
}
