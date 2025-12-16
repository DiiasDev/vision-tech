import { frappe } from "./frappeClient";
import { 
  User, 
  Building2, 
  Construction, 
  Headphones, 
  Wrench, 
  FileText, 
  ShoppingCart,
  Plug,
  Server,
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
  | "integracao"
  | "servico-monitorado"
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
  integracao: { icon: Plug, label: "Integração" },
  "servico-monitorado": { icon: Server, label: "Serviço" },
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
    { title: "Integrações de Clientes", path: "/integracoes/clientes", subtitle: "Dashboard de integrações" },
    { title: "Serviços & Backend", path: "/integracoes/backend", subtitle: "Monitoramento de serviços" },
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

    if (!response.data?.data || response.data.data.length === 0) {
      return [];
    }

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
  } catch (error: any) {
    // Ignora erro 404 (doctype não existe ou sem dados)
    if (error.response?.status === 404) {
      console.log("Doctype Clientes não encontrado ou sem dados");
      return [];
    }
    console.error("Erro ao buscar clientes:", error);
    return [];
  }
}

// Busca fornecedores
async function searchFornecedores(query: string): Promise<SearchResult[]> {
  try {
    const response = await frappe.get("/resource/Fornecedor", {
      params: {
        fields: JSON.stringify(["name", "nome_fornecedor", "cnpj", "email", "telefone"]),
        filters: JSON.stringify([
          ["nome_fornecedor", "like", `%${query}%`]
        ]),
        limit_page_length: 5,
      },
    });

    if (!response.data?.data || response.data.data.length === 0) {
      return [];
    }

    return response.data.data.map((fornecedor: any) => ({
      id: fornecedor.name,
      title: fornecedor.nome_fornecedor,
      subtitle: fornecedor.cnpj ? `CNPJ: ${fornecedor.cnpj}` : (fornecedor.email || "Fornecedor"),
      type: "fornecedor" as SearchResultType,
      icon: typeConfig.fornecedor.icon,
      path: `/fornecedores`,
      data: fornecedor,
    }));
  } catch (error: any) {
    console.error("Erro ao buscar fornecedores:", error);
    // Ignora erro 404 (doctype não existe ou sem dados)
    if (error.response?.status === 404) {
      console.log("Doctype Fornecedor não encontrado ou sem dados");
    }
    return [];
  }
}

// Busca integrações de clientes
async function searchIntegracoes(query: string): Promise<SearchResult[]> {
  try {
    const normalizedQuery = normalizeString(query);
    
    // Se a query for "integração" ou similar, retorna o dashboard principal
    if (normalizedQuery.includes("integrac") || normalizedQuery.includes("integracao")) {
      return [{
        id: "integracoes-dashboard",
        title: "Integrações de Clientes",
        subtitle: "Dashboard de todas as integrações",
        type: "integracao" as SearchResultType,
        icon: typeConfig.integracao.icon,
        path: `/integracoes/clientes`,
        data: null,
      }];
    }

    // Busca clientes que tenham integração
    const response = await frappe.get("/resource/Clientes", {
      params: {
        fields: JSON.stringify(["name", "nome"]),
        filters: JSON.stringify([
          ["nome", "like", `%${query}%`]
        ]),
        limit_page_length: 2,
      },
    });

    if (!response.data?.data || response.data.data.length === 0) {
      return [];
    }

    return response.data.data.map((cliente: any) => ({
      id: `integracao-${cliente.name}`,
      title: `Integração - ${cliente.nome}`,
      subtitle: "Aplicações e serviços do cliente",
      type: "integracao" as SearchResultType,
      icon: typeConfig.integracao.icon,
      path: `/integracoes/clientes/${cliente.name}`,
      data: cliente,
    }));
  } catch (error) {
    console.error("Erro ao buscar integrações:", error);
    return [];
  }
}

