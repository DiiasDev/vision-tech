"use client"

import { useEffect } from "react"
import { Check, UsersRound, X } from "lucide-react"

import { availabilityMeta } from "@/components/services/agenda/agenda-mock-data"
import type { AgendaTechnician } from "@/components/services/agenda/agenda-types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TechnicianLoadMap = Map<
  string,
  {
    monthCount: number
    todayCount: number
  }
>

type AgendaTeamFilterModalProps = {
  open: boolean
  onClose: () => void
  technicians: AgendaTechnician[]
  selectedTechnicianIds: string[]
  onChangeSelectedTechnicians: (technicianIds: string[]) => void
  technicianLoad: TechnicianLoadMap
}

export function AgendaTeamFilterModal({
  open,
  onClose,
  technicians,
  selectedTechnicianIds,
  onChangeSelectedTechnicians,
  technicianLoad,
}: AgendaTeamFilterModalProps) {
  useEffect(() => {
    if (!open) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [open, onClose])

  if (!open) return null

  const totalMonthLoad = Array.from(technicianLoad.values()).reduce((sum, load) => sum + load.monthCount, 0)
  const totalTodayLoad = Array.from(technicianLoad.values()).reduce((sum, load) => sum + load.todayCount, 0)
  const selectedCount = selectedTechnicianIds.length

  function toggleTechnicianSelection(technicianId: string) {
    if (selectedTechnicianIds.includes(technicianId)) {
      onChangeSelectedTechnicians(selectedTechnicianIds.filter((id) => id !== technicianId))
      return
    }

    onChangeSelectedTechnicians([...selectedTechnicianIds, technicianId])
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "color-mix(in oklab, var(--background) 30%, black 70%)" }}
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Filtro de equipe tecnica"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4 md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Filtro de equipe</p>
            <h3 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
              <UsersRound className="h-5 w-5 text-primary" />
              Escolha os tecnicos exibidos na agenda
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecao multipla ativa. {selectedCount === 0 ? "Mostrando todos os tecnicos." : `${selectedCount} selecionado(s).`}
            </p>
          </div>

          <Button type="button" size="icon-sm" variant="outline" onClick={onClose} aria-label="Fechar modal">
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="max-h-[calc(88vh-118px)] overflow-y-auto p-4 md:p-6">
          <button
            type="button"
            onClick={() => {
              onChangeSelectedTechnicians([])
            }}
            className={cn(
              "w-full rounded-xl border p-3 text-left transition-colors",
              selectedCount === 0
                ? "border-primary/45 bg-primary/10"
                : "border-border/70 bg-background/60 hover:border-primary/35"
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">Todos os tecnicos</p>
                <p className="text-sm text-muted-foreground">Visao geral da operacao</p>
              </div>

              <div className="flex gap-2 text-xs">
                <span className="rounded-lg border border-border/70 bg-muted/25 px-2 py-1">No mes: {totalMonthLoad}</span>
                <span className="rounded-lg border border-border/70 bg-muted/25 px-2 py-1">Hoje: {totalTodayLoad}</span>
              </div>
            </div>
          </button>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {technicians.map((technician) => {
              const load = technicianLoad.get(technician.id)
              const isSelected = selectedTechnicianIds.includes(technician.id)
              const availability = availabilityMeta[technician.availability]

              return (
                <button
                  key={technician.id}
                  type="button"
                  onClick={() => toggleTechnicianSelection(technician.id)}
                  className={cn(
                    "relative w-full rounded-xl border p-3 text-left transition-colors",
                    isSelected
                      ? "border-primary/45 bg-primary/10"
                      : "border-border/70 bg-background/60 hover:border-primary/35"
                  )}
                >
                  {isSelected ? (
                    <span className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : null}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 text-sm font-semibold shadow-sm"
                        style={{
                          backgroundColor: technician.accent,
                          color: technician.accentForeground,
                        }}
                      >
                        {technician.initials}
                      </span>

                      <div>
                        <p className="text-lg font-semibold leading-tight text-foreground">{technician.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {technician.specialty} - {technician.base}
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                        availability.chipClassName
                      )}
                    >
                      {availability.label}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-border/70 bg-muted/30 px-2 py-1.5">
                      <p className="text-muted-foreground">No mes</p>
                      <p className="text-lg font-semibold text-foreground">{load?.monthCount ?? 0}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-muted/30 px-2 py-1.5">
                      <p className="text-muted-foreground">Hoje</p>
                      <p className="text-lg font-semibold text-foreground">{load?.todayCount ?? 0}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex justify-end gap-2 border-t border-border/70 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onChangeSelectedTechnicians([])}
              disabled={selectedCount === 0}
            >
              Limpar selecao
            </Button>
            <Button type="button" onClick={onClose}>
              Concluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
