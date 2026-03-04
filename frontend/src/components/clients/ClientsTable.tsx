import Link from "next/link"
import { Building2, CircleAlert, Clock3 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClientsListItem } from "@/services/clients.service"
import { formatCpfCnpj, formatPhoneBR } from "@/utils/Formatter"

function statusBadgeVariant(status: ClientsListItem["status"]): "default" | "secondary" | "destructive" {
  if (status === "DELINQUENT") return "destructive"
  if (status === "ACTIVE") return "default"
  return "secondary"
}

function statusLabel(status: ClientsListItem["status"]) {
  if (status === "ACTIVE") return "Ativo"
  if (status === "DELINQUENT") return "Inadimplente"
  return "Inativo"
}

function formatLastContact(value?: string | null) {
  if (!value) return "Sem registro"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Sem registro"
  return date.toLocaleString("pt-BR")
}

function formatLocation(city?: string | null, state?: string | null) {
  if (city && state) return `${city}, ${state}`
  if (city) return city
  if (state) return state
  return "Nao informado"
}

type ClientsTableProps = {
  clients: ClientsListItem[]
}

export default function ClientsTable({ clients }: ClientsTableProps) {
  const atRisk = clients.filter((client) => client.status === "DELINQUENT").length

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
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-muted/20 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr className="border-b border-border/70">
                <th className="px-6 py-3 text-left font-medium">Cliente</th>
                <th className="px-3 py-3 text-left font-medium">Documento</th>
                <th className="px-3 py-3 text-left font-medium">Tipo</th>
                <th className="px-3 py-3 text-left font-medium">Status</th>
                <th className="px-3 py-3 text-left font-medium">Cidade</th>
                <th className="px-3 py-3 text-left font-medium">Ultimo contato</th>
                <th className="px-3 py-3 text-right font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-border/60 transition-colors hover:bg-muted/25">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg border border-border/70 bg-background/70 p-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.email ?? "Sem email"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{client.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <p className="text-foreground">{formatCpfCnpj(client.document)}</p>
                  </td>
                  <td className="px-3 py-4">
                    <Badge variant="secondary" className="rounded-full px-2.5 py-1">
                      {client.type}
                    </Badge>
                  </td>
                  <td className="px-3 py-4">
                    <Badge variant={statusBadgeVariant(client.status)} className="rounded-full px-2.5 py-1">
                      {statusLabel(client.status)}
                    </Badge>
                  </td>
                  <td className="px-3 py-4">
                    <p className="text-foreground">{formatLocation(client.city, client.state)}</p>
                  </td>
                  <td className="px-3 py-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatLastContact(client.lastContact)}
                    </div>
                    <p className="mt-1 max-w-[220px] truncate text-xs">
                      {client.telephone ? formatPhoneBR(client.telephone) : "Sem telefone"}
                    </p>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <Button asChild size="sm" className="rounded-lg">
                      <Link href={`/dashboard/comercial/clientes/${client.id}`}>Abrir</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    Nenhum cliente encontrado.
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