// Busca serviços monitorados
async function searchServicos(query: string): Promise<SearchResult[]> {
  try {
    const normalizedQuery = normalizeString(query);
    
    // Lista de serviços conhecidos - corrigindo paths para corresponder às rotas
    const servicos = [
      { id: "frappe-backend", name: "Frappe Backend", type: "Backend", path: "/integracoes/backend" },
      { id: "vision-tech-frontend", name: "Vision Tech Frontend", type: "Application", path: "/integracoes/backend" },
      { id: "frappe-workers", name: "Frappe Workers", type: "Worker", path: "/integracoes/backend" },
      { id: "redis-cache", name: "Redis Cache", type: "Backend", path: "/integracoes/backend" },
      { id: "mariadb-database", name: "MariaDB Database", type: "Database", path: "/integracoes/backend" },
      { id: "servicos-backend", name: "Serviços & Backend", type: "Dashboard", path: "/integracoes/backend" },
    ];

    return servicos
      .filter(servico => normalizeString(servico.name).includes(normalizedQuery))
      .slice(0, 3) // Limita a 3 serviços
      .map(servico => ({
        id: servico.id,
        title: servico.name,
        subtitle: `Tipo: ${servico.type}`,
        type: "servico-monitorado" as SearchResultType,
        icon: typeConfig["servico-monitorado"].icon,
        path: servico.path,
        data: servico,
      }));
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return [];
  }
}

// Busca genérica em outros DocTypes (produtos, colaboradores, etc)
async function searchGenericDocTypes(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  // Lista de DocTypes para buscar dinamicamente
  const docTypesToSearch = [
    { 
      doctype: "Colaboradores", 
      nameField: "nome_colaborador",
      subtitleField: "cargo",
      type: "colaborador" as SearchResultType,
      path: "/colaboradores"
    },
    { 
      doctype: "Produtos", 
      nameField: "nome_produto",
      subtitleField: "categoria",
      type: "produto" as SearchResultType,
      path: "/acessorios/estoque"
    },
  ];

  // Busca em paralelo em todos os DocTypes
  await Promise.all(
    docTypesToSearch.map(async ({ doctype, nameField, subtitleField, type, path }) => {
      try {
        const response = await frappe.get(`/resource/${doctype}`, {
          params: {
            fields: JSON.stringify(["name", nameField, subtitleField]),
            filters: JSON.stringify([
              [nameField, "like", `%${query}%`]
            ]),
            limit_page_length: 3,
          },
        });

        if (response.data?.data && response.data.data.length > 0) {
          const mapped = response.data.data.map((item: any) => ({
            id: item.name,
            title: item[nameField] || item.name,
            subtitle: item[subtitleField] ? `${subtitleField}: ${item[subtitleField]}` : undefined,
            type: type,
            icon: typeConfig[type].icon,
            path: path,
            data: item,
          }));
          results.push(...mapped);
        }
      } catch (error: any) {
        // Ignora erros 404 (DocType não existe)
        if (error.response?.status !== 404) {
          console.error(`Erro ao buscar ${doctype}:`, error);
        }
      }
    })
  );

  return results;
}

// Função principal de pesquisa global
export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const trimmedQuery = query.trim();

  try {
    // Executa buscas em paralelo - agora incluindo busca genérica
    const [
      clientesResults, 
      fornecedoresResults, 
      integracoesResults, 
      servicosResults, 
      genericResults,
      routesResults
    ] = await Promise.all([
      searchClientes(trimmedQuery),
      searchFornecedores(trimmedQuery),
      searchIntegracoes(trimmedQuery),
      searchServicos(trimmedQuery),
      searchGenericDocTypes(trimmedQuery),
      Promise.resolve(searchInRoutes(trimmedQuery)),
    ]);

    // Combina todos os resultados com priorização
    const allResults = [
      ...clientesResults,        // Prioridade 1: Clientes
      ...fornecedoresResults,    // Prioridade 2: Fornecedores
      ...integracoesResults,     // Prioridade 3: Integrações
      ...genericResults,         // Prioridade 4: Outros DocTypes
      ...servicosResults,        // Prioridade 5: Serviços
      ...routesResults,          // Prioridade 6: Rotas
    ];

    // Limita a 15 resultados
    return allResults.slice(0, 15);

  } catch (error) {
    console.error("Erro na pesquisa global:", error);
    return [];
  }
}

// Exporta a configuração de tipos para uso nos componentes
export { typeConfig };
