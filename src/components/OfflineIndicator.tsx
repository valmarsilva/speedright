import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-50 animate-slide-up">
      <div
        className={`rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium ${
          isOnline
            ? "bg-accent/20 border border-accent/50 text-accent"
            : "bg-speed-warning/20 border border-speed-warning/50 text-speed-warning"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Conexão restaurada</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Modo offline - GPS pode não funcionar</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
