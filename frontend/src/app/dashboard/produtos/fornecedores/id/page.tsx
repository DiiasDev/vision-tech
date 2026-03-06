"use client"

import Link from "next/link"
import { useEffect, useState, type ComponentType, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Building2, CalendarClock, CircleDollarSign, Clock3, Loader2, Mail, MapPin, Phone, Save, ShieldAlert, User } from "lucide-react"

import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import { suppliersMock } from "@/components/products/Supplier/supplier-mock-data"
import {
  supplierRiskLabels,
  supplierSegmentLabels,
  supplierStatusLabels,
  type Supplier,
  type SupplierRiskLevel,
  type SupplierSegment,
  type SupplierStatus,
} from "@/components/products/Supplier/supplier-models"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrencyBR } from "@/utils/Formatter"

type SupplierFormState = {
  id: string
  name: string
  tradeName: string
  segment: SupplierSegment
  status: SupplierStatus
  riskLevel: SupplierRiskLevel
  contactName: string
  contactEmail: string
  contactPhone: string
  city: string
  state: string
  leadTimeDays: number
  onTimeRate: number
  qualityScore: number
  annualSpend: number
  paymentTerm: string
  minimumOrderValue: number
  categories: string
  lastDeliveryAt: string
  nextReviewAt: string
}

const EMPTY_SUPPLIER_FORM: SupplierFormState = {
  id: "",
  name: "",
  tradeName: "",
  segment: "servicos",
  status: "avaliacao",
  riskLevel: "medio",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  city: "",
  state: "",
  leadTimeDays: 0,
  onTimeRate: 0,
  qualityScore: 0,
  annualSpend: 0,
  paymentTerm: "",
  minimumOrderValue: 0,
  categories: "",
  lastDeliveryAt: "",
  nextReviewAt: "",
}

const segmentOptions: SupplierSegment[] = ["eletronicos", "infraestrutura", "insumos", "embalagem", "servicos"]
const statusOptions: SupplierStatus[] = ["ativo", "avaliacao", "suspenso"]
const riskOptions: SupplierRiskLevel[] = ["baixo", "medio", "alto"]

function toFormState(supplier: Supplier): SupplierFormState {
  return {
    id: supplier.id,
    name: supplier.name,
    tradeName: supplier.tradeName,
    segment: supplier.segment,
    status: supplier.status,
    riskLevel: supplier.riskLevel,
    contactName: supplier.contactName,
    contactEmail: supplier.contactEmail,
    contactPhone: supplier.contactPhone,
    city: supplier.city,
    state: supplier.state,
    leadTimeDays: supplier.leadTimeDays,
    onTimeRate: supplier.onTimeRate,
    qualityScore: supplier.qualityScore,
    annualSpend: supplier.annualSpend,
    paymentTerm: supplier.paymentTerm,
    minimumOrderValue: supplier.minimumOrderValue,
    categories: supplier.categories.join(", "),
    lastDeliveryAt: supplier.lastDeliveryAt,
    nextReviewAt: supplier.nextReviewAt,
  }
}

function toSupplier(form: SupplierFormState, previous: Supplier): Supplier {
  return {
    ...previous,
    id: form.id,
    name: form.name.trim(),
    tradeName: form.tradeName.trim(),
    segment: form.segment,
    status: form.status,
    riskLevel: form.riskLevel,
    contactName: form.contactName.trim(),
    contactEmail: form.contactEmail.trim(),
    contactPhone: form.contactPhone.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    leadTimeDays: Math.max(0, form.leadTimeDays),
    onTimeRate: Math.max(0, Math.min(100, form.onTimeRate)),
    qualityScore: Math.max(0, Math.min(100, form.qualityScore)),
    annualSpend: Math.max(0, form.annualSpend),
    paymentTerm: form.paymentTerm.trim(),
    minimumOrderValue: Math.max(0, form.minimumOrderValue),
    categories: form.categories.split(",").map((item) => item.trim()).filter(Boolean),
    lastDeliveryAt: form.lastDeliveryAt,
    nextReviewAt: form.nextReviewAt,
  }
}

