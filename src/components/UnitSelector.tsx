interface UnitSelectorProps {
  currentUnit: "kmh" | "mph" | "knots";
  onUnitChange: (unit: "kmh" | "mph" | "knots") => void;
}

const units: { id: "kmh" | "mph" | "knots"; label: string }[] = [
  { id: "kmh", label: "km/h" },
  { id: "mph", label: "mph" },
  { id: "knots", label: "knots" },
];

const UnitSelector = ({ currentUnit, onUnitChange }: UnitSelectorProps) => {
  return (
    <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg border border-border/50">
      {units.map((unit) => (
        <button
          key={unit.id}
          onClick={() => onUnitChange(unit.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            currentUnit === unit.id
              ? "bg-primary text-primary-foreground shadow-lg"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          {unit.label}
        </button>
      ))}
    </div>
  );
};

export default UnitSelector;
