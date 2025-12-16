import {
  Computer,
  AttachMoney,
  Build,
  Inventory,
} from "@mui/icons-material";
import { type Notification } from "../../types/Notify.types";

const icons = {
  system: <Computer fontSize="small" />,
  finance: <AttachMoney fontSize="small" />,
  service: <Build fontSize="small" />,
  stock: <Inventory fontSize="small" />,
};

interface Props {
  data: Notification;
  onToggleRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ data, onToggleRead, onDelete }: Props) {
  const typeColors = {
    system: "from-blue-500 to-blue-600",
    finance: "from-green-500 to-emerald-600",
    service: "from-orange-500 to-amber-600",
    stock: "from-purple-500 to-violet-600",
  };

  return (
    <div
      className={`group relative flex gap-4 p-5 rounded-2xl transition-all duration-300
        ${data.read 
          ? "bg-white dark:bg-neutral-800/40 hover:bg-gray-50 dark:hover:bg-neutral-800/70 border border-gray-200 dark:border-neutral-700/50" 
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/50 dark:from-blue-900/20 dark:via-neutral-800/50 dark:to-indigo-900/10 border-2 border-blue-200 dark:border-blue-700/50 shadow-lg shadow-blue-500/10 dark:shadow-blue-900/20"
        }
        hover:shadow-xl hover:scale-[1.01] hover:border-blue-300 dark:hover:border-blue-600/50`}
    >
      {/* Indicador visual lateral melhorado */}
      {!data.read && (
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-gradient-to-b ${typeColors[data.type]} rounded-r-full shadow-lg`}></div>
      )}

      {/* Ícone com badge melhorado */}
      <div className={`flex-shrink-0 relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all
        ${data.read 
          ? "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-700 dark:to-neutral-800 text-gray-600 dark:text-gray-400" 
          : `bg-gradient-to-br ${typeColors[data.type]} text-white shadow-xl`
        }`}>
        {icons[data.type]}
        {!data.read && (
          <>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-full border-3 border-white dark:border-neutral-900 animate-pulse shadow-lg"></div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent"></div>
          </>
        )}
      </div>

      {/* Conteúdo melhorado */}
      <div className="flex-1 min-w-0 pr-20">
        <div className="flex items-start justify-between gap-3 mb-1">
          <p className={`font-bold text-base leading-tight ${
            data.read 
              ? "text-gray-700 dark:text-gray-300" 
              : "text-gray-900 dark:text-white"
          }`}>
            {data.title}
          </p>
          <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0 bg-gray-100 dark:bg-neutral-700/50 px-2 py-0.5 rounded-full">
            {data.date}
          </span>
        </div>
        
        <p className={`text-sm mt-1.5 leading-relaxed ${
          data.read 
            ? "text-gray-600 dark:text-gray-400" 
            : "text-gray-700 dark:text-gray-300"
        }`}>
          {data.description}
        </p>
        
        {/* Badge de status */}
        {!data.read && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></span>
              Nova
            </span>
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1">
        <button
          className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onToggleRead(data.id);
          }}
          title={data.read ? "Marcar como não lida" : "Marcar como lida"}
        >
          <span className="text-sm">{data.read ? "📭" : "✓"}</span>
        </button>
        <button
          className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(data.id);
          }}
          title="Deletar notificação"
        >
          <span className="text-sm">🗑️</span>
        </button>
      </div>
    </div>
  );
}
