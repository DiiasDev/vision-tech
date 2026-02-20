import Link from "next/link"
import { ArrowUpRight, Building2, CircleAlert, Clock3 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { clientsData, type ClientStatus } from "@/components/clients/mock-data"

function statusBadgeVariant(status: ClientStatus): "default" | "secondary" | "destructive" {
  if (status === "Inadimplente") return "destructive"
  if (status === "Ativo") return "default"
  return "secondary"
}

export default function ClientsTable() {
  const atRisk = clientsData.filter((client) => client.status === "Em risco" || client.status === "Inadimplente").length

  return (
    <Card className="overflow-hidden border-border/70 bg-card/70 shadow-lg">
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Pipeline de Clientes</CardTitle>
            <CardDescription className="mt-1">
              Visao de receita, risco e saude da carteira comercial.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <CircleAlert className="h-3.5 w-3.5 text-amber-300" />
            {atRisk} contas em acompanhamento
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full text-sm">
            <thead className="bg-muted/20 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr className="border-b border-border/70">
                <th className="px-6 py-3 text-left font-medium">Cliente</th>
                <th className="px-3 py-3 text-left font-medium">Segmento</th>
                <th className="px-3 py-3 text-left font-medium">Plano</th>
                <th className="px-3 py-3 text-left font-medium">Status</th>
                <th className="px-3 py-3 text-left font-medium">Saude</th>
                <th className="px-3 py-3 text-left font-medium">MRR</th>
                <th className="px-3 py-3 text-left font-medium">Ultimo contato</th>
                <th className="px-3 py-3 text-right font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {clientsData.map((client) => (
                <tr key={client.id} className="border-b border-border/60 transition-colors hover:bg-muted/25">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg border border-border/70 bg-background/70 p-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{client.nome}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{client.cidade}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <p className="text-foreground">{client.segmento}</p>
                    <p className="text-xs text-muted-foreground">{client.tipo}</p>
                  </td>
                  <td className="px-3 py-4">
                    <Badge variant="secondary" className="rounded-full px-2.5 py-1">
                      {client.plano}
                    </Badge>
                  </td>
                  <td className="px-3 py-4">
                    <Badge variant={statusBadgeVariant(client.status)} className="rounded-full px-2.5 py-1">
                      {client.status}
                    </Badge>
                    {client.inadimplenciaDias ? (
                      <p className="mt-1 text-xs text-rose-300">{client.inadimplenciaDias} dias em atraso</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-4">
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-foreground">{client.healthScore}%</p>
                      <div className="h-1.5 w-28 rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-sky-400 to-emerald-300"
                          style={{ width: `${client.healthScore}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Tickets abertos: {client.openTickets}</p>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <p className="font-semibold text-foreground">R$ {client.mrr.toLocaleString("pt-BR")}</p>
                    <p className="text-xs text-muted-foreground">LTV R$ {client.totalGasto.toLocaleString("pt-BR")}</p>
                  </td>
                  <td className="px-3 py-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock3 className="h-3.5 w-3.5" />
                      {client.ultimoContato}
                    </div>
                    <p className="mt-1 max-w-[220px] truncate text-xs">{client.proximaAcao}</p>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <Button asChild size="sm" className="rounded-lg">
                      <Link href={`/dashboard/comercial/clientes/${client.id}`}>
                        Abrir
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
