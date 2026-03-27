"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import { AgendaCalendarBoard } from "@/components/services/agenda/AgendaCalendarBoard"
import { AgendaDayServicesModal } from "@/components/services/agenda/AgendaDayServicesModal"
import { AgendaHero } from "@/components/services/agenda/AgendaHero"
import { AgendaTeamFilterModal } from "@/components/services/agenda/AgendaTeamFilterModal"
import { AgendaTopControls } from "@/components/services/agenda/AgendaTopControls"
import { agendaQueueFilters } from "@/components/services/agenda/agenda-mock-data"
import type {
  AgendaPriority,
  AgendaQueue,
  AgendaQueueFilter,
  AgendaService,
  AgendaStatus,
  AgendaTechnician,
  AgendaTechnicianAvailability,
} from "@/components/services/agenda/agenda-types"
import {
  buildCalendarMonth,
  formatDateKey,
  formatLongDate,
  formatMonthLabel,
  isSameMonth,
  parseDateKey,
  sortServicesByStartTime,
} from "@/components/services/agenda/agenda-utils"
import { FormServiceOrder } from "@/components/services/serviceOrder/FormServiceOrder"
import { getServiceOrders, type ApiServiceOrder } from "@/services/orderServices.service"

const technicianAccentPalette = [
  "var(--primary)",
  "color-mix(in oklab, var(--chart-2) 78%, black 22%)",
  "var(--chart-5)",
  "color-mix(in oklab, var(--chart-4) 45%, black 55%)",
  "color-mix(in oklab, var(--chart-3) 58%, black 42%)",
]

const queueSpecialtyLabel: Record<AgendaQueue, string> = {
  instalacao: "Instalacao tecnica",
  manutencao: "Manutencao",
  suporte: "Suporte tecnico",
  garantia: "Atendimento em garantia",
}

type AgendaTechnicianAccumulator = {
  id: string
  name: string
  accent: string
  queueCounts: Map<AgendaQueue, number>
  base: string
  hasOpenOrders: boolean
  hasTodayOrders: boolean
}

function normalizeToken(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

function parseDateValue(value: string | null | undefined) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function formatTimeValue(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000)
}

function parseDurationToMinutes(value: string | null | undefined) {
  if (!value) return 0

  const normalized = value.replace(",", ".").trim().toLowerCase()
  if (!normalized) return 0

  const hhmmMatch = normalized.match(/^(\d{1,2}):(\d{2})$/)
  if (hhmmMatch) {
    const hours = Number.parseInt(hhmmMatch[1], 10)
    const minutes = Number.parseInt(hhmmMatch[2], 10)
    if (Number.isFinite(hours) && Number.isFinite(minutes)) return hours * 60 + minutes
  }

  const match = normalized.match(/(\d+(\.\d+)?)/)
  if (!match?.[1]) return 0

  const numeric = Number.parseFloat(match[1])
  if (!Number.isFinite(numeric) || numeric <= 0) return 0

  if (normalized.includes("min")) return Math.round(numeric)
  if (normalized.includes("h")) return Math.round(numeric * 60)

  // Sem unidade explicita: valores baixos tendem a representar horas, altos em minutos.
  return numeric > 10 ? Math.round(numeric) : Math.round(numeric * 60)
}

function resolveScheduleDate(order: ApiServiceOrder) {
  return parseDateValue(order.scheduling) ?? parseDateValue(order.term) ?? parseDateValue(order.createdAt)
}

function resolveAgendaStatus(status: ApiServiceOrder["status"]): AgendaStatus {
  if (status === "COMPLETED") return "concluido"
  if (status === "IN_PROGRESS") return "em_execucao"
  if (status === "AWAITING_PARTS") return "deslocamento"
  return "confirmado"
}

function resolveAgendaPriority(priority: ApiServiceOrder["priority"]): AgendaPriority {
  if (priority === "HIGH" || priority === "CRITICAL") return "alta"
  if (priority === "LOW") return "baixa"
  return "media"
}

