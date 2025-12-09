import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./Components/Header/Header";
import { Layout } from "./Components/Sidebar/Layout";
import { SidebarProvider } from "./contexts/SidebarContext";
import Home from "./Pages/HomePage/HomePage";

function App() {
  return (
    <SidebarProvider>
      <Layout>
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/Home" replace />} />
          <Route path="/Home" element={<Home />} />
          {/* Adicione outras rotas aqui conforme necessário */}
        </Routes>
      </Layout>
    </SidebarProvider>
  );
}

export default App;
