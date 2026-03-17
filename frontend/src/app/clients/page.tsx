import ClientsComponent from "@/components/clients/ClientsComponent"

export default function ClientsPage() {
  return <ClientsComponent detailsBasePath="/clients/id" detailsRouteMode="query" />
}
