import { AlertTriangle } from "lucide-react";

interface SpeedLimitSelectorProps {
  currentLimit: number | null;
  onLimitChange: (limit: number | null) => void;
  unit: "kmh" | "mph" | "knots";
}

const SPEED_LIMITS = {
  kmh: [30, 40, 50, 60, 80, 100, 120],
  mph: [20, 25, 35, 45, 55, 65, 75],
  knots: [15, 20, 30, 40, 50, 60, 70],
};

const SpeedLimitSelector = ({ currentLimit, onLimitChange, unit }: SpeedLimitSelectorProps) => {
  const limits = SPEED_LIMITS[unit];
  const unitLabel = unit === "kmh" ? "km/h" : unit === "mph" ? "mph" : "kn";

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-speed-warning" />
        <span className="text-sm font-medium text-foreground">Limite de Velocidade</span>
        {currentLimit && (
          <button
            onClick={() => onLimitChange(null)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpar
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {limits.map((limit) => (
          <button
            key={limit}
            onClick={() => onLimitChange(currentLimit === limit ? null : limit)}
            className={`
              px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200
              border-2 min-w-[60px]
              ${
                currentLimit === limit
                  ? "bg-speed-warning/20 border-speed-warning text-speed-warning speed-warning-glow"
                  : "bg-secondary/50 border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }
            `}
          >
            {limit}
            <span className="text-xs ml-0.5 opacity-70">{unitLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpeedLimitSelector;
