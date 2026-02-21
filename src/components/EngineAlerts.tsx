import { AlertTriangle, Thermometer, Gauge } from "lucide-react";
import { EngineAlert } from "@/hooks/useEngineAlerts";

interface EngineAlertsProps {
  alerts: EngineAlert[];
}

const alertIcons: Record<string, React.ElementType> = {
  rpm: Gauge,
  coolant: Thermometer,
  oil: Thermometer,
};

const EngineAlerts = ({ alerts }: EngineAlertsProps) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90vw] max-w-sm">
      {alerts.map((alert) => {
        const Icon = alertIcons[alert.id] || AlertTriangle;
        const isDanger = alert.level === "danger";

        return (
          <div
            key={alert.id}
            className={`
              px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-300
              ${isDanger
                ? "bg-destructive/20 border-2 border-destructive animate-pulse-warning"
                : "bg-yellow-500/20 border-2 border-yellow-500"
              }
            `}
          >
            <div className={`p-2 rounded-full ${isDanger ? "bg-destructive/30" : "bg-yellow-500/30"}`}>
              <Icon className={`w-5 h-5 ${isDanger ? "text-destructive" : "text-yellow-500"}`} />
            </div>
            <div className="flex flex-col flex-1">
              <span className={`text-sm font-bold ${isDanger ? "text-destructive" : "text-yellow-500"}`}>
                {alert.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {alert.value} {alert.unit} (limite: {alert.threshold} {alert.unit})
              </span>
            </div>
            <AlertTriangle className={`w-4 h-4 ${isDanger ? "text-destructive animate-pulse" : "text-yellow-500"}`} />
          </div>
        );
      })}
    </div>
  );
};

export default EngineAlerts;
