import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./Components/Header/Header";
import { Layout } from "./Components/Sidebar/Layout";
import { SidebarProvider } from "./contexts/SidebarContext";
import Home from "./Pages/HomePage/HomePage";
import NovoCliente from "./Pages/ClientsPage/ClientPage"
import ClienteCard from "./Components/Clientes/ListaClientes"

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
        </Routes>
      </Layout>
    </SidebarProvider>
  );
}

export default App;
