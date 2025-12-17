import { useState, useEffect } from "react";
import { 
  FiUsers, 
  FiFileText, 
  FiShoppingBag, 
  FiAlertTriangle, 
  FiPlusCircle 
} from "react-icons/fi";
import { listarClientes } from "../../Services/clients.api";
import { type ClienteTypes } from "../../types/Clientes.types";


import DashboardCard from "../../Components/Home/DashboardCard";
import QuickAction from "../../Components/Home/QuickActions";
import SystemStatusItem from "../../Components/Home/StatusSystem";
import { verificarStatusBackend } from "../../Services/frappeClient";

export default function Home() {
  const [systemStatus, setSystemStatus] = useState({
    backend: "verificando...",
    lastSync: "Verificando...",
    version: "1.0.0",
  });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [clientes, setClientes] = useState<ClienteTypes[]>([])

  useEffect(() => {
    async function checkBackendStatus() {
      const isOnline = await verificarStatusBackend();
      const now = new Date();
      if (isOnline) {
        setLastSyncTime(now);
      }
      
      setSystemStatus({
        backend: isOnline ? "online" : "offline",
        lastSync: isOnline ? formatLastSync(now) : "Indisponível",
        version: "1.0.0",
      });
    }

    checkBackendStatus();

    // Verifica a cada 30 segundos
    const interval = setInterval(checkBackendStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchClientes() {
      try{
        const data = await listarClientes();
        setClientes(data)
      }catch(error){
        console.log("Erro ao trazer clientes...")
      }
    }

    fetchClientes();
  }, []);

  // Atualiza o tempo de sincronização a cada segundo
  useEffect(() => {
    if (!lastSyncTime) return;

    const updateInterval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        lastSync: formatLastSync(lastSyncTime),
      }));
    }, 1000);

    return () => clearInterval(updateInterval);
  }, [lastSyncTime]);

  function formatLastSync(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `Há ${diffInSeconds} segundo${diffInSeconds !== 1 ? 's' : ''}`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Há ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    return `Há ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
  }

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 bg-[var(--page-bg)]">

      {/* TÍTULO */}
      <h1 className="text-3xl font-semibold text-neutralLight dark:text-white">
        Dashboard Vision Tech
      </h1>

      {/* === CARDS SUPERIORES === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <DashboardCard
          title="Clientes"
          value={clientes? clientes.length : "0"}
          icon={<FiUsers size={26} />}
          color="primary"
        />

        <DashboardCard
          title="Orçamentos"
          value="54"
          icon={<FiFileText size={26} />}
          color="secondary"
        />

        <DashboardCard
          title="Pedidos"
          value="32"
          icon={<FiShoppingBag size={26} />}
          color="dark"
        />

        <DashboardCard
          title="Estoque Baixo"
          value="7"
          icon={<FiAlertTriangle size={26} />}
          color="accent"
        />
      </div>

      {/* === GRÁFICO / PLACEHOLDER === */}
      <div className="bg-white dark:bg-neutralDark rounded-xl p-6 shadow border border-gray-200 dark:border-neutral-700">
        <h2 className="text-xl font-medium mb-4 dark:text-white">Resumo Mensal</h2>

        <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <span>📊 Gráfico será carregado aqui...</span>
        </div>
      </div>

      {/* === ATALHOS RÁPIDOS === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <QuickAction
          title="Criar Orçamento"
          icon={<FiPlusCircle size={22} />}
          color="primary"
          onClick={() => console.log("Criar orçamento")}
        />

        <QuickAction
          title="Novo Cliente"
          icon={<FiUsers size={22} />}
          color="secondary"
          onClick={() => console.log("Novo cliente")}
        />

        <QuickAction
          title="Gerar Pedido"
          icon={<FiFileText size={22} />}
          color="accent"
          onClick={() => console.log("Gerar pedido")}
        />
      </div>

      {/* === STATUS DO SISTEMA === */}
      <div className="bg-white dark:bg-neutralDark rounded-xl shadow p-6 border border-gray-200 dark:border-neutral-700">
        <h2 className="text-xl font-medium mb-4 dark:text-white">Status do Sistema</h2>

        <div className="flex flex-col gap-3">

          <SystemStatusItem label="Backend" value={systemStatus.backend} />
          <SystemStatusItem label="Última sincronização" value={systemStatus.lastSync} />
          <SystemStatusItem label="Versão" value={systemStatus.version} />

        </div>
      </div>
    </div>
  );
}