function resolveAgendaQueue(order: ApiServiceOrder): AgendaQueue {
  const searchable = [
    order.title,
    order.description,
    order.service?.name,
    ...(order.services?.map((item) => item.category) ?? []),
    ...(order.services?.map((item) => item.serviceType) ?? []),
    ...(order.services?.map((item) => item.name) ?? []),
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")

  const token = normalizeToken(searchable)

  if (/garantia|warranty|rma/.test(token)) return "garantia"
  if (/instal|implant|ativac|comission|upgrade|deploy|montag/.test(token)) return "instalacao"
  if (/prevent|manut|corret|inspec|revis|auditor/.test(token)) return "manutencao"
  return "suporte"
}

function resolveTechnicianName(order: ApiServiceOrder) {
  const candidate =
    order.responsibleUser?.name?.trim() ||
    order.responsible?.trim() ||
    order.createdBy?.name?.trim() ||
    "Equipe tecnica"
  return candidate.length > 0 ? candidate : "Equipe tecnica"
}

function buildTechnicianInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)

  if (parts.length === 0) return "EQ"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function buildChecklist(order: ApiServiceOrder) {
  const fromOrderChecklist =
    order.checklist?.map((item) => item.trim()).filter((item) => item.length > 0).slice(0, 6) ?? []
  if (fromOrderChecklist.length > 0) return fromOrderChecklist

  const fromServiceItems =
    order.services
      ?.map((service) => service.name?.trim())
      .filter((item): item is string => Boolean(item && item.length > 0))
      .slice(0, 4)
      .map((item) => `Executar: ${item}`) ?? []
  if (fromServiceItems.length > 0) return fromServiceItems

  return ["Confirmar escopo com o cliente", "Registrar evidencias da execucao"]
}

function buildEquipment(order: ApiServiceOrder) {
  const serviceName = order.service?.name?.trim()
  if (serviceName) return serviceName

  const serviceItemName = order.services?.[0]?.name?.trim()
  if (serviceItemName) return serviceItemName

  const serviceCategory = order.services?.[0]?.category?.trim()
  if (serviceCategory) return serviceCategory

  const orderTitle = order.title?.trim()
  if (orderTitle) return orderTitle

  return "Equipamento nao informado"
}

function buildAddress(order: ApiServiceOrder) {
  const street = order.client?.street?.trim() || ""
  const number = order.client?.number?.trim() || ""
  const city = order.client?.city?.trim() || ""
  const state = order.client?.state?.trim() || ""
  const cityState = [city, state].filter((item) => item.length > 0).join("/")
  const addressLine = [street, number].filter((item) => item.length > 0).join(", ")
  const value = [addressLine, cityState].filter((item) => item.length > 0).join(" - ")
  return value || "Endereco nao informado"
}

function buildDistrict(order: ApiServiceOrder) {
  const neighborhood = order.client?.neighborhood?.trim()
  if (neighborhood) return neighborhood
  return order.client?.city?.trim() || "Sem bairro"
}

function getPrioritySlaMinutes(priority: ApiServiceOrder["priority"]) {
  if (priority === "CRITICAL") return 60
  if (priority === "HIGH") return 120
  if (priority === "LOW") return 480
  return 240
}

function resolveSlaMinutes(order: ApiServiceOrder, scheduleDate: Date) {
  const termDate = parseDateValue(order.term)
  if (termDate) {
    const diffMinutes = Math.round((termDate.getTime() - scheduleDate.getTime()) / 60_000)
    // Trata como SLA apenas janelas operacionais curtas. Prazos longos de entrega (dias)
    // voltam para o SLA padrao por prioridade.
    if (diffMinutes > 0 && diffMinutes <= 720) {
      return Math.max(30, diffMinutes)
    }
  }

  return getPrioritySlaMinutes(order.priority)
}

