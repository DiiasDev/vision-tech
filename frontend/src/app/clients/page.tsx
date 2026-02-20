import { Badge } from "@/components/ui/badge"
import ClientsKPIs from "@/components/clients/ClientsKPIs"
import ClientsFilters from "@/components/clients/ClientsFilters"
import ClientsTable from "@/components/clients/ClientsTable"

export default function ClientsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          CRM SaaS
        </Badge>
        <h1 className="mt-3 text-3xl font-bold">Clientes</h1>
      </div>

      <ClientsKPIs />

      <ClientsFilters />

      <ClientsTable />
    </div>
  )
}
