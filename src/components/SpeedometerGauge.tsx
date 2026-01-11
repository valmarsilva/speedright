import { useMemo } from "react";

interface SpeedometerGaugeProps {
  speed: number;
  maxSpeed: number;
}

const SpeedometerGauge = ({ speed, maxSpeed }: SpeedometerGaugeProps) => {
  const percentage = Math.min((speed / maxSpeed) * 100, 100);
  
  const arcPath = useMemo(() => {
    const startAngle = -135;
    const endAngle = 135;
    const range = endAngle - startAngle;
    const currentAngle = startAngle + (range * percentage) / 100;
    
    const centerX = 150;
    const centerY = 150;
    const radius = 120;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (currentAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    const largeArc = currentAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  }, [percentage]);

  const getStrokeColor = () => {
    if (percentage > 90) return "url(#dangerGradient)";
    if (percentage > 70) return "url(#warningGradient)";
    return "url(#primaryGradient)";
  };

  const ticks = useMemo(() => {
    const tickCount = 13;
    const startAngle = -135;
    const range = 270;
    const centerX = 150;
    const centerY = 150;
    const innerRadius = 100;
    const outerRadius = 115;
    
    return Array.from({ length: tickCount }, (_, i) => {
      const angle = startAngle + (range * i) / (tickCount - 1);
      const rad = (angle * Math.PI) / 180;
      const x1 = centerX + innerRadius * Math.cos(rad);
      const y1 = centerY + innerRadius * Math.sin(rad);
      const x2 = centerX + outerRadius * Math.cos(rad);
      const y2 = centerY + outerRadius * Math.sin(rad);
      const isMajor = i % 2 === 0;
      return { x1, y1, x2, y2, isMajor };
    });
  }, []);

  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80">
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(180 100% 50%)" />
            <stop offset="100%" stopColor="hsl(160 100% 45%)" />
          </linearGradient>
          <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(45 100% 55%)" />
            <stop offset="100%" stopColor="hsl(35 100% 50%)" />
          </linearGradient>
          <linearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(0 85% 55%)" />
            <stop offset="100%" stopColor="hsl(350 85% 50%)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d="M 29.29 229.29 A 120 120 0 1 1 270.71 229.29"
          fill="none"
          stroke="hsl(220 20% 15%)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Active arc */}
        <path
          d={arcPath}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth="12"
          strokeLinecap="round"
          filter="url(#glow)"
          className="transition-all duration-300"
        />

        {/* Tick marks */}
        {ticks.map((tick, i) => (
          <line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.isMajor ? "hsl(180 100% 50%)" : "hsl(220 10% 40%)"}
            strokeWidth={tick.isMajor ? 2 : 1}
            opacity={tick.isMajor ? 0.8 : 0.5}
          />
        ))}

        {/* Center circle */}
        <circle
          cx="150"
          cy="150"
          r="8"
          fill="hsl(180 100% 50%)"
          filter="url(#glow)"
        />
      </svg>
    </div>
  );
};

export default SpeedometerGauge;
