import { Wrench } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClientDetails } from "@/components/clients/mock-data"

type ClientServicesTabProps = {
  client: ClientDetails
}

export default function ClientServicesTab({ client }: ClientServicesTabProps) {
  return (
    <Card className="gap-4 border-border/70 bg-card/60">
      <CardHeader>
        <CardTitle className="text-lg">Ordens de Servico</CardTitle>
        <CardDescription>Execucao operacional, prioridades e responsaveis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {client.serviceOrders.length ? (
          client.serviceOrders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{order.titulo}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={order.prioridade === "Alta" ? "destructive" : "secondary"}>{order.prioridade}</Badge>
                  <Badge variant={order.status === "Concluida" ? "secondary" : "default"}>{order.status}</Badge>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>#{order.id}</span>
                <span>Tecnico: {order.tecnico}</span>
                <span>Agenda: {order.agendamento}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 p-8 text-center text-sm text-muted-foreground">
            <Wrench className="mx-auto mb-2 h-5 w-5" />
            Sem ordens de servico em aberto.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
