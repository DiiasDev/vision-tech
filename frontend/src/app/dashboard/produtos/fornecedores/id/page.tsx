"use client"

import Link from "next/link"
import { useEffect, useState, type ComponentType, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Building2, CalendarClock, Clock3, Hash, Loader2, Mail, MapPin, Phone, Save, ShieldAlert, User } from "lucide-react"

import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import { type Supplier } from "@/components/products/Supplier/supplier-models"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupplierById, updateSupplier, type ApiSupplier, type UpdateSupplierPayload } from "@/services/Supplier.service"
import { formatCurrencyBR, formatPhoneBR } from "@/utils/Formatter"

type SupplierFormState = {
  id: string
  code: string
  name: string
  fantasyName: string
  segment: string
  risk: string
  contact: string
  city: string
  state: string
  status: string
  categories: string
  lead: string
  location: string
  phone: string
  email: string
  minRequest: string
  lastDelivery: string
}

const EMPTY_SUPPLIER_FORM: SupplierFormState = {
  id: "",
  code: "",
  name: "",
  fantasyName: "",
  segment: "",
  risk: "",
  contact: "",
  city: "",
  state: "",
  status: "",
  categories: "",
  lead: "",
  location: "",
  phone: "",
  email: "",
  minRequest: "",
  lastDelivery: "",
}

function parseCurrencyToNumber(value: string) {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim()

  if (!normalized) return Number.NaN
  return Number(normalized)
}

function formatCurrencyField(value: string) {
  const numericValue = parseCurrencyToNumber(value)
  if (Number.isNaN(numericValue)) return value
  return formatCurrencyBR(numericValue)
}

function toFormState(supplier: Supplier): SupplierFormState {
  return {
    id: supplier.id,
    code: supplier.code,
    name: supplier.name,
    fantasyName: supplier.fantasyName,
    segment: supplier.segment,
    risk: supplier.risk,
    contact: supplier.contact ?? "",
    city: supplier.city,
    state: supplier.state,
    status: supplier.status,
    categories: supplier.categories,
    lead: supplier.lead ?? "",
    location: supplier.location,
    phone: formatPhoneBR(supplier.phone),
    email: supplier.email,
    minRequest: formatCurrencyField(supplier.minRequest),
    lastDelivery: supplier.lastDelivery,
  }
}

function toSupplier(form: SupplierFormState, previous: Supplier): Supplier {
  return {
    ...previous,
    id: form.id,
    code: form.code.trim(),
    name: form.name.trim(),
    fantasyName: form.fantasyName.trim(),
    segment: form.segment.trim(),
    risk: form.risk.trim(),
    contact: form.contact.trim() ? form.contact.trim() : undefined,
    city: form.city.trim(),
    state: form.state.trim(),
    status: form.status.trim(),
    categories: form.categories.trim(),
    lead: form.lead.trim() ? form.lead.trim() : undefined,
    location: form.location.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    minRequest: form.minRequest.trim(),
    lastDelivery: form.lastDelivery.trim(),
  }
}

function mapApiSupplierToUi(supplier: ApiSupplier): Supplier {
  return {
    id: supplier.id,
    code: supplier.supplierCode,
    name: supplier.name,
    fantasyName: supplier.fantasyName,
    segment: supplier.segment,
    risk: supplier.risk,
    contact: supplier.contact ?? undefined,
    city: supplier.city,
    state: supplier.state,
    status: supplier.status,
    categories: supplier.categories,
    lead: supplier.lead ?? undefined,
    location: supplier.location,
    phone: formatPhoneBR(supplier.phone),
    email: supplier.email,
    minRequest: formatCurrencyField(supplier.minRequest),
    lastDelivery: supplier.lastDelivery,
  }
}

function toUpdateSupplierPayload(form: SupplierFormState): UpdateSupplierPayload {
  return {
    name: form.name.trim(),
    fantasyName: form.fantasyName.trim(),
    segment: form.segment.trim(),
    risk: form.risk.trim(),
    contact: form.contact.trim() ? form.contact.trim() : null,
    city: form.city.trim(),
    state: form.state.trim().toUpperCase(),
    status: form.status.trim(),
    categories: form.categories.trim(),
    lead: form.lead.trim() ? form.lead.trim() : null,
    location: form.location.trim(),
    phone: formatPhoneBR(form.phone.trim()),
    email: form.email.trim(),
    minRequest: formatCurrencyField(form.minRequest.trim()),
    lastDelivery: form.lastDelivery.trim(),
  }
}

