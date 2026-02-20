import { Download, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClientDetails } from "@/components/clients/mock-data"

type ClientFilesTabProps = {
  client: ClientDetails
}

export default function ClientFilesTab({ client }: ClientFilesTabProps) {
  return (
    <Card className="gap-4 border-border/70 bg-card/60">
      <CardHeader>
        <CardTitle className="text-lg">Central de Arquivos</CardTitle>
        <CardDescription>Contratos, anexos financeiros e documentos operacionais.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {client.files.length ? (
          client.files.map((file) => (
            <div key={file.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-border/70 bg-background/70 p-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{file.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.tipo} • {file.tamanho} • Atualizado por {file.atualizadoPor}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg border-border/70">
                <Download className="h-4 w-4" />
                Baixar
              </Button>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 p-8 text-center text-sm text-muted-foreground">
            Nenhum arquivo disponivel para este cliente.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
