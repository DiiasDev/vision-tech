import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./Components/Header/Header";
import { Layout } from "./Components/Sidebar/Layout";
import { SidebarProvider } from "./contexts/SidebarContext";
import Home from "./Pages/HomePage/HomePage";
import NovoCliente from "./Pages/ClientsPage/ClientPage"
import ClienteCard from "./Components/Clientes/ListaClientes"
import NewFornecedor from "./Components/Fornecedores/NewFornecedor"
import ListaFornecedores from "./Components/Fornecedores/ListaFornecedores"
import IntegrationsDashboard from "./Components/Integrations/IntegrationsDashboard";
import ClientIntegrationPage from "./Pages/IntegrationPage/ClientIntegrationPage";
import ServicesDashboard from "./Components/Integrations/ServicesComponent/ServicesDashboard";
import ServiceDetailPage from "./Pages/ServicePage/ServiceDetailPage";
import Login from "./Pages/AuthPage/AuthPage";
import { useAuth } from "./hooks/useAuth";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? <Navigate to="/Home" replace /> : <>{children}</>;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Rota raiz - redireciona baseado em autenticação */}
      <Route 
        path="/" 
        element={
          isAuthenticated() ? <Navigate to="/Home" replace /> : <Navigate to="/login" replace />
        } 
      />

      {/* Rota pública de Login */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />

      {/* Rotas protegidas com Layout */}
      <Route 
        path="/*" 
        element={
          <PrivateRoute>
            <SidebarProvider>
              <Layout>
                <Header />
                <Routes>
                  <Route path="/Home" element={<Home />} />
                  <Route path="/Clientes/Novo" element={<NovoCliente />} />
                  <Route path="/Clientes/Lista" element={<ClienteCard />} />
                  <Route path="/fornecedores/cadastro" element={<NewFornecedor />} />
                  <Route path="/fornecedores" element={<ListaFornecedores />} />
                  <Route path="/integracoes/clientes" element={<IntegrationsDashboard />} />
                  <Route path="/integracoes/clientes/:clientId" element={<ClientIntegrationPage />} />
                  <Route path="/integracoes/backend" element={<ServicesDashboard />} />
                  <Route path="/integracoes/backend/:serviceId" element={<ServiceDetailPage />} />
                  <Route path="*" element={<Navigate to="/Home" replace />} />
                </Routes>
              </Layout>
            </SidebarProvider>
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

export default App;
