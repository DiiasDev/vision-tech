// src/components/dashboard/QuickAction.tsx
import React from "react";

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  color?: "primary" | "secondary" | "accent";
  onClick?: () => void;
}

export default function QuickAction({
  title,
  icon,
  color = "primary",
  onClick,
}: QuickActionProps) {
  const bgColor =
    color === "primary"
      ? "bg-primary"
      : color === "secondary"
      ? "bg-secondary"
      : "bg-accent text-black";

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-5 py-4 rounded-xl shadow 
      bg-white dark:bg-neutralDark border border-gray-200 dark:border-neutral-700
      hover:scale-[1.02] transition-all active:scale-95 w-full text-left"
    >
      <div className={`p-2 rounded-lg text-white ${bgColor}`}>
        {icon}
      </div>

      <span className="font-medium dark:text-white">{title}</span>
    </button>
  );
}
