"use client"

import { Search, Plus } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import ClientForm from "@/components/clients/clientForm"
import ClientsKPIs from "@/components/clients/ClientsKPIs"
import ClientsTable from "@/components/clients/ClientsTable"
import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getClients, type ClientsListItem } from "@/services/clients.service"

type FeedbackState = {
  type: "success" | "error"
  message: string
} | null

type ClientsComponentProps = {
  detailsBasePath?: string
  detailsRouteMode?: "query" | "path"
}

export function ClientsComponent({
  detailsBasePath = "/clients/id",
  detailsRouteMode = "query",
}: ClientsComponentProps) {
  const [search, setSearch] = useState("")
  const [clients, setClients] = useState<ClientsListItem[]>([])
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set())
  const [deletingClientIds, setDeletingClientIds] = useState<Set<string>>(new Set())
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)
  const [formFeedback, setFormFeedback] = useState<FeedbackState>(null)

  const loadClients = useCallback(async () => {
    setIsLoadingClients(true)

    try {
      const response = await getClients()
      setClients(response.data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel carregar os clientes."
      setClients([])
      setFeedback(ComponentAlert.Error(message))
    } finally {
      setIsLoadingClients(false)
    }
  }, [])

  useEffect(() => {
    void loadClients()
  }, [loadClients])

  const filteredClients = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR")
    if (!normalizedSearch) return clients

    return clients.filter((client) => {
      const searchableParts = [
        client.code,
        client.name,
        client.document,
        client.status,
        client.type,
        client.email ?? "",
        client.responsibleName ?? "",
        client.city ?? "",
        client.state ?? "",
        client.telephone ?? "",
      ]

      return searchableParts.join(" ").toLocaleLowerCase("pt-BR").includes(normalizedSearch)
    })
  }, [clients, search])

  function removeClientFromState(clientId: string) {
    setClients((prev) => prev.filter((client) => client.id !== clientId))
    setSelectedClientIds((prev) => {
      const next = new Set(prev)
      next.delete(clientId)
      return next
    })
  }

  async function handleDeleteClientRequest(clientId: string) {
    setFeedback(ComponentAlert.Info("Removendo cliente..."))
    setDeletingClientIds((prev) => {
      const next = new Set(prev)
      next.add(clientId)
      return next
    })

    try {
      removeClientFromState(clientId)
      setFeedback(ComponentAlert.Success("Cliente removido da listagem."))
    } catch {
      setFeedback(ComponentAlert.Error("Nao foi possivel remover o cliente."))
    } finally {
      setDeletingClientIds((prev) => {
        const next = new Set(prev)
        next.delete(clientId)
        return next
      })
    }
  }

  function handleDeleteClient(clientId: string) {
    if (deletingClientIds.has(clientId)) return
    void handleDeleteClientRequest(clientId)
  }

  function handleToggleSelection(clientId: string, checked: boolean) {
    setSelectedClientIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(clientId)
      else next.delete(clientId)
      return next
    })
  }

  function handleToggleAllVisible(checked: boolean) {
    setSelectedClientIds((prev) => {
      const next = new Set(prev)

      filteredClients.forEach((client) => {
        if (checked) next.add(client.id)
        else next.delete(client.id)
      })

      return next
    })
  }

  function handleOpenClientForm() {
    setFormFeedback(null)
    setFeedback(null)
    setIsFormOpen(true)
  }

  function handleFormFeedback(nextFeedback: FeedbackState) {
    setFormFeedback(nextFeedback)

    if (!nextFeedback) {
      setFeedback(null)
      return
    }

    if (nextFeedback.type === "success") {
      setFeedback(ComponentAlert.Success(nextFeedback.message))
      return
    }

    setFeedback(ComponentAlert.Error(nextFeedback.message))
  }

  return (
    <div className="relative space-y-6 overflow-hidden pb-4">
      <ClientForm
        open={isFormOpen}
        loading={isSubmitting}
        feedback={formFeedback}
        onClose={() => setIsFormOpen(false)}
        onSubmitStart={() => {
          setIsSubmitting(true)
          setFormFeedback(null)
          setFeedback(null)
        }}
        onSubmitEnd={() => setIsSubmitting(false)}
        onFeedback={handleFormFeedback}
        onCreated={() => {
          void loadClients()
        }}
      />

      <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Clientes</h1>
          <p className="mt-1 text-lg text-muted-foreground">Gerencie sua base de clientes</p>
        </div>

        <Button type="button" className="h-11 rounded-xl px-5 text-sm shadow-sm" onClick={handleOpenClientForm}>
          <Plus className="h-4 w-4" />
          Adicionar Cliente
        </Button>
      </section>

      <ClientsKPIs clients={clients} />

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm">
        <div className="border-b border-border/70 p-5">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar clientes..."
              className="h-10 rounded-xl border-border/70 bg-background pl-10"
            />
          </div>
        </div>

        {isLoadingClients ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">Carregando clientes...</div>
        ) : (
          <ClientsTable
            clients={filteredClients}
            detailsBasePath={detailsBasePath}
            detailsRouteMode={detailsRouteMode}
            selectedClientIds={selectedClientIds}
            deletingClientIds={deletingClientIds}
            onToggleSelection={handleToggleSelection}
            onToggleAll={handleToggleAllVisible}
            onDeleteClient={handleDeleteClient}
          />
        )}
      </section>
    </div>
  )
}

export default ClientsComponent
