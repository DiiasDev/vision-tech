"use client"

import { useState } from "react"
import { CircleAlert, CircleCheck } from "lucide-react"

import ClientForm from "@/components/clients/clientForm"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ClientsKPIs from "@/components/clients/ClientsKPIs"
import ClientsFilters from "@/components/clients/ClientsFilters"
import ClientsTable from "@/components/clients/ClientsTable"

type FeedbackState = {
  type: "success" | "error"
  message: string
} | null

export default function ClientsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>(null)

  return (
    <div className="space-y-6 p-6">
      <div>
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          CRM SaaS
        </Badge>
        <h1 className="mt-3 text-3xl font-bold">Clientes</h1>
      </div>

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
