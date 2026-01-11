import { Smartphone, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const QRCodeModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors duration-200">
          <Smartphone className="w-4 h-4" />
          <span>Instalar no Android</span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-display">
            <QrCode className="w-6 h-6 text-primary" />
            Instalar no Android
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-6 space-y-4">
          <div className="p-4 bg-white rounded-2xl">
            {/* QR Code placeholder - generates a simple pattern */}
            <svg viewBox="0 0 100 100" className="w-48 h-48">
              <rect fill="white" width="100" height="100" />
              {/* QR Pattern */}
              <g fill="black">
                {/* Position detection patterns */}
                <rect x="5" y="5" width="25" height="25" />
                <rect x="8" y="8" width="19" height="19" fill="white" />
                <rect x="11" y="11" width="13" height="13" />
                
                <rect x="70" y="5" width="25" height="25" />
                <rect x="73" y="8" width="19" height="19" fill="white" />
                <rect x="76" y="11" width="13" height="13" />
                
                <rect x="5" y="70" width="25" height="25" />
                <rect x="8" y="73" width="19" height="19" fill="white" />
                <rect x="11" y="76" width="13" height="13" />
                
                {/* Data modules */}
                <rect x="35" y="5" width="5" height="5" />
                <rect x="45" y="5" width="5" height="5" />
                <rect x="55" y="5" width="5" height="5" />
                <rect x="35" y="15" width="5" height="5" />
                <rect x="50" y="15" width="5" height="5" />
                <rect x="60" y="15" width="5" height="5" />
                
                <rect x="5" y="35" width="5" height="5" />
                <rect x="15" y="35" width="5" height="5" />
                <rect x="25" y="40" width="5" height="5" />
                <rect x="35" y="35" width="5" height="5" />
                <rect x="45" y="40" width="5" height="5" />
                <rect x="55" y="35" width="5" height="5" />
                <rect x="65" y="40" width="5" height="5" />
                <rect x="75" y="35" width="5" height="5" />
                <rect x="85" y="40" width="5" height="5" />
                
                <rect x="5" y="50" width="5" height="5" />
                <rect x="20" y="50" width="5" height="5" />
                <rect x="35" y="50" width="5" height="5" />
                <rect x="50" y="50" width="5" height="5" />
                <rect x="65" y="50" width="5" height="5" />
                <rect x="80" y="50" width="5" height="5" />
                <rect x="90" y="50" width="5" height="5" />
                
                <rect x="35" y="60" width="5" height="5" />
                <rect x="50" y="65" width="5" height="5" />
                <rect x="60" y="60" width="5" height="5" />
                <rect x="75" y="65" width="5" height="5" />
                <rect x="85" y="60" width="5" height="5" />
                
                <rect x="35" y="75" width="5" height="5" />
                <rect x="45" y="80" width="5" height="5" />
                <rect x="55" y="75" width="5" height="5" />
                <rect x="65" y="80" width="5" height="5" />
                <rect x="75" y="75" width="5" height="5" />
                <rect x="85" y="80" width="5" height="5" />
                
                <rect x="35" y="90" width="5" height="5" />
                <rect x="50" y="90" width="5" height="5" />
                <rect x="60" y="90" width="5" height="5" />
                <rect x="75" y="90" width="5" height="5" />
                <rect x="90" y="90" width="5" height="5" />
              </g>
            </svg>
          </div>
          <p className="text-center text-muted-foreground text-sm max-w-xs">
            Escaneie o QR Code com seu dispositivo Android para instalar o aplicativo
          </p>
          <div className="flex items-center gap-2 text-primary text-sm font-medium">
            <Smartphone className="w-4 h-4" />
            <span>Compatível com Android 8.0+</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
