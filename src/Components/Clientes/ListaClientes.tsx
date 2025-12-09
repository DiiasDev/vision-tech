import { useEffect, useState } from "react";
import { listarClientes } from "../../Services/clients.api";

// ---------------------------------------
// Tipos
// ---------------------------------------
interface Cliente {
  name: string;
  nome: string;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  ativo?: number;
  creation?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

// ---------------------------------------
// Cores para status
// ---------------------------------------
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

// ---------------------------------------
// Card Component
// ---------------------------------------
function ClienteCard({ cliente, onClick }: { cliente: Cliente; onClick: () => void }) {
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
          <span className="text-lg text-white font-semibold">{cliente.nome}</span>
          <span className="text-sm text-gray-400">{cliente.email || "Sem email"}</span>
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
          {cliente.creation ? new Date(cliente.creation).toLocaleDateString('pt-BR') : ""}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------
// Modal Component (detalhes)
// ---------------------------------------
function ClienteModal({
  open,
  onClose,
  cliente,
}: {
  open: boolean;
  onClose: () => void;
  cliente: Cliente | null;
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

// ---------------------------------------
// Página Principal
// ---------------------------------------
export default function ClientsList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClientes() {
      try {
        setLoading(true);
        setError(null);
        const data = await listarClientes();
        setClientes(data);
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
        setError("Não foi possível carregar os clientes.");
      } finally {
        setLoading(false);
      }
    }

    fetchClientes();
  }, []);

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* Título */}
      <h1 className="text-2xl font-bold text-white">Clientes</h1>

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-400 py-8">Carregando clientes...</div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Grid de Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-8">
              Nenhum cliente cadastrado.
            </div>
          ) : (
            clientes.map((cliente) => (
              <ClienteCard
                key={cliente.name}
                cliente={cliente}
                onClick={() => {
                  setSelectedCliente(cliente);
                  setModalOpen(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Modal */}
      <ClienteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cliente={selectedCliente}
      />
    </div>
  );
}
