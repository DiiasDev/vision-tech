"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronDown, Clock3, MapPin, Plus, ShieldCheck, Wrench, X } from "lucide-react"

import {
  agendaPriorityMeta,
  agendaQueueMeta,
  agendaStatusMeta,
} from "@/components/services/agenda/agenda-mock-data"
import type { AgendaService, AgendaTechnician } from "@/components/services/agenda/agenda-types"
import { formatDuration } from "@/components/services/agenda/agenda-utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type AgendaDayServicesModalProps = {
  open: boolean
  onClose: () => void
  selectedDateLabel: string
  services: AgendaService[]
  techniciansById: Map<string, AgendaTechnician>
  onAddService?: () => void
}

type ChecklistStage = {
  id: string
  title: string
  itemIndexes: number[]
}

function formatServiceOrderLabel(serviceId: string) {
  const normalized = serviceId.trim()
  if (!normalized) return "OS"

  const upperNormalized = normalized.toUpperCase()
  if (upperNormalized.startsWith("OS-") || upperNormalized.startsWith("OS ")) return normalized
  return `OS ${normalized}`
}

export function AgendaDayServicesModal({
  open,
  onClose,
  selectedDateLabel,
  services,
  techniciansById,
  onAddService,
}: AgendaDayServicesModalProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [checklistStateByService, setChecklistStateByService] = useState<Record<string, boolean[]>>({})
  const [collapsedStagesByService, setCollapsedStagesByService] = useState<Record<string, Record<string, boolean>>>({})
  const [finalizedServiceIds, setFinalizedServiceIds] = useState<Set<string>>(() => new Set())

  const handleClose = useCallback(() => {
    setSelectedServiceId(null)
    setChecklistStateByService({})
    setCollapsedStagesByService({})
    setFinalizedServiceIds(new Set())
    onClose()
  }, [onClose])

  const getChecklistState = useCallback(
    (service: AgendaService) => {
      const currentChecklistState = checklistStateByService[service.id]
      if (!currentChecklistState) {
        return service.checklist.map(() => false)
      }

      if (currentChecklistState.length === service.checklist.length) {
        return currentChecklistState
      }

      return service.checklist.map((_, index) => currentChecklistState[index] ?? false)
    },
    [checklistStateByService]
  )

  const handleToggleChecklistItem = useCallback(
    (serviceId: string, itemIndex: number, checked: boolean | "indeterminate") => {
      const service = services.find((item) => item.id === serviceId)
      if (!service) return

      setChecklistStateByService((previousState) => {
        const currentChecklistState = previousState[serviceId]
        const normalizedChecklistState =
          currentChecklistState && currentChecklistState.length === service.checklist.length
            ? [...currentChecklistState]
            : service.checklist.map((_, index) => currentChecklistState?.[index] ?? false)

        normalizedChecklistState[itemIndex] = checked === true

        return {
          ...previousState,
          [serviceId]: normalizedChecklistState,
        }
      })
    },
    [services]
  )

  const handleFinalizeService = useCallback((serviceId: string) => {
    setFinalizedServiceIds((previousState) => {
      const nextState = new Set(previousState)
      nextState.add(serviceId)
      return nextState
    })
  }, [])

  const isStageCollapsed = useCallback(
    (serviceId: string, stageId: string) => {
      return collapsedStagesByService[serviceId]?.[stageId] ?? false
    },
    [collapsedStagesByService]
  )

  const handleToggleStage = useCallback((serviceId: string, stageId: string) => {
    setCollapsedStagesByService((previousState) => {
      const serviceStages = previousState[serviceId] ?? {}
      const nextCollapsedState = !(serviceStages[stageId] ?? false)

      return {
        ...previousState,
        [serviceId]: {
          ...serviceStages,
          [stageId]: nextCollapsedState,
        },
      }
    })
  }, [])

  useEffect(() => {
    if (!open) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose()
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [open, handleClose])

  if (!open) return null

  const completedCount = services.filter((service) => service.status === "concluido").length
  const selectedService =
    services.find((service) => service.id === selectedServiceId) ??
    (services.length > 0 ? services[0] : null)
  const selectedTechnician = selectedService ? techniciansById.get(selectedService.technicianId) : null
  const selectedChecklistState = selectedService ? getChecklistState(selectedService) : []
  const completedChecklistItems = selectedChecklistState.filter(Boolean).length
  const totalChecklistItems = selectedChecklistState.length
  const checklistProgressPercentage =
    totalChecklistItems === 0 ? 0 : Math.round((completedChecklistItems / totalChecklistItems) * 100)
  const canFinalizeService = totalChecklistItems > 0 && completedChecklistItems === totalChecklistItems
  const isSelectedServiceFinalized = selectedService ? finalizedServiceIds.has(selectedService.id) : false
  const selectedChecklistStages: ChecklistStage[] = selectedService
    ? (() => {
        const checklistSize = selectedService.checklist.length
        if (checklistSize === 0) return []

        if (checklistSize === 1) {
          return [
            {
              id: "simulacao",
              title: "1 - Simulação de Erro",
              itemIndexes: [0],
            },
          ]
        }

        const splitIndex = Math.max(1, Math.ceil(checklistSize / 2))

        return [
          {
            id: "simulacao",
            title: "1 - Simulação de Erro",
            itemIndexes: Array.from({ length: splitIndex }, (_, index) => index),
          },
          {
            id: "resolucao",
            title: "2 - Resolução",
            itemIndexes: Array.from({ length: checklistSize - splitIndex }, (_, index) => splitIndex + index),
          },
        ].filter((stage) => stage.itemIndexes.length > 0)
      })()
    : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "color-mix(in oklab, var(--background) 30%, black 70%)" }}
      onClick={handleClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Servicos do dia"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4 md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Servicos do dia</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{selectedDateLabel}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {services.length} ordens planejadas - {completedCount} concluidas
            </p>
          </div>

          <Button type="button" size="icon-sm" variant="outline" onClick={handleClose} aria-label="Fechar modal">
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="max-h-[calc(88vh-118px)] overflow-y-auto p-4 md:p-6">
          {services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">
                Sem ordens de servico para este dia no filtro atual. Escolha outro dia no calendario ou ajuste os
                filtros.
              </p>
              {onAddService ? (
                <Button type="button" className="mt-3" onClick={onAddService}>
                  <Plus className="h-4 w-4" />
                  Adicionar servico
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
              <div className="grid items-start gap-3 lg:grid-cols-2">
                {services.map((service) => {
                  const technician = techniciansById.get(service.technicianId)
                  const status = agendaStatusMeta[service.status]
                  const priority = agendaPriorityMeta[service.priority]
                  const queue = agendaQueueMeta[service.queue]
                  const accentColor = technician?.accent ?? "var(--muted-foreground)"
                  const isSelected = selectedServiceId === service.id

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      className={cn(
                        "h-fit rounded-2xl border p-3.5 text-left transition-all duration-200",
                        isSelected
                          ? "border-primary/45 bg-primary/10 shadow-sm"
                          : "border-border/70 bg-card/90 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card hover:shadow-sm"
                      )}
                      style={{ borderLeftColor: accentColor, borderLeftWidth: "3px" }}
                    >
                      <div className="flex items-start gap-4">
                        <p className="min-w-0 flex-1 text-[clamp(1.2rem,0.95rem+0.35vw,1.4rem)] font-semibold leading-tight text-foreground">
                          {service.title}
                        </p>
                        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border/70 bg-muted/25 px-3 py-1.5 text-[11px] font-semibold tabular-nums text-foreground">
                          <Clock3 className="h-3.5 w-3.5 text-primary/80" />
                          <span>{service.startTime}</span>
                          <span className="text-muted-foreground">-</span>
                          <span>{service.endTime}</span>
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-2.5 py-2">
                        <span
                          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 text-[10px] font-bold shadow-sm"
                          style={{
                            backgroundColor: accentColor,
                            color: technician?.accentForeground ?? "var(--primary-foreground)",
                          }}
                        >
                          {technician?.initials ?? "EQ"}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Técnico</p>
                          <p className="truncate text-sm font-medium text-foreground">
                            {technician?.name ?? "Equipe não definida"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className={cn("rounded-full border px-2 py-0.5", status.chipClassName)}>{status.label}</span>
                        <span className={cn("rounded-full border px-2 py-0.5", priority.chipClassName)}>{priority.label}</span>
                        <span className={cn("rounded-full border px-2 py-0.5", queue.chipClassName)}>{queue.label}</span>
                        {finalizedServiceIds.has(service.id) ? (
                          <span className="rounded-full border border-primary/35 bg-primary/10 px-2 py-0.5 text-primary">
                            Finalizado
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <Clock3 className="h-3.5 w-3.5 shrink-0" />
                          SLA: {formatDuration(service.slaMinutes)} - Estimativa: {formatDuration(service.estimateMinutes)}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {service.client} - {service.district}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              <aside className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Detalhes do serviço</p>

                {selectedService ? (
                  <div className="mt-3 space-y-4">
                    <div>
                      <p className="text-lg font-semibold leading-tight text-foreground">{selectedService.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{formatServiceOrderLabel(selectedService.id)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className={cn("rounded-full border px-2 py-0.5", agendaStatusMeta[selectedService.status].chipClassName)}>
                        {agendaStatusMeta[selectedService.status].label}
                      </span>
                      <span className={cn("rounded-full border px-2 py-0.5", agendaPriorityMeta[selectedService.priority].chipClassName)}>
                        {agendaPriorityMeta[selectedService.priority].label}
                      </span>
                      <span className={cn("rounded-full border px-2 py-0.5", agendaQueueMeta[selectedService.queue].chipClassName)}>
                        {agendaQueueMeta[selectedService.queue].label}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        Horario:
                        <span className="whitespace-nowrap tabular-nums text-foreground">
                          {selectedService.startTime} - {selectedService.endTime}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        SLA: {formatDuration(selectedService.slaMinutes)} - Estimativa:{" "}
                        {formatDuration(selectedService.estimateMinutes)}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {selectedService.client} - {selectedService.address}, {selectedService.district}
                      </p>
                      <p className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Tecnico: {selectedTechnician?.name ?? "Equipe nao definida"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/80 bg-background/90 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-foreground">
                          <Wrench className="h-3 w-3" />
                          Checklist completo
                        </p>
                        <p className="text-xs font-semibold text-foreground">
                          {completedChecklistItems}/{totalChecklistItems} concluído(s)
                        </p>
                      </div>

                      <div className="mb-1 h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{ width: `${checklistProgressPercentage}%` }}
                        />
                      </div>

                      <p className="mb-3 text-xs font-medium text-muted-foreground">{checklistProgressPercentage}% concluído</p>

                      <div className="space-y-3">
                        {selectedChecklistStages.map((stage) => {
                          const isCollapsed = isStageCollapsed(selectedService.id, stage.id)
                          const completedInStage = stage.itemIndexes.filter((index) => selectedChecklistState[index]).length
                          const stagePanelId = `${selectedService.id}-stage-${stage.id}`

                          return (
                            <section key={stage.id} className="rounded-md border border-border/70 bg-card/80 p-2.5">
                              <button
                                type="button"
                                className="flex w-full items-center justify-between gap-2 text-left"
                                onClick={() => handleToggleStage(selectedService.id, stage.id)}
                                aria-expanded={!isCollapsed}
                                aria-controls={stagePanelId}
                              >
                                <p className="text-sm font-semibold text-foreground">{stage.title}</p>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                                  {completedInStage}/{stage.itemIndexes.length}
                                  <ChevronDown className={cn("h-4 w-4 transition-transform", isCollapsed && "-rotate-90")} />
                                </span>
                              </button>

                              {!isCollapsed ? (
                                <div id={stagePanelId} className="mt-2 space-y-2">
                                  {stage.itemIndexes.map((index) => {
                                    const item = selectedService.checklist[index]
                                    const itemId = `${selectedService.id}-check-${stage.id}-${index}`
                                    const isChecked = selectedChecklistState[index] ?? false

                                    return (
                                      <label
                                        key={itemId}
                                        htmlFor={itemId}
                                        className="flex cursor-pointer items-start gap-2 rounded-md border border-border/70 bg-background/95 px-2.5 py-2"
                                      >
                                        <Checkbox
                                          id={itemId}
                                          checked={isChecked}
                                          onCheckedChange={(checked) => {
                                            handleToggleChecklistItem(selectedService.id, index, checked)
                                          }}
                                          className="mt-0.5 size-5 border-2 border-primary/55 bg-card data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                                        />
                                        <span
                                          className={cn(
                                            "text-sm font-medium text-foreground transition-colors",
                                            isChecked && "text-muted-foreground line-through"
                                          )}
                                        >
                                          {item}
                                        </span>
                                      </label>
                                    )
                                  })}
                                </div>
                              ) : null}
                            </section>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        type="button"
                        className="w-full"
                        disabled={!canFinalizeService || isSelectedServiceFinalized}
                        onClick={() => handleFinalizeService(selectedService.id)}
                      >
                        {isSelectedServiceFinalized ? "Serviço finalizado" : "Finalizar serviço"}
                      </Button>

                      {!isSelectedServiceFinalized ? (
                        <p className="text-xs text-muted-foreground">
                          {canFinalizeService
                            ? "Checklist concluído. Você já pode finalizar este serviço."
                            : "Marque todos os itens do checklist para habilitar a finalização do serviço."}
                        </p>
                      ) : (
                        <p className="text-xs text-primary">Serviço finalizado com sucesso.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">Selecione um serviço na lista para ver os detalhes.</p>
                )}
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
