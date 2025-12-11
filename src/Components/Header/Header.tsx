import { useEffect, useState, useRef } from "react";
import {
  Bell,
  Search,
  Sun,
  Moon,
  ChevronDown,
  Circle,
  Settings,
  LayoutDashboard,
  FileText,
  X
} from "lucide-react";
import { verificarStatusBackend } from "../../Services/frappeClient";
import { globalSearch, type SearchResult } from "../../Services/search.api";
import SearchDropdown from "./SearchDropdown";

export default function Header() {
  const [darkMode, setDarkMode] = useState(() => {
    // Inicializar com o tema salvo
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  const [backendStatus, setBackendStatus] = useState<"online" | "offline" | "verificando">("verificando");
  
  // Estados para a pesquisa
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Aplicar tema ao carregar a página
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Verificar status do backend
  useEffect(() => {
    async function checkStatus() {
      const isOnline = await verificarStatusBackend();
      setBackendStatus(isOnline ? "online" : "offline");
    }

    checkStatus();
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pesquisa com debounce
  useEffect(() => {
    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Se a query estiver vazia, limpar resultados
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    // Iniciar pesquisa após 300ms de digitação
    setIsSearching(true);
    setShowDropdown(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await globalSearch(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Erro na pesquisa:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Função de trocar tema
  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newTheme = !prev;
      
      if (newTheme) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      
      return newTheme;
    });
  };

  // Função para limpar pesquisa
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  // Função chamada ao selecionar um resultado
  const handleSelectResult = () => {
    clearSearch();
  };

  return (
    <header
      className="
        w-full h-16 px-6 flex items-center justify-between 
        bg-[#0F172A] text-white shadow-md
        dark:bg-[#020617] transition-all
      "
    >
      {/* -------- LOGO + NAVEGAÇÃO RÁPIDA ------- */}
      <div className="flex items-center gap-6">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-teal-400" />
          <span className="font-semibold text-lg tracking-wide">
            Vision Tech
          </span>
        </div>

        {/* ÍCONES DE NAVEGAÇÃO */}
        <nav className="hidden md:flex items-center gap-5 ml-6">
          <button className="flex items-center gap-2 opacity-80 hover:opacity-100 transition">
            <LayoutDashboard size={18} />
            <span className="text-sm">Dashboard</span>
          </button>

          <button className="flex items-center gap-2 opacity-80 hover:opacity-100 transition">
            <FileText size={18} />
            <span className="text-sm">Documentos</span>
          </button>

          <button className="flex items-center gap-2 opacity-80 hover:opacity-100 transition">
            <Settings size={18} />
            <span className="text-sm">Configurações</span>
          </button>
        </nav>
      </div>

      {/* ---------- BARRA DE PESQUISA CENTRAL -------- */}
      <div className="flex-1 px-6 max-w-xl hidden md:flex" ref={searchRef}>
        <div className="w-full relative">
          <div
            className="
              w-full flex items-center gap-3 
              bg-[#1E293B]/60 dark:bg-[#0B1120]/60 
              border border-[#1E293B]
              rounded-xl px-4 py-2 
              shadow-sm backdrop-blur-md transition
              focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20
            "
          >
            <Search size={18} className="opacity-60 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar clientes, pedidos, documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              className="w-full bg-transparent outline-none text-sm text-gray-200 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="flex-shrink-0 p-1 hover:bg-gray-700/50 rounded-lg transition"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* DROPDOWN DE RESULTADOS */}
          {showDropdown && (
            <SearchDropdown
              results={searchResults}
              isLoading={isSearching}
              query={searchQuery}
              onSelectResult={handleSelectResult}
            />
          )}
        </div>
      </div>

      {/* --------- CONTROLES À DIREITA -------- */}
      <div className="flex items-center gap-4">

        {/* STATUS DO SISTEMA */}
        <div className="hidden md:flex items-center gap-2">
          <Circle 
            size={10} 
            className={
              backendStatus === "online" 
                ? "text-green-400" 
                : backendStatus === "offline"
                ? "text-red-400"
                : "text-yellow-400"
            } 
          />
          <span className="text-sm opacity-80 capitalize">{backendStatus}</span>
        </div>

        {/* BOTÃO DE TEMA */}
        <button
          onClick={toggleTheme}
          className="
            p-2 rounded-xl border border-[#1E293B]
            bg-[#1E293B]/40 hover:bg-[#1E293B]/70 
            transition-all backdrop-blur-sm
          "
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* NOTIFICAÇÕES */}
        <div className="relative">
          <button
            className="
              p-2 rounded-xl border border-[#1E293B]
              bg-[#1E293B]/40 hover:bg-[#1E293B]/70 
              transition backdrop-blur-sm
            "
          >
            <Bell size={18} />
          </button>

          {/* BADGE */}
          <span
            className="
              absolute -top-1 -right-1 
              bg-red-500 text-[10px] 
              px-[6px] py-[1px] rounded-full
            "
          >
            3
          </span>
        </div>

        {/* PERFIL */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
          <img
            src="https://ui-avatars.com/api/?name=User&background=1D4ED8&color=fff"
            alt="perfil"
            className="w-9 h-9 rounded-xl border border-[#1E293B]"
          />
          <ChevronDown size={18} className="opacity-70" />
        </div>
      </div>
    </header>
  );
}
