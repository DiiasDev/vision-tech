import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./Components/Header/Header";
import { Layout } from "./Components/Sidebar/Layout";
import { SidebarProvider } from "./contexts/SidebarContext";
import Home from "./Pages/HomePage/HomePage";
import NovoCliente from "./Pages/ClientsPage/ClientPage"
import ClienteCard from "./Components/Clientes/ListaClientes"
import NewFornecedor from "./Components/Fornecedores/NewFornecedor"
import IntegrationsDashboard from "./Components/Integrations/IntegrationsDashboard";
import ClientIntegrationPage from "./Pages/IntegrationPage/ClientIntegrationPage";
import ServicesDashboard from "./Components/Integrations/ServicesComponent/ServicesDashboard";
import ServiceDetailPage from "./Pages/ServicePage/ServiceDetailPage";
import Login from "./Pages/AuthPage/AuthPage";
import { useAuth } from "./hooks/useAuth";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />;
}

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    );
  }

  return (
    <SidebarProvider>
      <Layout>
        <Header />
        <Routes>
          <Route path="/Home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/Clientes/Novo" element={<PrivateRoute><NovoCliente /></PrivateRoute>} />
          <Route path="/Clientes/Lista" element={<PrivateRoute><ClienteCard /></PrivateRoute>} />
          <Route path="/fornecedores/cadastro" element={<PrivateRoute><NewFornecedor /></PrivateRoute>} />
          <Route path="/integracoes/clientes" element={<PrivateRoute><IntegrationsDashboard /></PrivateRoute>} />
          <Route path="/integracoes/clientes/:clientId" element={<PrivateRoute><ClientIntegrationPage /></PrivateRoute>} />
          <Route path="/integracoes/backend" element={<PrivateRoute><ServicesDashboard /></PrivateRoute>} />
          <Route path="/integracoes/backend/:serviceId" element={<PrivateRoute><ServiceDetailPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/Home" replace />} />
        </Routes>
      </Layout>
    </SidebarProvider>
  );
}

function App() {
  return <AppContent />;
}

export default App;
