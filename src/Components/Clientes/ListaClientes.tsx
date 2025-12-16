import { useEffect, useState } from "react";
import { listarClientes, atualizarCliente, deletarCliente } from "../../Services/clients.api";
import { type ClienteTypes } from "../../types/Clientes.types";
import ClienteModal from "../Modals/ClientesModal"
import ClienteCard from "./ClientesCard";
import { Search, Filter, X } from "lucide-react";

export default function ClientsList() {
  const [clientes, setClientes] = useState<ClienteTypes[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<ClienteTypes[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteTypes | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<ClienteTypes | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "PF" | "PJ">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    async function fetchClientes() {
      try {
        setLoading(true);
        setError(null);
        const data = await listarClientes();
        setClientes(data);
        setFilteredClientes(data);
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
        setError("Não foi possível carregar os clientes.");
      } finally {
        setLoading(false);
      }
    }

    fetchClientes();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let result = [...clientes];

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(cliente => 
        cliente.nome?.toLowerCase().includes(term) ||
        cliente.email?.toLowerCase().includes(term) ||
        cliente.cpf?.toLowerCase().includes(term) ||
        cliente.cnpj?.toLowerCase().includes(term) ||
        cliente.telefone?.toLowerCase().includes(term)
      );
    }

    // Filtro de tipo
    if (filterType !== "all") {
      result = result.filter(cliente => cliente.tipo_cliente === filterType);
    }

    // Filtro de status
    if (filterStatus !== "all") {
      const isActive = filterStatus === "active";
      result = result.filter(cliente => cliente.ativo === (isActive ? 1 : 0));
    }

    setFilteredClientes(result);
  }, [searchTerm, filterType, filterStatus, clientes]);

  const handleEdit = (cliente: ClienteTypes) => {
    setSelectedCliente(cliente);
    setIsEditMode(true);
    setModalOpen(true);
  };

  const handleSave = async (data: ClienteTypes) => {
    try {
      await atualizarCliente(data.name || "", data);
      // Recarregar a lista de clientes
      const updatedClientes = await listarClientes();
      setClientes(updatedClientes);
      setFilteredClientes(updatedClientes);
      setModalOpen(false);
      setIsEditMode(false);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw error;
    }
  };

  const handleDelete = (cliente: ClienteTypes) => {
    setClienteToDelete(cliente);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!clienteToDelete?.name) return;
    
    setDeleting(true);
    try {
      await deletarCliente(clienteToDelete.name);
      // Recarregar a lista de clientes
      const updatedClientes = await listarClientes();
      setClientes(updatedClientes);
      setFilteredClientes(updatedClientes);
      setDeleteModalOpen(false);
      setClienteToDelete(null);
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      alert("Erro ao deletar cliente");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setClienteToDelete(null);
  };

  const handleViewDetails = (cliente: ClienteTypes) => {
    setSelectedCliente(cliente);
    setIsEditMode(false);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setIsEditMode(false);
    setSelectedCliente(null);
  };

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredClientes.length} de {clientes.length} {clientes.length === 1 ? "cliente" : "clientes"}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-[#2d3542] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-blue-500 dark:text-blue-400" />
          <span className="text-gray-900 dark:text-white font-medium">Filtros</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nome, email, CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-[#0a0e13] border border-gray-300 dark:border-[#2d3542] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Tipo de Cliente */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "all" | "PF" | "PJ")}
            className="px-4 py-2.5 bg-gray-50 dark:bg-[#0a0e13] border border-gray-300 dark:border-[#2d3542] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">Todos os tipos</option>
            <option value="PF">Pessoa Física</option>
            <option value="PJ">Pessoa Jurídica</option>
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
            className="px-4 py-2.5 bg-gray-50 dark:bg-[#0a0e13] border border-gray-300 dark:border-[#2d3542] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        {/* Limpar filtros */}
        {(searchTerm || filterType !== "all" || filterStatus !== "all") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterType("all");
              setFilterStatus("all");
            }}
            className="mt-4 text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            <X size={14} />
            Limpar filtros
          </button>
        )}
      </div>

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
          {filteredClientes.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-8">
              {searchTerm || filterType !== "all" || filterStatus !== "all" 
                ? "Nenhum cliente encontrado com os filtros aplicados."
                : "Nenhum cliente cadastrado."}
            </div>
          ) : (
            filteredClientes.map((cliente) => (
              <ClienteCard
                key={cliente.nome}
                cliente={cliente}
                onClick={() => handleViewDetails(cliente)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      {/* Modal */}
      <ClienteModal
        open={modalOpen}
        onClose={handleCloseModal}
        cliente={selectedCliente}
        isEditMode={isEditMode}
        onSave={handleSave}
      />

      {/* Modal de Confirmação de Exclusão */}
      {deleteModalOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={cancelDelete}
        >
          <div 
            className="bg-white dark:bg-[#0f1419] border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Confirmar Exclusão
                  </h2>
                  <p className="text-red-100 text-sm">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 bg-gray-50 dark:bg-[#0a0e13]">
              <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                Tem certeza que deseja excluir o cliente{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {clienteToDelete?.nome}
                </span>
                ?
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
                Todos os dados associados a este cliente serão permanentemente removidos.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-white dark:bg-[#1e2530] border-t border-gray-200 dark:border-gray-800 p-5">
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={deleting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white font-semibold rounded-xl py-3.5 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {deleting ? "Excluindo..." : "Sim, Excluir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
