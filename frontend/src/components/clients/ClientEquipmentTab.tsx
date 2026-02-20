import { MonitorCog } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClientDetails } from "@/components/clients/mock-data"

type ClientEquipmentTabProps = {
  client: ClientDetails
}

export default function ClientEquipmentTab({ client }: ClientEquipmentTabProps) {
  return (
    <Card className="gap-4 border-border/70 bg-card/60">
      <CardHeader>
        <CardTitle className="text-lg">Parque de Equipamentos</CardTitle>
        <CardDescription>Inventario tecnico e estado dos ativos monitorados.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {client.equipments.length ? (
          client.equipments.map((equipment) => (
            <div key={equipment.id} className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{equipment.nome}</p>
                <Badge
                  variant={
                    equipment.status === "Operacional"
                      ? "secondary"
                      : equipment.status === "Monitoramento"
                        ? "default"
                        : "destructive"
                  }
                >
                  {equipment.status}
                </Badge>
              </div>
              <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                <p>#{equipment.id}</p>
                <p>Serial: {equipment.serial}</p>
                <p>Categoria: {equipment.categoria}</p>
                <p>Garantia: {equipment.garantia}</p>
                <p>Ultima manutencao: {equipment.ultimaManutencao}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 p-8 text-center text-sm text-muted-foreground">
            <MonitorCog className="mx-auto mb-2 h-5 w-5" />
            Nenhum equipamento vinculado a este cliente.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
