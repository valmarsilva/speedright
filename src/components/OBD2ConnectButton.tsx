import { Bluetooth, BluetoothOff, Loader2, Play, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OBD2ConnectButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  isSupported: boolean;
  deviceName: string | null;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onConnectDemo: () => void;
}

const OBD2ConnectButton = ({
  isConnected,
  isConnecting,
  isSupported,
  deviceName,
  error,
  onConnect,
  onDisconnect,
  onConnectDemo,
}: OBD2ConnectButtonProps) => {
  if (isConnected) {
    return (
      <button
        onClick={onDisconnect}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 transition-colors"
      >
        <Bluetooth className="w-4 h-4" />
        <span className="text-sm font-medium">{deviceName}</span>
      </button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
          <BluetoothOff className="w-4 h-4" />
          <span className="text-sm font-medium">OBD-II</span>
        </button>
      </DialogTrigger>
      <DialogContent className="card-gradient border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Bluetooth className="w-5 h-5 text-primary" />
            Conectar OBD-II
          </DialogTitle>
          <DialogDescription>
            Conecte um adaptador ELM327 Bluetooth para visualizar dados do motor em tempo real.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {!isSupported && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Bluetooth não suportado</p>
                <p className="text-muted-foreground mt-1">
                  Web Bluetooth só funciona no Chrome (Android/Desktop). Safari e iOS não são suportados.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Adaptadores compatíveis:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• ELM327 Bluetooth (v1.5 ou superior)</li>
              <li>• Vgate iCar Pro Bluetooth 4.0</li>
              <li>• OBDLink MX+ Bluetooth</li>
              <li>• Veepeak OBDCheck BLE+</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={onConnect}
              disabled={!isSupported || isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Bluetooth className="w-4 h-4 mr-2" />
                  Conectar Adaptador
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onConnectDemo}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Modo Demo (sem adaptador)
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Certifique-se que o adaptador está conectado à porta OBD-II do veículo e com ignição ligada.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OBD2ConnectButton;
