"use client"

import { useMemo, useState } from "react"
import { Asterisk, ImagePlus, Loader2, Sparkles, Upload, X } from "lucide-react"
import Image from "next/image"

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
  type: "text" | "email" | "tel" | "number" | "date" | "datetime-local" | "datetime" | "select" | "textarea" | "file"
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
  accept?: string
  section?: string
  sectionDescription?: string
  autoFilled?: boolean
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

function buildSections(fields: GenericField[]) {
  const sections = new Map<
    string,
    {
      title: string
      description?: string
      fields: GenericField[]
    }
  >()

  for (const field of fields) {
    const title = field.section ?? "default"

    if (!sections.has(title)) {
      sections.set(title, {
        title,
        description: field.sectionDescription,
        fields: [],
      })
    }

    const current = sections.get(title)
    if (!current) continue
    if (!current.description && field.sectionDescription) {
      current.description = field.sectionDescription
    }
    current.fields.push(field)
  }

  return Array.from(sections.values())
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
  const sections = useMemo(() => buildSections(fields), [fields])
  const showSectionHeader = useMemo(
    () => sections.some((section) => section.title !== "default") || sections.length > 1,
    [sections]
  )
  const [internalValues, setInternalValues] = useState<Record<string, string>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeDropField, setActiveDropField] = useState<string | null>(null)
  const values = controlledValues ?? internalValues
  const requiredCount = useMemo(() => fields.filter((field) => field.required).length, [fields])
  const autoFieldCount = useMemo(() => fields.filter((field) => field.autoFilled).length, [fields])

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

  function handleFileChange(fieldName: string, file: File | null) {
    if (!file) {
      handleValueChange(fieldName, "")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      handleValueChange(fieldName, result)
    }
    reader.readAsDataURL(file)
  }

  function handleFileDrop(fieldName: string, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    setActiveDropField(null)

    const file = event.dataTransfer.files?.[0] ?? null
    handleFileChange(fieldName, file)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return
    await onSubmit(values)
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-border bg-card shadow-2xl",
        scrollable && "flex max-h-full flex-col",
        className
      )}
    >
      <CardHeader className="border-b border-border bg-card">
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
              className="rounded-full border-border bg-muted"
              onClick={onHeaderClose}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-4 p-5 sm:p-6", scrollable && "min-h-0 flex-1")}>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/35 px-3 py-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 font-medium">
            <Asterisk className="h-3 w-3 text-primary" />
            {requiredCount} campo(s) obrigatorio(s)
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 font-medium">
            <Sparkles className="h-3 w-3 text-primary" />
            {autoFieldCount} campo(s) automatico(s)
          </span>
          <span className="text-muted-foreground">Campos com * sao obrigatorios.</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className={cn("space-y-6", scrollable && "flex h-full flex-col")}
        >
          <div className={cn("form-scrollbar space-y-5", scrollable && "min-h-0 flex-1 overflow-y-scroll pr-2 pb-24")}>
            {sections.map((section) => (
              <section key={section.title} className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                {showSectionHeader ? (
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{section.title === "default" ? "Informacoes" : section.title}</h3>
                    {section.description ? <p className="text-xs text-muted-foreground">{section.description}</p> : null}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {section.fields.map((field) => {
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
                        <div className="flex items-center gap-2">
                          <Label htmlFor={field.name} className="text-sm font-medium">
                            {field.label}
                            {field.required ? " *" : ""}
                          </Label>
                          {field.autoFilled ? (
                            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                              Automatico
                            </span>
                          ) : null}
                        </div>

                        {field.type === "select" ? (
                          <Select
                            value={values[field.name] ?? ""}
                            onValueChange={(value) => handleValueChange(field.name, value)}
                            disabled={loading || field.disabled}
                          >
                            <SelectTrigger
                              id={field.name}
                              className={cn(
                                "h-11 rounded-xl border-border bg-background/95 text-foreground shadow-none disabled:opacity-100",
                                (field.readOnly || field.autoFilled) &&
                                  "border-border/90 bg-muted/85 text-foreground/75",
                                fieldError && "border-destructive/70"
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
                            disabled={loading || field.disabled}
                            className={cn(
                              "h-11 rounded-xl border-border bg-background/95 text-foreground shadow-none disabled:opacity-100",
                              (field.readOnly || field.autoFilled) &&
                                "border-border/90 bg-muted/85 text-foreground/75",
                              fieldError && "border-destructive/70"
                            )}
                          />
                        ) : field.type === "textarea" ? (
                          <Textarea
                            id={field.name}
                            placeholder={field.placeholder}
                            value={values[field.name] ?? ""}
                            onChange={(event) => handleValueChange(field.name, event.target.value)}
                            disabled={loading || field.disabled}
                            readOnly={field.readOnly}
                            className={cn(
                              "min-h-24 rounded-xl border-border bg-background/95 text-foreground shadow-none disabled:opacity-100 disabled:text-foreground/85",
                              (field.readOnly || field.autoFilled) &&
                                "border-border/90 bg-muted/85 text-foreground/75",
                              fieldError && "border-destructive/70"
                            )}
                          />
                        ) : field.type === "file" ? (
                          <div
                            className={cn(
                              "relative space-y-3 rounded-2xl border border-dashed border-border bg-muted/25 p-4 transition-colors",
                              activeDropField === field.name && "border-primary bg-primary/5"
                            )}
                            onDragOver={(event) => {
                              event.preventDefault()
                              setActiveDropField(field.name)
                            }}
                            onDragLeave={() => setActiveDropField((prev) => (prev === field.name ? null : prev))}
                            onDrop={(event) => handleFileDrop(field.name, event)}
                          >
                            <Input
                              id={field.name}
                              type="file"
                              accept={field.accept ?? "image/*"}
                              className="hidden"
                              disabled={loading || field.disabled}
                              onChange={(event) => handleFileChange(field.name, event.target.files?.[0] ?? null)}
                            />

                            {values[field.name] ? (
                              <div className="relative overflow-hidden rounded-xl border border-border bg-background">
                                <Image
                                  src={values[field.name]}
                                  alt="Preview da imagem do produto"
                                  width={1200}
                                  height={640}
                                  unoptimized
                                  className="h-40 w-full object-cover"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="absolute right-2 top-2 h-8 rounded-lg bg-background/90"
                                  onClick={() => handleValueChange(field.name, "")}
                                  disabled={loading || field.disabled}
                                >
                                  Remover
                                </Button>
                              </div>
                            ) : (
                              <label
                                htmlFor={field.name}
                                className={cn(
                                  "flex h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background text-center transition-colors hover:bg-muted/35",
                                  (loading || field.disabled) && "pointer-events-none opacity-60"
                                )}
                              >
                                <div className="mb-3 rounded-full border border-border bg-muted p-3">
                                  <Upload className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-base font-medium text-foreground">Arraste e solte ou clique para selecionar</p>
                                <p className="mt-1 text-sm text-muted-foreground">Tipos suportados: PNG, JPG, WEBP</p>
                                <p className="mt-3 inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium">
                                  <ImagePlus className="h-3.5 w-3.5" />
                                  Fixar imagem
                                </p>
                              </label>
                            )}
                          </div>
                        ) : (
                          <Input
                            id={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={values[field.name] ?? ""}
                            onChange={(event) => handleValueChange(field.name, event.target.value)}
                            disabled={loading || field.disabled}
                            readOnly={field.readOnly}
                            className={cn(
                              "h-11 rounded-xl border-border bg-background/95 text-foreground shadow-none disabled:opacity-100 disabled:text-foreground/85",
                              (field.readOnly || field.autoFilled) &&
                                "border-border/90 bg-muted/85 text-foreground/75",
                              fieldError && "border-destructive/70"
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
              </section>
            ))}
          </div>

          {footer ? (
            footer
          ) : (
            <div className="sticky bottom-0 z-20 -mx-5 -mb-5 flex flex-wrap justify-end gap-2 border-t border-border bg-card/98 px-5 py-3 sm:-mx-6 sm:-mb-6 sm:px-6">
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