function buildAgendaFromOrders(orders: ApiServiceOrder[]) {
  const activeOrders = orders.filter((order) => order.status !== "CANCELED")
  const todayKey = formatDateKey(new Date())
  const techniciansByName = new Map<string, AgendaTechnicianAccumulator>()

  for (const order of activeOrders) {
    const technicianName = resolveTechnicianName(order)
    const technicianKey = normalizeToken(technicianName)

    let accumulator = techniciansByName.get(technicianKey)
    if (!accumulator) {
      const index = techniciansByName.size
      accumulator = {
        id: `tec-${String(index + 1).padStart(2, "0")}`,
        name: technicianName,
        accent: technicianAccentPalette[index % technicianAccentPalette.length],
        queueCounts: new Map<AgendaQueue, number>(),
        base: order.client?.city?.trim() || "Base operacional",
        hasOpenOrders: false,
        hasTodayOrders: false,
      }
      techniciansByName.set(technicianKey, accumulator)
    }

    const queue = resolveAgendaQueue(order)
    accumulator.queueCounts.set(queue, (accumulator.queueCounts.get(queue) ?? 0) + 1)

    if (order.client?.city?.trim()) {
      accumulator.base = order.client.city.trim()
    }

    const isOpenStatus = order.status !== "COMPLETED" && order.status !== "CANCELED"
    if (isOpenStatus) {
      accumulator.hasOpenOrders = true
    }

    const scheduleDate = resolveScheduleDate(order)
    if (isOpenStatus && scheduleDate && formatDateKey(scheduleDate) === todayKey) {
      accumulator.hasTodayOrders = true
    }
  }

  const technicians: AgendaTechnician[] = Array.from(techniciansByName.values())
    .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"))
    .map((technician) => {
      let dominantQueue: AgendaQueue = "suporte"
      let dominantCount = -1

      for (const [queue, count] of technician.queueCounts.entries()) {
        if (count > dominantCount) {
          dominantQueue = queue
          dominantCount = count
        }
      }

      const availability: AgendaTechnicianAvailability = technician.hasTodayOrders
        ? "em_rota"
        : technician.hasOpenOrders
          ? "disponivel"
          : "folga"

      return {
        id: technician.id,
        name: technician.name,
        initials: buildTechnicianInitials(technician.name),
        specialty: queueSpecialtyLabel[dominantQueue],
        base: technician.base,
        availability,
        accent: technician.accent,
        accentForeground: "var(--primary-foreground)",
      }
    })

  const technicianIdByNameKey = new Map<string, string>()
  for (const technician of technicians) {
    technicianIdByNameKey.set(normalizeToken(technician.name), technician.id)
  }

  const services: AgendaService[] = activeOrders
    .map((order) => {
      const scheduleDate = resolveScheduleDate(order)
      if (!scheduleDate) return null

      const technicianName = resolveTechnicianName(order)
      const technicianId = technicianIdByNameKey.get(normalizeToken(technicianName))
      if (!technicianId) return null

      const serviceDurationByItems =
        order.services?.reduce((accumulator, item) => {
          return accumulator + parseDurationToMinutes(item.estimatedDuration)
        }, 0) ?? 0
      const fallbackDuration = parseDurationToMinutes(order.services?.[0]?.estimatedDuration) || 90
      const estimateMinutes = Math.max(30, serviceDurationByItems > 0 ? serviceDurationByItems : fallbackDuration)

      const slaMinutes = resolveSlaMinutes(order, scheduleDate)

      return {
        id: order.code?.trim() || order.id,
        title: order.title?.trim() || order.service?.name?.trim() || `OS ${order.code?.trim() || order.id}`,
        client: order.client?.name?.trim() || "Cliente nao informado",
        date: formatDateKey(scheduleDate),
        startTime: formatTimeValue(scheduleDate),
        endTime: formatTimeValue(addMinutes(scheduleDate, estimateMinutes)),
        address: buildAddress(order),
        district: buildDistrict(order),
        technicianId,
        status: resolveAgendaStatus(order.status),
        priority: resolveAgendaPriority(order.priority),
        queue: resolveAgendaQueue(order),
        equipment: buildEquipment(order),
        checklist: buildChecklist(order),
        slaMinutes,
        estimateMinutes,
      }
    })
    .filter((service): service is AgendaService => Boolean(service))

  const orderCodes = orders
    .map((order) => order.code?.trim())
    .filter((code): code is string => Boolean(code && code.length > 0))

  return {
    technicians,
    services,
    orderCodes: Array.from(new Set(orderCodes)),
  }
}

