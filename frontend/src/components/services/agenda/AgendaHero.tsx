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
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 p-6 text-slate-100 shadow-2xl md:p-7">
      <div className="pointer-events-none absolute -left-16 top-0 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-48 w-48 rounded-full bg-emerald-300/15 blur-3xl" />

      <div className="relative grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] tracking-[0.18em] uppercase text-slate-200">
            Servicos - Agenda Tecnica
          </Badge>

          <div className="space-y-2">
            <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              Orquestracao de campo com visao mensal, prioridades e SLA em uma unica tela.
            </h1>
            <p className="max-w-2xl text-sm text-slate-300 md:text-base">
              Jornada de trabalho de {monthLabel.toLowerCase()} com foco em previsibilidade, produtividade e controle
              de deslocamento.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-300">Hoje</p>
              <p className="mt-2 flex items-center gap-2 text-xl font-semibold">
                <CalendarRange className="h-4 w-4 text-cyan-300" />
                {todayServices} visitas
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-300">Criticos</p>
              <p className="mt-2 flex items-center gap-2 text-xl font-semibold">
                <Target className="h-4 w-4 text-rose-300" />
                {criticalToday}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-300">Concluidos</p>
              <p className="mt-2 flex items-center gap-2 text-xl font-semibold">
                <CircleCheckBig className="h-4 w-4 text-emerald-300" />
                {completedToday}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 self-end">
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-300">Carga mensal</p>
            <p className="mt-2 text-3xl font-semibold">{totalMonthServices} ordens</p>
            <p className="mt-1 text-xs text-slate-300">Distribuidas entre visitas tecnicas, instalacoes e suporte.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300">Tecnicos em campo</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                <UsersRound className="h-4 w-4 text-cyan-200" />
                {fieldTechnicians}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300">Ritmo operacional</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                <Activity className="h-4 w-4 text-emerald-200" />
                Estavel
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
