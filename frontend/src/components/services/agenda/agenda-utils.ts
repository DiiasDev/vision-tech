import type { AgendaService } from "@/components/services/agenda/agenda-types"

export type AgendaCalendarCell = {
  date: Date
  dateKey: string
  isCurrentMonth: boolean
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map((value) => Number.parseInt(value, 10))
  return new Date(year, month - 1, day)
}

export function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function buildCalendarMonth(monthReference: Date): AgendaCalendarCell[] {
  const firstDay = new Date(monthReference.getFullYear(), monthReference.getMonth(), 1)
  const mondayIndex = (firstDay.getDay() + 6) % 7
  const firstVisibleDay = addDays(firstDay, -mondayIndex)

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(firstVisibleDay, index)

    return {
      date,
      dateKey: formatDateKey(date),
      isCurrentMonth:
        date.getMonth() === monthReference.getMonth() && date.getFullYear() === monthReference.getFullYear(),
    }
  })
}

export function toTimeValue(time: string) {
  const [hours, minutes] = time.split(":").map((value) => Number.parseInt(value, 10))
  return hours * 60 + minutes
}

export function sortServicesByStartTime(services: AgendaService[]) {
  return [...services].sort((left, right) => toTimeValue(left.startTime) - toTimeValue(right.startTime))
}

export function formatMonthLabel(date: Date) {
  const label = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })

  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatLongDate(date: Date) {
  const label = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })

  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  if (hours <= 0) return `${remainder} min`
  if (remainder <= 0) return `${hours}h`

  return `${hours}h ${String(remainder).padStart(2, "0")}m`
}

export function isSameMonth(date: Date, monthReference: Date) {
  return date.getMonth() === monthReference.getMonth() && date.getFullYear() === monthReference.getFullYear()
}
