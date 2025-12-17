// src/components/system/SystemStatusItem.tsx
interface SystemStatusItemProps {
  label: string;
  value: string;
}

export default function SystemStatusItem({ label, value }: SystemStatusItemProps) {
  const getStatusColor = () => {
    const lowerValue = value.toLowerCase();
    if (lowerValue === "online") return "text-green-500";
    if (lowerValue === "offline") return "text-red-500";
    if (lowerValue === "verificando...") return "text-yellow-500";
    return "text-gray-500 dark:text-gray-400";
  };

  return (
    <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
      <span>{label}</span>

      <span className={`font-semibold ${getStatusColor()}`}>
        {value}
      </span>
    </div>
  );
}