function formatDate(value: string) {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return value

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsedDate)
}

export default function SupplierDetailsPage() {
  const searchParams = useSearchParams()
  const supplierId = searchParams.get("supplierId")

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [form, setForm] = useState<SupplierFormState>(EMPTY_SUPPLIER_FORM)

  useEffect(() => {
    let mounted = true

    async function loadSupplier() {
      if (!supplierId || supplierId === "new") {
        if (mounted) {
          setSelectedSupplier(null)
          setForm(EMPTY_SUPPLIER_FORM)
          setFeedback(ComponentAlert.Error("Fornecedor invalido para edicao."))
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)

      try {
        const response = await getSupplierById(supplierId)
        const supplier = mapApiSupplierToUi(response.data)

        if (mounted) {
          setSelectedSupplier(supplier)
          setForm(toFormState(supplier))
        }
      } catch (error) {
        if (mounted) {
          const message = error instanceof Error ? error.message : "Nao foi possivel carregar fornecedor."
          setFeedback(ComponentAlert.Error(message))
          setSelectedSupplier(null)
          setForm(EMPTY_SUPPLIER_FORM)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    void loadSupplier()

    return () => {
      mounted = false
    }
  }, [supplierId])

  async function handleSaveChanges() {
    if (!selectedSupplier || !supplierId || supplierId === "new") {
      setFeedback(ComponentAlert.Error("Fornecedor nao encontrado para atualizacao."))
      return
    }

    setIsSaving(true)
    setFeedback(ComponentAlert.Info("Salvando alteracoes do fornecedor..."))

    try {
      const response = await updateSupplier(supplierId, toUpdateSupplierPayload(form))
      const supplier = response.data ? mapApiSupplierToUi(response.data) : toSupplier(form, selectedSupplier)
      setSelectedSupplier(supplier)
      setForm(toFormState(supplier))
      setFeedback(ComponentAlert.Success(response.message))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel atualizar fornecedor."
      setFeedback(ComponentAlert.Error(message))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card p-8">
        <h1 className="text-2xl font-semibold">Carregando fornecedor...</h1>
        <p className="mt-2 text-sm text-muted-foreground">Buscando os dados detalhados para edicao.</p>
      </div>
    )
  }

  if (!selectedSupplier) {
    return (
      <div className="rounded-2xl border bg-card p-8">
        <h1 className="text-2xl font-semibold">Fornecedor nao encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Volte para a lista e selecione um fornecedor valido para editar.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/produtos/fornecedores">Voltar para fornecedores</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

      <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button asChild variant="ghost" size="sm" className="h-7 px-2">
                <Link href="/dashboard/produtos/fornecedores">
                  <ArrowLeft className="h-4 w-4" />
                  Fornecedores
                </Link>
              </Button>
              <span>/</span>
              <span>Fornecedor</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">{form.name || "Novo fornecedor"}</h1>
            <p className="text-sm text-muted-foreground">Edite os campos do fornecedor organizados por categoria.</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              {form.code || "Sem codigo"}
            </Badge>
            <Button className="h-10 rounded-xl px-4" onClick={() => void handleSaveChanges()} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Salvando..." : "Salvar alteracoes"}
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="space-y-4 rounded-3xl border bg-card/90 p-5 shadow-sm md:p-6">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">campos do fornecedor</p>
            <h2 className="text-xl font-semibold">Cadastro por categoria</h2>
          </header>

          <FormCategory title="Identificacao" description="Codigo e dados basicos de cadastro.">
            <Field label="Codigo do fornecedor" id="supplier-code">
              <Input id="supplier-code" value={form.code} readOnly disabled />
            </Field>

            <Field label="Nome" id="supplier-name">
              <Input id="supplier-name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            </Field>

            <Field label="Nome fantasia" id="supplier-fantasy-name">
              <Input
                id="supplier-fantasy-name"
                value={form.fantasyName}
                onChange={(event) => setForm((prev) => ({ ...prev, fantasyName: event.target.value }))}
              />
            </Field>

            <Field label="Status" id="supplier-status">
              <Input id="supplier-status" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} />
            </Field>
          </FormCategory>

          <FormCategory title="Classificacao" description="Segmentacao e criticidade do fornecedor.">
            <Field label="Segmento" id="supplier-segment">
              <Input id="supplier-segment" value={form.segment} onChange={(event) => setForm((prev) => ({ ...prev, segment: event.target.value }))} />
            </Field>

            <Field label="Risco" id="supplier-risk">
              <Input id="supplier-risk" value={form.risk} onChange={(event) => setForm((prev) => ({ ...prev, risk: event.target.value }))} />
            </Field>

            <Field label="Categorias" id="supplier-categories">
              <Input
                id="supplier-categories"
                value={form.categories}
                onChange={(event) => setForm((prev) => ({ ...prev, categories: event.target.value }))}
              />
            </Field>

            <Field label="Pedido minimo" id="supplier-min-request">
              <Input
                id="supplier-min-request"
                value={form.minRequest}
                onChange={(event) => setForm((prev) => ({ ...prev, minRequest: event.target.value }))}
                onBlur={(event) => setForm((prev) => ({ ...prev, minRequest: formatCurrencyField(event.target.value) }))}
              />
            </Field>
          </FormCategory>

          <FormCategory title="Contato" description="Canal principal para negociacao e suporte.">
            <Field label="Contato" id="supplier-contact">
              <Input id="supplier-contact" value={form.contact} onChange={(event) => setForm((prev) => ({ ...prev, contact: event.target.value }))} />
            </Field>

            <Field label="Telefone" id="supplier-phone">
              <Input
                id="supplier-phone"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                onBlur={(event) => setForm((prev) => ({ ...prev, phone: formatPhoneBR(event.target.value) }))}
              />
            </Field>

            <Field label="Email" id="supplier-email">
              <Input id="supplier-email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
            </Field>
          </FormCategory>

          <FormCategory title="Localizacao e operacao" description="Endereco de atendimento e previsibilidade logistica.">
            <Field label="Cidade" id="supplier-city">
              <Input id="supplier-city" value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} />
            </Field>

            <Field label="Estado" id="supplier-state">
              <Input id="supplier-state" value={form.state} onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))} />
            </Field>

            <Field label="Localizacao" id="supplier-location">
              <Input
                id="supplier-location"
                value={form.location}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              />
            </Field>

            <Field label="Lead" id="supplier-lead">
              <Input id="supplier-lead" value={form.lead} onChange={(event) => setForm((prev) => ({ ...prev, lead: event.target.value }))} />
            </Field>

            <Field label="Ultima entrega" id="supplier-last-delivery">
              <DatePicker
                id="supplier-last-delivery"
                value={form.lastDelivery}
                onChange={() => undefined}
                placeholder="Sem data"
                readOnly
                disabled
              />
            </Field>
          </FormCategory>
        </section>

        <aside className="space-y-5">
          <section className="rounded-3xl border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">resumo</p>
            <h2 className="mt-1 text-xl font-semibold">Fornecedor selecionado</h2>

            <div className="mt-4 grid gap-2 text-sm">
              <Stat icon={Hash} label="Codigo" value={form.code} />
              <Stat icon={Building2} label="Fornecedor" value={form.fantasyName || form.name} />
              <Stat icon={User} label="Contato" value={form.contact} />
              <Stat icon={Mail} label="Email" value={form.email} />
              <Stat icon={Phone} label="Telefone" value={form.phone} />
              <Stat icon={MapPin} label="Cidade" value={`${form.city} - ${form.state}`} />
              <Stat icon={MapPin} label="Localizacao" value={form.location} />
              <Stat icon={Clock3} label="Lead" value={form.lead} />
              <Stat icon={ShieldAlert} label="Risco" value={form.risk} />
              <Stat icon={CalendarClock} label="Ultima entrega" value={formatDate(form.lastDelivery)} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function FormCategory({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-background/40 p-4">
      <header className="space-y-1">
        <h3 className="text-sm font-semibold tracking-wide">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({
  label,
  id,
  children,
}: {
  label: string
  id: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-background/70 px-3 py-2.5">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </span>
      <span className="font-medium text-foreground">{value || "-"}</span>
    </div>
  )
}
