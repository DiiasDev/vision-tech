"use client"

import { useMemo, useState } from "react"
import { Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type GenericFieldOption = {
  label: string
  value: string
}

export type GenericField = {
  name: string
  label: string
  type: "text" | "email" | "tel" | "number" | "date" | "datetime-local" | "datetime" | "select" | "textarea"
  placeholder?: string
  required?: boolean
  options?: GenericFieldOption[]
  description?: string
  colSpan?: 1 | 2 | 3
  defaultValue?: string
}

type GenericFormProps = {
  title: string
  description?: string
  fields: GenericField[]
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  scrollable?: boolean
  values?: Record<string, string>
  onValuesChange?: (values: Record<string, string>) => void
  onHeaderClose?: () => void
  footer?: React.ReactNode
  className?: string
  onCancel?: () => void
  onSubmit: (values: Record<string, string>) => Promise<void> | void
}

function buildInitialValues(fields: GenericField[]) {
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.name] = field.defaultValue ?? ""
    return acc
  }, {})
}

export default function FormComponent({
  title,
  description,
  fields,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  loading = false,
  scrollable = false,
  values: controlledValues,
  onValuesChange,
  onHeaderClose,
  footer,
  className,
  onCancel,
  onSubmit,
}: GenericFormProps) {
  const initialValues = useMemo(() => buildInitialValues(fields), [fields])
  const [internalValues, setInternalValues] = useState<Record<string, string>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const values = controlledValues ?? internalValues

  function handleValueChange(fieldName: string, value: string) {
    const nextValues = { ...values, [fieldName]: value }
    if (controlledValues) {
      onValuesChange?.(nextValues)
    } else {
      setInternalValues(nextValues)
    }

    setErrors((prev) => {
      if (!prev[fieldName]) return prev
      const next = { ...prev }
      delete next[fieldName]
      return next
    })
  }

  function validate() {
    const validationErrors: Record<string, string> = {}

    for (const field of fields) {
      if (!field.required) continue
      const value = values[field.name]?.trim()
      if (!value) {
        validationErrors[field.name] = "Campo obrigatorio."
      }
    }

    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return
    await onSubmit(values)
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/70 bg-gradient-to-b from-background/90 to-muted/25 shadow-xl",
        scrollable && "flex max-h-full flex-col",
        className
      )}
    >
      <CardHeader className="border-b border-border/70 bg-muted/20">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-xl tracking-tight">{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {onHeaderClose ? (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-full border-border/70 bg-background/75"
              onClick={onHeaderClose}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className={cn("p-5 sm:p-6", scrollable && "min-h-0 flex-1")}>
        <form
          onSubmit={handleSubmit}
          className={cn("space-y-6", scrollable && "flex h-full flex-col")}
        >
          <div
            className={cn(
              "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
              scrollable && "min-h-0 flex-1 overflow-y-auto pr-2"
            )}
          >
            {fields.map((field) => {
              const fieldError = errors[field.name]

              return (
                <div
                  key={field.name}
                  className={cn(
                    "space-y-2",
                    field.colSpan === 2 && "md:col-span-2",
                    field.colSpan === 3 && "xl:col-span-3 md:col-span-2"
                  )}
                >
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    {field.label}
                    {field.required ? " *" : ""}
                  </Label>

                  {field.type === "select" ? (
                    <Select
                      value={values[field.name] ?? ""}
                      onValueChange={(value) => handleValueChange(field.name, value)}
                      disabled={loading}
                    >
                      <SelectTrigger
                        id={field.name}
                        className={cn(
                          "h-10 rounded-xl border-border/70 bg-background/65",
                          fieldError && "border-destructive/60"
                        )}
                      >
                        <SelectValue placeholder={field.placeholder ?? "Selecione..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "datetime" ? (
                    <DateTimePicker
                      value={values[field.name] ?? ""}
                      onChange={(value) => handleValueChange(field.name, value)}
                      placeholder={field.placeholder}
                      disabled={loading}
                      className={cn(fieldError && "border-destructive/60")}
                    />
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      placeholder={field.placeholder}
                      value={values[field.name] ?? ""}
                      onChange={(event) => handleValueChange(field.name, event.target.value)}
                      disabled={loading}
                      className={cn(
                        "min-h-24 rounded-xl border-border/70 bg-background/65",
                        fieldError && "border-destructive/60"
                      )}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={values[field.name] ?? ""}
                      onChange={(event) => handleValueChange(field.name, event.target.value)}
                      disabled={loading}
                      className={cn(
                        "h-10 rounded-xl border-border/70 bg-background/65",
                        fieldError && "border-destructive/60"
                      )}
                    />
                  )}

                  {field.description ? (
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  ) : null}

                  {fieldError ? (
                    <p className="text-xs font-medium text-destructive">{fieldError}</p>
                  ) : null}
                </div>
              )
            })}
          </div>

          {footer ? (
            footer
          ) : (
            <div className="flex flex-wrap justify-end gap-2">
              {onCancel ? (
                <Button type="button" variant="outline" className="rounded-xl" onClick={onCancel} disabled={loading}>
                  {cancelLabel}
                </Button>
              ) : null}
              <Button type="submit" className="rounded-xl" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitLabel}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
