import { Crown, Headphones } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const VipBadge = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full vip-gradient text-primary-foreground font-semibold text-sm shadow-lg hover:scale-105 transition-transform duration-200">
          <Crown className="w-4 h-4" />
          <span>VIP</span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-display">
            <div className="p-2 rounded-full vip-gradient">
              <Crown className="w-6 h-6 text-primary-foreground" />
            </div>
            Suporte VIP
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-muted-foreground">
            Como membro VIP, você tem acesso exclusivo ao nosso suporte prioritário 24/7.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Headphones className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Suporte Prioritário</p>
                <p className="text-sm text-muted-foreground">Resposta em até 1 hora</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Crown className="w-5 h-5 text-vip-gold" />
              <div>
                <p className="font-medium">Sem Propagandas</p>
                <p className="text-sm text-muted-foreground">Experiência limpa e rápida</p>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <a
              href="mailto:suporte@speedometer.app"
              className="block w-full py-3 text-center rounded-lg vip-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Contatar Suporte VIP
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VipBadge;
