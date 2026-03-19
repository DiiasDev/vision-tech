"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DatePickerProps = {
  id?: string
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  className?: string
}

function parseDateOnly(value?: string) {
  if (!value?.trim()) return null

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (match) {
    const year = Number.parseInt(match[1] ?? "0", 10)
    const month = Number.parseInt(match[2] ?? "0", 10)
    const day = Number.parseInt(match[3] ?? "0", 10)
    const parsed = new Date(year, month - 1, day)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const fallback = new Date(value)
  if (Number.isNaN(fallback.getTime())) return null
  return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate())
}

function toDateOnly(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Selecionar data",
  disabled,
  readOnly,
  className,
}: DatePickerProps) {
  const selectedDate = useMemo(() => parseDateOnly(value), [value])
  const isDisabled = disabled || readOnly

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={isDisabled}
          className={cn(
            "h-10 w-full justify-start rounded-xl border-border/70 bg-background/65 px-3 text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {selectedDate ? format(selectedDate, "dd/MM/yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-xl border-border/70 p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate ?? undefined}
          onSelect={(day) => onChange(day ? toDateOnly(day) : "")}
        />
      </PopoverContent>
    </Popover>
  )
}
