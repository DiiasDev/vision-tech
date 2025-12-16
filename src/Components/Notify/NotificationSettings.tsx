import { Switch } from "@mui/material";
import {Settings, Computer } from "@mui/icons-material";
import {
  AttachMoney,
  Build,
  Inventory,
  VolumeOff,
} from "@mui/icons-material";

export function NotificationSettings() {
  const options = [
    { label: "Sistema", icon: <Computer fontSize="small" />, key: "system", color: "text-blue-600" },
    { label: "Financeiro", icon: <AttachMoney fontSize="small" />, key: "finance", color: "text-green-600" },
    { label: "Serviços", icon: <Build fontSize="small" />, key: "service", color: "text-orange-600" },
    { label: "Estoque", icon: <Inventory fontSize="small" />, key: "stock", color: "text-purple-600" },
    { label: "Som", icon: <VolumeOff fontSize="small" />, key: "sound", color: "text-gray-600" },
  ];

  return (
    <details className="group px-4 py-3">
      <summary className="flex items-center justify-between cursor-pointer list-none select-none">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Settings fontSize="small" className="text-gray-500" />
          Preferências de notificações
        </div>
        <div className="transition-transform duration-200 group-open:rotate-180 text-gray-400">
          ▼
        </div>
      </summary>

      <div className="mt-3 space-y-1 pl-1">
        {options.map((opt) => (
          <div
            key={opt.key}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`${opt.color} dark:opacity-80`}>
                {opt.icon}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {opt.label}
              </span>
            </div>
            <Switch 
              size="small" 
              defaultChecked 
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#3b82f6',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#3b82f6',
                },
              }}
            />
          </div>
        ))}
      </div>
    </details>
  );
}
