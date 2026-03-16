"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Activity,
  ArrowLeft,
  CircleDollarSign,
  Clock3,
  Save,
  ShieldCheck,
  Tag,
  Trash2,
  User,
  Wrench,
} from "lucide-react"

import {
  getServiceCatalogMockById,
  serviceCatalogMockCategories,
} from "@/components/services/catalog/catalog-mock-data"
import type { ServiceBillingModel, ServiceCatalogStatus } from "@/components/services/catalog/catalog-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrencyBR } from "@/utils/Formatter"

type ServiceCatalogDetailsWorkspaceProps = {
  catalogHref: string
}

const billingModelOptions: Array<{ value: ServiceBillingModel; label: string }> = [
  { value: "project", label: "Projeto" },
  { value: "recurring", label: "Recorrente" },
  { value: "hourly", label: "Hora tecnica" },
]

function statusLabel(status: ServiceCatalogStatus) {
  if (status === "active") return "Ativo"
  if (status === "inactive") return "Inativo"
  return "Rascunho"
}

function statusBadgeVariant(status: ServiceCatalogStatus): "default" | "secondary" | "outline" {
  if (status === "active") return "default"
  if (status === "inactive") return "secondary"
  return "outline"
}

function formatDate(value: string) {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnlyMatch) {
    const year = Number.parseInt(dateOnlyMatch[1], 10)
    const month = Number.parseInt(dateOnlyMatch[2], 10)
    const day = Number.parseInt(dateOnlyMatch[3], 10)
    const localDate = new Date(year, month - 1, day, 12, 0, 0)

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(localDate)
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value))
}

function billingModelLabel(model: ServiceBillingModel) {
  return billingModelOptions.find((item) => item.value === model)?.label ?? "-"
}

export function ServiceCatalogDetailsWorkspace({ catalogHref }: ServiceCatalogDetailsWorkspaceProps) {
  const searchParams = useSearchParams()
  const serviceId = searchParams.get("serviceId")
  const selectedService = getServiceCatalogMockById(serviceId)

  if (!selectedService) {
    return (
      <div className="rounded-2xl border bg-card p-8">
        <h1 className="text-2xl font-semibold">Servico nao encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Volte ao catalogo e selecione um servico valido.
        </p>
        <Button asChild className="mt-4">
          <Link href={catalogHref}>Voltar ao catalogo</Link>
        </Button>
      </div>
    )
  }

  return (
    <div key={selectedService.id} className="space-y-6 pb-6">
      <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button asChild variant="ghost" size="sm" className="h-7 px-2">
                <Link href={catalogHref}>
                  <ArrowLeft className="h-4 w-4" />
                  Catalogo
                </Link>
              </Button>
              <span>/</span>
              <span>Servico</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">{selectedService.name}</h1>
            <p className="text-sm text-muted-foreground">
              Formulario visual com dados mockados para futura integracao com backend.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={statusBadgeVariant(selectedService.status)} className="rounded-full px-3 py-1 text-xs">
              {statusLabel(selectedService.status)}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              {selectedService.code}
            </Badge>
            <Button type="button" variant="destructive" className="h-10 rounded-xl px-4">
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
            <Button type="button" className="h-10 rounded-xl px-4">
              <Save className="h-4 w-4" />
              Salvar alteracoes
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="space-y-6 rounded-3xl border bg-card/90 p-5 shadow-sm md:p-6">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">dados principais</p>
            <h2 className="text-xl font-semibold">Informacoes do Servico</h2>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Codigo" id="code">
              <Input
                id="code"
                defaultValue={selectedService.code}
                readOnly
                aria-readonly="true"
                className="cursor-not-allowed bg-muted/45 text-muted-foreground"
              />
            </Field>

            <Field label="Nome" id="name">
              <Input id="name" defaultValue={selectedService.name} />
            </Field>

            <Field label="Categoria" id="category">
              <select
                id="category"
                defaultValue={selectedService.category}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {serviceCatalogMockCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Responsavel" id="responsible">
              <Input id="responsible" defaultValue={selectedService.responsible} />
            </Field>
          </div>

          <Field label="Descricao" id="description">
            <Textarea id="description" defaultValue={selectedService.description} className="min-h-28" />
          </Field>

          <header className="space-y-1 pt-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">dados operacionais</p>
            <h2 className="text-xl font-semibold">Comercial e SLA</h2>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Modelo de cobranca" id="billingModel">
              <select
                id="billingModel"
                defaultValue={selectedService.billingModel}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {billingModelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status" id="status">
              <select
                id="status"
                defaultValue={selectedService.status}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="draft">Rascunho</option>
              </select>
            </Field>

            <Field label="Ticket base (R$)" id="basePrice">
              <Input id="basePrice" type="number" min={0} defaultValue={selectedService.basePrice} />
            </Field>

            <Field label="SLA (horas)" id="slaHours">
              <Input id="slaHours" type="number" min={0} defaultValue={selectedService.slaHours} />
            </Field>

            <Field label="Execucao media (horas)" id="avgExecutionHours">
              <Input id="avgExecutionHours" type="number" min={0} defaultValue={selectedService.avgExecutionHours} />
            </Field>

            <Field label="Contratos ativos" id="activeContracts">
              <Input id="activeContracts" type="number" min={0} step={1} defaultValue={selectedService.activeContracts} />
            </Field>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-3xl border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">resumo rapido</p>
            <h2 className="mt-1 text-xl font-semibold">Indicadores</h2>

            <div className="mt-4 grid gap-2 text-sm">
              <Stat icon={CircleDollarSign} label="Ticket base" value={formatCurrencyBR(selectedService.basePrice)} />
              <Stat icon={Clock3} label="SLA" value={`${selectedService.slaHours}h`} />
              <Stat icon={Activity} label="Execucao media" value={`${selectedService.avgExecutionHours}h`} />
              <Stat icon={ShieldCheck} label="Contratos ativos" value={`${selectedService.activeContracts}`} />
              <Stat icon={User} label="Responsavel" value={selectedService.responsible} />
              <Stat icon={Wrench} label="Modelo de cobranca" value={billingModelLabel(selectedService.billingModel)} />
              <Stat icon={Tag} label="Atualizado em" value={formatDate(selectedService.updatedAt)} />
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
  children: React.ReactNode
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
  icon: React.ComponentType<{ className?: string }>
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
