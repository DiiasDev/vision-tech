import { CircleDollarSign } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClientDetails } from "@/components/clients/mock-data"

type ClientFinanceTabProps = {
  client: ClientDetails
}

export default function ClientFinanceTab({ client }: ClientFinanceTabProps) {
  const totalAberto = client.invoices
    .filter((invoice) => invoice.status !== "Pago")
    .reduce((acc, invoice) => acc + invoice.valor, 0)

  return (
    <Card className="gap-4 border-border/70 bg-card/60">
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Financeiro e Faturamento</CardTitle>
            <CardDescription>Faturas recentes e exposicao financeira atual.</CardDescription>
          </div>
          <Badge variant={totalAberto > 0 ? "destructive" : "secondary"} className="rounded-full px-3 py-1">
            Aberto: R$ {totalAberto.toLocaleString("pt-BR")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {client.invoices.length ? (
          client.invoices.map((invoice) => (
            <div key={invoice.id} className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{invoice.descricao}</p>
                <Badge
                  variant={invoice.status === "Pago" ? "secondary" : invoice.status === "Atrasado" ? "destructive" : "default"}
                  className="rounded-full px-2.5 py-1"
                >
                  {invoice.status}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>#{invoice.id}</span>
                <span>Vencimento: {invoice.vencimento}</span>
                <span className="font-medium text-foreground">R$ {invoice.valor.toLocaleString("pt-BR")}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 p-8 text-center text-sm text-muted-foreground">
            <CircleDollarSign className="mx-auto mb-2 h-5 w-5" />
            Nenhuma fatura cadastrada para este cliente.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
