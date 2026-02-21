import { Funnel, Plus, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { clientsData } from "@/components/clients/mock-data"

type ClientsFiltersProps = {
  onNewClientClick?: () => void
}

export default function ClientsFilters({ onNewClientClick }: ClientsFiltersProps) {
  const enterpriseCount = clientsData.filter((client) => client.plano === "Enterprise").length
  const riskCount = clientsData.filter((client) => client.status === "Em risco" || client.status === "Inadimplente").length
  const onboardingCount = clientsData.filter((client) => client.status === "Onboarding").length

  return (
    <section className="space-y-4 rounded-2xl border border-border/70 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar cliente, gestor, segmento..." className="h-10 rounded-xl border-border/70 bg-background/60 pl-9" />
        </div>

        <Select>
          <SelectTrigger className="h-10 w-[170px] rounded-xl border-border/70 bg-background/60">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="em-risco">Em risco</SelectItem>
            <SelectItem value="inadimplente">Inadimplente</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="h-10 w-[170px] rounded-xl border-border/70 bg-background/60">
            <SelectValue placeholder="Plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="essential">Essentials</SelectItem>
            <SelectItem value="growth">Growth</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="h-10 rounded-xl border-border/70">
          <Funnel className="h-4 w-4" />
          Filtros Avancados
        </Button>

        <Button className="h-10 rounded-xl" onClick={onNewClientClick}>
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
          Enterprise: {enterpriseCount}
        </Badge>
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
          Onboarding: {onboardingCount}
        </Badge>
        <Badge variant="destructive" className="rounded-full px-3 py-1 text-xs">
          Em alerta: {riskCount}
        </Badge>
      </div>
    </section>
  )
}
