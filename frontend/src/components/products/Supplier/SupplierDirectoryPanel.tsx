import type { ComponentType } from "react"
import { Building2, Clock3, Mail, MapPin, Phone, Settings2, Trash2, UserRound } from "lucide-react"

import { getRiskSortValue, type Supplier } from "@/components/products/Supplier/supplier-models"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type SupplierDirectoryPanelProps = {
  suppliers: Supplier[]
  selectedSupplierId: string | null
  onSelectSupplier: (supplierId: string) => void
  onConfigureSupplier: (supplierId: string) => void
  onDeleteSupplier: (supplierId: string) => void
}

function normalizeValue(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR")
}

function buildRiskStyle(risk: string) {
  const normalizedRisk = normalizeValue(risk)
  if (normalizedRisk === "alto") return "border-red-300/60 bg-red-100/65 text-red-700"
  if (normalizedRisk === "medio") return "border-amber-300/60 bg-amber-100/65 text-amber-700"
  return "border-emerald-300/60 bg-emerald-100/65 text-emerald-700"
}

function buildStatusStyle(status: string) {
  const normalizedStatus = normalizeValue(status)
  if (normalizedStatus === "ativo") return "border-sky-300/60 bg-sky-100/65 text-sky-700"
  if (normalizedStatus === "avaliacao") return "border-violet-300/60 bg-violet-100/65 text-violet-700"
  return "border-slate-300/60 bg-slate-200/75 text-slate-700"
}

export function SupplierDirectoryPanel({
  suppliers,
  selectedSupplierId,
  onSelectSupplier,
  onConfigureSupplier,
  onDeleteSupplier,
}: SupplierDirectoryPanelProps) {
  const sortedSuppliers = [...suppliers].sort((left, right) => {
    if (getRiskSortValue(left.risk) !== getRiskSortValue(right.risk)) {
      return getRiskSortValue(left.risk) - getRiskSortValue(right.risk)
    }

    return left.name.localeCompare(right.name, "pt-BR")
  })

  return (
    <Card className="border-border/70 bg-card/80 py-0">
      <CardHeader className="border-b border-border/70 py-4">
        <CardTitle className="text-base">Dados dos fornecedores</CardTitle>
        <CardDescription>Lista dos fornecedores com os campos padrao de cadastro.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {sortedSuppliers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum fornecedor encontrado para o filtro selecionado.
          </p>
        ) : (
          sortedSuppliers.map((supplier) => (
            <article
              key={supplier.id}
              className={cn(
                "space-y-4 rounded-2xl border bg-background/70 p-4 transition-colors",
                selectedSupplierId === supplier.id ? "border-primary/60 ring-1 ring-primary/30" : "border-border/70"
              )}
              onClick={() => onSelectSupplier(supplier.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  onSelectSupplier(supplier.id)
                }
              }}
            >
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base font-semibold">{supplier.name}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {supplier.code} - {supplier.fantasyName} - {supplier.segment}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="rounded-full border-border/70 bg-muted/20">
                      {supplier.categories}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={cn("rounded-full border px-2.5 py-1 text-[11px]", buildStatusStyle(supplier.status))}>
                    {supplier.status}
                  </Badge>
                  <Badge className={cn("rounded-full border px-2.5 py-1 text-[11px]", buildRiskStyle(supplier.risk))}>
                    Risco {supplier.risk}
                  </Badge>
                </div>
              </header>

              <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                <InfoLine icon={Clock3} text={`Lead: ${supplier.lead || "-"}`} />
                <InfoLine icon={MapPin} text={`${supplier.city} - ${supplier.state}`} />
                <InfoLine icon={MapPin} text={`Local: ${supplier.location}`} />
                <InfoLine icon={Phone} text={supplier.phone} />
                <InfoLine icon={Mail} text={supplier.email} />
                <InfoLine icon={UserRound} text={supplier.contact || "-"} />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  className="h-11 flex-1 rounded-xl"
                  onClick={(event) => {
                    event.stopPropagation()
                    onConfigureSupplier(supplier.id)
                  }}
                >
                  <Settings2 className="mr-1 h-4 w-4" />
                  Configurar
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  aria-label={`Excluir ${supplier.name}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    onDeleteSupplier(supplier.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function InfoLine({ icon: Icon, text }: { icon: ComponentType<{ className?: string }>; text: string }) {
  return (
    <p className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/10 px-2 py-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="truncate">{text}</span>
    </p>
  )
}
