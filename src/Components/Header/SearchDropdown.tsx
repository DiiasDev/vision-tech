import { useNavigate } from "react-router-dom";
import { type SearchResult, typeConfig } from "../../Services/search.api";
import { FileQuestion, Loader2 } from "lucide-react";

interface SearchDropdownProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
  onSelectResult: () => void;
}

export default function SearchDropdown({ 
  results, 
  isLoading, 
  query, 
  onSelectResult 
}: SearchDropdownProps) {
  const navigate = useNavigate();

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    onSelectResult();
  };

  // Não renderiza nada se não houver query
  if (!query.trim()) {
    return null;
  }

  return (
    <div
      className="
        absolute top-full left-0 right-0 mt-2 
        bg-[#1E293B] dark:bg-[#0B1120]
        border border-[#334155] dark:border-[#1E293B]
        rounded-xl shadow-2xl 
        max-h-[500px] overflow-y-auto
        z-50 backdrop-blur-lg
        animate-in fade-in slide-in-from-top-2 duration-200
      "
    >
      {/* LOADING STATE */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-blue-400" size={24} />
          <span className="ml-3 text-gray-400">Pesquisando...</span>
        </div>
      )}

      {/* RESULTADOS */}
      {!isLoading && results.length > 0 && (
        <div className="py-2">
          <div className="px-4 py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
            {results.length} {results.length === 1 ? "Resultado" : "Resultados"}
          </div>

          {results.map((result) => {
            const Icon = result.icon;
            const config = typeConfig[result.type];

            return (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="
                  w-full px-4 py-3 flex items-start gap-4
                  hover:bg-[#334155]/40 dark:hover:bg-[#1E293B]/60
                  transition-all duration-150
                  border-b border-[#334155]/20 last:border-b-0
                  group cursor-pointer
                "
              >
                {/* ÍCONE */}
                <div
                  className="
                    flex-shrink-0 w-10 h-10 rounded-lg
                    bg-gradient-to-br from-blue-500/20 to-teal-500/20
                    border border-blue-500/30
                    flex items-center justify-center
                    group-hover:from-blue-500/30 group-hover:to-teal-500/30
                    group-hover:border-blue-400/50
                    group-hover:scale-105
                    transition-all duration-200
                  "
                >
                  <Icon size={20} className="text-blue-400 group-hover:text-blue-300" />
                </div>

                {/* CONTEÚDO */}
                <div className="flex-1 text-left min-w-0">
                  {/* TÍTULO */}
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium text-sm truncate group-hover:text-blue-300 transition-colors">
                      {result.title}
                    </h4>
                    <span
                      className="
                        text-[10px] px-2 py-0.5 rounded-full
                        bg-blue-500/20 text-blue-300
                        border border-blue-500/30
                        font-semibold uppercase tracking-wider
                        flex-shrink-0
                      "
                    >
                      {config.label}
                    </span>
                  </div>

                  {/* SUBTÍTULO */}
                  {result.subtitle && (
                    <p className="text-xs text-gray-400 truncate">
                      {result.subtitle}
                    </p>
                  )}

                  {/* CAMINHO */}
                  <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                    <span className="opacity-60">→</span>
                    <span className="truncate">{result.path}</span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* SEM RESULTADOS */}
      {!isLoading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div
            className="
              w-16 h-16 rounded-full
              bg-gradient-to-br from-gray-500/20 to-gray-600/20
              border border-gray-500/30
              flex items-center justify-center
              mb-4
            "
          >
            <FileQuestion size={28} className="text-gray-400" />
          </div>
          
          <h4 className="text-white font-medium mb-2">
            Nenhum resultado encontrado
          </h4>
          
          <p className="text-sm text-gray-400 text-center max-w-sm">
            Não encontramos nada relacionado a <span className="text-blue-400 font-semibold">"{query}"</span>.
            Tente usar outros termos de busca.
          </p>
        </div>
      )}
    </div>
  );
}
