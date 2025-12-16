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
  X,
  LogOut
} from "lucide-react";
import { verificarStatusBackend } from "../../Services/frappeClient";
import { globalSearch, type SearchResult } from "../../Services/search.api";
import SearchDropdown from "./SearchDropdown";
import { NotificationModal } from "../Modals/NotificationModal";
import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const { getLoggedUser, logout } = useAuth();
  const loggedUser = getLoggedUser();

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

  // Estado para o modal de notificações
  const [showNotificationModal, setShowNotificationModal] = useState(false);

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

  // Função de logout
  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <header
      className="
        w-full h-16 px-6 flex items-center justify-between 
        bg-white dark:bg-[#1e2530] 
        text-gray-900 dark:text-gray-100
        border-b border-gray-200 dark:border-[#2d3542]
        shadow-sm transition-all
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
          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition">
            <LayoutDashboard size={18} />
            <span className="text-sm">Dashboard</span>
          </button>

          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition">
            <FileText size={18} />
            <span className="text-sm">Documentos</span>
          </button>

          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition">
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
              bg-gray-100 dark:bg-[#0f1419]
              border border-gray-300 dark:border-[#2d3542]
              rounded-xl px-4 py-2 
              shadow-sm transition
              focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20
            "
          >
            <Search size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar clientes, pedidos, documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-lg transition"
              >
                <X size={16} className="text-gray-400 dark:text-gray-500" />
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
                ? "text-green-500 fill-green-500" 
                : backendStatus === "offline"
                ? "text-red-500 fill-red-500"
                : "text-yellow-500 fill-yellow-500"
            } 
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{backendStatus}</span>
        </div>

        {/* BOTÃO DE TEMA */}
        <button
          onClick={toggleTheme}
          className="
            p-2 rounded-xl 
            border border-gray-300 dark:border-[#2d3542]
            bg-gray-100 dark:bg-[#0f1419]
            hover:bg-gray-200 dark:hover:bg-[#223043]
            text-gray-700 dark:text-gray-300
            transition-all
          "
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* NOTIFICAÇÕES */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationModal(true)}
            className="
              p-2 rounded-xl 
              border border-gray-300 dark:border-[#2d3542]
              bg-gray-100 dark:bg-[#0f1419]
              hover:bg-gray-200 dark:hover:bg-[#223043]
              text-gray-700 dark:text-gray-300
              transition
            "
          >
            <Bell size={18} />
          </button>

          {/* BADGE */}
          <span
            className="
              absolute -top-1 -right-1 
              bg-red-500 text-white text-[10px] 
              px-[6px] py-[1px] rounded-full
            "
          >
            3
          </span>
        </div>

        {/* PERFIL */}
        <div className="relative group">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
            <img
              src={loggedUser?.avatar || "https://ui-avatars.com/api/?name=User&background=1D4ED8&color=fff"}
              alt={loggedUser?.fullName || "perfil"}
              className="w-9 h-9 rounded-xl border border-gray-300 dark:border-[#2d3542]"
            />
            {loggedUser && (
              <div className="hidden lg:flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {loggedUser.fullName}
                </span>
              </div>
            )}
            <ChevronDown size={18} className="text-gray-600 dark:text-gray-400" />
          </div>

          {/* DROPDOWN DO PERFIL */}
          <div className="
            absolute right-0 top-full mt-2 w-56
            bg-white dark:bg-[#1e2530]
            border border-gray-200 dark:border-[#2d3542]
            rounded-xl shadow-lg
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-200 z-50
          ">
            <div className="p-3 border-b border-gray-200 dark:border-[#2d3542]">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {loggedUser?.fullName || "Usuário"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {loggedUser?.email || "email@empresa.com"}
              </p>
            </div>
            
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="
                  w-full flex items-center gap-3 px-3 py-2
                  text-sm text-red-600 dark:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-950/20
                  rounded-lg transition
                "
              >
                <LogOut size={16} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE NOTIFICAÇÕES */}
      <NotificationModal 
        open={showNotificationModal} 
        onClose={() => setShowNotificationModal(false)} 
      />
    </header>
  );
}
