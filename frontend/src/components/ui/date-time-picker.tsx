"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { CalendarClock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type DateTimePickerProps = {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

function parseDateTime(value?: string) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function buildDateTimeString(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Selecionar data e hora",
  disabled,
  className,
}: DateTimePickerProps) {
  const selectedDateTime = useMemo(() => parseDateTime(value), [value])
  const hour = selectedDateTime ? String(selectedDateTime.getHours()).padStart(2, "0") : "09"
  const minute = selectedDateTime ? String(selectedDateTime.getMinutes()).padStart(2, "0") : "00"

  function updateDate(nextDate: Date) {
    const base = selectedDateTime ?? new Date()
    const merged = new Date(nextDate)
    merged.setHours(base.getHours(), base.getMinutes(), 0, 0)
    onChange(buildDateTimeString(merged))
  }

  function updateTime(nextHour: string, nextMinute: string) {
    const base = selectedDateTime ?? new Date()
    const merged = new Date(base)
    merged.setHours(Number.parseInt(nextHour, 10), Number.parseInt(nextMinute, 10), 0, 0)
    onChange(buildDateTimeString(merged))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-start rounded-xl border-border/70 bg-background/65 px-3 text-left font-normal",
            !selectedDateTime && "text-muted-foreground",
            className
          )}
        >
          <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
          {selectedDateTime ? format(selectedDateTime, "dd/MM/yyyy 'as' HH:mm") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-xl border-border/70 p-0" align="start">
        <div className="border-b border-border/70 p-2">
          <Calendar mode="single" selected={selectedDateTime ?? undefined} onSelect={(day) => day && updateDate(day)} />
        </div>
        <div className="grid grid-cols-2 gap-2 p-3">
          <Select value={hour} onValueChange={(nextHour) => updateTime(nextHour, minute)}>
            <SelectTrigger className="h-9 rounded-lg border-border/70 bg-background/60">
              <SelectValue placeholder="Hora" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, index) => {
                const hourValue = String(index).padStart(2, "0")
                return (
                  <SelectItem key={hourValue} value={hourValue}>
                    {hourValue}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          <Select value={minute} onValueChange={(nextMinute) => updateTime(hour, nextMinute)}>
            <SelectTrigger className="h-9 rounded-lg border-border/70 bg-background/60">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 60 }, (_, index) => {
                const minuteValue = String(index).padStart(2, "0")
                return (
                  <SelectItem key={minuteValue} value={minuteValue}>
                    {minuteValue}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}
