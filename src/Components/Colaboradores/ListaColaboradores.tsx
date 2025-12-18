import { useState, useEffect } from "react";
import { type Colaborador } from "../../types/Colaboradores.types";
import { listarColaboradores, atualizarColaborador, deletarColaborador } from "../../Services/colaboradores.api";
import ColaboradorCard from "./ColaboradoresCard";
import ColaboradorModal from "../Modals/ColaboradoresModal";
import { Search, Filter, X } from "lucide-react";

export default function ColaboradoresList() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [filteredColaboradores, setFilteredColaboradores] = useState<Colaborador[]>([]);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [colaboradorToDelete, setColaboradorToDelete] = useState<Colaborador | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    async function fetchColaboradores() {
      try {
        setLoading(true);
        setError(null);
        const data = await listarColaboradores();
        setColaboradores(data);
        setFilteredColaboradores(data);
      } catch (err) {
        console.error("Erro ao carregar colaboradores:", err);
        setError("Não foi possível carregar os colaboradores.");
      } finally {
        setLoading(false);
      }
    }

    fetchColaboradores();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let result = [...colaboradores];

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(colaborador => 
        colaborador.nome_completo?.toLowerCase().includes(term) ||
        colaborador.email?.toLowerCase().includes(term) ||
        colaborador.cpf?.toLowerCase().includes(term) ||
        colaborador.telefone?.toLowerCase().includes(term) ||
        colaborador.cargo?.toLowerCase().includes(term)
      );
    }

    // Filtro de status
    if (filterStatus !== "all") {
      const isActive = filterStatus === "active";
      result = result.filter(colaborador => colaborador.status === (isActive ? "Ativo" : "Inativo"));
    }

    setFilteredColaboradores(result);
  }, [searchTerm, filterStatus, colaboradores]);

  const handleEdit = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setIsEditMode(true);
    setModalOpen(true);
  };

  const handleSave = async (data: Colaborador) => {
    try {
      await atualizarColaborador(data.name || "", data);
      // Recarregar a lista de colaboradores
      const updatedColaboradores = await listarColaboradores();
      setColaboradores(updatedColaboradores);
      setFilteredColaboradores(updatedColaboradores);
      setModalOpen(false);
      setIsEditMode(false);
    } catch (error) {
      console.error("Erro ao atualizar colaborador:", error);
      throw error;
    }
  };

  const handleDelete = (colaborador: Colaborador) => {
    setColaboradorToDelete(colaborador);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!colaboradorToDelete?.name) return;
    
    setDeleting(true);
    try {
      await deletarColaborador(colaboradorToDelete.name);
      // Recarregar a lista de colaboradores
      const updatedColaboradores = await listarColaboradores();
      setColaboradores(updatedColaboradores);
      setFilteredColaboradores(updatedColaboradores);
      setDeleteModalOpen(false);
      setColaboradorToDelete(null);
    } catch (error) {
      console.error("Erro ao deletar colaborador:", error);
      alert("Erro ao deletar colaborador");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setColaboradorToDelete(null);
  };

  const handleViewDetails = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setIsEditMode(false);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setIsEditMode(false);
    setSelectedColaborador(null);
  };

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Colaboradores</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredColaboradores.length} de {colaboradores.length} {colaboradores.length === 1 ? "colaborador" : "colaboradores"}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-[#2d3542] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-blue-500 dark:text-blue-400" />
          <span className="text-gray-900 dark:text-white font-medium">Filtros</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nome, email, CPF, cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-[#0a0e13] border border-gray-300 dark:border-[#2d3542] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={18} />
              </button>
            )}
          </div>

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

        {/* Indicador de filtros ativos */}
        {(searchTerm || filterStatus !== "all") && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#2d3542]">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Filtros ativos:</span>
              {searchTerm && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded">Busca: "{searchTerm}"</span>}
              {filterStatus !== "all" && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded">{filterStatus === "active" ? "Ativos" : "Inativos"}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-400 py-8">Carregando colaboradores...</div>
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
          {filteredColaboradores.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-8">
              {searchTerm || filterStatus !== "all"
                ? "Nenhum colaborador encontrado com os filtros aplicados."
                : "Nenhum colaborador cadastrado."}
            </div>
          ) : (
            filteredColaboradores.map((colaborador) => (
              <ColaboradorCard
                key={colaborador.name}
                colaborador={colaborador}
                onClick={() => handleViewDetails(colaborador)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      {/* Modal */}
      <ColaboradorModal
        open={modalOpen}
        onClose={handleCloseModal}
        colaborador={selectedColaborador}
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
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Confirmar Exclusão</h3>
                  <p className="text-white/80 text-sm mt-1">Esta ação não pode ser desfeita</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 bg-gray-50 dark:bg-[#0a0e13]">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Tem certeza que deseja excluir o colaborador:
              </p>
              <div className="bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="font-semibold text-gray-900 dark:text-white text-lg">
                  {colaboradorToDelete?.nome_completo}
                </p>
                {colaboradorToDelete?.cargo && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {colaboradorToDelete.cargo}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white dark:bg-[#1e2530] border-t border-gray-200 dark:border-gray-800 p-5">
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={deleting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl py-3.5 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl py-3.5 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {deleting ? "Excluindo..." : "Confirmar Exclusão"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
