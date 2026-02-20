import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ClientDetails } from "@/components/clients/mock-data"

type ClientNotesTabProps = {
  client: ClientDetails
}

export default function ClientNotesTab({ client }: ClientNotesTabProps) {
  return (
    <Card className="space-y-4 border-border/70 bg-card/60 p-6">
      <h2 className="text-lg font-semibold">Observacoes Internas</h2>

      <Textarea
        className="min-h-24 rounded-xl border-border/70 bg-background/60"
        placeholder="Adicionar observacao para equipe comercial e tecnica..."
      />

      <Button className="rounded-xl">Salvar Observacao</Button>

      <div className="mt-2 space-y-3">
        {client.notes.length ? (
          client.notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{note.autor}</Badge>
                  <span className="text-xs text-muted-foreground">{note.data}</span>
                </div>
              </div>
              <p className="text-sm text-foreground/95">{note.texto}</p>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
            Ainda nao existem observacoes registradas.
          </div>
        )}
      </div>
    </Card>
  )
}
