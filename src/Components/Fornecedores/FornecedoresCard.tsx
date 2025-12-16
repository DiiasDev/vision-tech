import { type Fornecedor } from "../../types/Fornecedores.types";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import {formatPhone} from "../../Utils/Formatter"

const getStatusLabel = (status?: string) => {
  if (status === "Ativo") return "Ativo";
  if (status === "Inativo") return "Inativo";
  if (status === "Suspenso") return "Suspenso";
  return "Pendente";
};

const getStatusStyle = (status?: string) => {
  if (status === "Ativo") return "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500";
  if (status === "Inativo") return "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500";
  if (status === "Suspenso") return "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-500";
  return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500";
};

export default function FornecedorCard({
  fornecedor,
  onClick,
  onEdit,
  onDelete,
}: {
  fornecedor: Fornecedor;
  onClick: () => void;
  onEdit?: (fornecedor: Fornecedor) => void;
  onDelete?: (fornecedor: Fornecedor) => void;
}) {
  const status = getStatusLabel(fornecedor.status);
  const statusStyle = getStatusStyle(fornecedor.status);

  const formattedPhone = formatPhone(fornecedor.telefone || fornecedor.whatsapp);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(fornecedor);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(fornecedor);
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white dark:bg-[#1e2530] hover:bg-gray-50 dark:hover:bg-[#252d3d] transition-all duration-200 border border-gray-200 dark:border-[#2d3542] rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md dark:shadow-none hover:border-blue-300 dark:hover:border-blue-700"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
          {fornecedor.nome_fornecedor?.[0]?.toUpperCase() || "?"}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-base text-gray-900 dark:text-white font-semibold truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {fornecedor.nome_fornecedor}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {fornecedor.email || fornecedor.empresa || "Sem informações"}
          </span>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-1">
          {onEdit && (
            <IconButton
              onClick={handleEdit}
              size="small"
              className="!text-blue-600 dark:!text-blue-400 hover:!bg-blue-50 dark:hover:!bg-blue-500/10"
              title="Editar fornecedor"
            >
              <EditIcon className="!w-5 !h-5" />
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              onClick={handleDelete}
              size="small"
              className="!text-red-600 dark:!text-red-400 hover:!bg-red-50 dark:hover:!bg-red-500/10"
              title="Excluir fornecedor"
            >
              <DeleteIcon className="!w-5 !h-5" />
            </IconButton>
          )}
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
        {formattedPhone && (
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <PhoneIcon className="!w-4 !h-4 text-gray-500 dark:text-gray-400" />
            <span className="font-medium">{formattedPhone}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <CalendarTodayIcon className="!w-3.5 !h-3.5" />
          <span>
            Criado em:{" "}
            {fornecedor.creation
              ? new Date(fornecedor.creation).toLocaleDateString("pt-BR", {
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
