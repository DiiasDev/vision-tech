interface Props {
  status: "active" | "inactive" | "error";
}

export function StatusBadge({ status }: Props) {
  const styles = {
    active: "bg-green-500/20 text-green-500 border border-green-500/30",
    inactive: "bg-[var(--sidebar-hover)] text-[var(--sidebar-text-secondary)] border border-[var(--sidebar-divider)]",
    error: "bg-red-500/20 text-red-500 border border-red-500/30",
  };

  const labels = {
    active: "Ativo",
    inactive: "Inativo",
    error: "Erro",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
