import type { ComponentType } from "react"
import { Building2, Clock3, Mail, MapPin, Phone } from "lucide-react"

import { supplierRiskLabels, supplierStatusLabels, type Supplier } from "@/components/products/Supplier/supplier-models"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type SupplierOpenedPanelProps = {
  supplier: Supplier | null
}

const statusStyles = {
  ativo: "border-sky-300/60 bg-sky-100/65 text-sky-700",
  avaliacao: "border-violet-300/60 bg-violet-100/65 text-violet-700",
  suspenso: "border-slate-300/60 bg-slate-200/75 text-slate-700",
} as const

const riskStyles = {
  baixo: "border-emerald-300/60 bg-emerald-100/65 text-emerald-700",
  medio: "border-amber-300/60 bg-amber-100/65 text-amber-700",
  alto: "border-red-300/60 bg-red-100/65 text-red-700",
} as const

export function SupplierOpenedPanel({ supplier }: SupplierOpenedPanelProps) {
  if (!supplier) return null

  return (
    <Card className="border-primary/30 bg-primary/5 py-0">
      <CardHeader className="border-b border-border/70 py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4 text-primary" />
          Fornecedor aberto: {supplier.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge className={cn("rounded-full border px-2.5 py-1 text-[11px]", statusStyles[supplier.status])}>
            {supplierStatusLabels[supplier.status]}
          </Badge>
          <Badge className={cn("rounded-full border px-2.5 py-1 text-[11px]", riskStyles[supplier.riskLevel])}>
            {supplierRiskLabels[supplier.riskLevel]}
          </Badge>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
          <DataLine icon={Mail} text={supplier.contactEmail} />
          <DataLine icon={Phone} text={supplier.contactPhone} />
          <DataLine icon={MapPin} text={`${supplier.city} - ${supplier.state}`} />
          <DataLine icon={Clock3} text={`Lead time: ${supplier.leadTimeDays} dias`} />
        </div>
      </CardContent>
    </Card>
  )
}

function DataLine({ icon: Icon, text }: { icon: ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/70 px-2.5 py-2">
      <Icon className="h-3.5 w-3.5" />
      <span className="truncate">{text}</span>
    </div>
  )
}
