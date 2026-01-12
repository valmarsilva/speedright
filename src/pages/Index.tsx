import { useState, useMemo } from "react";
import { Gauge, Navigation, Timer, RotateCcw, Play, Pause, MapPin } from "lucide-react";
import SpeedDisplay from "@/components/SpeedDisplay";
import SpeedometerGauge from "@/components/SpeedometerGauge";
import StatsCard from "@/components/StatsCard";
import UnitSelector from "@/components/UnitSelector";
import VipBadge from "@/components/VipBadge";
import QRCodeModal from "@/components/QRCodeModal";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineIndicator from "@/components/OfflineIndicator";
import LocationDisplay from "@/components/LocationDisplay";
import SpeedLimitSelector from "@/components/SpeedLimitSelector";
import SpeedWarning from "@/components/SpeedWarning";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";

type SpeedUnit = "kmh" | "mph" | "knots";

const convertSpeed = (speedMs: number, unit: SpeedUnit): number => {
  switch (unit) {
    case "kmh":
      return speedMs * 3.6;
    case "mph":
      return speedMs * 2.237;
    case "knots":
      return speedMs * 1.944;
    default:
      return speedMs * 3.6;
  }
};

const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
};

const Index = () => {
  const [unit, setUnit] = useState<SpeedUnit>("kmh");
  const [maxSpeedRecorded, setMaxSpeedRecorded] = useState(0);
  const [speedLimit, setSpeedLimit] = useState<number | null>(null);
  
  const {
    speed: speedMs,
    distance,
    accuracy,
    latitude,
    longitude,
    isTracking,
    error,
    startTracking,
    stopTracking,
    resetDistance,
  } = useGeolocation();

  const { address, isLoading: isLoadingAddress } = useReverseGeocode(latitude, longitude);

  const maxSpeedLimit = useMemo(() => {
    switch (unit) {
      case "kmh": return 200;
      case "mph": return 125;
      case "knots": return 108;
      default: return 200;
    }
  }, [unit]);

  const currentSpeed = useMemo(() => {
    const converted = convertSpeed(speedMs, unit);
    if (converted > maxSpeedRecorded) {
      setMaxSpeedRecorded(converted);
    }
    return converted;
  }, [speedMs, unit, maxSpeedRecorded]);

  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const handleReset = () => {
    resetDistance();
    setMaxSpeedRecorded(0);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <InstallPrompt />
      <OfflineIndicator />
      <SpeedWarning currentSpeed={currentSpeed} speedLimit={speedLimit} unit={unit} />
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Gauge className="w-6 h-6 text-primary pulse-glow" />
          <h1 className="font-display text-lg font-bold tracking-wider text-foreground">
            SPEEDOMETER
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <QRCodeModal />
          <VipBadge />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
        {/* Unit Selector */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <UnitSelector currentUnit={unit} onUnitChange={(newUnit) => {
            setUnit(newUnit);
            setSpeedLimit(null); // Reset limit when changing unit
          }} />
        </div>

        {/* Speed Limit Selector */}
        <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <SpeedLimitSelector 
            currentLimit={speedLimit} 
            onLimitChange={setSpeedLimit} 
            unit={unit} 
          />
        </div>

        {/* Speedometer */}
        <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <SpeedometerGauge speed={currentSpeed} maxSpeed={maxSpeedLimit} />
          <div className="absolute inset-0 flex items-center justify-center pt-8">
            <SpeedDisplay speed={currentSpeed} unit={unit} maxSpeed={maxSpeedLimit} />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <button
            onClick={handleToggleTracking}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-lg transition-all duration-300 ${
              isTracking
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90 speedometer-glow"
            }`}
          >
            {isTracking ? (
              <>
                <Pause className="w-5 h-5" />
                Parar
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Iniciar
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Location Display */}
        <div className="animate-slide-up w-full flex justify-center" style={{ animationDelay: "0.35s" }}>
          <LocationDisplay
            street={address.street}
            fullAddress={address.fullAddress}
            isLoading={isLoadingAddress}
            isTracking={isTracking}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <StatsCard
            icon={Navigation}
            label="Distância"
            value={formatDistance(distance)}
          />
          <StatsCard
            icon={Gauge}
            label="Velocidade Máx"
            value={`${Math.round(maxSpeedRecorded)}`}
            subValue={unit === "kmh" ? "km/h" : unit === "mph" ? "mph" : "kn"}
          />
          <StatsCard
            icon={MapPin}
            label="Precisão GPS"
            value={accuracy > 0 ? `±${Math.round(accuracy)}m` : "--"}
          />
          <StatsCard
            icon={Timer}
            label="Status"
            value={isTracking ? "Ativo" : "Parado"}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-3 text-center border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          GPS de alta precisão • Sem propagandas • Suporte VIP
        </p>
      </footer>
    </div>
  );
};

export default Index;
