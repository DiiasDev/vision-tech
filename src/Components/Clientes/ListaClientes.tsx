import { useEffect, useState } from "react";
import { listarClientes } from "../../Services/clients.api";
import { type ClienteTypes } from "../../types/Clientes.types";
import ClienteModal from "../Modals/ClientesModal"
import ClienteCard from "./ClientesCard";

export default function ClientsList() {
  const [clientes, setClientes] = useState<ClienteTypes[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteTypes | null>(null);
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
                key={cliente.nome}
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
