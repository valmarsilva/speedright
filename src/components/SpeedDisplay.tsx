import { useMemo } from "react";

interface SpeedDisplayProps {
  speed: number;
  unit: "kmh" | "mph" | "knots";
  maxSpeed: number;
}

const SpeedDisplay = ({ speed, unit, maxSpeed }: SpeedDisplayProps) => {
  const unitLabels = {
    kmh: "km/h",
    mph: "mph",
    knots: "kn",
  };

  const getSpeedClass = useMemo(() => {
    if (speed > maxSpeed * 0.9) return "text-speed-danger text-glow-danger";
    if (speed > maxSpeed * 0.7) return "text-speed-warning text-glow-warning";
    return "text-primary text-glow";
  }, [speed, maxSpeed]);

  const formattedSpeed = Math.round(speed).toString().padStart(3, "0");

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`font-display text-8xl md:text-9xl font-bold tracking-wider ${getSpeedClass} transition-colors duration-300`}>
        {formattedSpeed}
      </div>
      <div className="text-2xl md:text-3xl font-medium text-muted-foreground mt-2 uppercase tracking-widest">
        {unitLabels[unit]}
      </div>
    </div>
  );
};

export default SpeedDisplay;
