import Link from "next/link"
import { Clock3, ShieldCheck, Trash2, Wrench } from "lucide-react"

import type { ServiceBillingModel, ServiceCatalogItem, ServiceCatalogStatus } from "@/components/services/catalog/catalog-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrencyBR } from "@/utils/Formatter"

type ServicesCatalogTableProps = {
  services: ServiceCatalogItem[]
  detailsBasePath: string
}

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

function billingModelLabel(model: ServiceBillingModel) {
  if (model === "project") return "Projeto"
  if (model === "recurring") return "Recorrente"
  return "Hora tecnica"
}

function formatUpdatedAt(value: string) {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return "Sem registro"
  return parsedDate.toLocaleDateString("pt-BR")
}

export function ServicesCatalogTable({ services, detailsBasePath }: ServicesCatalogTableProps) {
  const activeServicesCount = services.filter((service) => service.status === "active").length

  return (
    <Card className="overflow-hidden border-border/70 bg-card/70 shadow-lg">
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Lista de Servicos</CardTitle>
            <CardDescription className="mt-1">
              Panorama comercial e operacional para o time de pre-vendas e atendimento.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            {activeServicesCount} servico(s) ativo(s)
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-muted/20 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr className="border-b border-border/70">
                <th className="pl-[4.25rem] pr-6 py-3 text-left font-medium">Servico</th>
                <th className="px-3 py-3 text-left font-medium">Categoria</th>
                <th className="px-3 py-3 text-left font-medium">Modelo</th>
                <th className="px-3 py-3 text-left font-medium">SLA</th>
                <th className="px-3 py-3 text-left font-medium">Execucao media</th>
                <th className="px-3 py-3 text-left font-medium">Ticket Base</th>
                <th className="px-3 py-3 text-left font-medium">Contratos</th>
                <th className="px-3 py-3 text-left font-medium">Responsavel</th>
                <th className="px-3 py-3 text-left font-medium">Status</th>
                <th className="px-3 py-3 text-center font-medium">Ações</th>
                <th className="px-3 py-3 text-right font-medium">Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-border/60 transition-colors hover:bg-muted/25">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg border border-border/70 bg-background/70 p-2">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <Link
                          href={`${detailsBasePath}?serviceId=${service.id}`}
                          className="font-medium text-foreground transition-colors hover:text-primary"
                        >
                          {service.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{service.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <Badge variant="secondary" className="rounded-full px-2.5 py-1">
                      {service.category}
                    </Badge>
                  </td>
                  <td className="px-3 py-4 text-foreground">{billingModelLabel(service.billingModel)}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      Ate {service.slaHours}h
                    </div>
                  </td>
                  <td className="px-3 py-4 text-foreground">{service.avgExecutionHours}h</td>
                  <td className="px-3 py-4 text-foreground">{formatCurrencyBR(service.basePrice)}</td>
                  <td className="px-3 py-4 text-foreground">{service.activeContracts}</td>
                  <td className="px-3 py-4 text-foreground">{service.responsible}</td>
                  <td className="px-3 py-4">
                    <Badge variant={statusBadgeVariant(service.status)} className="rounded-full px-2.5 py-1">
                      {statusLabel(service.status)}
                    </Badge>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button asChild size="sm" className="rounded-lg">
                        <Link href={`${detailsBasePath}?serviceId=${service.id}`}>Editar</Link>
                      </Button>
                      <Button type="button" size="icon-sm" variant="destructive" className="rounded-lg" aria-label={`Excluir ${service.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-right text-muted-foreground">{formatUpdatedAt(service.updatedAt)}</td>
                </tr>
              ))}
              {services.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    Nenhum servico encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
