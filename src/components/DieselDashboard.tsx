import { Gauge, Thermometer, Wind, Filter, ArrowUpDown, Activity, AlertTriangle } from "lucide-react";
import type { DieselData } from "@/hooks/useDieselOBD2";
import type { CylinderCount } from "@/types/engine";
import { DIESEL_THRESHOLDS } from "@/types/engine";

interface DieselGaugeProps {
  icon: React.ElementType;
  label: string;
  value: number;
  unit: string;
  max: number;
  warning?: number;
  danger?: number;
  decimals?: number;
}

const DieselGauge = ({
  icon: Icon,
  label,
  value,
  unit,
  max,
  warning,
  danger,
  decimals = 0,
}: DieselGaugeProps) => {
  const percentage = Math.min((value / max) * 100, 100);

  let colorClass = "text-amber-500";
  let bgClass = "bg-amber-500";

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
        <div className="p-1.5 rounded-md bg-amber-500/20">
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

      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${bgClass} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const DPFStatusBadge = ({ status }: { status: DieselData["dpfStatus"] }) => {
  const config = {
    ok: { label: "Normal", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    regenerating: { label: "Regenerando", className: "bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse" },
    blocked: { label: "Bloqueado!", className: "bg-destructive/20 text-destructive border-destructive/30 animate-pulse" },
  };
  const c = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.className}`}>
      {status === "blocked" && <AlertTriangle className="w-3 h-3" />}
      {c.label}
    </span>
  );
};

interface DieselDashboardProps {
  data: DieselData;
  cylinders: CylinderCount;
  isConnected: boolean;
}

const DieselDashboard = ({ data, cylinders, isConnected }: DieselDashboardProps) => {
  if (!isConnected) return null;

  const t = DIESEL_THRESHOLDS[cylinders];

  return (
    <div className="w-full max-w-md space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <Activity className="w-4 h-4 text-amber-500" />
        DIESEL {cylinders} CILINDROS
      </h3>

      {/* Turbo Boost - Featured */}
      <div className="card-gradient rounded-xl p-4 border border-amber-500/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Wind className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">Pressão Turbo</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-display font-bold ${
              data.turboBoost >= t.turboBoostDanger ? 'text-destructive' :
              data.turboBoost >= t.turboBoostWarning ? 'text-yellow-500' : 'text-amber-500'
            }`}>
              {data.turboBoost.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">bar</span>
          </div>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-200 rounded-full ${
              data.turboBoost >= t.turboBoostDanger ? 'bg-destructive' :
              data.turboBoost >= t.turboBoostWarning ? 'bg-yellow-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min((data.turboBoost / t.turboBoostMax) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0</span>
          <span>{(t.turboBoostMax / 2).toFixed(1)}</span>
          <span>{t.turboBoostMax.toFixed(1)} bar</span>
        </div>
      </div>

      {/* DPF Status Card */}
      <div className="card-gradient rounded-xl p-3 border border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/20">
            <Filter className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Filtro DPF</span>
            <span className="text-sm text-foreground">{data.dpfTemp.toFixed(0)}°C / {data.dpfPressure.toFixed(1)} kPa</span>
          </div>
        </div>
        <DPFStatusBadge status={data.dpfStatus} />
      </div>

      {/* Diesel Gauges Grid */}
      <div className="grid grid-cols-2 gap-2">
        <DieselGauge
          icon={Thermometer}
          label="EGT (Escapamento)"
          value={data.egt}
          unit="°C"
          max={t.egtMax}
          warning={t.egtWarning}
          danger={t.egtDanger}
        />
        <DieselGauge
          icon={Gauge}
          label="Pressão Rail"
          value={data.railPressure}
          unit="bar"
          max={t.railPressureMax}
          warning={t.railPressureWarning}
          danger={t.railPressureDanger}
        />
        <DieselGauge
          icon={ArrowUpDown}
          label="Taxa EGR"
          value={data.egrRate}
          unit="%"
          max={50}
          decimals={1}
        />
        <DieselGauge
          icon={ArrowUpDown}
          label="Erro EGR"
          value={data.egrError}
          unit="%"
          max={20}
          warning={10}
          danger={15}
          decimals={1}
        />
      </div>
    </div>
  );
};

export default DieselDashboard;
