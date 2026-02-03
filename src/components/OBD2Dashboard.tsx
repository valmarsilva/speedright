import { Thermometer, Gauge, Wind, Droplets, Activity, Zap, Fuel } from "lucide-react";
import { OBD2Data } from "@/hooks/useOBD2";

interface OBD2GaugeProps {
  icon: React.ElementType;
  label: string;
  value: number;
  unit: string;
  max: number;
  warning?: number;
  danger?: number;
  decimals?: number;
}

const OBD2Gauge = ({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  max, 
  warning, 
  danger,
  decimals = 0 
}: OBD2GaugeProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  let colorClass = "text-primary";
  let bgClass = "bg-primary";
  
  if (danger && value >= danger) {
    colorClass = "text-destructive";
    bgClass = "bg-destructive";
  } else if (warning && value >= warning) {
    colorClass = "text-yellow-500";
    bgClass = "bg-yellow-500";
  }

  return (
    <div className="card-gradient rounded-xl p-3 border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-md bg-primary/20`}>
          <Icon className={`w-4 h-4 ${colorClass}`} />
        </div>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      
      <div className="flex items-baseline gap-1 mb-2">
        <span className={`text-2xl font-display font-bold ${colorClass}`}>
          {value.toFixed(decimals)}
        </span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full ${bgClass} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface OBD2DashboardProps {
  data: OBD2Data;
  isConnected: boolean;
}

const OBD2Dashboard = ({ data, isConnected }: OBD2DashboardProps) => {
  if (!isConnected) {
    return null;
  }

  return (
    <div className="w-full max-w-md space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        DADOS DO MOTOR
      </h3>
      
      {/* RPM - Featured gauge */}
      <div className="card-gradient rounded-xl p-4 border border-primary/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Gauge className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">RPM</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-display font-bold ${
              data.rpm > 6000 ? 'text-destructive' : 
              data.rpm > 4500 ? 'text-yellow-500' : 'text-primary'
            }`}>
              {Math.round(data.rpm)}
            </span>
          </div>
        </div>
        
        {/* RPM bar */}
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-200 rounded-full ${
              data.rpm > 6000 ? 'bg-destructive' : 
              data.rpm > 4500 ? 'bg-yellow-500' : 'bg-primary'
            }`}
            style={{ width: `${Math.min((data.rpm / 8000) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0</span>
          <span>2k</span>
          <span>4k</span>
          <span>6k</span>
          <span>8k</span>
        </div>
      </div>

      {/* Grid of other gauges */}
      <div className="grid grid-cols-2 gap-2">
        <OBD2Gauge
          icon={Activity}
          label="Acelerador"
          value={data.throttle}
          unit="%"
          max={100}
        />
        <OBD2Gauge
          icon={Zap}
          label="Carga Motor"
          value={data.engineLoad}
          unit="%"
          max={100}
          warning={80}
          danger={95}
        />
        <OBD2Gauge
          icon={Thermometer}
          label="Temp. Água"
          value={data.coolantTemp}
          unit="°C"
          max={130}
          warning={100}
          danger={110}
        />
        <OBD2Gauge
          icon={Thermometer}
          label="Temp. Óleo"
          value={data.oilTemp}
          unit="°C"
          max={150}
          warning={120}
          danger={135}
        />
        <OBD2Gauge
          icon={Wind}
          label="MAF"
          value={data.maf}
          unit="g/s"
          max={250}
          decimals={1}
        />
        <OBD2Gauge
          icon={Gauge}
          label="MAP"
          value={data.map}
          unit="kPa"
          max={105}
        />
        <OBD2Gauge
          icon={Droplets}
          label="Sonda O₂"
          value={data.o2Voltage}
          unit="V"
          max={1}
          decimals={2}
        />
        <OBD2Gauge
          icon={Fuel}
          label="Combustível"
          value={data.fuelLevel}
          unit="%"
          max={100}
          warning={20}
          danger={10}
        />
      </div>
    </div>
  );
};

export default OBD2Dashboard;
