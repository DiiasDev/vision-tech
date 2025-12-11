import { type ClienteTypes } from "../../types/Clientes.types";

const getStatusLabel = (ativo?: number) => {
  if (ativo === 1) return "Ativo";
  if (ativo === 0) return "Inativo";
  return "Pendente";
};

export default function ClienteModal({
  open,
  onClose,
  cliente,
}: {
  open: boolean;
  onClose: () => void;
  cliente: ClienteTypes | null;
}) {
  if (!open || !cliente) return null;

  const endereco = [
    cliente.logradouro,
    cliente.numero,
    cliente.bairro,
    cliente.cidade,
    cliente.estado
  ].filter(Boolean).join(", ");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-neutralDark border border-neutral-700 shadow-xl rounded-xl w-[450px] p-6">
        <h2 className="text-white text-xl font-semibold">{cliente.nome}</h2>
        <p className="text-gray-400 text-sm mb-4">
          Cliente desde: {cliente.creation ? new Date(cliente.creation).toLocaleDateString('pt-BR') : "N/A"}
        </p>

        <div className="flex flex-col gap-2 text-gray-300 text-sm">
          <p><b>Email:</b> {cliente.email || "Não informado"}</p>
          <p><b>Telefone:</b> {cliente.telefone || "Não informado"}</p>
          {cliente.whatsapp && <p><b>WhatsApp:</b> {cliente.whatsapp}</p>}
          <p><b>Status:</b> {getStatusLabel(cliente.ativo)}</p>
          {endereco && <p><b>Endereço:</b> {endereco}</p>}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full bg-primary text-white rounded-lg py-2 hover:bg-primary/80 transition"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}