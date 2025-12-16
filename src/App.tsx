import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./Components/Header/Header";
import { Layout } from "./Components/Sidebar/Layout";
import { SidebarProvider } from "./contexts/SidebarContext";
import Home from "./Pages/HomePage/HomePage";
import NovoCliente from "./Pages/ClientsPage/ClientPage"
import ClienteCard from "./Components/Clientes/ListaClientes"
import IntegrationsDashboard from "./Components/Integrations/IntegrationsDashboard";
import ClientIntegrationPage from "./Pages/IntegrationPage/ClientIntegrationPage";
import ServicesDashboard from "./Components/Integrations/ServicesComponent/ServicesDashboard";
import ServiceDetailPage from "./Pages/ServicePage/ServiceDetailPage";

function App() {
  return (
    <SidebarProvider>
      <Layout>
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/Home" replace />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Clientes/Novo" element={<NovoCliente />} />
          <Route path="/Clientes/Lista" element={<ClienteCard />} />
          <Route path="/integracoes/clientes" element={<IntegrationsDashboard />} />
          <Route path="/integracoes/clientes/:clientId" element={<ClientIntegrationPage />} />
          <Route path="/integracoes/backend" element={<ServicesDashboard />} />
          <Route path="/integracoes/backend/:serviceId" element={<ServiceDetailPage />} />
        </Routes>
      </Layout>
    </SidebarProvider>
  );
}

export default App;
