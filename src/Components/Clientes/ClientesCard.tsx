import { type ClienteTypes } from "../../types/Clientes.types";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const getStatusLabel = (ativo?: number) => {
  if (ativo === 1) return "Ativo";
  if (ativo === 0) return "Inativo";
  return "Pendente";
};

const getStatusStyle = (ativo?: number) => {
  if (ativo === 1) return "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500";
  if (ativo === 0) return "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500";
  return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500";
};

const formatPhoneNumber = (phone?: string) => {
  if (!phone) return "Sem telefone";
  
  // Remove tudo que não é número
  const cleaned = phone.replace(/\D/g, "");
  
  // Formata para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

export default function ClienteCard({
  cliente,
  onClick,
}: {
  cliente: ClienteTypes;
  onClick: () => void;
}) {
  const status = getStatusLabel(cliente.ativo);
  const statusStyle = getStatusStyle(cliente.ativo);

  const formattedPhone = formatPhoneNumber(cliente.telefone || cliente.whatsapp);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white dark:bg-[#1e2530] hover:bg-gray-50 dark:hover:bg-[#252d3d] transition-all duration-200 border border-gray-200 dark:border-[#2d3542] rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md dark:shadow-none hover:border-blue-300 dark:hover:border-blue-700"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
          {cliente.nome?.[0]?.toUpperCase() || "?"}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-base text-gray-900 dark:text-white font-semibold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {cliente.nome}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {cliente.email || "Sem email"}
          </span>
        </div>
      </div>

      {/* Status */}
      <span
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border w-fit ${statusStyle}`}
      >
        {status}
      </span>

      {/* Infos principais */}
      <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-[#2d3542]">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <PhoneIcon className="!w-4 !h-4 text-gray-500 dark:text-gray-400" />
          <span className="font-medium">{formattedPhone}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <CalendarTodayIcon className="!w-3.5 !h-3.5" />
          <span>
            Criado em:{" "}
            {cliente.creation
              ? new Date(cliente.creation).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}
