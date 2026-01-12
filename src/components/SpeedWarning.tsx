import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface SpeedWarningProps {
  currentSpeed: number;
  speedLimit: number | null;
  unit: "kmh" | "mph" | "knots";
}

const SpeedWarning = ({ currentSpeed, speedLimit, unit }: SpeedWarningProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const unitLabel = unit === "kmh" ? "km/h" : unit === "mph" ? "mph" : "kn";
  const isOverLimit = speedLimit !== null && currentSpeed > speedLimit;
  const overBy = speedLimit !== null ? Math.round(currentSpeed - speedLimit) : 0;

  useEffect(() => {
    if (isOverLimit) {
      setIsVisible(true);
    } else {
      // Delay hiding to avoid flicker
      const timer = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOverLimit]);

  if (!isVisible || speedLimit === null) return null;

  return (
    <div
      className={`
        fixed top-20 left-1/2 -translate-x-1/2 z-50
        px-4 py-3 rounded-xl
        flex items-center gap-3
        transition-all duration-300
        ${isOverLimit 
          ? "bg-speed-danger/20 border-2 border-speed-danger animate-pulse-warning" 
          : "bg-speed-warning/20 border-2 border-speed-warning opacity-0"
        }
      `}
    >
      <div className="p-2 rounded-full bg-speed-danger/30">
        <AlertTriangle className="w-5 h-5 text-speed-danger" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-speed-danger">
          LIMITE EXCEDIDO!
        </span>
        <span className="text-xs text-muted-foreground">
          +{overBy} {unitLabel} acima de {speedLimit} {unitLabel}
        </span>
      </div>
    </div>
  );
};

export default SpeedWarning;
