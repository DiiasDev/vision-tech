"use client"

import { useMemo, useState } from "react"
import { Asterisk, ImagePlus, Loader2, Sparkles, Upload, X } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
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
  type:
    | "text"
    | "email"
    | "tel"
    | "number"
    | "date"
    | "date-picker"
    | "datetime-local"
    | "datetime"
    | "select"
    | "multiselect"
    | "textarea"
    | "file"
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

export type GenericFormStep = {
  key: string
  title: string
  description?: string
  sections?: string[]
  sectionPrefixes?: string[]
  submitLabel?: string
}

type GenericFormProps = {
  title: string
  description?: string
  fields: GenericField[]
  steps?: GenericFormStep[]
  renderStepHeaderActions?: (context: {
    step: GenericFormStep
    stepIndex: number
    totalSteps: number
  }) => React.ReactNode
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

function parseMultiSelectValue(value: string | undefined) {
  if (!value?.trim()) return []
  return value
    .split("|")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function stepMatchesSection(step: GenericFormStep, sectionTitle: string) {
  const normalizedSection = sectionTitle.trim()
  const hasExactSections = Array.isArray(step.sections) && step.sections.length > 0
  const hasSectionPrefixes = Array.isArray(step.sectionPrefixes) && step.sectionPrefixes.length > 0

  if (!hasExactSections && !hasSectionPrefixes) return true

  const exactMatch = hasExactSections && step.sections?.includes(normalizedSection)
  const prefixMatch =
    hasSectionPrefixes && step.sectionPrefixes?.some((prefix) => normalizedSection.startsWith(prefix.trim()))

  return Boolean(exactMatch || prefixMatch)
}

export default function FormComponent({
  title,
  description,
  fields,
  steps,
  renderStepHeaderActions,
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
  const formSteps = useMemo(() => steps ?? [], [steps])
  const isStepMode = formSteps.length > 0
  const [internalValues, setInternalValues] = useState<Record<string, string>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeDropField, setActiveDropField] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const values = controlledValues ?? internalValues
  const requiredCount = useMemo(() => fields.filter((field) => field.required).length, [fields])
  const autoFieldCount = useMemo(() => fields.filter((field) => field.autoFilled).length, [fields])
  const effectiveStepIndex = isStepMode ? Math.min(stepIndex, Math.max(formSteps.length - 1, 0)) : 0
  const currentStep = isStepMode ? formSteps[effectiveStepIndex] : null

  const visibleSections = useMemo(() => {
    if (!currentStep) return sections
    return sections.filter((section) => stepMatchesSection(currentStep, section.title))
  }, [currentStep, sections])

  const showSectionHeader = useMemo(
    () => visibleSections.some((section) => section.title !== "default") || visibleSections.length > 1,
    [visibleSections]
  )
  const shouldShowSectionHeader = isStepMode ? visibleSections.length > 1 : showSectionHeader
  const currentStepFields = useMemo(
    () => visibleSections.flatMap((section) => section.fields),
    [visibleSections]
  )
  const currentStepFieldNames = useMemo(
    () => new Set(currentStepFields.map((field) => field.name)),
    [currentStepFields]
  )
  const isLastStep = !isStepMode || effectiveStepIndex === formSteps.length - 1
  const primaryActionLabel = isStepMode
    ? isLastStep
      ? currentStep?.submitLabel ?? submitLabel
      : "Proximo"
    : submitLabel
  const secondaryActionLabel = isStepMode && effectiveStepIndex > 0 ? "Voltar" : cancelLabel
  const stepHeaderActions = currentStep
    ? renderStepHeaderActions?.({
        step: currentStep,
        stepIndex: effectiveStepIndex,
        totalSteps: formSteps.length,
      })
    : null

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

  function validate(fieldNames?: Set<string>) {
    const validationErrors: Record<string, string> = {}

    for (const field of fields) {
      if (fieldNames && !fieldNames.has(field.name)) continue
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

  function handleMultiSelectToggle(fieldName: string, optionValue: string, checked: boolean) {
    const currentValues = parseMultiSelectValue(values[fieldName])
    const nextValues = checked
      ? Array.from(new Set([...currentValues, optionValue]))
      : currentValues.filter((item) => item !== optionValue)

    handleValueChange(fieldName, nextValues.join("|"))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isStepMode && !isLastStep) {
      if (!validate(currentStepFieldNames)) return
      setStepIndex((prev) => Math.min(prev + 1, formSteps.length - 1))
      return
    }

    if (!validate()) return
    await onSubmit(values)
  }

  function handleBackOrCancel() {
    if (isStepMode && effectiveStepIndex > 0) {
      setStepIndex((prev) => Math.max(0, prev - 1))
      return
    }
    onCancel?.()
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-border bg-card shadow-2xl",
        scrollable && "flex min-h-0 max-h-full flex-col",
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

      <CardContent
        className={cn(
          "space-y-4 p-5 sm:p-6",
          scrollable && "flex min-h-0 flex-1 flex-col overflow-hidden"
        )}
      >
        {isStepMode ? (
          <section className="shrink-0 space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Etapa {effectiveStepIndex + 1} de {formSteps.length}
              </p>
              <span className="inline-flex items-center rounded-full border border-primary/35 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                Em andamento
              </span>
            </div>

            <ol className="flex items-center">
              {formSteps.map((step, index) => {
                const isActive = index === effectiveStepIndex
                const isDone = index < effectiveStepIndex

                return (
                  <li key={step.key} className="flex min-w-0 flex-1 items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : isDone
                            ? "border-primary/60 bg-primary/15 text-primary"
                            : "border-border bg-background text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </div>
                    {index < formSteps.length - 1 ? (
                      <div
                        className={cn(
                          "mx-2 h-1 flex-1 rounded-full transition-colors",
                          index < effectiveStepIndex ? "bg-primary" : "bg-border"
                        )}
                      />
                    ) : null}
                  </li>
                )
              })}
            </ol>

            <div className="flex flex-wrap items-start justify-between gap-3 border-t border-border/80 pt-3">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold tracking-tight">{currentStep?.title}</h3>
                {currentStep?.description ? (
                  <p className="text-sm text-muted-foreground">{currentStep.description}</p>
                ) : null}
              </div>

              {stepHeaderActions ? (
                <div className="flex flex-wrap items-center justify-end gap-2">{stepHeaderActions}</div>
              ) : null}
            </div>
          </section>
        ) : (
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
        )}

        <form
          onSubmit={handleSubmit}
          className={cn("space-y-6", scrollable && "flex min-h-0 flex-1 flex-col")}
        >
          <div
            className={cn(
              "form-scrollbar space-y-5",
              scrollable && "min-h-0 flex-1 overflow-y-auto pr-2 [scrollbar-gutter:stable]"
            )}
          >
            {visibleSections.map((section) => (
              <section
                key={section.title}
                className={cn(
                  "space-y-3 rounded-2xl border p-4 shadow-sm",
                  isStepMode ? "border-border/70 bg-background/85" : "border-border bg-card"
                )}
              >
                {shouldShowSectionHeader ? (
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{section.title === "default" ? "Informacoes" : section.title}</h3>
                    {section.description ? <p className="text-xs text-muted-foreground">{section.description}</p> : null}
                  </div>
                ) : null}

                <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", !isStepMode && "xl:grid-cols-3")}>
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
                        ) : field.type === "multiselect" ? (
                          <div
                            className={cn(
                              "space-y-3 rounded-xl border border-border bg-background/95 p-3",
                              (field.readOnly || field.autoFilled) && "border-border/90 bg-muted/85",
                              fieldError && "border-destructive/70"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-muted-foreground">
                                {parseMultiSelectValue(values[field.name]).length > 0
                                  ? `${parseMultiSelectValue(values[field.name]).length} selecionada(s)`
                                  : (field.placeholder ?? "Selecione uma ou mais opcoes")}
                              </p>
                              {parseMultiSelectValue(values[field.name]).length > 0 ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => handleValueChange(field.name, "")}
                                  disabled={loading || field.disabled || field.readOnly}
                                >
                                  Limpar
                                </Button>
                              ) : null}
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                              {field.options?.map((option) => {
                                const isChecked = parseMultiSelectValue(values[field.name]).includes(option.value)

                                return (
                                  <label
                                    key={option.value}
                                    className={cn(
                                      "flex items-center gap-2 rounded-lg border border-border/70 bg-card px-2.5 py-2 text-sm",
                                      isChecked && "border-primary/50 bg-primary/10"
                                    )}
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      disabled={loading || field.disabled || field.readOnly}
                                      onCheckedChange={(checked) =>
                                        handleMultiSelectToggle(field.name, option.value, checked === true)
                                      }
                                    />
                                    <span>{option.label}</span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        ) : field.type === "date" || field.type === "date-picker" ? (
                          <DatePicker
                            value={values[field.name] ?? ""}
                            onChange={(value) => handleValueChange(field.name, value)}
                            placeholder={field.placeholder ?? "Selecione uma data"}
                            disabled={loading || field.disabled || field.readOnly}
                            className={cn(
                              "h-11 rounded-xl border-border bg-background/95 text-foreground shadow-none disabled:opacity-100",
                              (field.readOnly || field.autoFilled) &&
                                "border-border/90 bg-muted/85 text-foreground/75",
                              fieldError && "border-destructive/70"
                            )}
                          />
                        ) : field.type === "datetime" || field.type === "datetime-local" ? (
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

            {visibleSections.length === 0 ? (
              <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">
                  {currentStep?.description || "Nao ha campos para esta etapa. Avance para continuar."}
                </p>
              </section>
            ) : null}
          </div>

          {footer ? (
            footer
          ) : (
            <div
              className={cn(
                "-mx-5 -mb-5 z-20 flex flex-wrap gap-2 border-t border-border bg-card/98 px-5 py-3 sm:-mx-6 sm:-mb-6 sm:px-6",
                isStepMode ? "justify-end" : "justify-between"
              )}
            >
              {onCancel ? (
                <Button
                  type="button"
                  variant="outline"
                  className={cn("rounded-xl", isStepMode && "order-1 w-full sm:order-none sm:w-auto")}
                  onClick={handleBackOrCancel}
                  disabled={loading}
                >
                  {secondaryActionLabel}
                </Button>
              ) : null}
              <Button type="submit" className={cn("rounded-xl", isStepMode && "w-full sm:w-auto sm:min-w-48")} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {primaryActionLabel}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
