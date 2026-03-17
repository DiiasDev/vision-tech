"use client"

import { Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type TableFieldOption<FieldKey extends string = string> = {
  key: FieldKey
  label: string
}

type TableFieldSelectorProps<FieldKey extends string = string> = {
  fields: ReadonlyArray<TableFieldOption<FieldKey>>
  selectedFields: ReadonlyArray<FieldKey>
  onSelectionChange: (fields: FieldKey[]) => void
  maxSelected?: number
  minSelected?: number
  title?: string
  description?: string
}

export function TableFieldSelector<FieldKey extends string = string>({
  fields,
  selectedFields,
  onSelectionChange,
  maxSelected = 8,
  minSelected = 1,
  title = "Campos visíveis",
  description = "Selecione os campos exibidos na tabela.",
}: TableFieldSelectorProps<FieldKey>) {
  function handleToggle(fieldKey: FieldKey, checked: boolean) {
    const selected = new Set(selectedFields)
    const isSelected = selected.has(fieldKey)

    if (checked) {
      if (isSelected) return
      if (selected.size >= maxSelected) return
      selected.add(fieldKey)
      onSelectionChange(Array.from(selected))
      return
    }

    if (!isSelected) return
    if (selected.size <= minSelected) return
    selected.delete(fieldKey)
    onSelectionChange(Array.from(selected))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 rounded-lg"
          aria-label="Configurar colunas da tabela"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 rounded-xl p-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
          <p className="text-xs text-muted-foreground">
            {selectedFields.length}/{maxSelected} selecionados
          </p>
        </div>

        <div className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {fields.map((field) => {
            const isSelected = selectedFields.includes(field.key)
            const limitReached = selectedFields.length >= maxSelected
            const minLimitReached = selectedFields.length <= minSelected
            const disabled = (!isSelected && limitReached) || (isSelected && minLimitReached)

            return (
              <label
                key={field.key}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
              >
                <Checkbox
                  checked={isSelected}
                  disabled={disabled}
                  onCheckedChange={(checked) => handleToggle(field.key, Boolean(checked))}
                  aria-label={`Exibir campo ${field.label}`}
                  className="border-primary/45"
                />
                <span className="text-sm">{field.label}</span>
              </label>
            )
          })}
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          Limite de {maxSelected} campos para manter legibilidade da tabela.
        </p>
      </PopoverContent>
    </Popover>
  )
}
