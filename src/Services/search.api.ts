import { frappe } from "./frappeClient";
import { 
  User, 
  Building2, 
  Construction, 
  Headphones, 
  Wrench, 
  FileText, 
  ShoppingCart,
  type LucideIcon 
} from "lucide-react";

export type SearchResultType = 
  | "cliente" 
  | "fornecedor" 
  | "colaborador" 
  | "produto" 
  | "servico" 
  | "orcamento" 
  | "pedido"
  | "rota";

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: SearchResultType;
  icon: LucideIcon;
  path: string;
  data?: any;
}

// Mapeia tipos para ícones e labels
const typeConfig: Record<SearchResultType, { icon: LucideIcon; label: string }> = {
  cliente: { icon: User, label: "Cliente" },
  fornecedor: { icon: Building2, label: "Fornecedor" },
  colaborador: { icon: Construction, label: "Colaborador" },
  produto: { icon: Headphones, label: "Produto" },
  servico: { icon: Wrench, label: "Serviço" },
  orcamento: { icon: FileText, label: "Orçamento" },
  pedido: { icon: ShoppingCart, label: "Pedido" },
  rota: { icon: FileText, label: "Página" },
};

// Função auxiliar para normalizar strings (remove acentos e lowcase)
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Busca em todas as rotas disponíveis
function searchInRoutes(query: string): SearchResult[] {
  const routes = [
    { title: "Home", path: "/Home", subtitle: "Dashboard principal" },
    { title: "Cadastro de Clientes", path: "/Clientes/Novo", subtitle: "Cadastrar novo cliente" },
    { title: "Lista de Clientes", path: "/Clientes/Lista", subtitle: "Visualizar todos os clientes" },
    { title: "Cadastro de Fornecedores", path: "/fornecedores/cadastro", subtitle: "Cadastrar novo fornecedor" },
    { title: "Lista de Fornecedores", path: "/fornecedores", subtitle: "Visualizar fornecedores" },
    { title: "Cadastro de Colaboradores", path: "/colaboradores/cadastro", subtitle: "Cadastrar colaborador" },
    { title: "Lista de Colaboradores", path: "/colaboradores", subtitle: "Visualizar colaboradores" },
    { title: "Cadastro de Produtos", path: "/acessorios/cadastro", subtitle: "Cadastrar produto" },
    { title: "Estoque", path: "/acessorios/estoque", subtitle: "Gerenciar estoque" },
    { title: "Cadastro de Serviços", path: "/servicos/cadastro", subtitle: "Cadastrar serviço" },
    { title: "Lista de Serviços", path: "/servicos", subtitle: "Visualizar serviços" },
    { title: "Criar Orçamento", path: "/orcamentos/cadastro", subtitle: "Novo orçamento" },
    { title: "Gerenciar Orçamentos", path: "/orcamentos", subtitle: "Visualizar orçamentos" },
    { title: "Criar Pedido", path: "/pedidos/cadastro", subtitle: "Novo pedido" },
    { title: "Lista de Pedidos", path: "/pedidos", subtitle: "Visualizar pedidos" },
  ];

  const normalizedQuery = normalizeString(query);

  return routes
    .filter(route => 
      normalizeString(route.title).includes(normalizedQuery) ||
      normalizeString(route.subtitle || "").includes(normalizedQuery)
    )
    .map(route => ({
      id: route.path,
      title: route.title,
      subtitle: route.subtitle,
      type: "rota" as SearchResultType,
      icon: typeConfig.rota.icon,
      path: route.path,
    }));
}

// Busca clientes
async function searchClientes(query: string): Promise<SearchResult[]> {
  try {
    const response = await frappe.get("/resource/Clientes", {
      params: {
        fields: JSON.stringify(["name", "nome", "tipo_cliente", "cpf", "cnpj", "email", "telefone"]),
        filters: JSON.stringify([
          ["nome", "like", `%${query}%`]
        ]),
        limit_page_length: 5,
      },
    });

    return response.data.data.map((cliente: any) => ({
      id: cliente.name,
      title: cliente.nome,
      subtitle: cliente.tipo_cliente === "PF" 
        ? `CPF: ${cliente.cpf || "N/A"}` 
        : `CNPJ: ${cliente.cnpj || "N/A"}`,
      type: "cliente" as SearchResultType,
      icon: typeConfig.cliente.icon,
      path: `/Clientes/Lista`,
      data: cliente,
    }));
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return [];
  }
}

// Função principal de pesquisa global
export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const trimmedQuery = query.trim();

  try {
    // Executa buscas em paralelo
    const [clientesResults, routesResults] = await Promise.all([
      searchClientes(trimmedQuery),
      Promise.resolve(searchInRoutes(trimmedQuery)),
    ]);

    // Combina todos os resultados
    const allResults = [
      ...clientesResults,
      ...routesResults,
    ];

    // Limita a 10 resultados
    return allResults.slice(0, 10);

  } catch (error) {
    console.error("Erro na pesquisa global:", error);
    return [];
  }
}

// Exporta a configuração de tipos para uso nos componentes
export { typeConfig };