function createNewSupplierMock(): Supplier {
  return {
    id: `sup-new-${Date.now()}`,
    name: "Novo fornecedor",
    tradeName: "Fornecedor novo",
    segment: "servicos",
    status: "avaliacao",
    riskLevel: "medio",
    leadTimeDays: 0,
    onTimeRate: 0,
    qualityScore: 0,
    annualSpend: 0,
    paymentTerm: "30 dias",
    minimumOrderValue: 0,
    activeContracts: 0,
    categories: [],
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    city: "",
    state: "",
    lastDeliveryAt: new Date().toISOString().slice(0, 10),
    nextReviewAt: new Date().toISOString().slice(0, 10),
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
      if (!supplierId) {
        if (mounted) {
          setSelectedSupplier(null)
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)

      const supplier = supplierId === "new" ? createNewSupplierMock() : (suppliersMock.find((item) => item.id === supplierId) ?? null)

      if (mounted) {
        setSelectedSupplier(supplier)
        setForm(supplier ? toFormState(supplier) : EMPTY_SUPPLIER_FORM)
        setIsLoading(false)
      }
    }

    void loadSupplier()

    return () => {
      mounted = false
    }
  }, [supplierId])

  async function handleSaveChanges() {
    if (!selectedSupplier) {
      setFeedback(ComponentAlert.Error("Fornecedor nao encontrado para atualizacao."))
      return
    }

    setIsSaving(true)
    setFeedback(ComponentAlert.Info("Salvando alteracoes do fornecedor..."))

    await new Promise((resolve) => setTimeout(resolve, 400))

    const updatedSupplier = toSupplier(form, selectedSupplier)
    setSelectedSupplier(updatedSupplier)
    setFeedback(ComponentAlert.Success(supplierId === "new" ? "Fornecedor criado com sucesso (mock)." : "Fornecedor atualizado com sucesso."))
    setIsSaving(false)
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

            <h1 className="text-3xl font-semibold tracking-tight">{form.name}</h1>
            <p className="text-sm text-muted-foreground">Atualize dados cadastrais e operacionais do fornecedor selecionado.</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              {form.id}
            </Badge>
            <Button className="h-10 rounded-xl px-4" onClick={() => void handleSaveChanges()} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Salvando..." : "Salvar alteracoes"}
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="space-y-6 rounded-3xl border bg-card/90 p-5 shadow-sm md:p-6">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">dados principais</p>
            <h2 className="text-xl font-semibold">Informacoes do fornecedor</h2>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="ID" id="supplier-id">
              <Input id="supplier-id" value={form.id} readOnly aria-readonly="true" className="cursor-not-allowed bg-muted/45 text-muted-foreground" />
            </Field>

            <Field label="Nome" id="supplier-name">
              <Input id="supplier-name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            </Field>

            <Field label="Nome fantasia" id="supplier-trade-name">
              <Input
                id="supplier-trade-name"
                value={form.tradeName}
                onChange={(event) => setForm((prev) => ({ ...prev, tradeName: event.target.value }))}
              />
            </Field>

            <Field label="Segmento" id="supplier-segment">
              <select
                id="supplier-segment"
                value={form.segment}
                onChange={(event) => setForm((prev) => ({ ...prev, segment: event.target.value as SupplierSegment }))}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {segmentOptions.map((segment) => (
                  <option key={segment} value={segment}>
                    {supplierSegmentLabels[segment]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status" id="supplier-status">
              <select
                id="supplier-status"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as SupplierStatus }))}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {supplierStatusLabels[status]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Risco" id="supplier-risk">
              <select
                id="supplier-risk"
                value={form.riskLevel}
                onChange={(event) => setForm((prev) => ({ ...prev, riskLevel: event.target.value as SupplierRiskLevel }))}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {riskOptions.map((risk) => (
                  <option key={risk} value={risk}>
                    {supplierRiskLabels[risk]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <header className="space-y-1 pt-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">contato</p>
            <h2 className="text-xl font-semibold">Dados comerciais</h2>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Contato" id="supplier-contact-name">
              <Input
                id="supplier-contact-name"
                value={form.contactName}
                onChange={(event) => setForm((prev) => ({ ...prev, contactName: event.target.value }))}
              />
            </Field>

            <Field label="Email" id="supplier-contact-email">
              <Input
                id="supplier-contact-email"
                value={form.contactEmail}
                onChange={(event) => setForm((prev) => ({ ...prev, contactEmail: event.target.value }))}
              />
            </Field>

            <Field label="Telefone" id="supplier-contact-phone">
              <Input
                id="supplier-contact-phone"
                value={form.contactPhone}
                onChange={(event) => setForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
              />
            </Field>

            <Field label="Cidade" id="supplier-city">
              <Input id="supplier-city" value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} />
            </Field>

            <Field label="Estado" id="supplier-state">
              <Input id="supplier-state" value={form.state} onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))} />
            </Field>

            <Field label="Categorias (separadas por virgula)" id="supplier-categories">
              <Input
                id="supplier-categories"
                value={form.categories}
                onChange={(event) => setForm((prev) => ({ ...prev, categories: event.target.value }))}
              />
            </Field>
          </div>

          <header className="space-y-1 pt-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">operacao</p>
            <h2 className="text-xl font-semibold">Indicadores e condicoes</h2>
          </header>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Lead time (dias)" id="supplier-lead-time">
              <Input
                id="supplier-lead-time"
                type="number"
                min={0}
                value={form.leadTimeDays}
                onChange={(event) => setForm((prev) => ({ ...prev, leadTimeDays: Number(event.target.value) }))}
              />
            </Field>

            <Field label="SLA no prazo (%)" id="supplier-on-time-rate">
              <Input
                id="supplier-on-time-rate"
                type="number"
                min={0}
                max={100}
                value={form.onTimeRate}
                onChange={(event) => setForm((prev) => ({ ...prev, onTimeRate: Number(event.target.value) }))}
              />
            </Field>

            <Field label="Qualidade (%)" id="supplier-quality-score">
              <Input
                id="supplier-quality-score"
                type="number"
                min={0}
                max={100}
                value={form.qualityScore}
                onChange={(event) => setForm((prev) => ({ ...prev, qualityScore: Number(event.target.value) }))}
              />
            </Field>

            <Field label="Spend anual" id="supplier-annual-spend">
              <Input
                id="supplier-annual-spend"
                type="number"
                min={0}
                value={form.annualSpend}
                onChange={(event) => setForm((prev) => ({ ...prev, annualSpend: Number(event.target.value) }))}
              />
            </Field>

            <Field label="Pedido minimo" id="supplier-minimum-order">
              <Input
                id="supplier-minimum-order"
                type="number"
                min={0}
                value={form.minimumOrderValue}
                onChange={(event) => setForm((prev) => ({ ...prev, minimumOrderValue: Number(event.target.value) }))}
              />
            </Field>

            <Field label="Prazo de pagamento" id="supplier-payment-term">
              <Input
                id="supplier-payment-term"
                value={form.paymentTerm}
                onChange={(event) => setForm((prev) => ({ ...prev, paymentTerm: event.target.value }))}
              />
            </Field>

            <Field label="Ultima entrega" id="supplier-last-delivery">
              <Input
                id="supplier-last-delivery"
                type="date"
                value={form.lastDeliveryAt}
                onChange={(event) => setForm((prev) => ({ ...prev, lastDeliveryAt: event.target.value }))}
              />
            </Field>

            <Field label="Proxima revisao" id="supplier-next-review">
              <Input
                id="supplier-next-review"
                type="date"
                value={form.nextReviewAt}
                onChange={(event) => setForm((prev) => ({ ...prev, nextReviewAt: event.target.value }))}
              />
            </Field>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-3xl border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">status atual</p>
            <h2 className="mt-1 text-xl font-semibold">Resumo rapido</h2>

            <div className="mt-4 grid gap-2 text-sm">
              <Stat icon={Building2} label="Fornecedor" value={form.tradeName || form.name} />
              <Stat icon={User} label="Contato" value={form.contactName} />
              <Stat icon={Mail} label="Email" value={form.contactEmail} />
              <Stat icon={Phone} label="Telefone" value={form.contactPhone} />
              <Stat icon={MapPin} label="Cidade" value={`${form.city} - ${form.state}`} />
              <Stat icon={Clock3} label="Lead time" value={`${form.leadTimeDays} dias`} />
              <Stat icon={ShieldAlert} label="Risco" value={supplierRiskLabels[form.riskLevel]} />
              <Stat icon={CircleDollarSign} label="Spend anual" value={formatCurrencyBR(form.annualSpend)} />
              <Stat icon={CircleDollarSign} label="Pedido minimo" value={formatCurrencyBR(form.minimumOrderValue)} />
              <Stat icon={CalendarClock} label="Ultima entrega" value={formatDate(form.lastDeliveryAt)} />
              <Stat icon={CalendarClock} label="Proxima revisao" value={formatDate(form.nextReviewAt)} />
            </div>
          </section>
        </aside>
      </div>
    </div>
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
