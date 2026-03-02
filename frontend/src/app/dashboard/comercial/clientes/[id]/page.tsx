"use client"

import { use, useEffect, useMemo, useState } from "react"
import { BadgeCheck, CalendarClock, CircleAlert, LifeBuoy } from "lucide-react"

import ClientSummaryTab from "@/components/clients/ClientSummaryTab"
import ClientFinanceTab from "@/components/clients/ClientFinanceTab"
import ClientServicesTab from "@/components/clients/ClientServicesTab"
import ClientEquipmentTab from "@/components/clients/ClientEquipmentTab"
import ClientFilesTab from "@/components/clients/ClientFilesTab"
import ClientNotesTab from "@/components/clients/ClientNotesTab"
import type { ClientDetails } from "@/components/clients/mock-data"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getClientById, type ClientsListItem } from "@/services/clients.service"

type DashboardClientDetailsPageProps = {
  params: Promise<{
    id: string
  }>
}

function statusLabel(status: ClientsListItem["status"]) {
  if (status === "ACTIVE") return "Ativo"
  if (status === "DELINQUENT") return "Inadimplente"
  return "Em risco"
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

function formatAddress(client: ClientsListItem) {
  const pieces = [client.street, client.number, client.neighborhood, formatLocation(client.city, client.state)].filter(Boolean)
  return pieces.length ? pieces.join(" - ") : "Nao informado"
}

function mapApiClientToDetails(client: ClientsListItem): ClientDetails {
  return {
    id: client.id,
    nome: client.name,
    fantasia: client.name,
    tipo: client.type,
    segmento: "Sem segmento",
    email: client.email ?? "Sem email",
    telefone: client.telephone ?? "Sem telefone",
    cidade: formatLocation(client.city, client.state),
    gerenteConta: client.responsibleName ?? "Nao definido",
    status: statusLabel(client.status),
    plano: "Essentials",
    mrr: 0,
    totalGasto: 0,
    healthScore: client.status === "ACTIVE" ? 80 : client.status === "DELINQUENT" ? 40 : 60,
    ticketMedio: 0,
    ultimoContato: formatLastContact(client.lastContact),
    proximaAcao: "Sem acao registrada",
    openTickets: 0,
    cnpjCpf: client.document,
    responsavel: client.responsibleName ?? client.name,
    endereco: formatAddress(client),
    desde: new Date(client.createdAt).toLocaleDateString("pt-BR"),
    contatos: [],
    invoices: [],
    serviceOrders: [],
    equipments: [],
    files: [],
    notes: [],
  }
}

export default function DashboardClientDetailsPage({ params }: DashboardClientDetailsPageProps) {
  const { id } = use(params)
  const [apiClient, setApiClient] = useState<ClientsListItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadClient() {
      try {
        setLoading(true)
        setError(null)
        const response = await getClientById(id)
        if (!mounted) return
        setApiClient(response.data)
      } catch (err) {
        if (!mounted) return
        const message = err instanceof Error ? err.message : "Nao foi possivel carregar o cliente."
        setError(message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void loadClient()

    return () => {
      mounted = false
    }
  }, [id])

  const client = useMemo(() => (apiClient ? mapApiClientToDetails(apiClient) : null), [apiClient])

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/40 p-6 text-sm text-muted-foreground">
        Carregando cliente...
      </div>
    )
  }

  if (error || !client || !apiClient) {
    return (
      <Alert variant="destructive">
        <CircleAlert className="h-4 w-4" />
        <AlertTitle>Erro ao abrir cliente</AlertTitle>
        <AlertDescription>{error ?? "Cliente nao encontrado."}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-6 text-slate-100 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="space-y-3">
            <Badge variant="secondary" className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">
              Cliente • {apiClient.code}
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">{client.fantasia ?? client.nome}</h1>
            <p className="text-sm text-slate-300">{client.nome}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full border border-white/10 bg-cyan-400/20 px-3 py-1 text-cyan-100">{client.status}</Badge>
              <Badge variant="secondary" className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-slate-100">
                Tipo {client.tipo}
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
