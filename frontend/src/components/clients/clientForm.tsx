"use client"

import { useState } from "react"
import { Check, CircleAlert, CircleCheck, Sparkles } from "lucide-react"

import FormComponent, { type GenericField } from "@/components/layout/formComponent"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { createClient, type CreateClientPayload } from "@/services/clients.service"

type FeedbackState = {
  type: "success" | "error"
  message: string
} | null

type ClientFormProps = {
  open: boolean
  loading?: boolean
  feedback?: FeedbackState
  onClose: () => void
  onSubmitStart?: () => void
  onSubmitEnd?: () => void
  onFeedback?: (feedback: FeedbackState) => void
  onCreated?: () => void
}

type SubmitOutcome =
  | {
      type: "success" | "error"
      message: string
    }
  | null

const allFields: GenericField[] = [
  {
    name: "type",
    label: "Tipo de Cliente",
    type: "select",
    required: true,
    placeholder: "Selecione o tipo",
    options: [
      { label: "Pessoa Juridica (PJ)", value: "PJ" },
      { label: "Pessoa Fisica (PF)", value: "PF" },
    ],
    colSpan: 1,
    defaultValue: "PJ",
  },
  {
    name: "status",
    label: "Status inicial",
    type: "select",
    required: true,
    placeholder: "Selecione o status",
    options: [
      { label: "Ativo", value: "ACTIVE" },
      { label: "Inativo", value: "INACTIVE" },
      { label: "Inadimplente", value: "DELINQUENT" },
    ],
    defaultValue: "ACTIVE",
    colSpan: 1,
  },
  {
    name: "name",
    label: "Nome",
    type: "text",
    required: true,
    placeholder: "Ex: Empresa Alpha Tecnologia",
    colSpan: 2,
  },
  {
    name: "document",
    label: "CPF/CNPJ",
    type: "text",
    required: true,
    placeholder: "Ex: 12.345.678/0001-90",
  },
  {
    name: "telephone",
    label: "Telefone",
    type: "tel",
    placeholder: "Ex: (11) 99999-0000",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "contato@empresa.com",
    colSpan: 2,
  },
  {
    name: "city",
    label: "Cidade",
    type: "text",
    placeholder: "Ex: Sao Paulo",
  },
  {
    name: "state",
    label: "UF",
    type: "text",
    placeholder: "Ex: SP",
  },
  {
    name: "zipCode",
    label: "CEP",
    type: "text",
    placeholder: "Ex: 01000-000",
  },
  {
    name: "street",
    label: "Rua",
    type: "text",
    placeholder: "Ex: Av. Paulista",
  },
  {
    name: "number",
    label: "Numero",
    type: "text",
    placeholder: "Ex: 1500",
  },
  {
    name: "neighborhood",
    label: "Bairro",
    type: "text",
    placeholder: "Ex: Bela Vista",
  },
  {
    name: "responsibleName",
    label: "Responsavel do Cliente",
    type: "text",
    placeholder: "Ex: Maria Oliveira",
    colSpan: 2,
  },
  {
    name: "responsibleEmail",
    label: "Email do Responsavel",
    type: "email",
    placeholder: "maria@empresa.com",
  },
  {
    name: "responsiblePhone",
    label: "Telefone do Responsavel",
    type: "tel",
    placeholder: "Ex: (11) 98888-7777",
  },
  {
    name: "lastContact",
    label: "Ultimo Contato",
    type: "datetime",
    description: "Opcional. Data/hora do ultimo contato comercial.",
    colSpan: 3,
  },
]

const stepDefinitions = [
  {
    key: "basico",
    title: "Dados Principais",
    description: "Informacoes basicas do cliente para cadastro inicial.",
    fields: ["type", "status", "name", "document", "telephone", "email"],
  },
  {
    key: "endereco",
    title: "Endereco",
    description: "Dados de localizacao e endereco principal do cliente.",
    fields: ["city", "state", "zipCode", "street", "number", "neighborhood"],
  },
  {
    key: "responsavel",
    title: "Responsavel e Follow-up",
    description: "Contato responsavel pelo cliente e data do ultimo contato.",
    fields: ["responsibleName", "responsibleEmail", "responsiblePhone", "lastContact"],
  },
] as const

function buildInitialValues(fields: GenericField[]) {
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.name] = field.defaultValue ?? ""
    return acc
  }, {})
}

