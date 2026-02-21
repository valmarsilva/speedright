import { Flame, Droplets } from "lucide-react";
import type { EngineType, CylinderCount } from "@/types/engine";

interface EngineTypeSelectorProps {
  engineType: EngineType;
  cylinders: CylinderCount;
  onEngineTypeChange: (type: EngineType) => void;
  onCylindersChange: (count: CylinderCount) => void;
}

const EngineTypeSelector = ({
  engineType,
  cylinders,
  onEngineTypeChange,
  onCylindersChange,
}: EngineTypeSelectorProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Engine Type Toggle */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-secondary/50 border border-border/50">
        <button
          onClick={() => onEngineTypeChange("gasoline")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
            engineType === "gasoline"
              ? "bg-primary text-primary-foreground shadow-lg"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Gasolina
        </button>
        <button
          onClick={() => onEngineTypeChange("diesel")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
            engineType === "diesel"
              ? "bg-amber-600 text-white shadow-lg"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          Diesel
        </button>
      </div>

      {/* Cylinder Count - only show for diesel */}
      {engineType === "diesel" && (
        <div className="flex items-center gap-1 p-1 rounded-full bg-secondary/30 border border-border/30">
          {([4, 6] as CylinderCount[]).map((count) => (
            <button
              key={count}
              onClick={() => onCylindersChange(count)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                cylinders === count
                  ? "bg-amber-600/80 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {count} cil.
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EngineTypeSelector;
