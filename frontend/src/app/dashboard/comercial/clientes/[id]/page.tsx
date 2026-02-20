import { notFound } from "next/navigation"
import { BadgeCheck, CalendarClock, LifeBuoy } from "lucide-react"

import ClientSummaryTab from "@/components/clients/ClientSummaryTab"
import ClientFinanceTab from "@/components/clients/ClientFinanceTab"
import ClientServicesTab from "@/components/clients/ClientServicesTab"
import ClientEquipmentTab from "@/components/clients/ClientEquipmentTab"
import ClientFilesTab from "@/components/clients/ClientFilesTab"
import ClientNotesTab from "@/components/clients/ClientNotesTab"
import { getClientById } from "@/components/clients/mock-data"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type DashboardClientDetailsPageProps = {
  params: Promise<{ id: string }>
}

export default async function DashboardClientDetailsPage({ params }: DashboardClientDetailsPageProps) {
  const { id } = await params
  const client = getClientById(id)

  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-6 text-slate-100 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="space-y-3">
            <Badge variant="secondary" className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">
              Cliente • {client.id.toUpperCase()}
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">{client.fantasia ?? client.nome}</h1>
            <p className="text-sm text-slate-300">{client.nome}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full border border-white/10 bg-cyan-400/20 px-3 py-1 text-cyan-100">
                {client.status}
              </Badge>
              <Badge variant="secondary" className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-slate-100">
                Plano {client.plano}
              </Badge>
            </div>
          </div>

          <div className="grid min-w-[260px] gap-2 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Gestor da conta</p>
              <p className="mt-1 font-medium">{client.gerenteConta}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Desde</p>
              <p className="mt-1 font-medium">{client.desde}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card/40 p-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Saude da conta</p>
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-emerald-300">
            <BadgeCheck className="h-4 w-4" />
            {client.healthScore}%
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Ultimo contato</p>
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            {client.ultimoContato}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Suporte aberto</p>
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
            <LifeBuoy className="h-4 w-4 text-muted-foreground" />
            {client.openTickets} tickets
          </p>
        </div>
      </section>

      <Tabs defaultValue="resumo" className="gap-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl border border-border/70 bg-card/40 p-2">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="servicos">Servicos</TabsTrigger>
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
          <TabsTrigger value="observacoes">Observacoes</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <ClientSummaryTab client={client} />
        </TabsContent>

        <TabsContent value="financeiro">
          <ClientFinanceTab client={client} />
        </TabsContent>

        <TabsContent value="servicos">
          <ClientServicesTab client={client} />
        </TabsContent>

        <TabsContent value="equipamentos">
          <ClientEquipmentTab client={client} />
        </TabsContent>

        <TabsContent value="arquivos">
          <ClientFilesTab client={client} />
        </TabsContent>

        <TabsContent value="observacoes">
          <ClientNotesTab client={client} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