export function TechnicalAgendaWorkspace() {
  const [selectedQueue, setSelectedQueue] = useState<AgendaQueueFilter>("todos")
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState<string[]>([])
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [selectedDateKey, setSelectedDateKey] = useState(() => formatDateKey(new Date()))
  const [isDayServicesModalOpen, setIsDayServicesModalOpen] = useState(false)
  const [isTeamFilterModalOpen, setIsTeamFilterModalOpen] = useState(false)
  const [isServiceOrderFormOpen, setIsServiceOrderFormOpen] = useState(false)
  const [serviceOrderScheduledAt, setServiceOrderScheduledAt] = useState<string | undefined>(undefined)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)
  const [isLoadingAgenda, setIsLoadingAgenda] = useState(false)
  const [technicians, setTechnicians] = useState<AgendaTechnician[]>([])
  const [services, setServices] = useState<AgendaService[]>([])
  const [orderCodes, setOrderCodes] = useState<string[]>([])

  const loadAgendaData = useCallback(async () => {
    setIsLoadingAgenda(true)

    try {
      const response = await getServiceOrders()
      const mappedAgenda = buildAgendaFromOrders(response.data)
      setTechnicians(mappedAgenda.technicians)
      setServices(mappedAgenda.services)
      setOrderCodes(mappedAgenda.orderCodes)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel carregar a agenda de servicos."
      setFeedback(ComponentAlert.Error(message))
      setTechnicians([])
      setServices([])
      setOrderCodes([])
    } finally {
      setIsLoadingAgenda(false)
    }
  }, [])

  useEffect(() => {
    void loadAgendaData()
  }, [loadAgendaData])

  useEffect(() => {
    const validIds = new Set(technicians.map((technician) => technician.id))
    setSelectedTechnicianIds((previous) => previous.filter((id) => validIds.has(id)))
  }, [technicians])

  const monthLabel = useMemo(() => formatMonthLabel(currentMonth), [currentMonth])
  const monthCells = useMemo(() => buildCalendarMonth(currentMonth), [currentMonth])

  const todayKey = formatDateKey(new Date())

  const queueScopedServices = useMemo(() => {
    return services.filter((service) => {
      if (selectedQueue === "todos") return true
      if (selectedQueue === "criticos") return service.priority === "alta" || service.slaMinutes <= 120
      return service.queue === selectedQueue
    })
  }, [services, selectedQueue])

  const visibleServices = useMemo(() => {
    return queueScopedServices.filter((service) => {
      if (selectedTechnicianIds.length === 0) return true
      return selectedTechnicianIds.includes(service.technicianId)
    })
  }, [queueScopedServices, selectedTechnicianIds])

  const servicesByDate = useMemo(() => {
    const grouped = new Map<string, AgendaService[]>()

    for (const service of visibleServices) {
      const existing = grouped.get(service.date)

      if (existing) {
        existing.push(service)
        continue
      }

      grouped.set(service.date, [service])
    }

    for (const [dateKey, groupedServices] of grouped.entries()) {
      grouped.set(dateKey, sortServicesByStartTime(groupedServices))
    }

    return grouped
  }, [visibleServices])

  const selectedDate = useMemo(() => parseDateKey(selectedDateKey), [selectedDateKey])
  const selectedDateLabel = useMemo(() => formatLongDate(selectedDate), [selectedDate])

  const selectedDayServices = useMemo(() => {
    return servicesByDate.get(selectedDateKey) ?? []
  }, [servicesByDate, selectedDateKey])

  const monthServices = useMemo(() => {
    return visibleServices.filter((service) => {
      return isSameMonth(parseDateKey(service.date), currentMonth)
    })
  }, [visibleServices, currentMonth])

  const todayServices = useMemo(() => {
    return visibleServices.filter((service) => service.date === todayKey)
  }, [visibleServices, todayKey])

  const criticalToday = useMemo(() => {
    return todayServices.filter((service) => service.priority === "alta").length
  }, [todayServices])

  const completedToday = useMemo(() => {
    return todayServices.filter((service) => service.status === "concluido").length
  }, [todayServices])

  const fieldTechnicians = useMemo(() => {
    return technicians.filter((technician) => technician.availability === "em_rota").length
  }, [technicians])

  const techniciansById = useMemo(() => {
    return new Map(technicians.map((technician) => [technician.id, technician]))
  }, [technicians])

  const activeTechnicians = useMemo(() => {
    if (selectedTechnicianIds.length === 0) return technicians
    return technicians.filter((technician) => selectedTechnicianIds.includes(technician.id))
  }, [technicians, selectedTechnicianIds])

  const selectedTechnicianLabel = useMemo(() => {
    if (selectedTechnicianIds.length === 0) return "Todos os tecnicos"
    if (selectedTechnicianIds.length === 1) {
      return techniciansById.get(selectedTechnicianIds[0])?.name ?? "1 tecnico selecionado"
    }
    return `${selectedTechnicianIds.length} tecnicos selecionados`
  }, [selectedTechnicianIds, techniciansById])

  const technicianLoad = useMemo(() => {
    const grouped = new Map<
      string,
      {
        monthCount: number
        todayCount: number
      }
    >()

    for (const technician of technicians) {
      grouped.set(technician.id, {
        monthCount: 0,
        todayCount: 0,
      })
    }

    for (const service of queueScopedServices) {
      const technicianStats = grouped.get(service.technicianId)
      if (!technicianStats) continue

      if (isSameMonth(parseDateKey(service.date), currentMonth)) {
        technicianStats.monthCount += 1
      }

      if (service.date === todayKey) {
        technicianStats.todayCount += 1
      }
    }

    return grouped
  }, [technicians, queueScopedServices, currentMonth, todayKey])

  function handleChangeMonth(offset: number) {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1)
    setCurrentMonth(nextMonth)

    if (!isSameMonth(selectedDate, nextMonth)) {
      setSelectedDateKey(formatDateKey(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1)))
    }
  }

  function handleJumpToToday() {
    const today = new Date()
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDateKey(formatDateKey(today))
  }

  function handleSelectCalendarDate(dateKey: string) {
    setSelectedDateKey(dateKey)
    setIsDayServicesModalOpen(true)
  }

  function handleOpenNewServiceForm() {
    setServiceOrderScheduledAt(`${selectedDateKey}T09:00`)
    setIsDayServicesModalOpen(false)
    setIsServiceOrderFormOpen(true)
  }

  function handleCloseNewServiceForm() {
    setIsServiceOrderFormOpen(false)
    setServiceOrderScheduledAt(undefined)
  }

  return (
    <div className="relative space-y-6 overflow-hidden pb-4">
      <FormServiceOrder
        open={isServiceOrderFormOpen}
        onClose={handleCloseNewServiceForm}
        existingCodes={orderCodes}
        initialScheduledAt={serviceOrderScheduledAt}
        onCreated={() => {
          handleCloseNewServiceForm()
          void loadAgendaData()
        }}
        onFeedback={setFeedback}
      />

      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-1/4 h-72 w-72 rounded-full bg-accent/80 blur-3xl" />

      <div className="relative space-y-6">
        <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

        <AgendaHero
          monthLabel={monthLabel}
          totalMonthServices={monthServices.length}
          todayServices={todayServices.length}
          criticalToday={criticalToday}
          completedToday={completedToday}
          fieldTechnicians={fieldTechnicians}
        />

        <AgendaTopControls
          filters={agendaQueueFilters}
          selectedFilter={selectedQueue}
          onFilterChange={setSelectedQueue}
          selectedTechnicianLabel={selectedTechnicianLabel}
          visibleServicesCount={visibleServices.length}
          onOpenTeamFilter={() => setIsTeamFilterModalOpen(true)}
          onJumpToToday={handleJumpToToday}
        />

        {isLoadingAgenda ? (
          <div className="rounded-xl border border-border/70 bg-card/85 px-4 py-2 text-sm text-muted-foreground">
            Carregando agenda a partir das ordens de servico...
          </div>
        ) : null}

        <AgendaCalendarBoard
          monthLabel={monthLabel}
          cells={monthCells}
          selectedDateKey={selectedDateKey}
          onSelectDate={handleSelectCalendarDate}
          onPreviousMonth={() => handleChangeMonth(-1)}
          onNextMonth={() => handleChangeMonth(1)}
          servicesByDate={servicesByDate}
          techniciansById={techniciansById}
          activeTechnicians={activeTechnicians}
        />
      </div>

      <AgendaDayServicesModal
        open={isDayServicesModalOpen}
        onClose={() => setIsDayServicesModalOpen(false)}
        selectedDateLabel={selectedDateLabel}
        services={selectedDayServices}
        techniciansById={techniciansById}
        onAddService={handleOpenNewServiceForm}
      />

      <AgendaTeamFilterModal
        open={isTeamFilterModalOpen}
        onClose={() => setIsTeamFilterModalOpen(false)}
        technicians={technicians}
        selectedTechnicianIds={selectedTechnicianIds}
        onChangeSelectedTechnicians={setSelectedTechnicianIds}
        technicianLoad={technicianLoad}
      />
    </div>
  )
}
