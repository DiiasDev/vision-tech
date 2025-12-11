import { type ClienteTypes } from "../../types/Clientes.types";

const getStatusLabel = (ativo?: number) => {
  if (ativo === 1) return "Ativo";
  if (ativo === 0) return "Inativo";
  return "Pendente";
};

const getStatusStyle = (ativo?: number) => {
  if (ativo === 1) return "bg-green-500/20 text-green-400 border-green-500";
  if (ativo === 0) return "bg-red-500/20 text-red-400 border-red-500";
  return "bg-yellow-500/20 text-yellow-400 border-yellow-500";
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

  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-neutralDark/40 hover:bg-neutralDark/60 transition-all border border-neutral-700 rounded-xl p-4 flex flex-col gap-3 shadow-lg shadow-black/20"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
          {cliente.nome?.[0]?.toUpperCase() || "?"}
        </div>

        <div className="flex flex-col">
          <span className="text-lg text-white font-semibold">
            {cliente.nome}
          </span>
          <span className="text-sm text-gray-400">
            {cliente.email || "Sem email"}
          </span>
        </div>
      </div>

      {/* Status */}
      <span
        className={`px-3 py-1 rounded-lg text-xs border w-fit ${statusStyle}`}
      >
        {status}
      </span>

      {/* Infos principais */}
      <div className="flex items-center justify-between text-sm text-gray-300 mt-2">
        <span>📞 {cliente.telefone || cliente.whatsapp || "Sem telefone"}</span>
        <span className="text-gray-400 text-xs">
          {cliente.creation
            ? new Date(cliente.creation).toLocaleDateString("pt-BR")
            : ""}
        </span>
      </div>
    </div>
  );
}
