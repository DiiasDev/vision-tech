import { Activity, CalendarRange, CircleCheckBig, Target, UsersRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"

type AgendaHeroProps = {
  monthLabel: string
  totalMonthServices: number
  todayServices: number
  criticalToday: number
  completedToday: number
  fieldTechnicians: number
}

export function AgendaHero({
  monthLabel,
  totalMonthServices,
  todayServices,
  criticalToday,
  completedToday,
  fieldTechnicians,
}: AgendaHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm md:p-7">
      <div className="pointer-events-none absolute -left-16 top-0 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-48 w-48 rounded-full bg-accent/80 blur-3xl" />

      <div className="relative grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <Badge className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] tracking-[0.18em] uppercase text-primary">
            Servicos - Agenda Tecnica
          </Badge>

          <div className="space-y-2">
            <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
              Orquestracao de campo com visao mensal, prioridades e SLA em uma unica tela.
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              Jornada de trabalho de {monthLabel.toLowerCase()} com foco em previsibilidade, produtividade e controle
              de deslocamento.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Hoje</p>
              <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-foreground">
                <CalendarRange className="h-4 w-4 text-primary" />
                {todayServices} visitas
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Criticos</p>
              <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-foreground">
                <Target className="h-4 w-4 text-destructive" />
                {criticalToday}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Concluidos</p>
              <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-foreground">
                <CircleCheckBig className="h-4 w-4 text-primary" />
                {completedToday}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 self-end">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Carga mensal</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{totalMonthServices} ordens</p>
            <p className="mt-1 text-xs text-muted-foreground">Distribuidas entre visitas tecnicas, instalacoes e suporte.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background/80 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Tecnicos em campo</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-foreground">
                <UsersRound className="h-4 w-4 text-primary" />
                {fieldTechnicians}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/80 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Ritmo operacional</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Activity className="h-4 w-4 text-accent-foreground" />
                Estavel
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
