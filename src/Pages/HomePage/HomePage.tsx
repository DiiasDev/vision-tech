import { useState } from "react";
import { 
  FiUsers, 
  FiFileText, 
  FiShoppingBag, 
  FiAlertTriangle, 
  FiPlusCircle 
} from "react-icons/fi";

import DashboardCard from "../../Components/Home/DashboardCard";
import QuickAction from "../../Components/Home/QuickActions";
import SystemStatusItem from "../../Components/Home/StatusSystem";

export default function Home() {
  const [systemStatus] = useState({
    backend: "online",
    lastSync: "Há 2 minutos",
    version: "1.0.0",
  });

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
          value="128"
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
