import { Building2, Mail, MapPin, Phone, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClientDetails } from "@/components/clients/mock-data"

type ClientSummaryTabProps = {
  client: ClientDetails
}

export default function ClientSummaryTab({ client }: ClientSummaryTabProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card className="gap-4 border-border/70 bg-card/60">
        <CardHeader>
          <CardTitle className="text-lg">Visao Geral</CardTitle>
          <CardDescription>Resumo estrategico do relacionamento com o cliente.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-muted/25 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Conta</p>
            <p className="mt-2 text-lg font-semibold">{client.fantasia ?? client.nome}</p>
            <p className="text-sm text-muted-foreground">{client.nome}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{client.plano}</Badge>
              <Badge>{client.status}</Badge>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/25 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Indicadores</p>
            <p className="mt-2 text-sm text-muted-foreground">Saude da conta</p>
            <p className="text-2xl font-semibold text-emerald-300">{client.healthScore}%</p>
            <p className="mt-2 text-sm text-muted-foreground">MRR R$ {client.mrr.toLocaleString("pt-BR")}</p>
            <p className="text-sm text-muted-foreground">LTV R$ {client.totalGasto.toLocaleString("pt-BR")}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-4 border-border/70 bg-card/60">
        <CardHeader>
          <CardTitle className="text-lg">Dados Cadastrais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2 text-muted-foreground">
            <Building2 className="mt-0.5 h-4 w-4" />
            <span>{client.cnpjCpf}</span>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <UserRound className="mt-0.5 h-4 w-4" />
            <span>{client.responsavel}</span>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <Mail className="mt-0.5 h-4 w-4" />
            <span>{client.email}</span>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <Phone className="mt-0.5 h-4 w-4" />
            <span>{client.telefone}</span>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4" />
            <span>{client.endereco}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
