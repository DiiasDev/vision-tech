import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ClientSummaryTab from "@/components/clients/ClientSummaryTab"
import ClientFinanceTab from "@/components/clients/ClientFinanceTab"
import ClientServicesTab from "@/components/clients/ClientServicesTab"
import ClientEquipmentTab from "@/components/clients/ClientEquipmentTab"
import ClientFilesTab from "@/components/clients/ClientFilesTab"
import ClientNotesTab from "@/components/clients/ClientNotesTab"
import { clientsData } from "@/components/clients/mock-data"

export default function ClientDetailsPage() {
  const client = clientsData[0]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Detalhes do Cliente</h1>

      <Tabs defaultValue="resumo">
        <TabsList>
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