export default function ClientForm({
  open,
  loading = false,
  feedback = null,
  onClose,
  onSubmitStart,
  onSubmitEnd,
  onFeedback,
  onCreated,
}: ClientFormProps) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const [formValues, setFormValues] = useState<Record<string, string>>(() => buildInitialValues(allFields))
  const [outcome, setOutcome] = useState<SubmitOutcome>(null)

  if (!open) return null

  const currentStep = stepDefinitions[step]
  const isLastStep = step === stepDefinitions.length - 1
  const currentFields = currentStep.fields
    .map((fieldName) => allFields.find((field) => field.name === fieldName))
    .filter((field): field is GenericField => Boolean(field))

  function resetForm() {
    setStep(0)
    setDirection("forward")
    setFormValues(buildInitialValues(allFields))
    setOutcome(null)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  async function handleSubmit(values: Record<string, string>) {
    if (!isLastStep) {
      setDirection("forward")
      setStep((prev) => prev + 1)
      return
    }

    onSubmitStart?.()

    const payload: CreateClientPayload = {
      type: values.type as "PF" | "PJ",
      status: values.status as "ACTIVE" | "INACTIVE" | "DELINQUENT",
      name: values.name.trim(),
      document: values.document.trim(),
      email: values.email?.trim() || undefined,
      telephone: values.telephone?.trim() || undefined,
      city: values.city?.trim() || undefined,
      state: values.state?.trim() || undefined,
      zipCode: values.zipCode?.trim() || undefined,
      street: values.street?.trim() || undefined,
      number: values.number?.trim() || undefined,
      neighborhood: values.neighborhood?.trim() || undefined,
      responsibleName: values.responsibleName?.trim() || undefined,
      responsibleEmail: values.responsibleEmail?.trim() || undefined,
      responsiblePhone: values.responsiblePhone?.trim() || undefined,
      lastContact: values.lastContact?.trim() || undefined,
    }

    try {
      const response = await createClient(payload)

      onFeedback?.({
        type: "success",
        message: response.message,
      })
      onCreated?.()
      setOutcome({
        type: "success",
        message: response.message,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar cliente."
      onFeedback?.({
        type: "error",
        message,
      })
      setOutcome({
        type: "error",
        message,
      })
    } finally {
      onSubmitEnd?.()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/60 p-3 backdrop-blur-sm sm:p-6">
      <div className="absolute inset-0" onClick={handleClose} aria-hidden="true" />
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="w-full max-w-6xl">
          {feedback ? (
            <Alert
              variant={feedback.type === "error" ? "destructive" : "success"}
              className="mb-3 border-border/70 bg-card/85 backdrop-blur"
            >
              {feedback.type === "error" ? <CircleAlert /> : <CircleCheck />}
              <AlertTitle>{feedback.type === "error" ? "Erro no cadastro" : "Cadastro concluido"}</AlertTitle>
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="mb-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-3 shadow-lg">
            <div className="grid gap-3 sm:grid-cols-3">
              {stepDefinitions.map((stepItem, index) => {
                const isActive = index === step
                const isDone = index < step

                return (
                  <div
                    key={stepItem.key}
                    className="relative rounded-xl border border-border/70 bg-muted/20 px-3 py-2 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold transition-all ${
                          isDone
                            ? "bg-emerald-500/20 text-emerald-300"
                            : isActive
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isDone ? <Check className="h-3 w-3" /> : index + 1}
                      </span>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Etapa {index + 1}
                      </p>
                    </div>
                    <p className={`mt-1 text-sm font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {stepItem.title}
                    </p>
                    {isActive ? (
                      <div className="absolute inset-x-3 -bottom-px h-0.5 animate-in fade-in bg-primary/80" />
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>

          {outcome ? (
            <div className="animate-in fade-in zoom-in-95 rounded-2xl border border-border/70 bg-card/80 p-8 shadow-xl">
              <div className="mx-auto max-w-xl text-center">
                <div
                  className={`mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border ${
                    outcome.type === "success"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-destructive/40 bg-destructive/10 text-destructive"
                  }`}
                >
                  {outcome.type === "success" ? <Sparkles className="h-8 w-8" /> : <CircleAlert className="h-8 w-8" />}
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">
                  {outcome.type === "success" ? "Cadastro concluido com sucesso" : "Nao foi possivel concluir o cadastro"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{outcome.message}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {outcome.type === "error" ? (
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setOutcome(null)}
                    >
                      Voltar e corrigir
                    </Button>
                  ) : null}
                  <Button className="rounded-xl" onClick={handleClose}>
                    {outcome.type === "success" ? "Concluir" : "Fechar"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              key={`${step}-${direction}`}
              className={`animate-in duration-300 ${
                direction === "forward" ? "slide-in-from-right-2 fade-in-50" : "slide-in-from-left-2 fade-in-50"
              }`}
            >
              <FormComponent
                title={currentStep.title}
                description={currentStep.description}
                fields={currentFields}
                values={formValues}
                onValuesChange={setFormValues}
                submitLabel={isLastStep ? "Cadastrar Cliente" : "Proximo"}
                cancelLabel={step > 0 ? "Voltar" : "Fechar"}
                loading={loading}
                scrollable
                className="max-h-[85dvh]"
                onHeaderClose={handleClose}
                footer={
                  <div className="flex flex-wrap justify-between gap-2 border-t border-border/70 pt-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => {
                          if (step > 0) {
                            setDirection("backward")
                            setStep((prev) => prev - 1)
                            return
                          }
                          handleClose()
                        }}
                        disabled={loading}
                      >
                        {step > 0 ? "Voltar" : "Fechar"}
                      </Button>
                    </div>
                    <Button type="submit" className="rounded-xl" disabled={loading}>
                      {isLastStep ? "Cadastrar Cliente" : "Continuar"}
                    </Button>
                  </div>
                }
                onCancel={() => {
                  if (step > 0) {
                    setDirection("backward")
                    setStep((prev) => prev - 1)
                    return
                  }
                  handleClose()
                }}
                onSubmit={handleSubmit}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
