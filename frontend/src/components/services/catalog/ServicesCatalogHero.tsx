import { Plus, Sparkles, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"

type ServicesCatalogHeroProps = {
  onAddService?: () => void
}

export function ServicesCatalogHero({ onAddService }: ServicesCatalogHeroProps) {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-card to-sky-500/10 p-6 shadow-sm md:p-7">
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-sky-500/20 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl border border-primary/25 bg-background/80 p-3 shadow-sm">
            <Wrench className="h-6 w-6 text-primary" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              operacao de servicos
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Catalogo de Servicos</h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Organize ofertas tecnicas, SLA e precificacao para acelerar proposta, execucao e atendimento.
              </p>
            </div>
          </div>
        </div>

        <Button type="button" className="h-11 rounded-xl px-5 text-sm shadow-sm" onClick={onAddService}>
          <Plus className="h-4 w-4" />
          Novo Servico
        </Button>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <div className="rounded-xl border bg-background/55 px-3 py-2">
          <span className="font-medium text-foreground">Onboarding medio</span>: 5 dias uteis
        </div>
        <div className="rounded-xl border bg-background/55 px-3 py-2">
          <span className="font-medium text-foreground">Cumprimento de SLA</span>: 97.4%
        </div>
        <div className="rounded-xl border bg-background/55 px-3 py-2">
          <span className="font-medium text-foreground">Templates prontos</span>: 18 playbooks
        </div>
      </div>
    </section>
  )
}
