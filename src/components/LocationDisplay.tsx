import { MapPin, Loader2 } from "lucide-react";

interface LocationDisplayProps {
  street: string | null;
  fullAddress: string | null;
  isLoading: boolean;
  isTracking: boolean;
}

const LocationDisplay = ({ street, fullAddress, isLoading, isTracking }: LocationDisplayProps) => {
  if (!isTracking) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/30 border border-border/30">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Inicie para ver localização</span>
      </div>
    );
  }

  if (isLoading && !street) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/30 border border-border/30">
        <Loader2 className="w-4 h-4 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground">Buscando localização...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-lg card-gradient border border-primary/20 max-w-md">
      <div className="p-1.5 rounded-md bg-primary/20 shrink-0">
        <MapPin className="w-4 h-4 text-primary" />
      </div>
      <div className="flex flex-col min-w-0">
        {street ? (
          <>
            <span className="text-sm font-semibold text-foreground truncate">
              {street}
            </span>
            {fullAddress && fullAddress !== street && (
              <span className="text-xs text-muted-foreground truncate">
                {fullAddress}
              </span>
            )}
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            Aguardando dados de localização...
          </span>
        )}
      </div>
      {isLoading && (
        <Loader2 className="w-3 h-3 text-primary/50 animate-spin shrink-0 ml-auto" />
      )}
    </div>
  );
};

export default LocationDisplay;
