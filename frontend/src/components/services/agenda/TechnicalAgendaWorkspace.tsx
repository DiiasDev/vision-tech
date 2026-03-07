"use client"

import { useMemo, useState } from "react"

import { AgendaCalendarBoard } from "@/components/services/agenda/AgendaCalendarBoard"
import { AgendaDayServicesModal } from "@/components/services/agenda/AgendaDayServicesModal"
import { AgendaHero } from "@/components/services/agenda/AgendaHero"
import { AgendaTeamFilterModal } from "@/components/services/agenda/AgendaTeamFilterModal"
import { AgendaTopControls } from "@/components/services/agenda/AgendaTopControls"
import {
  agendaQueueFilters,
  createAgendaMockData,
} from "@/components/services/agenda/agenda-mock-data"
import type {
  AgendaQueueFilter,
  AgendaService,
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

export function TechnicalAgendaWorkspace() {
  const [selectedQueue, setSelectedQueue] = useState<AgendaQueueFilter>("todos")
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState<string[]>([])
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [selectedDateKey, setSelectedDateKey] = useState(() => formatDateKey(new Date()))
  const [isDayServicesModalOpen, setIsDayServicesModalOpen] = useState(false)
  const [isTeamFilterModalOpen, setIsTeamFilterModalOpen] = useState(false)

  const { technicians, services } = useMemo(() => createAgendaMockData(new Date()), [])

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
      <div className="pointer-events-none absolute -left-24 top-32 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative mx-auto w-full space-y-6 px-4 py-5 md:px-6 md:py-6 xl:px-8 xl:py-8">
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
