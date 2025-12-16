import { useEffect, useState } from "react";
import { listarFornecedores, atualizarFornecedor, deletarFornecedor } from "../../Services/fornecedores.api";
import { type Fornecedor } from "../../types/Fornecedores.types";
import FornecedorModal from "../Modals/FornecedoresModal"
import FornecedorCard from "./FornecedoresCard";
import { Search, Filter, X } from "lucide-react";

export default function FornecedoresList() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [filteredFornecedores, setFilteredFornecedores] = useState<Fornecedor[]>([]);
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fornecedorToDelete, setFornecedorToDelete] = useState<Fornecedor | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    async function fetchFornecedores() {
      try {
        setLoading(true);
        setError(null);
        const data = await listarFornecedores();
        setFornecedores(data);
        setFilteredFornecedores(data);
      } catch (err) {
        console.error("Erro ao carregar fornecedores:", err);
        setError("Não foi possível carregar os fornecedores.");
      } finally {
        setLoading(false);
      }
    }

    fetchFornecedores();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let result = [...fornecedores];

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(fornecedor => 
        fornecedor.nome_fornecedor?.toLowerCase().includes(term) ||
        fornecedor.email?.toLowerCase().includes(term) ||
        fornecedor.cnpj?.toLowerCase().includes(term) ||
        fornecedor.telefone?.toLowerCase().includes(term)
      );
    }

    // Filtro de status
    if (filterStatus !== "all") {
      const isActive = filterStatus === "active";
      result = result.filter(fornecedor => fornecedor.ativo === (isActive ? 1 : 0));
    }

    setFilteredFornecedores(result);
  }, [searchTerm, filterStatus, fornecedores]);

  const handleEdit = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setIsEditMode(true);
    setModalOpen(true);
  };

  const handleSave = async (data: Fornecedor) => {
    try {
      await atualizarFornecedor(data.name || "", data);
      // Recarregar a lista de fornecedores
      const updatedFornecedores = await listarFornecedores();
      setFornecedores(updatedFornecedores);
      setFilteredFornecedores(updatedFornecedores);
      setModalOpen(false);
      setIsEditMode(false);
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error);
      throw error;
    }
  };

  const handleDelete = (fornecedor: Fornecedor) => {
    setFornecedorToDelete(fornecedor);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!fornecedorToDelete?.name) return;
    
    setDeleting(true);
    try {
      await deletarFornecedor(fornecedorToDelete.name);
      // Recarregar a lista de fornecedores
      const updatedFornecedores = await listarFornecedores();
      setFornecedores(updatedFornecedores);
      setFilteredFornecedores(updatedFornecedores);
      setDeleteModalOpen(false);
      setFornecedorToDelete(null);
    } catch (error) {
      console.error("Erro ao deletar fornecedor:", error);
      alert("Erro ao deletar fornecedor");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setFornecedorToDelete(null);
  };

  const handleViewDetails = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setIsEditMode(false);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setIsEditMode(false);
    setSelectedFornecedor(null);
  };

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Fornecedores</h1>
        <div className="text-sm text-gray-400">
          {filteredFornecedores.length} de {fornecedores.length} {fornecedores.length === 1 ? "fornecedor" : "fornecedores"}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-[#1e2530] border border-[#2d3542] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-blue-400" />
          <span className="text-white font-medium">Filtros</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email, CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-[#0a0e13] border border-[#2d3542] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
            className="px-4 py-2.5 bg-[#0a0e13] border border-[#2d3542] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        {/* Limpar filtros */}
        {(searchTerm || filterStatus !== "all") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("all");
            }}
            className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            <X size={14} />
            Limpar filtros
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-400 py-8">Carregando fornecedores...</div>
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
          {filteredFornecedores.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-8">
              {searchTerm || filterStatus !== "all"
                ? "Nenhum fornecedor encontrado com os filtros aplicados."
                : "Nenhum fornecedor cadastrado."}
            </div>
          ) : (
            filteredFornecedores.map((fornecedor) => (
              <FornecedorCard
                key={fornecedor.nome_fornecedor}
                fornecedor={fornecedor}
                onClick={() => handleViewDetails(fornecedor)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      {/* Modal */}
      <FornecedorModal
        open={modalOpen}
        onClose={handleCloseModal}
        fornecedor={selectedFornecedor}
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
                Tem certeza que deseja excluir o fornecedor{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {fornecedorToDelete?.nome_fornecedor}
                </span>
                ?
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
                Todos os dados associados a este fornecedor serão permanentemente removidos.
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
