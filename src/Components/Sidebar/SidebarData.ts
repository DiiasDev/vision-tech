import {
  Home,
  User,
  Building2,
  Construction,
  Headphones,
  Wrench,
  FileText,
  ShoppingCart,
  BarChart,
  Plug,
  type LucideIcon,
} from "lucide-react";

// Types for sidebar structure
type SidebarChild = {
  label: string;
  path: string;
};

type SidebarItemWithChildren = {
  label: string;
  icon: LucideIcon;
  key: string;
  children: SidebarChild[];
};

type SidebarItemWithPath = {
  label: string;
  icon: LucideIcon;
  key: string;
  path: string;
};

type SidebarItem = SidebarItemWithChildren | SidebarItemWithPath;

type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

export const sidebarSections: SidebarSection[] = [
  {
    title: "Main",
    items: [
      { label: "Home", icon: Home, key: "home", path: "/Home" },
    ],
  },

  {
    title: "Cadastros",
    items: [
      {
        label: "Clientes",
        icon: User,
        key: "clientes",
        children: [
          { label: "Cadastro", path: "/Clientes/Novo" },
          { label: "Lista", path: "/Clientes/Lista" },
        ],
      },
      {
        label: "Fornecedores",
        icon: Building2,
        key: "fornecedores",
        children: [
          { label: "Cadastro", path: "/fornecedores/cadastro" },
          { label: "Lista", path: "/fornecedores" },
        ],
      },
      {
        label: "Colaboradores",
        icon: Construction,
        key: "colaboradores",
        children: [
          { label: "Cadastro", path: "/colaboradores/cadastro" },
          { label: "Lista", path: "/colaboradores" },
        ],
      },
      {
        label: "Produtos",
        icon: Headphones,
        key: "produtos",
        children: [
          { label: "cadastrar", path: "/acessorios/cadastro" },
          { label: "Estoque", path: "/acessorios/estoque" },
        ],
      },
    ],
  },

  {
    title: "Gestão",
    items: [
      {
        label: "Serviços",
        icon: Wrench,
        key: "servicos",
        children: [
          { label: "Cadastro", path: "/servicos/cadastro" },
          { label: "Lista", path: "/servicos" },
        ],
      },
      {
        label: "Orçamentos",
        icon: FileText,
        key: "orcamentos",
        children: [
          { label: "Criar", path: "/orcamentos/cadastro" },
          { label: "Gerenciar", path: "/orcamentos" },
        ],
      },
      {
        label: "Pedidos",
        icon: ShoppingCart,
        key: "pedidos",
        children: [
          { label: "Criar", path: "/pedidos/cadastro" },
          { label: "Lista", path: "/pedidos" },
        ],
      },
    ],
  },

  {
    title: "Dashboards",
    items: [
      {
        label: "Dashboards",
        icon: BarChart,
        key: "dashboards",
        children: [
          { label: "Empresa", path: "/dashboard/empresa" },
          { label: "Serviços", path: "/dashboard/servicos" },
          { label: "Acessórios", path: "/dashboard/acessorios" },
          { label: "Financeiro", path: "/dashboard/financeiro" },
        ],
      },
    ],
  },

  {
    title: "Integrações",
    items: [
      {
        label: "Integrações",
        icon: Plug,
        key: "integracoes",
        children: [
          { label: "Configurações", path: "/integracoes/configuracoes" },
          { label: "API Keys", path: "/integracoes/api-keys" },
          { label: "Webhooks", path: "/integracoes/webhooks" },
          { label: "Gestão de Clientes", path: "/integracoes/clientes" },
          { label: "Servidor Backend", path: "/integracoes/backend" },
        ],
      },
    ],
  },
];
