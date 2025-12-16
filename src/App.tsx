import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./Components/Header/Header";
import { Layout } from "./Components/Sidebar/Layout";
import { SidebarProvider } from "./contexts/SidebarContext";
import Home from "./Pages/HomePage/HomePage";
import NovoCliente from "./Pages/ClientsPage/ClientPage"
import ClienteCard from "./Components/Clientes/ListaClientes"
import IntegrationsDashboard from "./Components/Integrations/IntegrationsDashboard";
import ClientIntegrationPage from "./Pages/IntegrationPage/ClientIntegrationPage";

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
        </Routes>
      </Layout>
    </SidebarProvider>
  );
}

export default App;
