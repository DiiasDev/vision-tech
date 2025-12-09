import Header from "./Components/Header/Header";
import { Layout } from "./Components/Sidebar/Layout";
import { SidebarProvider } from "./contexts/SidebarContext";
import Home from "./Pages/HomePage/HomePage";

function App() {
  return (
    <SidebarProvider>
      <Layout>
        <Header />
        <Home/>
      </Layout>
    </SidebarProvider>
  );
}

export default App;
