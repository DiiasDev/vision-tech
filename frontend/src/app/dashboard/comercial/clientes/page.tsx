"use client"

import { useState } from "react"
import { ArrowUpRight, ChartNoAxesColumnIncreasing, CircleAlert, CircleCheck, Users } from "lucide-react"

import ClientForm from "@/components/clients/clientForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ClientsKPIs from "@/components/clients/ClientsKPIs"
import ClientsFilters from "@/components/clients/ClientsFilters"
import ClientsTable from "@/components/clients/ClientsTable"
import { clientsData } from "@/components/clients/mock-data"

export default function DashboardClientsPage() {
  const mrr = clientsData.reduce((acc, client) => acc + client.mrr, 0)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-6 text-slate-100 shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-16 h-52 w-52 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-indigo-300/20 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="secondary" className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">
              Comercial • Pipeline de Clientes
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Gestao de carteira com foco em receita e retencao</h1>
            <p className="text-sm text-slate-300 md:text-base">
              Monitore saude das contas, riscos de inadimplencia e proximas oportunidades em um unico painel.
            </p>
          </div>

          <div className="grid min-w-[260px] gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">MRR total</p>
              <p className="mt-2 text-2xl font-semibold">R$ {mrr.toLocaleString("pt-BR")}</p>
            </div>
            <Button variant="secondary" className="rounded-xl border border-white/10 bg-white/10 text-slate-100 hover:bg-white/20">
              <ChartNoAxesColumnIncreasing className="h-4 w-4" />
              Ver relatorio executivo
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card/40 p-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Cobertura comercial</p>
          <p className="mt-2 text-lg font-semibold">8 estados monitorados</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Contas enterprise</p>
          <p className="mt-2 text-lg font-semibold">1 cliente premium ativo</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Equipe de atendimento</p>
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
            <Users className="h-4 w-4 text-muted-foreground" />
            3 gerentes dedicados
          </p>
        </div>
      </section>

      {feedback ? (
        <Alert variant={feedback.type === "error" ? "destructive" : "success"}>
          {feedback.type === "error" ? <CircleAlert /> : <CircleCheck />}
          <AlertTitle>{feedback.type === "error" ? "Falha no cadastro" : "Sucesso"}</AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      ) : null}

      <ClientsKPIs />

      <ClientsFilters onNewClientClick={() => setIsFormOpen(true)} />

      <ClientsTable />

      <ClientForm
        open={isFormOpen}
        loading={isSubmitting}
        feedback={feedback}
        onClose={() => setIsFormOpen(false)}
        onSubmitStart={() => {
          setIsSubmitting(true)
          setFeedback(null)
        }}
        onSubmitEnd={() => setIsSubmitting(false)}
        onFeedback={setFeedback}
      />
    </div>
  )
}
